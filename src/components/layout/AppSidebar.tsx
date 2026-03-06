import { Home, LayoutDashboard, Upload, Building2, Settings, Info, LogOut, X, ChevronLeft, ChevronRight, MessageSquareHeart } from "lucide-react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import caeLogoTruth from "@/assets/cae-logo-truth.png";
import { useState, useEffect } from "react";

const navItems = [
  { title: "HOME", path: "/", icon: Home },
  { title: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
  { title: "NEW ANALYSIS", path: "/upload", icon: Upload },
  { title: "COMPANIES", path: "/companies", icon: Building2 },
  { title: "FEEDBACK", path: "/feedback", icon: MessageSquareHeart },
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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("cae_sidebar_collapsed") === "true");

  useEffect(() => {
    localStorage.setItem("cae_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

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
          "fixed top-0 left-0 z-50 h-full bg-sidebar flex flex-col transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          collapsed ? "w-[60px]" : "w-[260px]",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn("pt-4 pb-2 flex items-center", collapsed ? "px-2 justify-center" : "px-5 justify-between")}>
          {!collapsed ? (
            <Link to="/dashboard">
              <img src={caeLogoTruth} alt="CAE Logo" className="w-[120px] cursor-pointer" />
            </Link>
          ) : (
            <Link to="/dashboard" className="font-display text-lg text-sidebar-primary cursor-pointer">
              C
            </Link>
          )}
          <button className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collapse toggle - desktop only */}
        <div className={cn("hidden lg:flex mb-2", collapsed ? "justify-center" : "justify-end px-3")}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? item.title : undefined}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-md font-nav text-[13px] tracking-wider transition-all",
                  collapsed ? "justify-center px-2" : "px-3",
                  isActive
                    ? "text-sidebar-primary bg-sidebar-accent border-l-4 border-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className={cn("p-3 border-t border-sidebar-border", collapsed ? "flex flex-col items-center gap-2" : "")}>
          <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
            <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sidebar-foreground truncate">{user?.email || "User"}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            title={collapsed ? "Sign Out" : undefined}
            className={cn(
              "flex items-center gap-2 text-sidebar-foreground/50 hover:text-sidebar-foreground text-xs font-nav tracking-wider transition-colors",
              collapsed ? "mt-1 justify-center" : "mt-3"
            )}
          >
            <LogOut className="h-3 w-3" />
            {!collapsed && "SIGN OUT"}
          </button>
        </div>
      </aside>
    </>
  );
}
