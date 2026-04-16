const http = require("http");
const https = require("https");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const STOCK_SHEETS_WEBHOOK_URL = process.env.STOCK_SHEETS_WEBHOOK_URL
  ?? "https://script.google.com/macros/s/AKfycbyBQ7KCRmthNf9THsDY_WcsPi_k_R1Yyzkv4IXwuTq8FPVqp2voWXXNT87ebjEpRSsHqA/exec";
const STOCK_SHEETS_TIMEOUT_MS = 12000;
const ROOT_DIR = __dirname;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT_DIR, "data"));
const STOCK_REQUESTS_FILE = path.join(DATA_DIR, "stock-requests.json");
const STOCK_RECEIPTS_FILE = path.join(DATA_DIR, "stock-receipts.json");
const STOCK_USERS_FILE = path.join(DATA_DIR, "stock-users.json");
const STOCK_OWNER_FILE = path.join(DATA_DIR, "stock-owner.json");
const STOCK_ORDER_SHEETS_WEBHOOK_URL = String(
  process.env.STOCK_ORDER_SHEETS_WEBHOOK_URL
  ?? "https://script.google.com/macros/s/AKfycbyBQ7KCRmthNf9THsDY_WcsPi_k_R1Yyzkv4IXwuTq8FPVqp2voWXXNT87ebjEpRSsHqA/exec"
).trim();
const MAX_BODY_BYTES = 1024 * 1024;
const VALID_REQUEST_STATUSES = new Set(["received", "packed", "ready", "collected", "completed", "cancelled"]);
const LAB_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const STOCK_SHEETS_COLUMN_DEFAULTS = Object.freeze({
  yellowTubes: 0,
  greyTubes: 0,
  purpleTubes: 0,
  greenTubes: 0,
  blueTubes: 0,
  pearlTubes: 0,
  tanTubes: 0,
  pinkTubes: 0,
  yellowTubeTrays: 0,
  greyTubeTrays: 0,
  purpleTubeTrays: 0,
  greenTubeTrays: 0,
  blueTubeTrays: 0,
  pearlTubeTrays: 0,
  tanTubeTrays: 0,
  pinkTubeTrays: 0,
  yellowTubeSingles: 0,
  greyTubeSingles: 0,
  purpleTubeSingles: 0,
  greenTubeSingles: 0,
  blueTubeSingles: 0,
  pearlTubeSingles: 0,
  tanTubeSingles: 0,
  pinkTubeSingles: 0
});
const STOCK_REQUEST_ITEM_LIMITS = Object.freeze({
  "pink-tubes-single": 5
});

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
  if (!fsSync.existsSync(STOCK_RECEIPTS_FILE)) {
    await fs.writeFile(STOCK_RECEIPTS_FILE, "[]\n", "utf8");
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

async function readStockReceipts() {
  await ensureStockRequestsFile();
  const raw = await fs.readFile(STOCK_RECEIPTS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeStockReceipts(records) {
  await ensureStockRequestsFile();
  await fs.writeFile(STOCK_RECEIPTS_FILE, `${JSON.stringify(records, null, 2)}\n`, "utf8");
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
  const safeStatus = slugifyStatus(status);
  if (safeStatus === "received") return "Submitted";
  if (safeStatus === "packed") return "Ready for Collection";
  if (safeStatus === "ready") return "Ready for Collection";
  if (safeStatus === "collected" || safeStatus === "completed") return "Collected";
  if (safeStatus === "cancelled") return "Cancelled";
  return safeStatus
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

function sanitizeDisplayName(value) {
  return sanitizeString(value, 120);
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

function normalizeElabUserNumber(value) {
  const raw = String(value || "").trim();
  return /^\d{2,3}$/.test(raw) ? raw : "";
}

function normalizePin(value) {
  const raw = String(value || "").trim();
  return /^\d{4}$/.test(raw) ? raw : "";
}

function normalizeUserRole(value) {
  const safeRole = String(value || "").trim().toLowerCase();
  if (safeRole === "admin") return "admin";
  if (safeRole === "labuser" || safeRole === "lab-user" || safeRole === "medical-technologist") return "labUser";
  return "labUser";
}

function getStoredUserDisplayName(user) {
  return sanitizeDisplayName(user?.displayName || user?.name || "");
}

async function findStockUserByNumber(userNumber) {
  const safeUserNumber = sanitizeUserNumber(userNumber);
  if (!safeUserNumber) return null;

  const users = await readStockUsers();
  return users.find((entry) => sanitizeUserNumber(entry.userNumber) === safeUserNumber) || null;
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

function getEffectiveUserRole(user, ownerUserNumber = "") {
  const safeOwnerUserNumber = sanitizeUserNumber(ownerUserNumber);
  const safeUserNumber = sanitizeUserNumber(user?.userNumber || "");
  if (safeOwnerUserNumber && safeUserNumber && safeOwnerUserNumber === safeUserNumber) {
    return "admin";
  }

  return normalizeUserRole(user?.role);
}

async function isOwnerUserNumber(userNumber) {
  const safeUserNumber = sanitizeUserNumber(userNumber);
  if (!safeUserNumber) return false;

  const ownerUserNumber = await getResolvedOwnerUserNumber();
  if (ownerUserNumber && ownerUserNumber === safeUserNumber) {
    return true;
  }

  const user = await getUserRecord(safeUserNumber);
  return normalizeUserRole(user?.role) === "admin";
}

async function getUserRecord(userNumber) {
  const users = await readStockUsers();
  return users.find((entry) => sanitizeUserNumber(entry.userNumber) === sanitizeUserNumber(userNumber)) || null;
}

function getUserDisplayName(user) {
  const fullName = sanitizePersonName(user?.fullName || "");
  if (fullName) return fullName;
  return sanitizeUserNumber(user?.userNumber || "") || "User";
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
    variantLabel: sanitizeString(item?.variantLabel, 80),
    quantity,
    unitType: sanitizeString(item?.unitType, 40),
    traySize: Number(item?.traySize) || null,
    packetSize: Number(item?.packetSize) || null,
    formattedQuantity: sanitizeString(item?.formattedQuantity, 120),
    inventoryUnits: Math.max(0, Number(item?.inventoryUnits) || 0),
    sheetColumnKey: sanitizeString(item?.sheetColumnKey, 80),
    sheetTrayColumnKey: sanitizeString(item?.sheetTrayColumnKey, 80),
    sheetSingleColumnKey: sanitizeString(item?.sheetSingleColumnKey, 80)
  };
}

function buildRequestId() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `STK-${today}-${suffix}`;
}

function buildReceiptId() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `REC-${today}-${suffix}`;
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
    totalRequestedQuantity: items.reduce((sum, item) => sum + getItemInventoryUnits(item), 0),
    items
  };
}

function validateStockRequestItems(items = []) {
  for (const item of items) {
    const maxAllowed = Number(STOCK_REQUEST_ITEM_LIMITS[item?.id] || 0);
    if (maxAllowed && Number(item?.quantity || 0) > maxAllowed) {
      return `${sanitizeString(item?.label, 120) || "This item"} is limited to ${maxAllowed} per request.`;
    }
  }

  return "";
}

function sanitizeStockReceiptPayload(payload) {
  const items = Array.isArray(payload?.items)
    ? payload.items.map(sanitizeItem).filter(Boolean)
    : [];

  return {
    supplierName: sanitizeString(payload?.supplierName, 120),
    reference: sanitizeString(payload?.reference, 120),
    notes: sanitizeMultilineString(payload?.notes, 500),
    submittedAt: sanitizeString(payload?.submittedAt, 40) || new Date().toISOString(),
    lineItemCount: items.length,
    totalReceivedQuantity: items.reduce((sum, item) => sum + getItemInventoryUnits(item), 0),
    items
  };
}

function getItemInventoryUnits(item) {
  const explicitInventoryUnits = Math.max(0, Number(item?.inventoryUnits) || 0);
  if (explicitInventoryUnits) return explicitInventoryUnits;

  const quantity = Math.max(0, Number(item?.quantity) || 0);
  if (!quantity) return 0;
  if (item?.unitType === "tray") {
    return quantity * Math.max(0, Number(item?.traySize) || 0);
  }
  if (item?.unitType === "packet") {
    return quantity * Math.max(0, Number(item?.packetSize) || 0);
  }
  return quantity;
}

function buildStockSheetsColumns(items = []) {
  const columns = { ...STOCK_SHEETS_COLUMN_DEFAULTS };

  items.forEach((item) => {
    const totalUnits = getItemInventoryUnits(item);
    if (item.sheetColumnKey && Object.prototype.hasOwnProperty.call(columns, item.sheetColumnKey)) {
      columns[item.sheetColumnKey] += totalUnits;
    }
    if (item.unitType === "tray" && item.sheetTrayColumnKey && Object.prototype.hasOwnProperty.call(columns, item.sheetTrayColumnKey)) {
      columns[item.sheetTrayColumnKey] += Math.max(0, Number(item.quantity) || 0);
    }
    if (item.unitType === "each" && item.sheetSingleColumnKey && Object.prototype.hasOwnProperty.call(columns, item.sheetSingleColumnKey)) {
      columns[item.sheetSingleColumnKey] += Math.max(0, Number(item.quantity) || 0);
    }
  });

  return columns;
}

function getStockInventoryKey(item) {
  return sanitizeString(item?.sheetColumnKey, 80) || sanitizeString(item?.id, 80);
}

function getStockInventoryLabel(item) {
  return sanitizeString(item?.label, 120) || sanitizeString(item?.id, 80) || "Item";
}

function getStockInventorySummary(receipts, requests) {
  const rows = new Map();

  function touchRow(item) {
    const key = getStockInventoryKey(item);
    if (!key) return null;
    const existing = rows.get(key) || {
      key,
      label: getStockInventoryLabel(item),
      received: 0,
      issued: 0,
      onHand: 0,
      updatedAt: ""
    };
    if (!existing.label) {
      existing.label = getStockInventoryLabel(item);
    }
    rows.set(key, existing);
    return existing;
  }

  receipts.forEach((receipt) => {
    const updatedAt = sanitizeString(receipt?.updatedAt || receipt?.createdAt, 40);
    (Array.isArray(receipt?.items) ? receipt.items : []).forEach((item) => {
      const row = touchRow(item);
      if (!row) return;
      row.received += getItemInventoryUnits(item);
      if (updatedAt && (!row.updatedAt || updatedAt > row.updatedAt)) {
        row.updatedAt = updatedAt;
      }
    });
  });

  requests
    .filter((request) => isRequestInventoryDeducted(request))
    .forEach((request) => {
      const updatedAt = sanitizeString(request?.updatedAt || request?.createdAt, 40);
      (Array.isArray(request?.items) ? request.items : []).forEach((item) => {
        const row = touchRow(item);
        if (!row) return;
        row.issued += getItemInventoryUnits(item);
        if (updatedAt && (!row.updatedAt || updatedAt > row.updatedAt)) {
          row.updatedAt = updatedAt;
        }
      });
    });

  return [...rows.values()]
    .map((row) => ({
      ...row,
      onHand: row.received - row.issued
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function isRequestInventoryDeducted(request) {
  if (request?.inventoryDeducted === true) return true;
  if (request?.inventoryDeducted === false) return false;

  const status = slugifyStatus(request?.status);
  if (status === "completed") return true;
  if (status === "collected" && (request?.collectedAt || request?.collectedBy)) return true;
  return false;
}

function getInventoryMapFromRecords(receipts, requests, options = {}) {
  const map = new Map();
  const excludeRequestId = sanitizeString(options.excludeRequestId, 80);

  function touch(item) {
    const key = getStockInventoryKey(item);
    if (!key) return null;
    const existing = map.get(key) || {
      key,
      label: getStockInventoryLabel(item),
      onHand: 0
    };
    if (!existing.label) existing.label = getStockInventoryLabel(item);
    map.set(key, existing);
    return existing;
  }

  receipts.forEach((receipt) => {
    (Array.isArray(receipt?.items) ? receipt.items : []).forEach((item) => {
      const row = touch(item);
      if (!row) return;
      row.onHand += getItemInventoryUnits(item);
    });
  });

  requests
    .filter((request) => isRequestInventoryDeducted(request))
    .filter((request) => !excludeRequestId || sanitizeString(request?.id, 80) !== excludeRequestId)
    .forEach((request) => {
      (Array.isArray(request?.items) ? request.items : []).forEach((item) => {
        const row = touch(item);
        if (!row) return;
        row.onHand -= getItemInventoryUnits(item);
      });
    });

  return map;
}

function buildCollectionShortages(request, inventoryMap) {
  const shortages = [];
  const items = Array.isArray(request?.items) ? request.items : [];

  items.forEach((item) => {
    const key = getStockInventoryKey(item);
    const requiredUnits = getItemInventoryUnits(item);
    const onHand = Math.max(0, Number(inventoryMap.get(key)?.onHand || 0));
    if (requiredUnits <= onHand) return;
    shortages.push({
      key,
      label: getStockInventoryLabel(item),
      requiredUnits,
      onHand,
      shortBy: requiredUnits - onHand
    });
  });

  return shortages;
}

function appendStatusAudit(record, status, userNumber, timestamp) {
  const safeStatus = slugifyStatus(status);
  const safeUserNumber = sanitizeUserNumber(userNumber);
  const safeTimestamp = sanitizeString(timestamp, 40) || new Date().toISOString();
  const history = Array.isArray(record.statusHistory) ? record.statusHistory : [];

  history.push({
    status: safeStatus,
    updatedAt: safeTimestamp,
    updatedBy: safeUserNumber
  });
  record.statusHistory = history;

  if (safeStatus === "received") {
    record.receivedAt = safeTimestamp;
    record.receivedBy = safeUserNumber;
  }
  if (safeStatus === "packed") {
    record.packedAt = safeTimestamp;
    record.packedBy = safeUserNumber;
  }
  if (safeStatus === "ready") {
    record.readyAt = safeTimestamp;
    record.readyBy = safeUserNumber;
  }
  if (safeStatus === "collected") {
    record.collectedAt = safeTimestamp;
    record.collectedBy = safeUserNumber;
  }
  if (safeStatus === "completed") {
    record.completedAt = safeTimestamp;
    record.completedBy = safeUserNumber;
  }
  if (safeStatus === "cancelled") {
    record.cancelledAt = safeTimestamp;
    record.cancelledBy = safeUserNumber;
  }
}

function buildStockSheetsPayload(record, options = {}) {
  const { action = "upsert-request", previousStatus = "", changedBy = "" } = options;
  const items = Array.isArray(record?.items) ? record.items : [];

  return {
    action,
    requestId: sanitizeString(record?.id, 80),
    source: sanitizeString(record?.source, 60),
    enteredBy: sanitizeString(record?.enteredBy, 40),
    status: slugifyStatus(record?.status),
    statusLabel: formatStatusLabel(record?.status),
    previousStatus: previousStatus ? slugifyStatus(previousStatus) : "",
    previousStatusLabel: previousStatus ? formatStatusLabel(previousStatus) : "",
    changedBy: sanitizeString(changedBy, 40),
    createdAt: sanitizeString(record?.createdAt, 40),
    updatedAt: sanitizeString(record?.updatedAt, 40),
    submittedAt: sanitizeString(record?.submittedAt, 40),
    requestedBy: sanitizeString(record?.requestedBy, 120),
    wardUnit: sanitizeString(record?.wardUnit, 120),
    notes: sanitizeMultilineString(record?.notes, 500),
    requestText: sanitizeMultilineString(record?.requestText, 4000),
    lineItemCount: Math.max(0, Number(record?.lineItemCount) || 0),
    totalRequestedQuantity: Math.max(0, Number(record?.totalRequestedQuantity) || 0),
    itemsSummary: items.map((item) => `${item.variantLabel ? `${item.label} - ${item.variantLabel}` : item.label}: ${item.formattedQuantity || item.quantity}`).join(" | "),
    items: items.map((item) => ({
      id: sanitizeString(item.id, 80),
      label: sanitizeString(item.label, 120),
      variantLabel: sanitizeString(item.variantLabel, 80),
      quantity: Math.max(0, Number(item.quantity) || 0),
      unitType: sanitizeString(item.unitType, 40),
      traySize: Number(item.traySize) || null,
      packetSize: Number(item.packetSize) || null,
      inventoryUnits: getItemInventoryUnits(item),
      formattedQuantity: sanitizeString(item.formattedQuantity, 120)
    })),
    sheetColumns: buildStockSheetsColumns(items)
  };
}

function postJson(urlString, payload, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const target = new URL(urlString);
    const transport = target.protocol === "https:" ? https : http;
    const body = JSON.stringify(payload);
    const request = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: "POST",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": Buffer.byteLength(body)
      }
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        responseBody += chunk;
      });
      response.on("end", () => {
        const statusCode = Number(response.statusCode) || 0;
        const location = typeof response.headers.location === "string" ? response.headers.location : "";
        if (location && [301, 302, 303, 307, 308].includes(statusCode) && redirectCount < 5) {
          resolve(postJson(new URL(location, target).toString(), payload, redirectCount + 1));
          return;
        }

        resolve({
          statusCode,
          body: responseBody
        });
      });
    });

    request.on("error", reject);
    request.setTimeout(STOCK_SHEETS_TIMEOUT_MS, () => {
      request.destroy(new Error("Google Sheets sync timed out"));
    });
    request.write(body);
    request.end();
  });
}

