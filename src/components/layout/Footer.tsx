export default function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <p className="font-body text-sm text-sidebar-foreground/80">
              Built by Act For Farmed Animals (AFFA) — Sinergia Animal International
            </p>
          </div>
          <div className="flex gap-6 font-nav text-xs tracking-wider text-sidebar-foreground/60">
            <a href="https://sinergiaanimal.org" target="_blank" rel="noopener noreferrer" className="hover:text-sidebar-primary transition-colors duration-affa">ABOUT AFFA</a>
            <a href="https://sinergiaanimal.org" target="_blank" rel="noopener noreferrer" className="hover:text-sidebar-primary transition-colors duration-affa">SINERGIAANIMAL.ORG</a>
            <a href="#" className="hover:text-sidebar-primary transition-colors duration-affa">CONTACT</a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-sidebar-border">
          <p className="font-body text-xs text-sidebar-foreground/40">Corporate Accountability Engine v1.0</p>
        </div>
      </div>
    </footer>
  );
}
