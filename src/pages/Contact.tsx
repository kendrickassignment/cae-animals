import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact", {
        body: { name: name.trim(), email: email.trim(), message: message.trim() },
      });
      if (error) throw error;
      toast.success("Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <h1 className="font-display text-4xl text-foreground">CONTACT US</h1>
        <p className="font-body text-muted-foreground">Have questions about the Corporate Accountability Engine? Get in touch.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-body text-sm font-bold text-foreground block mb-1">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={100} />
          </div>
          <div>
            <label className="font-body text-sm font-bold text-foreground block mb-1">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" maxLength={255} />
          </div>
          <div>
            <label className="font-body text-sm font-bold text-foreground block mb-1">Message</label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..." rows={5} maxLength={2000} />
          </div>
          <Button type="submit" className="w-full font-body font-bold" disabled={sending}>
            {sending ? "SENDING..." : "SEND MESSAGE"}
          </Button>
        </form>
      </div>
    </div>
  );
}
