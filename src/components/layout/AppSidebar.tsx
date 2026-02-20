import { LayoutDashboard, Upload, Building2, Settings, Info, LogOut, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import caeLogoNew from "@/assets/cae-logo-new.png";

const navItems = [
  { title: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
  { title: "NEW ANALYSIS", path: "/upload", icon: Upload },
  { title: "COMPANIES", path: "/companies", icon: Building2 },
  { title: "SETTINGS", path: "/settings", icon: Settings },
  { title: "ABOUT", path: "/about", icon: Info },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[260px] bg-sidebar flex flex-col transition-transform ease-in-out lg:relative lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <img src={caeLogoNew} alt="CAE Logo" className="w-[120px] brightness-0 invert" />
            <button className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md font-nav text-[13px] tracking-wider transition-all",
                  isActive
                    ? "text-sidebar-primary bg-sidebar-accent border-l-4 border-sidebar-primary -ml-px"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-sidebar-foreground truncate">{user?.email || "User"}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 mt-3 text-sidebar-foreground/50 hover:text-sidebar-foreground text-xs font-nav tracking-wider transition-colors"
          >
            <LogOut className="h-3 w-3" />
            SIGN OUT
          </button>
        </div>
      </aside>
    </>
  );
}
