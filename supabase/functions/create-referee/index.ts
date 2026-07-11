// supabase/functions/create-referee/index.ts
//
// MISSING FILE — src/services/adminService.js createReferee() already calls
// supabase.functions.invoke('create-referee', ...) but this function did not
// exist anywhere in the project, so "Create New Referee" in
// src/pages/admin/ManageReferees.jsx has always failed (404 Function not found).
//
// Body: { full_name, username, password, email, mobile, designation, region,
//         father_name, kulam, caste, gothram, occupation, profile_image_url }
//
// Auth model note: the project's login screen (src/pages/public/Login.jsx)
// only ever authenticates with email + password (per the "do not change the
// authentication flow" requirement). "username" is therefore stored as a
// display/handle field on the profile — the referee still signs in with the
// email + password set here, exactly like every other account.
//
// Deploy: supabase functions deploy create-referee

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // Only an authenticated admin may call this function.
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerUser, error: callerErr } = await callerClient.auth.getUser();
    if (callerErr || !callerUser?.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role_id")
      .eq("id", callerUser.user.id)
      .single();
    if (callerProfile?.role_id !== 3) {
      return json({ error: "Only an administrator can create referees" }, 403);
    }

    const body = await req.json();
    const {
      full_name, username, password, email, mobile, designation, region,
      father_name, kulam, caste, gothram, occupation, profile_image_url,
    } = body ?? {};

    if (!full_name || !username || !password || !email) {
      return json({ error: "full_name, username, password and email are required" }, 400);
    }
    if (String(password).length < 8) {
      return json({ error: "Password must be at least 8 characters" }, 400);
    }

    const { data: existingUsername } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existingUsername) {
      return json({ error: "That username is already taken" }, 409);
    }

    // 1. Create the auth user (email + password — same auth flow as everyone else)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) return json({ error: createErr.message }, 400);

    const userId = created.user.id;

    try {
      // 2. Extend the profile row (auth trigger already inserted a bare row —
      // see handle_new_user in 0002_functions_triggers.sql)
      const { error: profileErr } = await admin
        .from("profiles")
        .update({
          role_id: 2, // referee
          full_name,
          username,
          mobile: mobile || null,
          notification_email: email,
          registration_status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (profileErr) throw profileErr;

      // 3. Create the referees row
      const { data: refereeRow, error: refereeErr } = await admin
        .from("referees")
        .insert({
          profile_id: userId,
          designation: designation || null,
          region: region || null,
          father_name: father_name || null,
          kulam: kulam || null,
          caste: caste || null,
          gothram: gothram || null,
          occupation: occupation || null,
          profile_image_url: profile_image_url || null,
          is_active: true,
        })
        .select("referee_code")
        .single();
      if (refereeErr) throw refereeErr;

      return json({ success: true, username, referee_code: refereeRow.referee_code });
    } catch (inner) {
      // Roll back the auth user if profile/referee setup failed, so we don't
      // leave an orphaned login with no referee record.
      await admin.auth.admin.deleteUser(userId);
      throw inner;
    }
  } catch (err) {
    return json({ error: String(err?.message ?? err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}