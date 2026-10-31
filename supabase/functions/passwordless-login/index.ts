import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { fullName, email } = await req.json();
    if (!fullName?.trim() || !email?.trim()) {
      return json({ ok: false, error: "Full name and email are required." }, 400);
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingProfile, error: lookupError } = await supabase
    .from("profiles").select("id, full_name, email, role_id").ilike("email", cleanEmail).maybeSingle();
    if (lookupError) return json({ ok: false, error: "Something went wrong looking up your account." }, 500);

    let isNew = false;
          if (existingProfile) {
      if (normalizeName(existingProfile.full_name) !== normalizeName(cleanName)) {
        return json({ ok: false, error: "We couldn't find a matching account. Check your full name and email." }, 401);
      }
      // Admin and referee accounts must use their own login pages
      if (existingProfile.role_id !== 1) {
        return json({ ok: false, error: "This account must sign in from the staff login page." }, 403);
      }
    } else {
      isNew = true;
      const { error: createError } = await supabase.auth.admin.createUser({
        email: cleanEmail,
        email_confirm: true,
        password: crypto.randomUUID() + crypto.randomUUID(),
        user_metadata: { full_name: cleanName },
      });
      if (createError) return json({ ok: false, error: createError.message }, 400);
    }
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink", email: cleanEmail,
    });
    if (linkError || !linkData?.properties?.hashed_token) {
      return json({ ok: false, error: "Could not start your session. Please try again." }, 500);
    }
    return json({ ok: true, token_hash: linkData.properties.hashed_token, email: cleanEmail, isNew });
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : "Unexpected error." }, 500);
  }
});