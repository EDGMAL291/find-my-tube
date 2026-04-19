const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

function normalizeElabUserNumber(value) {
  const raw = String(value || "").trim();
  if (!/^\d{2,3}$/.test(raw)) return "";
  return raw.replace(/^0+(?=\d)/, "");
}

function sanitizePin(value) {
  return String(value || "").replace(/\D+/g, "").slice(0, 4);
}

function sanitizeDisplayName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  const userInput = readArg("--user");
  const normalizedUserNumber = normalizeElabUserNumber(userInput);
  const pin = sanitizePin(readArg("--pin"));
  const displayName = sanitizeDisplayName(readArg("--name")) || `Admin ${userInput || normalizedUserNumber}`;

  if (!normalizedUserNumber || pin.length !== 4) {
    console.error("Usage: npm run admin:set -- --user 001 --pin 1234 [--name 'Lab Admin']");
    process.exit(1);
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || "").trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const nowIso = new Date().toISOString();
  const pinHash = hashPin(pin);

  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("id,user_number")
    .eq("user_number", normalizedUserNumber)
    .limit(1)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    throw new Error(existingError.message || "Could not read existing users");
  }

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        pin_hash: pinHash,
        role: "admin",
        is_active: true,
        updated_at: nowIso
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message || "Could not update admin user");
    }

    console.log(`Admin updated for lab user ${userInput} (normalized: ${normalizedUserNumber})`);
    return;
  }

  const { error: insertError } = await supabase.from("users").insert({
    user_number: normalizedUserNumber,
    display_name: displayName,
    pin_hash: pinHash,
    role: "admin",
    is_active: true,
    created_at: nowIso,
    updated_at: nowIso
  });

  if (insertError) {
    throw new Error(insertError.message || "Could not create admin user");
  }

  console.log(`Admin set to lab user ${userInput} (normalized: ${normalizedUserNumber})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not set admin");
  process.exit(1);
});
