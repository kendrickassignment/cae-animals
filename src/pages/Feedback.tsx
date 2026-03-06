import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Send, Upload, X, Paperclip, MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CATEGORIES = [
  { value: "bug", label: "🐛 Bug Report" },
  { value: "feature", label: "💡 Feature Request" },
  { value: "improvement", label: "✨ Improvement Idea" },
  { value: "question", label: "❓ Question" },
  { value: "other", label: "📝 Other" },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("other");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const total = files.length + accepted.length;
    if (total > 5) {
      toast.error("Maximum 5 attachments allowed.");
      return;
    }
    // Validate sizes (5MB per file)
    const oversized = accepted.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error("Each file must be under 5MB.");
      return;
    }
    setFiles((prev) => [...prev, ...accepted]);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 5,
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please write your feedback before sending.");
      return;
    }

    setSending(true);

    try {
      // Upload attachments to storage if any
      const attachmentUrls: string[] = [];
      for (const file of files) {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user!.id}/feedback/${timestamp}_${safeName}`;
        const { error } = await supabase.storage.from("reports").upload(path, file);
        if (!error) {
          const { data: urlData } = supabase.storage.from("reports").getPublicUrl(path);
          attachmentUrls.push(urlData.publicUrl);
        }
      }

      const { error } = await supabase.functions.invoke("send-feedback", {
        body: {
          category: CATEGORIES.find((c) => c.value === category)?.label || category,
          message: message.trim(),
          attachment_urls: attachmentUrls,
        },
      });

      if (error) throw error;

      toast.success("Thank you for your feedback! We really appreciate it. 💛");
      setMessage("");
      setFiles([]);
      setCategory("other");
    } catch (err: any) {
      console.error("Feedback error:", err);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <MessageSquareHeart className="h-8 w-8 text-primary" />
        <h1 className="font-display text-4xl text-foreground">FEEDBACK</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 space-y-5">
        <div className="space-y-2">
          <p className="font-body text-muted-foreground">
            We'd love to hear from you! Whether you found a bug, have an idea to make CAE better,
            or just want to share your experience — your feedback helps us improve.
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Everything you share is sent directly to our team. Feel free to attach screenshots or documents if it helps explain.
          </p>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="font-body text-sm font-bold text-foreground">What's this about?</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value} className="font-body">{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="font-body text-sm font-bold text-foreground">Your message</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind... We're all ears! 🐰"
            className="font-body min-h-[140px] resize-y"
            maxLength={5000}
          />
          <p className="font-body text-xs text-muted-foreground text-right">{message.length}/5000</p>
        </div>

        {/* File attachments */}
        <div className="space-y-2" {...getRootProps()}>
          <input {...getInputProps()} />
          <label className="font-body text-sm font-bold text-foreground">Attachments (optional)</label>

          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-body text-sm truncate flex-1">{f.name}</span>
                  <span className="font-body text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={open}
            className={`w-full border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer hover:border-primary ${
              isDragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="font-body text-xs text-muted-foreground">
              Drop screenshots or PDFs here, or click to browse • Max 5MB each • Up to 5 files
            </p>
          </button>
        </div>

        <Button
          className="w-full font-body font-bold gap-2"
          disabled={!message.trim() || sending}
          onClick={handleSubmit}
        >
          <Send className="h-4 w-4" />
          {sending ? "SENDING..." : "SEND FEEDBACK"}
        </Button>
      </div>
    </div>
  );
}
