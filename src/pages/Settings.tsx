import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { saveBackendUrl, saveProviderConfig, getStoredBackendUrl, getStoredProvider, healthCheck, testProvider } from "@/services/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("CAE");
  const [backendUrl, setBackendUrl] = useState(getStoredBackendUrl());
  const [provider, setProvider] = useState(getStoredProvider());
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await healthCheck();
      toast.success("Backend is reachable!");
      if (apiKey) {
        const result = await testProvider(provider, apiKey);
        if (result.status === "success") toast.success(`AI Provider working: ${result.model}`);
        else toast.error(`AI Provider failed: ${result.error}`);
      }
    } catch {
      toast.error("Cannot reach backend. Check the URL.");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveApi = () => {
    saveBackendUrl(backendUrl);
    saveProviderConfig(provider, apiKey);
    toast.success("API settings saved!");
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
          <Button className="font-body font-bold text-sm">UPDATE PROFILE</Button>
        </div>
      </div>

      {/* API Config */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h3 className="font-display text-lg">AI ENGINE CONFIGURATION</h3>
        <div className="space-y-3">
          <div>
            <Label className="font-body text-sm">Backend API URL</Label>
            <Input value={backendUrl} onChange={e => setBackendUrl(e.target.value)} placeholder="https://cae-backend.onrender.com" className="font-body font-mono text-sm" />
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
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="font-body font-bold text-sm border-2" onClick={handleTestConnection} disabled={testing}>
              {testing ? "Testing..." : "TEST CONNECTION"}
            </Button>
            <Button className="font-body font-bold text-sm" onClick={handleSaveApi}>SAVE SETTINGS</Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-lg border-2 border-destructive/30 p-6">
        <h3 className="font-display text-lg text-destructive">DANGER ZONE</h3>
        <p className="font-body text-sm text-muted-foreground mt-2 mb-4">Permanently delete all your data including reports, analyses, and findings.</p>
        <Button variant="destructive" className="font-body font-bold text-sm">DELETE ALL MY DATA</Button>
      </div>
    </div>
  );
}
