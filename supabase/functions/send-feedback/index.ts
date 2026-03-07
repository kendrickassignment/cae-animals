import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = ["https://cae-animals.com", "https://cae-animals.lovable.app"];

function isOriginAllowedValue(origin: string): boolean {
  if (!origin) return true;
  return (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith(".lovableproject.com") ||
    origin.endsWith(".lovable.app") ||
    origin.startsWith("http://localhost:")
  );
}

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = isOriginAllowedValue(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  return isOriginAllowedValue(origin);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { category, message, attachment_urls } = await req.json() as {
      category?: string;
      message?: string;
      attachment_urls?: unknown;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (message.trim().length > 5000) {
      return new Response(JSON.stringify({ error: "Message must be 5000 characters or less" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    if (attachment_urls !== undefined) {
      if (
        !Array.isArray(attachment_urls) ||
        attachment_urls.length > 5 ||
        attachment_urls.some((url) => typeof url !== "string")
      ) {
        return new Response(JSON.stringify({ error: "Attachments must be up to 5 files" }), {
          status: 400, headers: { ...CORS, "Content-Type": "application/json" },
        });
      }
    }

    const attachmentPaths = (attachment_urls ?? []) as string[];

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const userName = profile?.full_name || user.email || "Unknown user";
    const safeCategory = escapeHtml(category || "General");
    const safeName = escapeHtml(userName);
    const safeEmail = escapeHtml(user.email || "");
    const safeMessage = escapeHtml(message.trim());

    // Download attachments and convert to Resend attachment format (base64)
    const resendAttachments: Array<{ filename: string; content: string }> = [];
    for (const storagePath of attachmentPaths) {
      try {
        // Extract the path from the public URL — take everything after /object/public/reports/
        let filePath = storagePath;
        const marker = "/object/public/reports/";
        const idx = storagePath.indexOf(marker);
        if (idx !== -1) {
          filePath = storagePath.substring(idx + marker.length);
        }

        const { data: fileData, error: dlError } = await supabase.storage
          .from("reports")
          .download(filePath);

        if (dlError || !fileData) {
          console.error("Failed to download attachment:", filePath, dlError);
          continue;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        // Base64 encode
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        const filename = filePath.split("/").pop() || "attachment";
        // Remove timestamp prefix if present (e.g., "1234567890_file.png" -> "file.png")
        const cleanFilename = filename.replace(/^\d+_/, "");

        resendAttachments.push({ filename: cleanFilename, content: base64 });
      } catch (e) {
        console.error("Error processing attachment:", e);
      }
    }

    // Build attachment links section for email body
    let attachmentHtml = "";
    if (resendAttachments.length > 0) {
      attachmentHtml = `<p><strong>Attachments:</strong> ${resendAttachments.length} file(s) attached to this email</p>`;
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const emailBody: Record<string, unknown> = {
      from: "CAE <onboarding@cae-animals.com>",
      to: ["kendrickfilbert@gmail.com"],
      subject: `CAE Feedback: ${safeCategory} — from ${safeName}`,
      html: `<h2>User Feedback</h2>
<p><strong>Category:</strong> ${safeCategory}</p>
<p><strong>From:</strong> ${safeName} (${safeEmail})</p>
<p><strong>Message:</strong></p>
<p>${safeMessage.replace(/\n/g, "<br>")}</p>
${attachmentHtml}`,
      reply_to: user.email || undefined,
    };

    if (resendAttachments.length > 0) {
      emailBody.attachments = resendAttachments;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return new Response(JSON.stringify({ error: "Failed to send feedback" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
