// supabase/functions/send-status-email/index.ts
//
// Generic transactional status-change email, called from the frontend (or
// from a Postgres webhook) whenever a profile's registration_status changes,
// or whenever an admin/referee action needs to notify a member by email.
//
// Body: { profileId: string, subject: string, heading: string, message: string }
//
// Deploy:  supabase functions deploy send-status-email
// Secrets: supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL="..." SITE_URL=...

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "Sri Lanka Mukkulathor Unity <notifications@yourdomain.com>";
const SITE_URL = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { profileId, subject, heading, message, ctaLabel, ctaPath } = await req.json();
    if (!profileId || !subject || !message) {
      return new Response(JSON.stringify({ error: "profileId, subject and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", profileId)
      .single();
    if (error) throw error;
    if (!profile?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: "No email on file" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ctaUrl = `${SITE_URL}${ctaPath ?? "/member/dashboard"}`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: profile.email,
        subject,
        html: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color:#173d5c;">${heading ?? subject}</h2>
            <p>Dear ${profile.full_name ?? "Member"},</p>
            <p>${message}</p>
            <p style="margin: 24px 0;">
              <a href="${ctaUrl}"
                 style="background:#173d5c;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;">
                ${ctaLabel ?? "View dashboard"}
              </a>
            </p>
            <p style="color:#697180;font-size:13px;">Sri Lanka Mukkulathor Unity</p>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: emailRes.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});