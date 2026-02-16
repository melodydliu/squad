import { useRef } from "react";
import { Upload } from "lucide-react";

interface CsvUploadProps {
  label: string;
  onParsed: (rows: string[][]) => void;
}

const CsvUpload = ({ label, onParsed }: CsvUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.split(",").map((cell) => cell.trim()))
        .filter((row) => row.some((cell) => cell.length > 0));

      // Skip header row
      if (lines.length > 1) {
        onParsed(lines.slice(1));
      }
    };
    reader.readAsText(file);
    // Reset so user can re-upload
    e.target.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full py-3 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Upload className="w-4 h-4" />
        Upload {label} CSV
      </button>
    </div>
  );
};

export default CsvUpload;
