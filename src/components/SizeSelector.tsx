import { Check } from 'lucide-react';
import { AVAILABLE_SIZES, SizeSelection, IconSize } from '@/utils/icoConverter';

interface SizeSelectorProps {
  selection: SizeSelection;
  onChange: (selection: SizeSelection) => void;
  maxDimension?: number;
  disabled?: boolean;
}

export function SizeSelector({ selection, onChange, maxDimension, disabled }: SizeSelectorProps) {
  const isAuto = selection === 'auto';
  const selectedSizes = isAuto ? [] : selection;

  const toggleSize = (size: number) => {
    if (disabled) return;
    
    if (isAuto) {
      // Switch from auto to manual with this size selected
      onChange([size]);
    } else {
      const newSelection = selectedSizes.includes(size)
        ? selectedSizes.filter((s) => s !== size)
        : [...selectedSizes, size];
      
      // If no sizes selected, switch back to auto
      if (newSelection.length === 0) {
        onChange('auto');
      } else {
        onChange(newSelection);
      }
    }
  };

  const setAuto = () => {
    if (disabled) return;
    onChange('auto');
  };

  const isSizeAvailable = (size: number) => {
    if (!maxDimension) return true;
    return size <= maxDimension;
  };

  const isSizeSelected = (size: number) => {
    if (isAuto) {
      return isSizeAvailable(size);
    }
    return selectedSizes.includes(size);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Dimensioni icona</h3>
        <button
          onClick={setAuto}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            isAuto
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-surface-elevated text-muted-foreground hover:text-foreground hover:bg-muted'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Auto
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {AVAILABLE_SIZES.map(({ size, label }) => {
          const available = isSizeAvailable(size);
          const selected = isSizeSelected(size);
          
          return (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              disabled={disabled || !available}
              className={`relative px-3 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                !available
                  ? 'border-border/50 bg-surface/30 text-muted-foreground/50 cursor-not-allowed'
                  : selected
                  ? 'border-primary bg-primary/10 text-primary size-chip-active'
                  : 'border-border bg-surface text-muted-foreground hover:border-primary/50 hover:bg-surface-elevated hover:text-foreground'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {label}
              {selected && available && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {isAuto
          ? 'Verranno incluse automaticamente tutte le dimensioni fino alla risoluzione dell\'immagine.'
          : `${selectedSizes.length} dimensione${selectedSizes.length !== 1 ? 'i' : ''} selezionata${selectedSizes.length !== 1 ? 'e' : ''}`}
      </p>
    </div>
  );
}
