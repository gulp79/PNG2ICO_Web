import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'image/png') {
        onFileSelect(file);
      }
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  }, [onFileSelect]);

  return (
    <div
      className={`upload-zone cursor-pointer group ${isDragging ? 'upload-zone-active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/png"
        className="hidden"
        onChange={handleFileInput}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-surface-elevated flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <ImageIcon className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-1">
            Trascina qui il tuo file PNG
          </p>
          <p className="text-sm text-muted-foreground">
            oppure <span className="text-primary font-medium">clicca per selezionare</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary/50"></div>
          <span>Solo file PNG supportati</span>
        </div>
      </div>
    </div>
  );
}