async function syncStockRecordToSheets(record, options = {}) {
  if (!STOCK_SHEETS_WEBHOOK_URL) {
    return { ok: false, skipped: true, error: "No Google Sheets webhook configured" };
  }

  try {
    const payload = buildStockSheetsPayload(record, options);
    const response = await postJson(STOCK_SHEETS_WEBHOOK_URL, payload);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return { ok: true, statusCode: response.statusCode };
    }
    return {
      ok: false,
      statusCode: response.statusCode,
      error: response.body || `Google Sheets sync failed with status ${response.statusCode}`
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Google Sheets sync failed"
    };
  }
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
  const openRequests = requests.filter((request) => !["collected", "completed", "cancelled"].includes(slugifyStatus(request.status))).length;
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
      const label = sanitizeString(item.variantLabel ? `${item.label} - ${item.variantLabel}` : item.label, 120);
      if (!label) return;
      const current = items.get(label) || { requests: 0, quantity: 0 };
      current.requests += 1;
      current.quantity += getItemInventoryUnits(item);
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

    const user = await findStockUserByNumber(session.userNumber);
    const ownerUserNumber = await getResolvedOwnerUserNumber();
    const role = getEffectiveUserRole(user || { userNumber: session.userNumber }, ownerUserNumber);
    const isOwner = role === "admin";
    sendJson(res, 200, {
      ok: true,
      authenticated: true,
      user: {
        userNumber: session.userNumber,
        displayName: getStoredUserDisplayName(user),
        role,
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

    const userNumber = normalizeElabUserNumber(payload.userNumber);
    const pin = normalizePin(payload.pin);
    const user = await findStockUserByNumber(userNumber);

    if (!user || !pin || !verifyPin(pin, user.salt, user.pinHash)) {
      sendJson(res, 401, {
        ok: false,
        error: "Incorrect eLab user number or PIN"
      });
      return;
    }

    const session = createLabSession(userNumber);
    const ownerUserNumber = await getResolvedOwnerUserNumber();
    const role = getEffectiveUserRole(user || { userNumber }, ownerUserNumber);
    const isOwner = role === "admin";
    sendJson(res, 200, {
      ok: true,
      authenticated: true,
      token: session.token,
      user: {
        userNumber,
        displayName: getStoredUserDisplayName(user),
        role,
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

    const userNumber = normalizeElabUserNumber(payload.userNumber);
    const pin = normalizePin(payload.pin);
    const displayName = sanitizeDisplayName(payload.displayName);
    if (!userNumber || !pin) {
      sendJson(res, 400, {
        ok: false,
        error: "Use an eLab user number (2 or 3 digits) and a 4-digit PIN"
      });
      return;
    }

    const now = new Date().toISOString();
    const { salt, hash } = createPinHash(pin);
    await writeStockUsers([{
      userNumber,
      displayName,
      role: "admin",
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
        displayName,
        role: "admin",
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
    const ownerUserNumber = await getResolvedOwnerUserNumber();
    sendJson(res, 200, {
      users: users.map((user) => ({
        userNumber: sanitizeUserNumber(user.userNumber),
        displayName: getStoredUserDisplayName(user),
        role: getEffectiveUserRole(user, ownerUserNumber),
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

    const userNumber = normalizeElabUserNumber(payload.userNumber);
    const pin = normalizePin(payload.pin);
    const displayName = sanitizeDisplayName(payload.displayName);
    const role = normalizeUserRole(payload.role);
    if (!userNumber || !pin || displayName.length < 2) {
      sendJson(res, 400, {
        ok: false,
        error: "Use a display name, an eLab user number (2 or 3 digits), and a 4-digit PIN"
      });
      return;
    }

    const users = await readStockUsers();
    if (users.some((user) => sanitizeUserNumber(user.userNumber) === userNumber)) {
      sendJson(res, 409, {
        ok: false,
        error: "That eLab user number already exists"
      });
      return;
    }

    const { salt, hash } = createPinHash(pin);
    const now = new Date().toISOString();
    users.push({
      userNumber,
      displayName,
      role,
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
        displayName,
        role,
        createdAt: now
      }
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/stock-requests") {
    const requests = await readStockRequests();
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));
    const rows = [...requests]
      .filter((record) => sanitizeString(record?.source, 60) !== "lab-manual-entry")
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

  if (req.method === "GET" && pathname === "/api/lab/stock-inventory") {
    const session = requireLabSession(req, res);
    if (!session) return;

    const [requests, receipts] = await Promise.all([
      readStockRequests(),
      readStockReceipts()
    ]);
    const summary = getStockInventorySummary(receipts, requests);
    const recentReceipts = [...receipts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);

    sendJson(res, 200, {
      summary,
      recentReceipts,
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

  if (req.method === "POST" && pathname === "/api/lab/stock-receipts") {
    const session = requireLabSession(req, res);
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

    const cleanPayload = sanitizeStockReceiptPayload(payload);
    if (!cleanPayload.items.length) {
      sendJson(res, 400, {
        ok: false,
        error: "At least one item is required"
      });
      return;
    }

    const receipt = await queueStockRequestWrite(async () => {
      const existing = await readStockReceipts();
      const now = new Date().toISOString();
      const nextRecord = {
        id: buildReceiptId(),
        createdAt: now,
        updatedAt: now,
        receivedBy: session.userNumber,
        ...cleanPayload
      };

      existing.push(nextRecord);
      await writeStockReceipts(existing);
      return nextRecord;
    });

    sendJson(res, 201, {
      ok: true,
      receipt: {
        id: receipt.id,
        createdAt: receipt.createdAt,
        receivedBy: receipt.receivedBy
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/lab/stock-requests/manual") {
    const session = requireLabSession(req, res);
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

    const cleanPayload = sanitizeStockRequestPayload({
      ...payload,
      source: "lab-manual-entry"
    });
    const itemValidationError = validateStockRequestItems(cleanPayload.items);
    if (!cleanPayload.requestedBy || !cleanPayload.wardUnit || !cleanPayload.items.length) {
      sendJson(res, 400, {
        ok: false,
        error: "Requested by, ward / unit, and at least one item are required"
      });
      return;
    }
    if (itemValidationError) {
      sendJson(res, 400, {
        ok: false,
        error: itemValidationError
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
        statusUpdatedAt: now,
        statusUpdatedBy: session.userNumber,
        enteredBy: session.userNumber,
        ...cleanPayload
      };
      appendStatusAudit(nextRecord, "received", session.userNumber, now);

      existing.push(nextRecord);
      await writeStockRequests(existing);
      return nextRecord;
    });
    const sheetSync = await syncStockRecordToSheets(record, { action: "create-request", changedBy: session.userNumber });

    sendJson(res, 201, {
      ok: true,
      request: {
        id: record.id,
        status: record.status,
        statusLabel: formatStatusLabel(record.status),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        enteredBy: record.enteredBy
      },
      sheetSync
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
    const itemValidationError = validateStockRequestItems(cleanPayload.items);
    if (!cleanPayload.requestedBy || !cleanPayload.wardUnit || !cleanPayload.items.length) {
      sendJson(res, 400, {
        ok: false,
        error: "Requested by, ward / unit, and at least one item are required"
      });
      return;
    }
    if (itemValidationError) {
      sendJson(res, 400, {
        ok: false,
        error: itemValidationError
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
        statusUpdatedAt: now,
        statusUpdatedBy: "",
        ...cleanPayload
      };
      appendStatusAudit(nextRecord, "received", "", now);

      existing.push(nextRecord);
      await writeStockRequests(existing);
      return nextRecord;
    });
    const sheetSync = await syncStockRecordToSheets(record, { action: "create-request" });

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
    const updatedResult = await queueStockRequestWrite(async () => {
      const existing = await readStockRequests();
      const target = existing.find((record) => record.id === requestId);
      if (!target) {
        return null;
      }

      const previousStatus = slugifyStatus(target.status);
      const wasDeducted = isRequestInventoryDeducted(target);
      const shouldDeductInventory = nextStatus === "collected" && !wasDeducted;

      if (shouldDeductInventory) {
        const receipts = await readStockReceipts();
        const inventoryMap = getInventoryMapFromRecords(receipts, existing, { excludeRequestId: requestId });
        const shortages = buildCollectionShortages(target, inventoryMap);
        if (shortages.length) {
          return {
            error: "insufficient-stock",
            shortages
          };
        }
      }

      const now = new Date().toISOString();
      target.status = nextStatus;
      target.updatedAt = now;
      target.statusUpdatedAt = target.updatedAt;
      target.statusUpdatedBy = session.userNumber;
      appendStatusAudit(target, nextStatus, session.userNumber, now);

      if (shouldDeductInventory) {
        const deductedItems = (Array.isArray(target.items) ? target.items : []).map((item) => ({
          id: sanitizeString(item?.id, 80),
          label: sanitizeString(item?.label, 120),
          variantLabel: sanitizeString(item?.variantLabel, 80),
          quantity: Math.max(0, Number(item?.quantity) || 0),
          unitType: sanitizeString(item?.unitType, 40),
          traySize: Number(item?.traySize) || null,
          packetSize: Number(item?.packetSize) || null,
          formattedQuantity: sanitizeString(item?.formattedQuantity, 120),
          inventoryUnits: getItemInventoryUnits(item)
        }));
        const totalUnitsDeducted = deductedItems.reduce((sum, item) => sum + Math.max(0, Number(item.inventoryUnits || 0)), 0);
        target.inventoryDeducted = true;
        target.inventoryDeductedAt = now;
        target.inventoryDeductedBy = session.userNumber;
        target.collectionRecord = {
          orderId: target.id,
          collectedAt: now,
          requestedBy: sanitizeString(target.requestedBy, 120),
          wardUnit: sanitizeString(target.wardUnit, 120),
          markedCollectedBy: session.userNumber,
          collectedBy: sanitizeString(target.requestedBy, 120),
          items: deductedItems,
          totalUnitsDeducted
        };
      }

      await writeStockRequests(existing);
      return {
        record: target,
        previousStatus
      };
    });

    if (!updatedResult?.record) {
      if (updatedResult?.error === "insufficient-stock") {
        sendJson(res, 409, {
          ok: false,
          error: "Not enough stock on hand to mark this order as collected.",
          shortages: updatedResult.shortages || []
        });
        return;
      }
      sendJson(res, 404, { ok: false, error: "Request not found" });
      return;
    }
    const updatedRecord = updatedResult.record;
    const sheetSync = await syncStockRecordToSheets(updatedRecord, {
      action: "update-status",
      previousStatus: updatedResult.previousStatus,
      changedBy: session.userNumber
    });

    sendJson(res, 200, {
      ok: true,
      request: {
        id: updatedRecord.id,
        status: updatedRecord.status,
        statusLabel: formatStatusLabel(updatedRecord.status),
        updatedAt: updatedRecord.updatedAt,
        statusUpdatedAt: updatedRecord.statusUpdatedAt || updatedRecord.updatedAt,
        statusUpdatedBy: updatedRecord.statusUpdatedBy || "",
        inventoryDeducted: Boolean(updatedRecord.inventoryDeducted),
        collectionRecord: updatedRecord.collectionRecord || null
      },
      sheetSync
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
