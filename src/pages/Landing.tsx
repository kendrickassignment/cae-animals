import { Link } from "react-router-dom";
import { Upload, Search, FileText, Shield, VolumeX, Globe, Store, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/layout/Footer";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import caeLogoDark from "@/assets/cae-logo-dark.png";

const evasionPatterns = [
  { icon: Shield, title: "HEDGING LANGUAGE", desc: "Non-binding phrases like 'we aim to' or 'where feasible' that sound like commitments but are not." },
  { icon: VolumeX, title: "STRATEGIC SILENCE", desc: "Countries like Indonesia simply not mentioned anywhere in the progress report." },
  { icon: Globe, title: "GEOGRAPHIC TIERING", desc: "'Leading markets' get real commitments; 'Elsewhere globally' gets a 2030 deadline." },
  { icon: Store, title: "FRANCHISE FIREWALL", desc: "Commitments cover 'company-operated stores' only — franchises and licensees are excluded." },
  { icon: Clock, title: "AVAILABILITY CLAUSE", desc: "'Where supply is readily available' — an indefinite, subjective deferral with no metrics." },
];

function CountUp({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      <span className="font-display text-5xl md:text-6xl text-primary">{visible ? target : "0"}</span>
      {suffix && <span className="font-display text-5xl md:text-6xl text-primary">{suffix}</span>}
    </div>
  );
}

function ContactSection() {
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
      setName(""); setEmail(""); setMessage("");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-6 bg-background border-t border-border">
      <div className="max-w-lg mx-auto">
        <h2 className="font-display text-4xl text-center text-foreground mb-10">GET IN TOUCH</h2>
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
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="bg-primary h-16 flex items-center px-4 sm:px-6 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <img src={caeLogoDark} alt="CAE Logo" className="h-10 mix-blend-multiply cursor-pointer" />
          <span className="font-nav text-[10px] text-primary-foreground/70 tracking-wider hidden sm:block">Corporate Accountability Engine</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#contact" className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all hidden sm:block">CONTACT</a>
          <Link to="/about" className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all hidden sm:block">ABOUT</Link>
          <Link to="/auth" className="font-nav text-xs text-primary-foreground tracking-wider hover:underline underline-offset-4 transition-all">SIGN IN</Link>
          <Link to="/auth">
            <Button variant="outline" className="bg-sidebar text-sidebar-foreground border-none font-body font-bold text-xs sm:text-sm px-3 sm:px-5 hover:bg-sidebar/90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 px-6 text-center max-w-4xl mx-auto animate-fade-in">
        <h1 className="font-display text-5xl md:text-7xl text-foreground leading-tight mb-6">
          EXPOSING CORPORATE<br />GREENWASHING WITH AI
        </h1>
        <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          The Corporate Accountability Engine analyzes sustainability reports to detect hidden exclusions, hedging language, and broken promises in cage-free egg commitments across Southeast Asia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button className="font-body font-bold text-base px-8 py-6 rounded-lg">START ANALYZING</Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" className="font-body font-bold text-base px-8 py-6 rounded-lg border-2 border-foreground text-foreground hover:bg-foreground hover:text-background">
              LEARN HOW IT WORKS
            </Button>
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl text-center text-foreground mb-14">HOW IT WORKS</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Upload, step: "01", title: "UPLOAD", desc: "Upload corporate sustainability reports (PDF format)" },
              { icon: Search, step: "02", title: "ANALYZE", desc: "AI scans for 5 types of greenwashing evasion patterns" },
              { icon: FileText, step: "03", title: "EXPOSE", desc: "Get citation-backed evidence with exact page numbers" },
            ].map((item, i) => (
              <div
                key={item.step}
                className="bg-card rounded-lg p-8 border-t-4 border-primary shadow-sm animate-float-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-display text-3xl text-primary">{item.step}</span>
                  <item.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl mb-2">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Evasion Patterns */}
      <section className="py-20 px-6 bg-sidebar">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl text-center text-sidebar-foreground mb-14">WHAT WE DETECT</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evasionPatterns.map((pattern, i) => (
              <div
                key={pattern.title}
                className="bg-sidebar-accent rounded-lg p-6 animate-float-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <pattern.icon className="h-6 w-6 text-sidebar-primary mb-3" />
                <h3 className="font-display text-lg text-sidebar-foreground mb-2">{pattern.title}</h3>
                <p className="font-body text-sm text-sidebar-foreground/70 leading-relaxed">{pattern.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <CountUp target="60" suffix="s" />
            <p className="font-body text-sm text-muted-foreground mt-2">Audit time (from 2 weeks)</p>
          </div>
          <div>
            <CountUp target="$0.15" />
            <p className="font-body text-sm text-muted-foreground mt-2">Cost per 200-page report</p>
          </div>
          <div>
            <CountUp target="5" />
            <p className="font-body text-sm text-muted-foreground mt-2">Evasion patterns detected</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactSection />

      <Footer />
    </div>
  );
}
