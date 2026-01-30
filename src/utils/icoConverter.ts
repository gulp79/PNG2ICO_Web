// ICO file format converter
// Converts PNG images to ICO format with multiple sizes

export interface IconSize {
  size: number;
  label: string;
}

export const AVAILABLE_SIZES: IconSize[] = [
  { size: 16, label: '16×16' },
  { size: 32, label: '32×32' },
  { size: 48, label: '48×48' },
  { size: 64, label: '64×64' },
  { size: 128, label: '128×128' },
  { size: 256, label: '256×256' },
];

export type SizeSelection = 'auto' | number[];

/**
 * Get sizes to include based on the selection and image dimensions
 */
export function getEffectiveSizes(
  selection: SizeSelection,
  imageDimension: number
): number[] {
  if (selection === 'auto') {
    // Include all sizes up to the image's smallest dimension
    return AVAILABLE_SIZES
      .filter((s) => s.size <= imageDimension)
      .map((s) => s.size);
  }
  return selection.filter((size) => size <= imageDimension);
}

/**
 * Resize an image to a specific size, centering if not square
 */
function resizeImage(
  img: HTMLImageElement,
  targetSize: number
): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  // Clear with transparent background
  ctx.clearRect(0, 0, targetSize, targetSize);
  
  // Calculate scaling to fit the image while maintaining aspect ratio
  const scale = Math.min(targetSize / img.width, targetSize / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  
  // Center the image
  const x = (targetSize - scaledWidth) / 2;
  const y = (targetSize - scaledHeight) / 2;
  
  // Enable high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  
  return ctx.getImageData(0, 0, targetSize, targetSize);
}

/**
 * Create an ICO file from multiple image data entries
 */
function createIcoBlob(images: { size: number; data: ImageData }[]): Blob {
  // ICO file structure:
  // - ICO Header (6 bytes)
  // - Image Directory entries (16 bytes each)
  // - Image data (PNG format for each size)
  
  const pngDataArray: Uint8Array[] = [];
  
  // Convert each ImageData to PNG
  for (const { size, data } of images) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(data, 0, 0);
    
    // Get PNG data as base64
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    pngDataArray.push(bytes);
  }
  
  // Calculate total size
  const headerSize = 6;
  const directorySize = 16 * images.length;
  const totalPngSize = pngDataArray.reduce((sum, arr) => sum + arr.length, 0);
  const totalSize = headerSize + directorySize + totalPngSize;
  
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  
  // ICO Header
  view.setUint16(0, 0, true); // Reserved, must be 0
  view.setUint16(2, 1, true); // Image type: 1 = ICO
  view.setUint16(4, images.length, true); // Number of images
  
  // Image Directory entries and data
  let dataOffset = headerSize + directorySize;
  
  for (let i = 0; i < images.length; i++) {
    const { size } = images[i];
    const pngData = pngDataArray[i];
    const directoryOffset = headerSize + i * 16;
    
    // Image directory entry (16 bytes)
    view.setUint8(directoryOffset + 0, size >= 256 ? 0 : size); // Width (0 = 256)
    view.setUint8(directoryOffset + 1, size >= 256 ? 0 : size); // Height (0 = 256)
    view.setUint8(directoryOffset + 2, 0); // Color palette (0 = no palette)
    view.setUint8(directoryOffset + 3, 0); // Reserved
    view.setUint16(directoryOffset + 4, 1, true); // Color planes
    view.setUint16(directoryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(directoryOffset + 8, pngData.length, true); // Image size
    view.setUint32(directoryOffset + 12, dataOffset, true); // Offset to image data
    
    // Copy PNG data
    const dataView = new Uint8Array(buffer, dataOffset, pngData.length);
    dataView.set(pngData);
    
    dataOffset += pngData.length;
  }
  
  return new Blob([buffer], { type: 'image/x-icon' });
}

/**
 * Load an image from a File or Blob
 */
export function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Convert a PNG file to ICO format
 */
export async function convertToIco(
  file: File,
  sizeSelection: SizeSelection
): Promise<{ blob: Blob; filename: string; sizes: number[] }> {
  const img = await loadImage(file);
  const minDimension = Math.min(img.width, img.height);
  
  const sizes = getEffectiveSizes(sizeSelection, minDimension);
  
  if (sizes.length === 0) {
    throw new Error('Image is too small to create an icon. Minimum size is 16×16.');
  }
  
  // Sort sizes in descending order (largest first in ICO file)
  const sortedSizes = [...sizes].sort((a, b) => b - a);
  
  // Generate resized images
  const images = sortedSizes.map((size) => ({
    size,
    data: resizeImage(img, size),
  }));
  
  // Create ICO blob
  const blob = createIcoBlob(images);
  
  // Generate filename
  const baseName = file.name.replace(/\.[^.]+$/, '');
  const filename = `${baseName}.ico`;
  
  return { blob, filename, sizes: sortedSizes };
}

/**
 * Get image dimensions from a file
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImage(file);
  return { width: img.width, height: img.height };
}

/**
 * Create a preview of the image at a specific size
 */
export async function createPreview(
  file: File,
  size: number
): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = size;
  canvas.height = size;
  
  ctx.clearRect(0, 0, size, size);
  
  const scale = Math.min(size / img.width, size / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const x = (size - scaledWidth) / 2;
  const y = (size - scaledHeight) / 2;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  
  return canvas.toDataURL('image/png');
}
