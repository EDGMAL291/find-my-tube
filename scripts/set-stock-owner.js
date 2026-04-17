const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const STOCK_USERS_FILE = path.join(DATA_DIR, "stock-users.json");
const STOCK_OWNER_FILE = path.join(DATA_DIR, "stock-owner.json");

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

function normalizeElabUserNumber(value) {
  const raw = String(value || "").trim();
  if (!/^\d{2,3}$/.test(raw)) return "";
  return raw.replace(/^0+(?=\d)/, "");
}

function sanitizeDisplayElabUserNumber(value) {
  const raw = String(value || "").trim();
  return /^\d{2,3}$/.test(raw) ? raw : "";
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

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  if (!fsSync.existsSync(STOCK_USERS_FILE)) {
    await fs.writeFile(STOCK_USERS_FILE, "[]\n", "utf8");
  }

  if (!fsSync.existsSync(STOCK_OWNER_FILE)) {
    await fs.writeFile(STOCK_OWNER_FILE, `${JSON.stringify({ ownerUserNumber: "" }, null, 2)}\n`, "utf8");
  }
}

async function readJsonArray(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const displayElabUserNumber = sanitizeDisplayElabUserNumber(readArg("--user"));
  const normalizedElabUserNumber = normalizeElabUserNumber(displayElabUserNumber);
  const pin = sanitizePin(readArg("--pin"));
  const displayName = sanitizeDisplayName(readArg("--name"));

  if (!normalizedElabUserNumber || pin.length !== 4) {
    console.error("Usage: npm run admin:set -- --user 001 --pin 1234 [--name 'Lab Admin']");
    process.exit(1);
  }

  await ensureFiles();
  const users = await readJsonArray(STOCK_USERS_FILE);
  const now = new Date().toISOString();
  const existing = users.find((user) => normalizeElabUserNumber(user.normalizedElabUserNumber || user.userNumber) === normalizedElabUserNumber);

  if (existing) {
    existing.displayName = displayName || existing.displayName || "";
    existing.pin = pin;
    existing.userNumber = normalizedElabUserNumber;
    existing.displayElabUserNumber = displayElabUserNumber;
    existing.normalizedElabUserNumber = normalizedElabUserNumber;
    existing.role = "admin";
    existing.updatedAt = now;
  } else {
    users.unshift({
      userNumber: normalizedElabUserNumber,
      displayElabUserNumber,
      normalizedElabUserNumber,
      displayName,
      pin,
      role: "admin",
      createdAt: now,
      updatedAt: now
    });
  }

  await fs.writeFile(STOCK_USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await fs.writeFile(STOCK_OWNER_FILE, `${JSON.stringify({ ownerUserNumber: normalizedElabUserNumber }, null, 2)}\n`, "utf8");

  console.log(`Admin set to lab user ${displayElabUserNumber} (normalized: ${normalizedElabUserNumber})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not set admin");
  process.exit(1);
});
