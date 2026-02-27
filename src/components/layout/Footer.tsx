import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <p className="font-body text-sm text-sidebar-foreground/80">
              Corporate Accountability Engine
            </p>
          </div>
          <div className="flex gap-6 font-nav text-xs tracking-wider text-sidebar-foreground/60">
            <Link to="/" className="hover:text-sidebar-primary transition-colors">HOME</Link>
            <Link to="/about" className="hover:text-sidebar-primary transition-colors">ABOUT</Link>
            <a href="/#contact" onClick={(e) => {
              e.preventDefault();
              if (window.location.pathname === '/') {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/#contact';
              }
            }} className="hover:text-sidebar-primary transition-colors">CONTACT</a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-sidebar-border">
          <p className="font-body text-xs text-sidebar-foreground/40">Corporate Accountability Engine v1.0</p>
        </div>
      </div>
    </footer>
  );
}
