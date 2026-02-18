import { Search, Sun, Moon, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="h-14 bg-primary flex items-center px-4 gap-4 shrink-0">
      <Button variant="ghost" size="icon" className="lg:hidden text-primary-foreground" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies or reports..."
          className="pl-9 bg-card border-none rounded-full h-9 text-sm font-body"
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={toggleDark}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-sidebar flex items-center justify-center text-sidebar-foreground text-xs font-bold">
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}
