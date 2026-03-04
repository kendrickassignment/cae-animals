import { Search, Sun, Moon, Bell, Menu, LayoutDashboard, Upload, Building2, Settings, Info, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { fuzzyMatchName } from "@/lib/fuzzy-search";
import { seedAnalyses, seedCompanies } from "@/data/seed-data";
import { useNotifications } from "@/hooks/useNotifications";
import { useRealAnalyses } from "@/hooks/useRealAnalyses";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

interface AppHeaderProps {
  onToggleSidebar?: () => void;
}

const dropdownNav = [
  { title: "Home", path: "/", icon: LayoutDashboard },
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "New Analysis", path: "/upload", icon: Upload },
  { title: "Companies", path: "/companies", icon: Building2 },
  { title: "Settings", path: "/settings", icon: Settings },
  { title: "About", path: "/about", icon: Info },
];

interface SearchResult {
  type: "company" | "analysis";
  label: string;
  path: string;
}

export default function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, addNotification, markAllRead, unreadCount } = useNotifications();
  const { notifications: adminNotifs, unreadCount: adminUnreadCount, markAllRead: markAdminRead } = useAdminNotifications();
  const { data: realAnalyses = [] } = useRealAnalyses();
  const totalUnread = unreadCount + adminUnreadCount;
  const [darkMode, setDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Search logic — includes both seed data and real (DB) analyses
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const results: SearchResult[] = [];
    const seen = new Set<string>();

    const matchesQuery = (analysis: { company_name: string; report_year: number; overall_risk_level: string }) => {
      if (fuzzyMatchName(q, analysis.company_name)) return true;
      if (String(analysis.report_year).includes(q)) return true;
      if (analysis.overall_risk_level?.toLowerCase().includes(q)) return true;
      return false;
    };

    // Real analyses first (higher priority)
    realAnalyses.forEach(a => {
      if (matchesQuery(a)) {
        const key = `${a.company_name.toLowerCase()}-${a.report_year}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ type: "analysis", label: `${a.company_name} (${a.report_year})`, path: `/analysis/${a.id}` });
        }
      }
    });

    // Seed companies
    seedCompanies.forEach(c => {
      const key = c.name.toLowerCase();
      if (!seen.has(key) && fuzzyMatchName(q, c.name)) {
        seen.add(key);
        const analysis = seedAnalyses.find(a => a.company_name === c.name);
        results.push({ type: "company", label: c.name, path: analysis ? `/analysis/${analysis.id}` : "/companies" });
      }
    });

    // Seed analyses
    seedAnalyses.forEach(a => {
      if (matchesQuery(a)) {
        const key = `${a.company_name.toLowerCase()}-${a.report_year}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({ type: "analysis", label: `${a.company_name} (${a.report_year})`, path: `/analysis/${a.id}` });
        }
      }
    });

    setSearchResults(results.slice(0, 8));
    setShowSearchResults(results.length > 0);
  }, [searchQuery, realAnalyses]);

  // Listen for realtime report status changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('report-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports', filter: `user_id=eq.${user.id}` }, (payload) => {
        const report = payload.new as any;
        let msg = "";
        const type: "info" | "success" | "error" = report.status === "completed" ? "success" : report.status === "failed" ? "error" : "info";
        if (report.status === "completed") msg = `Analysis completed: ${report.company_name || report.file_name}`;
        else if (report.status === "failed") msg = `Analysis failed: ${report.company_name || report.file_name}`;
        else if (report.status === "processing") msg = `Processing: ${report.company_name || report.file_name}`;
        else if (report.status === "pending") msg = `Queued: ${report.company_name || report.file_name}`;
        if (msg) addNotification(msg, type);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports', filter: `user_id=eq.${user.id}` }, (payload) => {
        const report = payload.new as any;
        addNotification(`New report uploaded: ${report.company_name || report.file_name}`, "info");
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, addNotification]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchResults(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 bg-primary flex items-center px-4 gap-4 shrink-0">
      <Button variant="ghost" size="icon" className="lg:hidden text-primary-foreground" onClick={onToggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="hidden md:flex relative flex-1 max-w-md" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies or reports..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
          className="pl-9 bg-card border-none rounded-full h-9 text-sm font-body"
        />
        {showSearchResults && (
          <div className="absolute top-11 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => { navigate(r.path); setSearchQuery(""); setShowSearchResults(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-body text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold uppercase">{r.type}</span>
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={toggleDark}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 relative" onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}>
            <Bell className="h-4 w-4" />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">{totalUnread}</span>
            )}
          </Button>
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <span className="font-nav text-xs tracking-wider">NOTIFICATIONS</span>
                {(notifications.length > 0 || adminNotifs.length > 0) && (
                  <button className="text-xs text-primary font-body" onClick={() => { markAllRead(); markAdminRead(); }}>Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {/* Admin notifications (persistent, from DB) */}
                {adminNotifs.length > 0 && (
                  <>
                    <div className="px-4 py-1.5 bg-muted/30">
                      <span className="font-nav text-[10px] tracking-wider text-muted-foreground">ADMIN ALERTS</span>
                    </div>
                    {adminNotifs.map(n => (
                      <div
                        key={`admin-${n.id}`}
                        className={`px-4 py-3 border-b border-border text-sm font-body cursor-pointer hover:bg-muted/30 ${n.read ? "" : "bg-muted/50"}`}
                        onClick={() => { if (n.analysis_id) { navigate(`/analysis/${n.analysis_id}`); setShowNotifications(false); } }}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "error" ? "bg-destructive" : n.type === "warning" ? "bg-yellow-500" : "bg-primary"}`} />
                          <div>
                            <p className="text-foreground">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {/* Session notifications (in-memory) */}
                {notifications.length > 0 && (
                  <>
                    {adminNotifs.length > 0 && (
                      <div className="px-4 py-1.5 bg-muted/30">
                        <span className="font-nav text-[10px] tracking-wider text-muted-foreground">SESSION</span>
                      </div>
                    )}
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-border text-sm font-body ${n.read ? "" : "bg-muted/50"}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === "success" ? "bg-green-500" : n.type === "error" ? "bg-destructive" : n.type === "warning" ? "bg-yellow-500" : "bg-primary"}`} />
                          <div>
                            <p className="text-foreground">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {notifications.length === 0 && adminNotifs.length === 0 && (
                  <p className="text-center text-muted-foreground font-body text-sm py-6">No notifications yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
            className="h-8 w-8 rounded-full bg-sidebar flex items-center justify-center text-sidebar-foreground text-xs font-bold cursor-pointer hover:ring-2 hover:ring-primary-foreground/30 transition-all"
          >
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-10 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-body text-sm text-foreground truncate">{user?.email || "User"}</p>
              </div>
              {dropdownNav.map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowDropdown(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left font-body text-sm transition-colors ${location.pathname === item.path ? "text-primary bg-muted" : "text-foreground hover:bg-muted"}`}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.title}
                </button>
              ))}
              <div className="border-t border-border">
                <button
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left font-body text-sm text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
