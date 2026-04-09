const http = require("http");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT_DIR, "data"));
const STOCK_REQUESTS_FILE = path.join(DATA_DIR, "stock-requests.json");
const STOCK_USERS_FILE = path.join(DATA_DIR, "stock-users.json");
const STOCK_OWNER_FILE = path.join(DATA_DIR, "stock-owner.json");
const STOCK_ORDER_SHEETS_WEBHOOK_URL = String(
  process.env.STOCK_ORDER_SHEETS_WEBHOOK_URL
  ?? "https://script.google.com/macros/s/AKfycbyBQ7KCRmthNf9THsDY_WcsPi_k_R1Yyzkv4IXwuTq8FPVqp2voWXXNT87ebjEpRSsHqA/exec"
).trim();
const MAX_BODY_BYTES = 1024 * 1024;
const VALID_REQUEST_STATUSES = new Set(["received", "packed", "completed", "cancelled"]);
const LAB_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

let writeQueue = Promise.resolve();
const labSessions = new Map();

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(message)
  });
  res.end(message);
}

async function ensureStockRequestsFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  if (!fsSync.existsSync(STOCK_REQUESTS_FILE)) {
    await fs.writeFile(STOCK_REQUESTS_FILE, "[]\n", "utf8");
  }
  if (!fsSync.existsSync(STOCK_USERS_FILE)) {
    await fs.writeFile(STOCK_USERS_FILE, "[]\n", "utf8");
  }
  if (!fsSync.existsSync(STOCK_OWNER_FILE)) {
    await fs.writeFile(STOCK_OWNER_FILE, `${JSON.stringify({ ownerUserNumber: "" }, null, 2)}\n`, "utf8");
  }
}

async function readStockRequests() {
  await ensureStockRequestsFile();
  const raw = await fs.readFile(STOCK_REQUESTS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStockRequests(records) {
  await ensureStockRequestsFile();
  await fs.writeFile(STOCK_REQUESTS_FILE, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

async function readStockUsers() {
  await ensureStockRequestsFile();
  const raw = await fs.readFile(STOCK_USERS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStockUsers(records) {
  await ensureStockRequestsFile();
  await fs.writeFile(STOCK_USERS_FILE, `${JSON.stringify(records, null, 2)}\n`, "utf8");
}

async function readStockOwner() {
  await ensureStockRequestsFile();
  const raw = await fs.readFile(STOCK_OWNER_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return {
      ownerUserNumber: sanitizeUserNumber(parsed?.ownerUserNumber || "")
    };
  } catch {
    return { ownerUserNumber: "" };
  }
}

async function writeStockOwner(record) {
  await ensureStockRequestsFile();
  const ownerUserNumber = sanitizeUserNumber(record?.ownerUserNumber || "");
  await fs.writeFile(STOCK_OWNER_FILE, `${JSON.stringify({ ownerUserNumber }, null, 2)}\n`, "utf8");
}

async function getResolvedOwnerUserNumber() {
  const ownerRecord = await readStockOwner();
  if (ownerRecord.ownerUserNumber) {
    return ownerRecord.ownerUserNumber;
  }

  const users = await readStockUsers();
  return sanitizeUserNumber(users[0]?.userNumber || "");
}

async function canBootstrapOwner() {
  const [ownerRecord, users] = await Promise.all([
    readStockOwner(),
    readStockUsers()
  ]);

  return !ownerRecord.ownerUserNumber && users.length === 0;
}

function queueStockRequestWrite(task) {
  writeQueue = writeQueue.then(task, task);
  return writeQueue;
}

function slugifyStatus(status) {
  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "sent") return "completed";
  return VALID_REQUEST_STATUSES.has(safeStatus) ? safeStatus : "received";
}

function formatStatusLabel(status) {
  return slugifyStatus(status)
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function sanitizeString(value, maxLength = 160) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMultilineString(value, maxLength = 1000) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
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

function verifyPin(pin, salt, expectedHash) {
  const calculated = crypto.scryptSync(pin, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(calculated, "hex"), Buffer.from(expectedHash, "hex"));
}

function createLabSession(userNumber) {
  const token = crypto.randomBytes(24).toString("hex");
  const session = {
    token,
    userNumber,
    createdAt: Date.now(),
    expiresAt: Date.now() + LAB_SESSION_TTL_MS
  };
  labSessions.set(token, session);
  return session;
}

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function getLabSession(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const session = labSessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    labSessions.delete(token);
    return null;
  }

  return session;
}

function requireLabSession(req, res) {
  const session = getLabSession(req);
  if (!session) {
    sendJson(res, 401, {
      ok: false,
      error: "Lab login required"
    });
    return null;
  }

  return session;
}

async function isOwnerUserNumber(userNumber) {
  const ownerUserNumber = await getResolvedOwnerUserNumber();
  return Boolean(ownerUserNumber && ownerUserNumber === sanitizeUserNumber(userNumber));
}

async function requireOwnerSession(req, res) {
  const session = requireLabSession(req, res);
  if (!session) return null;

  if (!(await isOwnerUserNumber(session.userNumber))) {
    sendJson(res, 403, {
      ok: false,
      error: "Admin access required"
    });
    return null;
  }

  return session;
}

function sanitizeItem(item) {
  const quantity = Math.max(0, Number(item?.quantity) || 0);
  if (!quantity) return null;

  return {
    id: sanitizeString(item?.id, 80),
    label: sanitizeString(item?.label, 120),
    quantity,
    unitType: sanitizeString(item?.unitType, 40),
    traySize: Number(item?.traySize) || null,
    packetSize: Number(item?.packetSize) || null,
    formattedQuantity: sanitizeString(item?.formattedQuantity, 120)
  };
}

function buildRequestId() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `STK-${today}-${suffix}`;
}

function sanitizeStockRequestPayload(payload) {
  const items = Array.isArray(payload?.items)
    ? payload.items.map(sanitizeItem).filter(Boolean)
    : [];

  return {
    source: sanitizeString(payload?.source || "find-my-tube", 60),
    submittedAt: sanitizeString(payload?.submittedAt, 40) || new Date().toISOString(),
    requestedBy: sanitizeString(payload?.requestedBy, 120),
    wardUnit: sanitizeString(payload?.wardUnit, 120),
    notes: sanitizeMultilineString(payload?.notes, 500),
    requestText: sanitizeMultilineString(payload?.requestText, 4000),
    lineItemCount: items.length,
    totalRequestedQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    items
  };
}

async function collectRequestBody(req) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function toSheetLineItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: sanitizeString(item?.id, 80),
    label: sanitizeString(item?.label, 120),
    quantity: Math.max(0, Number(item?.quantity) || 0),
    unitType: sanitizeString(item?.unitType, 40),
    traySize: Number(item?.traySize) || null,
    packetSize: Number(item?.packetSize) || null,
    formattedQuantity: sanitizeString(item?.formattedQuantity, 120)
  }));
}

