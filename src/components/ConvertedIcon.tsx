import { Download, Check, FileImage } from 'lucide-react';

interface ConvertedIconProps {
  blob: Blob;
  filename: string;
  sizes: number[];
}

export function ConvertedIcon({ blob, filename, sizes }: ConvertedIconProps) {
  const handleDownload = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card glow-border p-6 animate-slide-in-right">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FileImage className="w-8 h-8 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-success-foreground" />
            </div>
            <span className="text-sm font-medium text-success-foreground">Convertito con successo!</span>
          </div>
          
          <h4 className="text-foreground font-medium truncate mb-2">{filename}</h4>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {sizes.map((size) => (
              <span
                key={size}
                className="px-2 py-0.5 rounded bg-surface-elevated text-xs text-muted-foreground font-mono"
              >
                {size}×{size}
              </span>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground mb-4">
            {(blob.size / 1024).toFixed(1)} KB • {sizes.length} dimensioni incluse
          </p>
          
          <button
            onClick={handleDownload}
            className="w-full btn-primary-glow py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            <Download className="w-4 h-4" />
            Scarica ICO
          </button>
        </div>
      </div>
    </div>
  );
}
