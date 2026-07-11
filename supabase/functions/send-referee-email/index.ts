// supabase/functions/send-referee-email/index.ts
//
// Invoked from the frontend right after `submit_registration()` succeeds.
// Body: { applicantId: string }
// For every referee_recommendations row belonging to that applicant with
// notified_at IS NULL, sends an email via Resend and stamps notified_at.
//
// Deploy:   supabase functions deploy send-referee-email
// Secrets:  supabase secrets set RESEND_API_KEY=... RESEND_FROM_EMAIL="..." SITE_URL=...

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
    const { applicantId } = await req.json();
    if (!applicantId) {
      return new Response(JSON.stringify({ error: "applicantId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: applicant, error: applicantErr } = await supabase
      .from("profiles")
      .select("full_name, branch")
      .eq("id", applicantId)
      .single();
    if (applicantErr) throw applicantErr;

    const { data: recs, error: recsErr } = await supabase
      .from("referee_recommendations")
      .select("id, referee_id, referees(profile_id, profiles(full_name, email))")
      .eq("applicant_id", applicantId)
      .is("notified_at", null);
    if (recsErr) throw recsErr;

    const results = [];
    for (const rec of recs ?? []) {
      const refereeProfile = rec.referees?.profiles;
      if (!refereeProfile?.email) continue;

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: refereeProfile.email,
          subject: "Recommendation requested — Sri Lanka Mukkulathor Unity",
          html: `
            <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto;">
              <h2 style="color:#173d5c;">New recommendation request</h2>
              <p>Dear ${refereeProfile.full_name ?? "Referee"},</p>
              <p><strong>${applicant.full_name}</strong> (${applicant.branch ?? "Mukkulathor"}) has listed you as a
              referee for their community membership application.</p>
              <p>Please log in to review their details and either approve or reject the recommendation.</p>
              <p style="margin: 24px 0;">
                <a href="${SITE_URL}/referee/dashboard"
                   style="background:#173d5c;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;">
                  Review application
                </a>
              </p>
              <p style="color:#697180;font-size:13px;">Sri Lanka Mukkulathor Unity — Membership Verification</p>
            </div>
          `,
        }),
      });

      const ok = emailRes.ok;
      if (ok) {
        await supabase
          .from("referee_recommendations")
          .update({ notified_at: new Date().toISOString() })
          .eq("id", rec.id);
      }
      results.push({ recommendationId: rec.id, sent: ok });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});