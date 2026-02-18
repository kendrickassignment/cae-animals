import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function UploadPage() {
  const [files, setFiles] = useState<{ file: File; companyName: string; reportYear: string }[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles(prev => [...prev, ...accepted.map(f => ({ file: f, companyName: "", reportYear: "2024" }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"] }, maxFiles: 10 });

  const handleAnalyze = () => {
    toast.info("Backend not connected. Go to Settings to configure your backend URL.");
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h1 className="font-display text-4xl text-foreground">NEW ANALYSIS</h1>

      <div
        {...getRootProps()}
        className={`bg-card rounded-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-affa hover:border-primary ${isDragActive ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="font-body text-foreground font-bold text-lg mb-1">Drop PDF reports here or click to upload</p>
        <p className="font-body text-sm text-muted-foreground">Accepts .pdf files (up to 10 at once, max 50MB each)</p>
      </div>

      {files.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          {files.map((uf, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 bg-muted rounded-md">
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-bold truncate">{uf.file.name}</p>
                <p className="font-body text-xs text-muted-foreground">{(uf.file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <Input
                placeholder="Company Name"
                value={uf.companyName}
                onChange={e => { const c = [...files]; c[i].companyName = e.target.value; setFiles(c); }}
                className="w-full sm:w-40 text-sm font-body"
              />
              <Select value={uf.reportYear} onValueChange={v => { const c = [...files]; c[i].reportYear = v; setFiles(c); }}>
                <SelectTrigger className="w-full sm:w-24 text-sm font-body"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <Button className="w-full font-body font-bold" disabled={files.some(f => !f.companyName)} onClick={handleAnalyze}>
            START ANALYSIS
          </Button>
        </div>
      )}
    </div>
  );
}
