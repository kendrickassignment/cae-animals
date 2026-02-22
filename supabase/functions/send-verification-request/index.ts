import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { analysis_id, note, company_name, report_year, risk_score, analysis_url } = await req.json();

    if (!analysis_id) {
      return new Response(JSON.stringify({ error: "analysis_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already requested
    const { count } = await supabase
      .from("verification_requests")
      .select("*", { count: "exact", head: true })
      .eq("analysis_id", analysis_id)
      .eq("requester_id", user.id)
      .eq("status", "pending");

    if (count && count > 0) {
      return new Response(JSON.stringify({ error: "You already submitted a request" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert request
    const { error: insertError } = await supabase.from("verification_requests").insert({
      analysis_id,
      requester_id: user.id,
      note: note?.trim() || null,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save request" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get requester profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const requesterName = profile?.full_name || user.email || "Unknown";

    // Send email to admins
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const safeName = escapeHtml(requesterName);
      const safeCompany = escapeHtml(company_name || "Unknown");
      const safeNote = note ? escapeHtml(note.trim()) : "No note provided";
      const safeUrl = escapeHtml(analysis_url || "");

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "CAE System <onboarding@resend.dev>",
          to: ["kendrickfilbert@gmail.com"],
          subject: `Verification Request: ${safeCompany} (${report_year || "N/A"})`,
          html: `<h2>Verification Request</h2>
<p><strong>Requester:</strong> ${safeName}</p>
<p><strong>Company:</strong> ${safeCompany}</p>
<p><strong>Report Year:</strong> ${report_year || "N/A"}</p>
<p><strong>Risk Score:</strong> ${risk_score ?? "N/A"}</p>
<p><strong>Note:</strong> ${safeNote}</p>
<p><a href="${safeUrl}">View Analysis</a></p>`,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
