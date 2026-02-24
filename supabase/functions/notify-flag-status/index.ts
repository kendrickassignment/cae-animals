import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://cae-animals.lovable.app",
  "https://id-preview--66fa6b17-db0f-4366-ba7e-e60ac0ceec2b.lovable.app",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

serve(async (req) => {
  const CORS = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    // Verify caller is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the caller is admin
    const { data: { user: callerUser }, error: authError } = await createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    }).auth.getUser();

    if (authError || !callerUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: callerUser.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const { action, analysis_id, company_name, reason, analysis_url, uploader_user_id } = await req.json();

    if (!action || !analysis_id || !company_name || !uploader_user_id) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    // Get uploader email
    const { data: userData } = await supabase.auth.admin.getUserById(uploader_user_id);
    const uploaderEmail = userData?.user?.email;

    if (!uploaderEmail) {
      return new Response(JSON.stringify({ error: "Uploader not found" }), { status: 404, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const safeCompany = escapeHtml(company_name);
    const safeReason = reason ? escapeHtml(reason) : "";
    const safeUrl = analysis_url || "";

    const isFlagged = action === "flag";
    const subject = isFlagged
      ? "CAE Alert: Your analysis has been flagged"
      : "CAE Alert: Flag removed from your analysis";

    const html = isFlagged
      ? `<h2>Your analysis has been flagged as suspicious</h2>
<p><strong>Company:</strong> ${safeCompany}</p>
<p><strong>Reason:</strong> ${safeReason}</p>
<p><a href="${safeUrl}">View Analysis</a></p>`
      : `<h2>Flag removed from your analysis</h2>
<p><strong>Company:</strong> ${safeCompany}</p>
<p>An admin has removed the suspicious flag from your analysis.</p>
<p><a href="${safeUrl}">View Analysis</a></p>`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "CAE Alerts <onboarding@resend.dev>",
          to: [uploaderEmail],
          subject,
          html,
        }),
      });
      if (!res.ok) {
        console.error("Resend error:", await res.text());
      }
    } else {
      console.warn("RESEND_API_KEY not set, skipping email");
    }

    // Insert in-app notification for the uploader
    const notifMessage = isFlagged
      ? `Your analysis for ${company_name} has been flagged: ${reason || "No reason given"}`
      : `Flag removed from your analysis for ${company_name}`;

    const { error: notifError } = await supabase.from("admin_notifications").insert({
      admin_user_id: uploader_user_id,
      message: notifMessage,
      type: isFlagged ? "warning" : "info",
      analysis_id,
    });
    if (notifError) {
      console.error("Failed to insert flag notification:", notifError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
