// supabase/functions/delete-referee/index.ts
//
// MISSING FILE — src/services/adminService.js deleteReferee() already calls
// supabase.functions.invoke('delete-referee', ...) but this function did not
// exist anywhere in the project, so the "Delete" button on
// src/pages/admin/ManageReferees.jsx has always failed (404 Function not found).
//
// Body: { profile_id: string }
// Deleting the auth user cascades (on delete cascade) to the profiles row,
// which in turn cascades to the referees row — no manual table cleanup needed.
//
// Deploy: supabase functions deploy delete-referee

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
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
      return json({ error: "Only an administrator can delete referees" }, 403);
    }

    const { profile_id } = await req.json();
    if (!profile_id) return json({ error: "profile_id is required" }, 400);

    if (profile_id === callerUser.user.id) {
      return json({ error: "You cannot delete your own account" }, 400);
    }

    const { error: deleteErr } = await admin.auth.admin.deleteUser(profile_id);
    if (deleteErr) return json({ error: deleteErr.message }, 400);

    return json({ success: true });
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