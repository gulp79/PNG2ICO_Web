import { useState, useCallback } from "react";
import { Loader2, Sparkles, ArrowRight, Zap, Shield, Globe, Github } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { SizeSelector } from "@/components/SizeSelector";
import { ImagePreview } from "@/components/ImagePreview";
import { ConvertedIcon } from "@/components/ConvertedIcon";
import { convertToIco, getImageDimensions, SizeSelection } from "@/utils/icoConverter";
import { toast } from "sonner";

interface ConvertedFile {
  blob: Blob;
  filename: string;
  sizes: number[];
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [sizeSelection, setSizeSelection] = useState<SizeSelection>("auto");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setSelectedFile(file);
      const dims = await getImageDimensions(file);
      setDimensions(dims);
      setSizeSelection("auto");
    } catch (error) {
      toast.error("Unable to load the image");
      setSelectedFile(null);
      setDimensions(null);
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!selectedFile || !dimensions) return;
    setIsConverting(true);
    try {
      const result = await convertToIco(selectedFile, sizeSelection);
      setConvertedFiles((prev) => [result, ...prev]);
      toast.success("Icon successfully converted!");
      // Reset for next file
      setSelectedFile(null);
      setDimensions(null);
      setSizeSelection("auto");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error during conversion");
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, dimensions, sizeSelection]);

  const clearConverted = useCallback(() => {
    setConvertedFiles([]);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-glow-secondary/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated border border-border mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Free and unlimited</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-gradient">PNG</span>
            <span className="text-foreground"> → </span>
            <span className="text-gradient">ICO</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Convert your PNG images into multi‑size ICO icons for favicons, desktop, and applications.
          </p>

          {/* Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Instant conversion</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>100% client-side</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>No server upload</span>
            </div>

            {/* New: GitHub link */}
            <a
              href="https://github.com/gulp79/PNG2ICO_Web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
              aria-label="Open GitHub repository"
            >
              <Github className="w-4 h-4 text-primary" />
              <span>GitHub repository</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* Main converter */}
        {!selectedFile ? (
          <div className="space-y-6">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Preview */}
            {dimensions && (
              <ImagePreview file={selectedFile} dimensions={dimensions} />
            )}

            {/* Right: Settings */}
            <div className="flex flex-col gap-4">
              <SizeSelector
                dimensions={dimensions!}
                value={sizeSelection}
                onChange={setSizeSelection}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setDimensions(null);
                  }}
                  disabled={isConverting}
                  className="flex-1 py-3 px-4 rounded-xl border border-border bg-surface text-muted-foreground font-medium hover:bg-surface-elevated hover:text-foreground transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-200 disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      Convert
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Converted icons */}
        {convertedFiles.length > 0 && (
          <section className="mt-12 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                Converted icons ({convertedFiles.length})
              </h3>
              <button
                onClick={clearConverted}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {convertedFiles.map((file, index) => (
                <ConvertedIcon key={index} file={file} />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground space-y-1">
          <p>All conversions take place directly in your browser.</p>
          <p>Your files are never uploaded to any server.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