async function mirrorStockRequestToGoogleSheets(record) {
  if (!STOCK_ORDER_SHEETS_WEBHOOK_URL) {
    return {
      ok: false,
      skipped: true,
      reason: "No Google Sheets webhook configured"
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(STOCK_ORDER_SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        id: sanitizeString(record?.id, 40),
        source: sanitizeString(record?.source || "find-my-tube", 60),
        submittedAt: sanitizeString(record?.submittedAt, 40),
        createdAt: sanitizeString(record?.createdAt, 40),
        status: sanitizeString(record?.status || "received", 40),
        requestedBy: sanitizeString(record?.requestedBy, 120),
        wardUnit: sanitizeString(record?.wardUnit, 120),
        notes: sanitizeMultilineString(record?.notes, 500),
        requestText: sanitizeMultilineString(record?.requestText, 4000),
        lineItemCount: Math.max(0, Number(record?.lineItemCount) || 0),
        totalRequestedQuantity: Math.max(0, Number(record?.totalRequestedQuantity) || 0),
        items: toSheetLineItems(record?.items)
      }),
      signal: controller.signal
    });

    const bodyText = await response.text().catch(() => "");
    let payload = null;

    try {
      payload = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      return {
        ok: false,
        skipped: false,
        reason: payload?.error || `Google Sheets mirror failed with status ${response.status}`
      };
    }

    return {
      ok: true,
      skipped: false,
      payload
    };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      reason: error instanceof Error ? error.message : "Google Sheets mirror failed"
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildStockStats(records) {
  const requests = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalRequests = requests.length;
  const totalLineItems = requests.reduce((sum, request) => sum + Number(request.lineItemCount || 0), 0);
  const totalUnitsRequested = requests.reduce((sum, request) => sum + Number(request.totalRequestedQuantity || 0), 0);
  const openRequests = requests.filter((request) => !["completed", "cancelled"].includes(slugifyStatus(request.status))).length;
  const statusCounts = {};
  const wards = new Map();
  const items = new Map();
  const dailyRequests = new Map();

  requests.forEach((request) => {
    const status = slugifyStatus(request.status);
    statusCounts[status] = (statusCounts[status] || 0) + 1;

    const ward = sanitizeString(request.wardUnit, 120);
    if (ward) {
      wards.set(ward, (wards.get(ward) || 0) + 1);
    }

    const dayKey = String(request.createdAt || "").slice(0, 10);
    if (dayKey) {
      dailyRequests.set(dayKey, (dailyRequests.get(dayKey) || 0) + 1);
    }

    (Array.isArray(request.items) ? request.items : []).forEach((item) => {
      const label = sanitizeString(item.label, 120);
      if (!label) return;
      const current = items.get(label) || { requests: 0, quantity: 0 };
      current.requests += 1;
      current.quantity += Number(item.quantity || 0);
      items.set(label, current);
    });
  });

  const topWards = [...wards.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const topItems = [...items.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 8)
    .map(([label, counts]) => ({
      label,
      requests: counts.requests,
      quantity: counts.quantity
    }));

  const recentDays = [...dailyRequests.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, count]) => ({ date, count }));

  return {
    totalRequests,
    openRequests,
    totalLineItems,
    totalUnitsRequested,
    statusCounts,
    topWards,
    topItems,
    recentDays
  };
}

