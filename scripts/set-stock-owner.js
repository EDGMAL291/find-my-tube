const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const STOCK_USERS_FILE = path.join(DATA_DIR, "stock-users.json");
const STOCK_OWNER_FILE = path.join(DATA_DIR, "stock-owner.json");

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

function sanitizeUserNumber(value) {
  return String(value || "").replace(/\D+/g, "").slice(0, 12);
}

function sanitizePin(value) {
  return String(value || "").replace(/\D+/g, "").slice(0, 4);
}

function createPinHash(pin, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
  return { salt, hash };
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
  const userNumber = sanitizeUserNumber(readArg("--user"));
  const pin = sanitizePin(readArg("--pin"));

  if (userNumber.length < 3 || pin.length !== 4) {
    console.error("Usage: npm run admin:set -- --user 001 --pin 1234");
    process.exit(1);
  }

  await ensureFiles();
  const users = await readJsonArray(STOCK_USERS_FILE);
  const now = new Date().toISOString();
  const { salt, hash } = createPinHash(pin);
  const existing = users.find((user) => sanitizeUserNumber(user.userNumber) === userNumber);

  if (existing) {
    existing.salt = salt;
    existing.pinHash = hash;
    existing.updatedAt = now;
  } else {
    users.unshift({
      userNumber,
      salt,
      pinHash: hash,
      createdAt: now,
      updatedAt: now
    });
  }

  await fs.writeFile(STOCK_USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await fs.writeFile(STOCK_OWNER_FILE, `${JSON.stringify({ ownerUserNumber: userNumber }, null, 2)}\n`, "utf8");

  console.log(`Admin set to lab user ${userNumber}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not set admin");
  process.exit(1);
});
