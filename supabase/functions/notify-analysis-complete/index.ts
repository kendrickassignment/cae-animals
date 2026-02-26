import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://cae-animals.com"];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  return ALLOWED_ORIGINS.includes(origin);
}

serve(async (req) => {
  const CORS = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  if (!isOriginAllowed(req)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { analysis_id, company_name, report_year, risk_score, risk_level, uploader_user_id } = await req.json();

    if (!analysis_id || !company_name || !uploader_user_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Server-side deduplication: check if notification for this analysis_id already exists
    const { data: existingNotifs } = await supabase
      .from("admin_notifications")
      .select("id")
      .eq("analysis_id", analysis_id)
      .limit(1);

    if (existingNotifs && existingNotifs.length > 0) {
      console.log(`Notification for analysis ${analysis_id} already exists, skipping`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "already_notified" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Get uploader info
    const { data: uploaderData } = await supabase.auth.admin.getUserById(uploader_user_id);
    const uploaderEmail = uploaderData?.user?.email || "Unknown user";
    const uploaderName = uploaderData?.user?.user_metadata?.full_name || uploaderEmail;

    // Get all admin user IDs
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No admins to notify" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const adminUserIds = adminRoles.map((r: any) => r.user_id);
    const notificationMessage = `New analysis completed: ${company_name} (${report_year || "N/A"}) — Risk: ${risk_level || "unknown"} (${risk_score ?? "N/A"}) — by ${uploaderName}`;

    // Insert in-app notifications for all admins
    const notifRows = adminUserIds.map((adminId: string) => ({
      admin_user_id: adminId,
      message: notificationMessage,
      type: "success",
      analysis_id,
    }));

    const { error: insertError } = await supabase.from("admin_notifications").insert(notifRows);
    if (insertError) {
      console.error("Failed to insert admin notifications:", insertError);
    }

    // Send email to all admin emails
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      // Get admin emails
      const adminEmails: string[] = [];
      for (const adminId of adminUserIds) {
        const { data: adminUser } = await supabase.auth.admin.getUserById(adminId);
        if (adminUser?.user?.email) adminEmails.push(adminUser.user.email);
      }

      if (adminEmails.length > 0) {
        const html = `
          <h2>New Analysis Completed</h2>
          <table style="border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Company</td><td>${company_name}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Report Year</td><td>${report_year || "N/A"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Risk Level</td><td>${risk_level || "Unknown"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Risk Score</td><td>${risk_score ?? "N/A"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Uploaded by</td><td>${uploaderName} (${uploaderEmail})</td></tr>
          </table>
          <p>Log in to the Corporate Accountability Engine to review this analysis.</p>
        `;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "CAE Alerts <onboarding@resend.dev>",
            to: adminEmails,
            subject: `CAE: New analysis completed — ${company_name} (${report_year || ""})`,
            html,
          }),
        });

        if (!res.ok) {
          console.error("Resend email error:", await res.text());
        }
      }
    } else {
      console.warn("RESEND_API_KEY not set, skipping admin email notifications");
    }

    return new Response(JSON.stringify({ success: true, admins_notified: adminUserIds.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in notify-analysis-complete:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