function getStaticFilePath(urlPathname) {
  let pathname = decodeURIComponent(urlPathname);
  if (pathname === "/") pathname = "/index.html";

  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(ROOT_DIR, safePath);
  if (!absolutePath.startsWith(ROOT_DIR)) {
    return "";
  }

  return absolutePath;
}

async function serveStaticAsset(req, res, pathname) {
  const filePath = getStaticFilePath(pathname);
  if (!filePath) {
    sendText(res, 400, "Bad request");
    return;
  }

  if (filePath.startsWith(DATA_DIR) || path.basename(filePath).startsWith(".")) {
    sendText(res, 404, "Not found");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendText(res, 404, "Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      "Cache-Control": pathname.startsWith("/assets/") ? "no-cache" : "no-store"
    });
    fsSync.createReadStream(filePath).pipe(res);
  } catch {
    sendText(res, 404, "Not found");
  }
}

async function handleApiRequest(req, res, pathname, searchParams) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      "Content-Length": "0"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, {
      ok: true,
      service: "find-my-tube-local-backend",
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/stock-auth/session") {
    const session = getLabSession(req);
    if (!session) {
      const setupRequired = await canBootstrapOwner();
      sendJson(res, 200, {
        ok: true,
        authenticated: false,
        setupRequired
      });
      return;
    }

    const isOwner = await isOwnerUserNumber(session.userNumber);
    sendJson(res, 200, {
      ok: true,
      authenticated: true,
      user: {
        userNumber: session.userNumber,
        isOwner
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-auth/login") {
    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const userNumber = sanitizeUserNumber(payload.userNumber);
    const pin = sanitizePin(payload.pin);
    const users = await readStockUsers();
    const user = users.find((entry) => entry.userNumber === userNumber);

    if (!user || pin.length !== 4 || !verifyPin(pin, user.salt, user.pinHash)) {
      sendJson(res, 401, {
        ok: false,
        error: "Incorrect user number or PIN"
      });
      return;
    }

    const session = createLabSession(userNumber);
    const isOwner = await isOwnerUserNumber(userNumber);
    sendJson(res, 200, {
      ok: true,
      authenticated: true,
      token: session.token,
      user: {
        userNumber,
        isOwner
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-auth/bootstrap") {
    if (!(await canBootstrapOwner())) {
      sendJson(res, 403, {
        ok: false,
        error: "Initial admin has already been configured"
      });
      return;
    }

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const userNumber = sanitizeUserNumber(payload.userNumber);
    const pin = sanitizePin(payload.pin);
    if (userNumber.length < 3 || pin.length !== 4) {
      sendJson(res, 400, {
        ok: false,
        error: "Use a user number of at least 3 digits and a 4-digit PIN"
      });
      return;
    }

    const now = new Date().toISOString();
    const { salt, hash } = createPinHash(pin);
    await writeStockUsers([{
      userNumber,
      salt,
      pinHash: hash,
      createdAt: now,
      updatedAt: now
    }]);
    await writeStockOwner({ ownerUserNumber: userNumber });

    const session = createLabSession(userNumber);
    sendJson(res, 201, {
      ok: true,
      authenticated: true,
      token: session.token,
      user: {
        userNumber,
        isOwner: true
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-auth/logout") {
    const token = getBearerToken(req);
    if (token) {
      labSessions.delete(token);
    }

    sendJson(res, 200, {
      ok: true
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/users") {
    const session = await requireOwnerSession(req, res);
    if (!session) return;

    const users = await readStockUsers();
    sendJson(res, 200, {
      users: users.map((user) => ({
        userNumber: sanitizeUserNumber(user.userNumber),
        createdAt: user.createdAt || "",
        updatedAt: user.updatedAt || ""
      }))
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/lab/users") {
    const session = await requireOwnerSession(req, res);
    if (!session) return;

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const userNumber = sanitizeUserNumber(payload.userNumber);
    const pin = sanitizePin(payload.pin);
    if (userNumber.length < 3 || pin.length !== 4) {
      sendJson(res, 400, {
        ok: false,
        error: "Use a user number of at least 3 digits and a 4-digit PIN"
      });
      return;
    }

    const users = await readStockUsers();
    if (users.some((user) => sanitizeUserNumber(user.userNumber) === userNumber)) {
      sendJson(res, 409, {
        ok: false,
        error: "That lab user number already exists"
      });
      return;
    }

    const { salt, hash } = createPinHash(pin);
    const now = new Date().toISOString();
    users.push({
      userNumber,
      salt,
      pinHash: hash,
      createdAt: now,
      updatedAt: now
    });
    await writeStockUsers(users);

    sendJson(res, 201, {
      ok: true,
      user: {
        userNumber,
        createdAt: now
      }
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/stock-requests") {
    const requests = await readStockRequests();
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));
    const rows = [...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    sendJson(res, 200, { requests: rows });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/stock-requests") {
    const session = requireLabSession(req, res);
    if (!session) return;

    const requests = await readStockRequests();
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));
    const rows = [...requests]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    sendJson(res, 200, {
      requests: rows,
      user: {
        userNumber: session.userNumber
      }
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/stock-stats") {
    const session = requireLabSession(req, res);
    if (!session) return;

    const requests = await readStockRequests();
    sendJson(res, 200, {
      stats: buildStockStats(requests),
      user: {
        userNumber: session.userNumber
      }
    });
    return;
  }

  if (req.method === "DELETE" && pathname === "/api/lab/stock-data") {
    const session = await requireOwnerSession(req, res);
    if (!session) return;

    await queueStockRequestWrite(async () => {
      await writeStockRequests([]);
    });

    sendJson(res, 200, {
      ok: true,
      cleared: true,
      clearedBy: session.userNumber
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-requests") {
    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const cleanPayload = sanitizeStockRequestPayload(payload);
    if (!cleanPayload.requestedBy || !cleanPayload.wardUnit || !cleanPayload.items.length) {
      sendJson(res, 400, {
        ok: false,
        error: "Requested by, ward / unit, and at least one item are required"
      });
      return;
    }

    const record = await queueStockRequestWrite(async () => {
      const existing = await readStockRequests();
      const now = new Date().toISOString();
      const nextRecord = {
        id: buildRequestId(),
        createdAt: now,
        updatedAt: now,
        status: "received",
        ...cleanPayload
      };

      existing.push(nextRecord);
      await writeStockRequests(existing);
      return nextRecord;
    });

    const sheetMirror = await mirrorStockRequestToGoogleSheets(record);
    if (!sheetMirror.ok && !sheetMirror.skipped) {
      console.error(`Find My Tube: Google Sheets mirror failed for ${record.id}: ${sheetMirror.reason}`);
    }

    sendJson(res, 201, {
      ok: true,
      request: {
        id: record.id,
        status: record.status,
        createdAt: record.createdAt
      },
      sheetMirror: {
        ok: sheetMirror.ok,
        skipped: sheetMirror.skipped,
        reason: sheetMirror.reason || ""
      }
    });
    return;
  }

  if (req.method === "PATCH" && pathname.startsWith("/api/stock-requests/")) {
    const session = requireLabSession(req, res);
    if (!session) return;

    const match = pathname.match(/^\/api\/stock-requests\/([^/]+)\/status$/);
    if (!match) {
      sendJson(res, 404, { ok: false, error: "Not found" });
      return;
    }

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const nextStatus = slugifyStatus(payload.status);
    const requestId = sanitizeString(match[1], 80);
    const updatedRecord = await queueStockRequestWrite(async () => {
      const existing = await readStockRequests();
      const target = existing.find((record) => record.id === requestId);
      if (!target) {
        return null;
      }

      target.status = nextStatus;
      target.updatedAt = new Date().toISOString();
      await writeStockRequests(existing);
      return target;
    });

    if (!updatedRecord) {
      sendJson(res, 404, { ok: false, error: "Request not found" });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      request: {
        id: updatedRecord.id,
        status: updatedRecord.status,
        statusLabel: formatStatusLabel(updatedRecord.status),
        updatedAt: updatedRecord.updatedAt
      }
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: "Not found" });
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (requestUrl.pathname.startsWith("/api/")) {
      await handleApiRequest(req, res, requestUrl.pathname, requestUrl.searchParams);
      return;
    }

    await serveStaticAsset(req, res, requestUrl.pathname);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: "Server error",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(PORT, HOST, async () => {
  await ensureStockRequestsFile();
  console.log(`Find My Tube running on http://${HOST}:${PORT}`);
});
