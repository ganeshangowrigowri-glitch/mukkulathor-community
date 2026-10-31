import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const STRONG = /^(?=.*[A-Za-z])(?=.*\d).{10,72}$/;
const USERNAME = /^[a-z0-9._-]{3,32}$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Caller must be a signed-in administrator
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: caller, error: callerErr } = await admin.auth.getUser(token);
    if (callerErr || !caller?.user) return json({ error: "Not authenticated" }, 401);
    const { data: cp } = await admin.from("profiles").select("role_id").eq("id", caller.user.id).single();
    if (cp?.role_id !== 3) return json({ error: "Only an administrator can manage referee accounts" }, 403);

    const { action, profile_id, username, password, is_active } = await req.json();
    if (!profile_id) return json({ error: "profile_id is required" }, 400);

    const { data: target } = await admin
      .from("profiles").select("id, role_id, username").eq("id", profile_id).maybeSingle();
    if (!target || target.role_id !== 2) return json({ error: "Referee not found" }, 404);

    if (action === "set_active") {
      const active = Boolean(is_active);
      const { error: e1 } = await admin.from("referees").update({ is_active: active }).eq("profile_id", profile_id);
      if (e1) return json({ error: e1.message }, 400);
      // Ban/unban blocks new logins and token refresh
      const { error: e2 } = await admin.auth.admin.updateUserById(profile_id, {
        ban_duration: active ? "none" : "876000h",
      });
      if (e2) return json({ error: e2.message }, 400);
      await admin.from("audit_logs").insert({
        actor_id: caller.user.id, action: active ? "ACTIVATE_REFEREE" : "DEACTIVATE_REFEREE",
        entity_type: "profile", entity_id: profile_id,
      });
      return json({ success: true });
    }

    if (action === "set_credentials") {
      if (!STRONG.test(String(password ?? ""))) {
        return json({ error: "Password must be 10-72 characters and include at least one letter and one number" }, 400);
      }
      const uname = String(username ?? target.username ?? "").trim().toLowerCase();
      if (!USERNAME.test(uname)) {
        return json({ error: "Username must be 3-32 characters: lowercase letters, numbers, dots, dashes or underscores" }, 400);
      }
      if (uname !== target.username) {
        const { data: taken } = await admin.from("profiles").select("id").eq("username", uname).neq("id", profile_id).maybeSingle();
        if (taken) return json({ error: "That username is already taken" }, 409);
        const { error: uErr } = await admin.from("profiles").update({ username: uname }).eq("id", profile_id);
        if (uErr) return json({ error: uErr.message }, 400);
      }
      const { error: pErr } = await admin.auth.admin.updateUserById(profile_id, { password: String(password) });
      if (pErr) return json({ error: pErr.message }, 400);
      await admin.from("staff_login_attempts").delete().eq("login_key", `referee:${uname}`);
      await admin.from("audit_logs").insert({
        actor_id: caller.user.id, action: "RESET_REFEREE_PASSWORD", entity_type: "profile", entity_id: profile_id,
      });
      return json({ success: true, username: uname });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 500);
  }
});