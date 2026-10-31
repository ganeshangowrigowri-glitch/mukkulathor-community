import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const ROLE_FOR_PORTAL: Record<string, number> = { admin: 3, referee: 2 };
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;
const GENERIC = "Invalid username or password.";

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { username, password, portal } = await req.json();
    const roleId = ROLE_FOR_PORTAL[String(portal)];
    const uname = String(username ?? "").trim().toLowerCase();
    const pw = String(password ?? "");
    if (!roleId || !uname || !pw || uname.length > 64 || pw.length > 200) {
      return json({ ok: false, error: GENERIC }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Lockout check
    const key = `${portal}:${uname}`;
    const { data: att } = await admin
      .from("staff_login_attempts").select("failed_count, locked_until").eq("login_key", key).maybeSingle();
    if (att?.locked_until && new Date(att.locked_until) > new Date()) {
      return json({ ok: false, error: `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.` }, 429);
    }
    const fail = async () => {
      const count = (att?.failed_count ?? 0) + 1;
      const lock = count >= MAX_FAILS;
      await admin.from("staff_login_attempts").upsert({
        login_key: key,
        failed_count: lock ? 0 : count,
        locked_until: lock ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
        updated_at: new Date().toISOString(),
      });
      return json({ ok: false, error: GENERIC }, 401);
    };

    // 2. Account must exist AND have the role for THIS portal
    const { data: profile } = await admin
      .from("profiles").select("id, role_id").eq("username", uname).eq("role_id", roleId).maybeSingle();
    if (!profile) return await fail();

    const { data: authUser } = await admin.auth.admin.getUserById(profile.id);
    if (!authUser?.user?.email) return await fail();

    // 3. Verify the password (Supabase stores it as a bcrypt hash)
    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signed, error: signErr } = await anon.auth.signInWithPassword({
      email: authUser.user.email, password: pw,
    });
    if (signErr || !signed?.session) {
      if (String(signErr?.message ?? "").toLowerCase().includes("banned")) {
        return json({ ok: false, error: "This account has been deactivated. Contact the administrator." }, 403);
      }
      return await fail();
    }

    // 4. Referee must still be active
    if (roleId === 2) {
      const { data: ref } = await admin.from("referees").select("is_active").eq("profile_id", profile.id).maybeSingle();
      if (!ref?.is_active) {
        return json({ ok: false, error: "This account has been deactivated. Contact the administrator." }, 403);
      }
    }

    await admin.from("staff_login_attempts").delete().eq("login_key", key);
    return json({
      ok: true,
      access_token: signed.session.access_token,
      refresh_token: signed.session.refresh_token,
    });
  } catch (_err) {
    return json({ ok: false, error: "Unexpected error. Please try again." }, 500);
  }
});