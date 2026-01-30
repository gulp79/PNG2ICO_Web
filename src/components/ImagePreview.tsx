import { useState, useEffect } from 'react';
import { createPreview } from '@/utils/icoConverter';
import { Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  dimensions: { width: number; height: number };
}

export function ImagePreview({ file, dimensions }: ImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    createPreview(file, 200)
      .then(setPreviewUrl)
      .finally(() => setLoading(false));
  }, [file]);

  const isSquare = dimensions.width === dimensions.height;

  return (
    <div className="glass-card p-6 space-y-4 animate-scale-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Anteprima</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {dimensions.width}×{dimensions.height}
          </span>
          {!isSquare && (
            <span className="px-2 py-0.5 rounded text-xs bg-warning/10 text-warning-foreground border border-warning/20">
              Non quadrata
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-center p-4">
        <div className="relative">
          {/* Checkerboard background for transparency */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{
              backgroundImage: `
                linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
                linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
                linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          />
          
          <div className="relative w-[200px] h-[200px] rounded-xl overflow-hidden border border-border flex items-center justify-center">
            {loading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-foreground font-medium truncate max-w-full">
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      </div>
      
      {!isSquare && (
        <p className="text-xs text-warning-foreground/80 text-center">
          L'immagine verrà centrata con sfondo trasparente
        </p>
      )}
    </div>
  );
}
