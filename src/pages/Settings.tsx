import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveBackendUrl, saveProviderConfig, getStoredBackendUrl, getStoredProvider, healthCheck, testProvider } from "@/services/api";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("CAE");
  const [savingProfile, setSavingProfile] = useState(false);
  const [backendUrl, setBackendUrl] = useState(getStoredBackendUrl());
  const [provider, setProvider] = useState(getStoredProvider());
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, organization").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || "");
        setOrganization(data.organization || "CAE");
      }
    });
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName, organization }).eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const data = await healthCheck();
      toast.success(`Backend is reachable! Status: ${data.status || 'operational'}`);
      if (apiKey) {
        try {
          const result = await testProvider(provider, apiKey);
          if (result.status === "success") toast.success(`AI Provider working: ${result.model}`);
          else toast.error(`AI Provider failed: ${result.error}`);
        } catch (provErr: any) {
          toast.error(`AI Provider test failed: ${provErr.message}`);
        }
      }
    } catch (err: any) {
      toast.error(`Cannot reach backend: ${err.message}. Check the URL and ensure CORS is enabled.`);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveApi = () => {
    saveBackendUrl(backendUrl);
    saveProviderConfig(provider, apiKey);
    toast.success("API settings saved!");
  };

  const handleDeleteData = async () => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to delete ALL your data? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const { data: reports } = await supabase.from("reports").select("id").eq("user_id", user.id);
      if (reports && reports.length > 0) {
        const reportIds = reports.map(r => r.id);
        await supabase.from("findings").delete().in("report_id", reportIds);
        await supabase.from("analysis_results").delete().in("report_id", reportIds);
        await supabase.from("reports").delete().eq("user_id", user.id);
      }
      toast.success("All your data has been deleted.");
    } catch {
      toast.error("Failed to delete data. Some tables may not allow deletion.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h1 className="font-display text-4xl text-foreground">SETTINGS</h1>

      {/* Profile */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h3 className="font-display text-lg">PROFILE</h3>
        <div className="space-y-3">
          <div>
            <Label className="font-body text-sm">Email</Label>
            <Input value={user?.email || ""} disabled className="font-body bg-muted" />
          </div>
          <div>
            <Label className="font-body text-sm">Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" className="font-body" />
          </div>
          <div>
            <Label className="font-body text-sm">Organization</Label>
            <Input value={organization} onChange={e => setOrganization(e.target.value)} className="font-body" />
          </div>
          <Button className="font-body font-bold text-sm" onClick={handleUpdateProfile} disabled={savingProfile}>
            {savingProfile ? "SAVING..." : "UPDATE PROFILE"}
          </Button>
        </div>
      </div>

      {/* API Config — Advanced */}
      <Collapsible>
        <div className="bg-card rounded-lg border border-border p-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <div>
              <h3 className="font-display text-lg flex items-center gap-2">⚙️ Advanced: AI Engine Configuration</h3>
              <p className="font-body text-xs text-muted-foreground mt-1 text-left">Default settings work for most users. Only change these if you have your own API key.</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <Label className="font-body text-sm">Backend API URL</Label>
                <button type="button" onClick={() => setBackendUrl("https://cae-backend-7g72.onrender.com")} className="font-body text-xs text-primary hover:underline">Reset to Default</button>
              </div>
              <Input value={backendUrl} onChange={e => setBackendUrl(e.target.value)} placeholder="https://cae-backend-7g72.onrender.com" className="font-body font-mono text-sm" />
              <p className="font-body text-xs text-amber-600 dark:text-amber-500 flex items-start gap-1.5 mt-1.5">
                <span className="shrink-0">⚠️</span>
                <span>Do not change this unless you are hosting your own CAE backend server.</span>
              </p>
            </div>
            <div>
              <Label className="font-body text-sm">AI Provider</Label>
              <select value={provider} onChange={e => setProvider(e.target.value)} className="w-full font-body text-sm bg-card border border-border rounded-lg px-3 py-2">
                <option value="gemini">Google Gemini (Free)</option>
                <option value="groq">Groq - Llama 3 (Free)</option>
                <option value="openai">OpenAI GPT-4o</option>
                <option value="mistral">Mistral (Free)</option>
              </select>
            </div>
            <div>
              <Label className="font-body text-sm">API Key</Label>
              <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Your API key (optional for free providers)" className="font-body font-mono text-sm" />
              <p className="font-body text-xs text-muted-foreground flex items-start gap-1.5 mt-1.5">
                <span className="shrink-0">🔒</span>
                <span>Secure & Stateless: Your key is encrypted in transit and never stored in our database. Use your own key to bypass public server limits (503 errors) and enable bulk auditing.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="font-body font-bold text-sm border-2" onClick={handleTestConnection} disabled={testing}>
                {testing ? "Testing..." : "TEST CONNECTION"}
              </Button>
              <Button className="font-body font-bold text-sm" onClick={handleSaveApi}>SAVE SETTINGS</Button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Danger Zone */}
      <div className="bg-card rounded-lg border-2 border-destructive/30 p-6">
        <h3 className="font-display text-lg text-destructive">DANGER ZONE</h3>
        <p className="font-body text-sm text-muted-foreground mt-2 mb-4">Permanently delete all your data including reports, analyses, and findings.</p>
        <Button variant="destructive" className="font-body font-bold text-sm" onClick={handleDeleteData} disabled={deleting}>
          {deleting ? "DELETING..." : "DELETE ALL MY DATA"}
        </Button>
      </div>
    </div>
  );
}
