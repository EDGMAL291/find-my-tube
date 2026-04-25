require("dotenv").config();

const http = require("http");
const https = require("https");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = __dirname;
const STOCK_SHEETS_WEBHOOK_URL = String(
  process.env.STOCK_SHEETS_WEBHOOK_URL
  ?? "https://script.google.com/macros/s/AKfycbyBQ7KCRmthNf9THsDY_WcsPi_k_R1Yyzkv4IXwuTq8FPVqp2voWXXNT87ebjEpRSsHqA/exec"
).trim();
const STOCK_ORDER_SHEETS_WEBHOOK_URL = String(
  process.env.STOCK_ORDER_SHEETS_WEBHOOK_URL
  ?? "https://script.google.com/macros/s/AKfycbyBQ7KCRmthNf9THsDY_WcsPi_k_R1Yyzkv4IXwuTq8FPVqp2voWXXNT87ebjEpRSsHqA/exec"
).trim();
const STOCK_SHEETS_TIMEOUT_MS = 12000;
const STOCK_AUTH_INVALID_MESSAGE = "Login details not recognised.";
const STOCK_AUTH_REPLACED_MESSAGE = "Session replaced by a newer login.";
const STOCK_AUTH_SERVICE_UNAVAILABLE_MESSAGE = "Login service is unavailable.";
const STOCK_AUTH_CONFIG_ERROR_MESSAGE = "Server configuration error.";
const MAX_BODY_BYTES = 1024 * 1024;
const LAB_SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const CANCELLED_ARCHIVE_WINDOW_MS = 5 * 60 * 60 * 1000;
const AUTH_COOKIE_NAME = "fmt_lab_session";
const VALID_REQUEST_STATUSES = new Set(["submitted", "received", "packed", "ready", "collected", "completed", "cancelled"]);

const SUPABASE_URL = String(process.env.SUPABASE_URL || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const SUPABASE_ANON_KEY = String(process.env.SUPABASE_ANON_KEY || "").trim();
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
let SUPABASE_PROJECT_HOST = "";
if (SUPABASE_URL) {
  try {
    SUPABASE_PROJECT_HOST = new URL(SUPABASE_URL).host;
  } catch {
    SUPABASE_PROJECT_HOST = "";
  }
}

const supabase = HAS_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  : null;

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

function getAllowedOrigin(req) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return "*";
  return origin;
}

function setCorsHeaders(req, res) {
  const origin = getAllowedOrigin(req);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (origin !== "*") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
}

function sendJson(req, res, statusCode, payload) {
  const body = JSON.stringify(payload);
  setCorsHeaders(req, res);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(req, res, statusCode, message) {
  setCorsHeaders(req, res);
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(message)
  });
  res.end(message);
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error || "Unknown error");
}

function isStockRequestStatusConstraintError(error) {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("stock_requests_status_check");
}

function isMissingOptionalStockItemColumnsError(error, tableName) {
  const message = getErrorMessage(error).toLowerCase();
  const safeTableName = String(tableName || "").toLowerCase();
  if (!message.includes("schema cache")) return false;
  if (!message.includes(`'${safeTableName}'`)) return false;
  return message.includes("'batch_number'") || message.includes("'expiry_date'");
}

function isMissingUserSessionColumnsError(error) {
  const message = getErrorMessage(error).toLowerCase();
  if (!message) return false;
  if (!message.includes("does not exist")) return false;
  if (!message.includes("relation \"users\"") && !message.includes("table \"users\"")) return false;
  return (
    message.includes("active_session_token_hash")
    || message.includes("last_seen_at")
    || message.includes("last_login_at")
  );
}

function logStockAuthError(context, error, details = {}) {
  const safeDetails = { ...details };
  try {
    console.error(`[stock-auth] ${context}`, {
      ...safeDetails,
      errorMessage: getErrorMessage(error),
      errorCode: error?.code || "",
      errorDetails: error?.details || "",
      errorHint: error?.hint || ""
    });
  } catch {
    // no-op
  }
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

function sanitizeDateOnly(value) {
  const safe = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(safe) ? safe : "";
}

function sanitizeUserNumber(value) {
  return String(value || "").replace(/\D+/g, "").slice(0, 12);
}

function sanitizePin(value) {
  return String(value || "").replace(/\D+/g, "").slice(0, 4);
}

function normalizeElabUserNumber(value, { allowAnyLength = false } = {}) {
  const raw = String(value || "").trim();
  if (!raw || !/^\d+$/.test(raw)) return "";
  if (!allowAnyLength && !/^\d{2,3}$/.test(raw)) return "";
  return raw.replace(/^0+(?=\d)/, "");
}

function normalizePin(value) {
  const raw = String(value || "").trim();
  return /^\d{4}$/.test(raw) ? raw : "";
}

function normalizeUserRole(value) {
  const safeRole = String(value || "").trim().toLowerCase();
  if (safeRole === "admin") return "admin";
  if (
    safeRole === "labuser"
    || safeRole === "lab-user"
    || safeRole === "medical-technologist"
    || safeRole === "medical technologist"
    || safeRole === "medical_technologist"
    || safeRole === "technologist"
    || safeRole === "user"
  ) return "labUser";
  return "labUser";
}

function normalizeUserStatus(value) {
  const safeStatus = String(value || "").trim().toLowerCase();
  if (safeStatus === "disabled" || safeStatus === "inactive" || safeStatus === "suspended") {
    return "disabled";
  }
  return "active";
}

function slugifyStatus(status) {
  const safeStatus = String(status || "").trim().toLowerCase();
  if (safeStatus === "sent") return "completed";
  return VALID_REQUEST_STATUSES.has(safeStatus) ? safeStatus : "submitted";
}

function formatStatusLabel(status) {
  const safeStatus = slugifyStatus(status);
  if (safeStatus === "submitted" || safeStatus === "received") return "Received";
  if (safeStatus === "packed") return "Ready for Collection";
  if (safeStatus === "ready") return "Ready for Collection";
  if (safeStatus === "collected" || safeStatus === "completed") return "Completed";
  if (safeStatus === "cancelled") return "Cancelled";
  return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
}

function createLabSessionToken() {
  return crypto.randomBytes(24).toString("hex");
}

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPinHash(pin, pinHash) {
  const safe = String(pinHash || "");
  const parts = safe.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = parts[1];
  const expectedHash = parts[2];
  if (!salt || !expectedHash) return false;
  try {
    const calculated = crypto.scryptSync(pin, salt, 64).toString("hex");
    const a = Buffer.from(calculated, "hex");
    const b = Buffer.from(expectedHash, "hex");
    if (!a.length || !b.length || a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function parseCookies(req) {
  const raw = String(req.headers.cookie || "");
  const cookies = Object.create(null);
  raw.split(";").forEach((pair) => {
    const [name, ...rest] = pair.split("=");
    if (!name) return;
    cookies[name.trim()] = decodeURIComponent(rest.join("=").trim());
  });
  return cookies;
}

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || "");
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function getSessionToken(req) {
  const cookies = parseCookies(req);
  const fromCookie = String(cookies[AUTH_COOKIE_NAME] || "").trim();
  return fromCookie || getBearerToken(req);
}

function buildAuthCookie(token, req, { expiresAt = null, clear = false } = {}) {
  const attrs = [
    `${AUTH_COOKIE_NAME}=${clear ? "" : encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly"
  ];

  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
  const isSecure = forwardedProto === "https" || req.socket.encrypted || /onrender\.com$/i.test(String(req.headers.host || ""));
  const hasOrigin = Boolean(String(req.headers.origin || "").trim());
  const shouldUseCrossSiteCookie = isSecure && (hasOrigin || String(process.env.NODE_ENV || "").trim().toLowerCase() === "production");
  if (isSecure) attrs.push("Secure");

  if (clear) {
    attrs.push("Max-Age=0");
    attrs.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    attrs.push(shouldUseCrossSiteCookie ? "SameSite=None" : "SameSite=Lax");
    return attrs.join("; ");
  }

  if (expiresAt instanceof Date) {
    attrs.push(`Expires=${expiresAt.toUTCString()}`);
  }

  attrs.push(shouldUseCrossSiteCookie ? "SameSite=None" : "SameSite=Lax");

  return attrs.join("; ");
}

function buildAuthClearCookies(req) {
  const primary = buildAuthCookie("", req, { clear: true });
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
  const isSecure = forwardedProto === "https" || req.socket.encrypted || /onrender\.com$/i.test(String(req.headers.host || ""));
  const fallbackParts = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "SameSite=Lax"
  ];
  if (isSecure) fallbackParts.push("Secure");
  const fallback = fallbackParts.join("; ");
  return [primary, fallback];
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

function sanitizeReceiptItem(item) {
  const safeItem = sanitizeItem(item);
  if (!safeItem) return null;
  return {
    ...safeItem,
    id: sanitizeString(item?.id || item?.itemId || item?.stock_item_id, 80),
    batchNumber: sanitizeString(item?.batchNumber, 120),
    expiryDate: sanitizeDateOnly(item?.expiryDate)
  };
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

function sanitizeStockReceiptPayload(payload) {
  const items = Array.isArray(payload?.items)
    ? payload.items.map(sanitizeReceiptItem).filter(Boolean)
    : [];

  return {
    supplierName: sanitizeString(payload?.supplierName || payload?.supplier, 120),
    reference: sanitizeString(payload?.reference, 120),
    notes: sanitizeMultilineString(payload?.notes || payload?.note, 500),
    submittedAt: sanitizeString(payload?.submittedAt, 40) || new Date().toISOString(),
    lineItemCount: items.length,
    totalReceivedQuantity: items.reduce((sum, item) => sum + getItemInventoryUnits(item), 0),
    items
  };
}

function validateStockReceiptPayload(payload) {
  const rawItems = Array.isArray(payload?.items) ? payload.items : [];
  if (!rawItems.length) {
    return "At least one item is required";
  }

  for (let index = 0; index < rawItems.length; index += 1) {
    const item = rawItems[index] || {};
    const itemPosition = `Item ${index + 1}`;
    const itemId = sanitizeString(item?.id || item?.itemId || item?.stock_item_id, 80);
    if (!itemId) {
      return `${itemPosition}: item id is required.`;
    }

    const quantity = Number(item?.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return `${itemPosition}: quantity must be a positive whole number.`;
    }

    const inventoryUnits = Number(item?.inventoryUnits);
    if (!Number.isFinite(inventoryUnits) || inventoryUnits <= 0) {
      return `${itemPosition}: inventoryUnits must be a positive number.`;
    }
  }

  return "";
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

function getItemInventoryUnits(item) {
  const explicitInventoryUnits = Math.max(0, Number(item?.inventoryUnits) || 0);
  if (explicitInventoryUnits) return explicitInventoryUnits;

  const quantity = Math.max(0, Number(item?.quantity) || 0);
  if (!quantity) return 0;
  if (item?.unitType === "tray") return quantity * Math.max(0, Number(item?.traySize) || 0);
  if (item?.unitType === "packet") return quantity * Math.max(0, Number(item?.packetSize) || 0);
  return quantity;
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

function getStockInventoryKey(item) {
  return sanitizeString(item?.sheetColumnKey, 80) || sanitizeString(item?.id, 80) || sanitizeString(item?.label, 120);
}

function getStockInventoryLabel(item) {
  return sanitizeString(item?.label, 120) || sanitizeString(item?.id, 80) || "Item";
}

function getStockBatchKey(item) {
  return getStockInventoryKey(item);
}

function buildBatchExpiryConflictMessage(itemLabel, expiryDate) {
  const safeItemLabel = sanitizeString(itemLabel, 120) || "this item";
  const safeExpiryDate = sanitizeDateOnly(expiryDate);
  if (!safeExpiryDate) {
    return "This lot number already exists for this item. Please use the same expiry date.";
  }
  return `This lot number already exists for this item with expiry ${safeExpiryDate}. Please use the same expiry date.`;
}

function appendStatusAudit(record, status, userNumber, timestamp) {
  const safeStatus = slugifyStatus(status);
  const safeUserNumber = sanitizeUserNumber(userNumber);
  const safeTimestamp = sanitizeString(timestamp, 40) || new Date().toISOString();
  const history = Array.isArray(record.statusHistory) ? [...record.statusHistory] : [];

  history.push({
    status: safeStatus,
    updatedAt: safeTimestamp,
    updatedBy: safeUserNumber
  });
  record.statusHistory = history;

  if (safeStatus === "submitted" || safeStatus === "received") {
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

function isRequestInventoryDeducted(request) {
  if (request?.inventoryDeducted === true) return true;
  if (request?.inventoryDeducted === false) return false;

  const status = slugifyStatus(request?.status);
  if (status === "completed") return true;
  if (status === "collected" && (request?.collectedAt || request?.collectedBy)) return true;
  return false;
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
    if (ward) wards.set(ward, (wards.get(ward) || 0) + 1);

    const dayKey = String(request.createdAt || "").slice(0, 10);
    if (dayKey) dailyRequests.set(dayKey, (dailyRequests.get(dayKey) || 0) + 1);

    (Array.isArray(request.items) ? request.items : []).forEach((item) => {
      const label = sanitizeString(item.variantLabel ? `${item.label} - ${item.variantLabel}` : item.label, 120);
      if (!label) return;
      const current = items.get(label) || { requests: 0, quantity: 0 };
      current.requests += 1;
      current.quantity += getItemInventoryUnits(item);
      items.set(label, current);
    });
  });

  const topWards = [...wards.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const topItems = [...items.entries()].sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 8).map(([label, counts]) => ({
    label,
    requests: counts.requests,
    quantity: counts.quantity
  }));
  const recentDays = [...dailyRequests.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14).map(([date, count]) => ({ date, count }));

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

function parseBooleanQueryFlag(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  const safeValue = String(value).trim().toLowerCase();
  if (!safeValue) return fallback;
  return ["1", "true", "yes", "on"].includes(safeValue);
}

function resolveCancelledAtFromHistory(statusHistory = []) {
  if (!Array.isArray(statusHistory) || !statusHistory.length) return "";
  for (let index = statusHistory.length - 1; index >= 0; index -= 1) {
    const entry = statusHistory[index] || {};
    if (slugifyStatus(entry?.status) !== "cancelled") continue;
    const candidate = sanitizeString(entry?.updatedAt || entry?.timestamp, 40);
    if (candidate) return candidate;
  }
  return "";
}

function resolveCancelledAt(request) {
  const direct = sanitizeString(request?.cancelledAt || request?.cancelled_at, 40);
  if (direct) return direct;
  return resolveCancelledAtFromHistory(request?.statusHistory);
}

function isArchivedCancelledRequest(request, nowMs = Date.now()) {
  if (slugifyStatus(request?.status) !== "cancelled") return false;
  const cancelledAt = resolveCancelledAt(request);
  const cancelledMs = new Date(cancelledAt).getTime();
  if (!Number.isFinite(cancelledMs) || cancelledMs <= 0) return true;
  return (nowMs - cancelledMs) >= CANCELLED_ARCHIVE_WINDOW_MS;
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

function mapUserFromDb(user) {
  return {
    id: sanitizeString(user?.id, 80),
    userNumber: normalizeElabUserNumber(user?.user_number, { allowAnyLength: true }),
    displayElabUserNumber: normalizeElabUserNumber(user?.user_number, { allowAnyLength: true }),
    displayName: sanitizeDisplayName(user?.display_name),
    role: normalizeUserRole(user?.role),
    status: user?.is_active ? "active" : "disabled",
    createdAt: sanitizeString(user?.created_at, 40),
    updatedAt: sanitizeString(user?.updated_at, 40),
    lastLoginAt: sanitizeString(user?.last_login_at, 40),
    isOwner: normalizeUserRole(user?.role) === "admin"
  };
}

function mapRequestItemFromDb(item) {
  return {
    id: sanitizeString(item?.item_id, 80),
    label: sanitizeString(item?.item_name, 120),
    variantLabel: sanitizeString(item?.variant_label, 80),
    quantity: Math.max(0, Number(item?.quantity) || 0),
    unitType: sanitizeString(item?.unit, 40),
    traySize: Number(item?.tray_size) || null,
    packetSize: Number(item?.packet_size) || null,
    formattedQuantity: sanitizeString(item?.formatted_quantity, 120),
    inventoryUnits: Math.max(0, Number(item?.inventory_units) || 0),
    sheetColumnKey: sanitizeString(item?.sheet_column_key, 80),
    sheetTrayColumnKey: sanitizeString(item?.sheet_tray_column_key, 80),
    sheetSingleColumnKey: sanitizeString(item?.sheet_single_column_key, 80)
  };
}

function mapRequestFromDb(row) {
  const items = Array.isArray(row?.stock_request_items) ? row.stock_request_items.map(mapRequestItemFromDb) : [];
  const statusHistory = Array.isArray(row?.status_history) ? row.status_history : [];
  const cancelledAt = sanitizeString(row?.cancelled_at, 40) || resolveCancelledAtFromHistory(statusHistory);
  return {
    id: sanitizeString(row?.id, 80),
    source: sanitizeString(row?.source, 60),
    submittedAt: sanitizeString(row?.submitted_at, 40),
    requestedBy: sanitizeString(row?.requester_name, 120),
    wardUnit: sanitizeString(row?.ward_or_unit, 120),
    notes: sanitizeMultilineString(row?.notes, 500),
    requestText: sanitizeMultilineString(row?.request_text, 4000),
    lineItemCount: Math.max(0, Number(row?.line_item_count) || items.length),
    totalRequestedQuantity: Math.max(0, Number(row?.total_requested_quantity) || 0),
    createdAt: sanitizeString(row?.created_at, 40),
    updatedAt: sanitizeString(row?.updated_at, 40),
    status: slugifyStatus(row?.status),
    statusUpdatedAt: sanitizeString(row?.updated_at, 40),
    statusUpdatedBy: "",
    enteredBy: "",
    inventoryDeducted: Boolean(row?.inventory_deducted),
    inventoryDeductedAt: sanitizeString(row?.inventory_deducted_at, 40),
    inventoryDeductedBy: "",
    collectionRecord: row?.collection_record || null,
    cancelledAt,
    cancelled_at: cancelledAt,
    statusHistory,
    items
  };
}

function mapReceiptFromDb(row) {
  const items = Array.isArray(row?.received_stock_items)
    ? row.received_stock_items.map((item) => ({
      id: sanitizeString(item?.item_id, 80),
      label: sanitizeString(item?.item_name, 120),
      variantLabel: sanitizeString(item?.variant_label, 80),
      quantity: Math.max(0, Number(item?.quantity) || 0),
      unitType: sanitizeString(item?.unit, 40),
      traySize: Number(item?.tray_size) || null,
      packetSize: Number(item?.packet_size) || null,
      formattedQuantity: sanitizeString(item?.formatted_quantity, 120),
      inventoryUnits: Math.max(0, Number(item?.inventory_units) || 0),
      sheetColumnKey: sanitizeString(item?.sheet_column_key, 80),
      sheetTrayColumnKey: sanitizeString(item?.sheet_tray_column_key, 80),
      sheetSingleColumnKey: sanitizeString(item?.sheet_single_column_key, 80),
      batchNumber: sanitizeString(item?.batch_number, 120),
      expiryDate: sanitizeDateOnly(item?.expiry_date)
    }))
    : [];

  return {
    id: sanitizeString(row?.id, 80),
    supplierName: sanitizeString(row?.supplier, 120),
    reference: sanitizeString(row?.reference, 120),
    notes: sanitizeMultilineString(row?.notes, 500),
    submittedAt: sanitizeString(row?.submitted_at, 40),
    lineItemCount: Math.max(0, Number(row?.line_item_count) || items.length),
    totalReceivedQuantity: Math.max(0, Number(row?.total_received_quantity) || 0),
    createdAt: sanitizeString(row?.created_at, 40),
    updatedAt: sanitizeString(row?.updated_at, 40),
    receivedBy: "",
    items
  };
}

async function dbSingle(queryPromise) {
  const { data, error } = await queryPromise;
  if (error) throw new Error(error.message || "Database query failed");
  return data;
}

async function dbMaybeSingle(queryPromise) {
  const { data, error } = await queryPromise;
  if (error && error.code !== "PGRST116") throw new Error(error.message || "Database query failed");
  return data || null;
}

async function dbCreateAuditLog(actorUserId, action, targetType, targetId, details = {}) {
  await dbSingle(
    supabase.from("audit_logs").insert({
      actor_user_id: actorUserId || null,
      action: sanitizeString(action, 80),
      target_type: sanitizeString(targetType, 80),
      target_id: sanitizeString(targetId, 160),
      details
    })
  );
}

async function dbFindUserByUserNumber(userNumber) {
  const safeUserNumber = normalizeElabUserNumber(userNumber, { allowAnyLength: true });
  if (!safeUserNumber) return null;
  return dbMaybeSingle(
    supabase
      .from("users")
      .select("*")
      .eq("user_number", safeUserNumber)
      .limit(1)
      .maybeSingle()
  );
}

async function dbGetSession(req) {
  const token = getSessionToken(req);
  if (!token) return null;
  const tokenHash = hashSessionToken(token);
  const session = await dbMaybeSingle(
    supabase
      .from("lab_sessions")
      .select("id,user_id,token_hash,expires_at,users(*)")
      .eq("token_hash", tokenHash)
      .limit(1)
      .maybeSingle()
  );

  if (!session) return null;

  const nowIso = new Date().toISOString();
  const user = session.users;
  if (!user || !user.is_active) {
    await dbSingle(supabase.from("lab_sessions").delete().eq("id", session.id));
    return {
      invalidReason: "user_inactive"
    };
  }

  if (!session.expires_at || new Date(session.expires_at).getTime() <= Date.now()) {
    await dbSingle(supabase.from("lab_sessions").delete().eq("id", session.id));
    return {
      invalidReason: "session_expired"
    };
  }

  const activeTokenHash = String(user.active_session_token_hash || "").trim();
  if (!activeTokenHash || activeTokenHash !== tokenHash) {
    return {
      invalidReason: "session_replaced"
    };
  }

  await dbSingle(
    supabase
      .from("users")
      .update({ last_seen_at: nowIso, updated_at: nowIso })
      .eq("id", user.id)
      .eq("active_session_token_hash", tokenHash)
  );

  return {
    id: session.id,
    user,
    token,
    tokenHash
  };
}

function sendSessionInvalidResponse(req, res, invalidReason) {
  const safeReason = String(invalidReason || "").trim().toLowerCase();
  if (safeReason === "session_replaced") {
    res.setHeader("Set-Cookie", buildAuthClearCookies(req));
    sendJson(req, res, 401, {
      ok: false,
      error: STOCK_AUTH_REPLACED_MESSAGE,
      reason: "session_replaced"
    });
    return;
  }
  if (safeReason === "session_expired") {
    res.setHeader("Set-Cookie", buildAuthClearCookies(req));
    sendJson(req, res, 401, {
      ok: false,
      error: "Session expired. Please log in again.",
      reason: "session_expired"
    });
    return;
  }
  sendJson(req, res, 401, {
    ok: false,
    error: "Lab login required",
    reason: "session_required"
  });
}

async function requireLabSession(req, res) {
  try {
    const session = await dbGetSession(req);
    if (!session || session.invalidReason) {
      sendSessionInvalidResponse(req, res, session?.invalidReason);
      return null;
    }
    return session;
  } catch (error) {
    logStockAuthError("require-session-failed", error, {
      route: req.url || "",
      method: req.method
    });
    if (isMissingUserSessionColumnsError(error)) {
      sendJson(req, res, 500, { ok: false, code: "server_configuration_error", error: STOCK_AUTH_CONFIG_ERROR_MESSAGE });
      return null;
    }
    sendJson(req, res, 503, { ok: false, code: "login_service_unavailable", error: STOCK_AUTH_SERVICE_UNAVAILABLE_MESSAGE });
    return null;
  }
}

async function requireOwnerSession(req, res) {
  const session = await requireLabSession(req, res);
  if (!session) return null;
  if (normalizeUserRole(session.user?.role) !== "admin") {
    sendJson(req, res, 403, {
      ok: false,
      error: "Admin access required"
    });
    return null;
  }
  return session;
}

async function dbListRequests(limit = 25, {
  includeManual = true,
  includeCancelled = false,
  includeArchived = false
} = {}) {
  const rows = await dbSingle(
    supabase
      .from("stock_requests")
      .select("*, stock_request_items(*)")
      .order("created_at", { ascending: false })
      .limit(limit)
  );

  const nowMs = Date.now();
  return (rows || [])
    .map(mapRequestFromDb)
    .filter((row) => includeManual || sanitizeString(row.source, 60) !== "lab-manual-entry")
    .filter((row) => {
      const status = slugifyStatus(row?.status);
      if (!includeCancelled && status === "cancelled") return false;
      if (!includeArchived && (status === "completed" || status === "collected")) return false;
      if (!includeArchived && isArchivedCancelledRequest(row, nowMs)) return false;
      return true;
    });
}

async function dbGetRequestById(requestId) {
  return dbMaybeSingle(
    supabase
      .from("stock_requests")
      .select("*, stock_request_items(*)")
      .eq("id", requestId)
      .limit(1)
      .maybeSingle()
  );
}

async function dbInsertRequest(payload, sessionUser = null) {
  const nowIso = new Date().toISOString();
  const requestId = buildRequestId();
  const record = {
    id: requestId,
    source: payload.source,
    requester_name: payload.requestedBy,
    ward_or_unit: payload.wardUnit,
    notes: payload.notes,
    request_text: payload.requestText,
    status: "received",
    line_item_count: payload.lineItemCount,
    total_requested_quantity: payload.totalRequestedQuantity,
    submitted_at: payload.submittedAt || nowIso,
    created_at: nowIso,
    updated_at: nowIso,
    requested_by_user_id: null,
    entered_by_user_id: sessionUser?.id || null,
    status_updated_by_user_id: sessionUser?.id || null,
    status_history: [{ status: "received", updatedAt: nowIso, updatedBy: sanitizeUserNumber(sessionUser?.user_number || "") }]
  };

  try {
    await dbSingle(supabase.from("stock_requests").insert(record));
  } catch (error) {
    if (!isStockRequestStatusConstraintError(error)) throw error;

    // Backward compatibility for databases that still enforce legacy status values.
    const fallbackRecord = {
      ...record,
      status: "submitted",
      status_history: [{ status: "submitted", updatedAt: nowIso, updatedBy: sanitizeUserNumber(sessionUser?.user_number || "") }]
    };
    console.warn("[stock-submit] status-constraint-fallback", {
      requestId,
      previousStatus: record.status,
      fallbackStatus: fallbackRecord.status,
      errorMessage: getErrorMessage(error)
    });
    await dbSingle(supabase.from("stock_requests").insert(fallbackRecord));
  }

  if (payload.items.length) {
    try {
      const itemRows = payload.items.map((item) => ({
        stock_request_id: requestId,
        item_id: item.id || null,
        item_name: item.label,
        variant_label: item.variantLabel || null,
        quantity: item.quantity,
        unit: item.unitType || "each",
        tray_size: item.traySize || null,
        packet_size: item.packetSize || null,
        inventory_units: getItemInventoryUnits(item),
        formatted_quantity: item.formattedQuantity || null,
        sheet_column_key: item.sheetColumnKey || null,
        sheet_tray_column_key: item.sheetTrayColumnKey || null,
        sheet_single_column_key: item.sheetSingleColumnKey || null,
        batch_number: item.batchNumber || null,
        expiry_date: sanitizeDateOnly(item.expiryDate) || null
      }));

      try {
        await dbSingle(supabase.from("stock_request_items").insert(itemRows));
      } catch (error) {
        if (!isMissingOptionalStockItemColumnsError(error, "stock_request_items")) throw error;

        const fallbackRows = itemRows.map(({ batch_number: _batchNumber, expiry_date: _expiryDate, ...row }) => row);
        console.warn("[stock-submit] stock_request_items-legacy-schema-fallback", {
          requestId,
          errorMessage: getErrorMessage(error)
        });
        await dbSingle(supabase.from("stock_request_items").insert(fallbackRows));
      }
    } catch (itemInsertError) {
      console.error("[stock-submit] item-insert-failed-rolling-back-request", {
        requestId,
        errorMessage: getErrorMessage(itemInsertError)
      });
      try {
        await dbSingle(supabase.from("stock_requests").delete().eq("id", requestId));
      } catch (rollbackError) {
        console.error("[stock-submit] rollback-failed", {
          requestId,
          errorMessage: getErrorMessage(rollbackError)
        });
      }
      throw itemInsertError;
    }
  }

  const inserted = await dbGetRequestById(requestId);
  return mapRequestFromDb(inserted);
}

async function dbListReceipts(limit = 12) {
  const rows = await dbSingle(
    supabase
      .from("received_stock")
      .select("*, received_stock_items(*)")
      .order("created_at", { ascending: false })
      .limit(limit)
  );
  return (rows || []).map(mapReceiptFromDb);
}

async function dbApplyInventoryDelta(item, delta) {
  const key = getStockInventoryKey(item);
  if (!key) return;

  const existing = await dbMaybeSingle(
    supabase.from("inventory_balances").select("id,item_name,quantity_on_hand").eq("item_key", key).limit(1).maybeSingle()
  );

  if (!existing) {
    await dbSingle(
      supabase.from("inventory_balances").insert({
        item_key: key,
        item_name: getStockInventoryLabel(item),
        quantity_on_hand: Math.max(0, Number(delta) || 0),
        updated_at: new Date().toISOString()
      })
    );
    return;
  }

  const nextQty = Math.max(0, Number(existing.quantity_on_hand || 0) + Number(delta || 0));
  await dbSingle(
    supabase
      .from("inventory_balances")
      .update({
        quantity_on_hand: nextQty,
        item_name: getStockInventoryLabel(item),
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
  );
}

async function dbFindInventoryBatch(item, batchNumber) {
  const itemKey = getStockBatchKey(item);
  const safeBatchNumber = sanitizeString(batchNumber, 120);
  if (!itemKey || !safeBatchNumber) return null;
  return dbMaybeSingle(
    supabase
      .from("inventory_batches")
      .select("*")
      .eq("item_key", itemKey)
      .eq("batch_number", safeBatchNumber)
      .limit(1)
      .maybeSingle()
  );
}

async function dbUpsertInventoryBatch(item, sessionUser, receivedAtIso) {
  const itemKey = getStockBatchKey(item);
  const safeBatchNumber = sanitizeString(item?.batchNumber, 120);
  if (!itemKey || !safeBatchNumber) return;

  const nowIso = new Date().toISOString();
  const inventoryUnits = Math.max(0, Number(getItemInventoryUnits(item)) || 0);
  if (!inventoryUnits) return;

  const existing = await dbFindInventoryBatch(item, safeBatchNumber);
  const existingExpiryDate = sanitizeDateOnly(existing?.expiry_date);
  const incomingExpiryDate = sanitizeDateOnly(item?.expiryDate);
  const resolvedExpiryDate = existingExpiryDate || incomingExpiryDate || null;

  if (!existing) {
    await dbSingle(
      supabase.from("inventory_batches").insert({
        item_key: itemKey,
        item_id: sanitizeString(item?.id, 80) || null,
        item_name: getStockInventoryLabel(item),
        batch_number: safeBatchNumber,
        expiry_date: resolvedExpiryDate,
        quantity_received: inventoryUnits,
        quantity_remaining: inventoryUnits,
        date_received: sanitizeString(receivedAtIso, 40) || nowIso,
        received_by_user_id: sessionUser?.id || null,
        last_received_at: nowIso,
        created_at: nowIso,
        updated_at: nowIso
      })
    );
    return;
  }

  await dbSingle(
    supabase
      .from("inventory_batches")
      .update({
        item_id: sanitizeString(item?.id, 80) || existing.item_id || null,
        item_name: getStockInventoryLabel(item),
        expiry_date: resolvedExpiryDate,
        quantity_received: Math.max(0, Number(existing.quantity_received || 0) + inventoryUnits),
        quantity_remaining: Math.max(0, Number(existing.quantity_remaining || 0) + inventoryUnits),
        received_by_user_id: sessionUser?.id || existing.received_by_user_id || null,
        last_received_at: nowIso,
        updated_at: nowIso
      })
      .eq("id", existing.id)
  );
}

async function dbGetInventoryMap() {
  const rows = await dbSingle(supabase.from("inventory_balances").select("*").order("item_name", { ascending: true }));
  const map = new Map();
  (rows || []).forEach((row) => {
    map.set(String(row.item_key || ""), {
      key: String(row.item_key || ""),
      label: String(row.item_name || "Item"),
      onHand: Math.max(0, Number(row.quantity_on_hand) || 0)
    });
  });
  return map;
}

async function dbListInventorySummary() {
  const rows = await dbSingle(supabase.from("inventory_balances").select("*").order("item_name", { ascending: true }));
  return (rows || []).map((row) => ({
    key: String(row.item_key || ""),
    label: String(row.item_name || "Item"),
    received: 0,
    issued: 0,
    onHand: Math.max(0, Number(row.quantity_on_hand) || 0),
    updatedAt: sanitizeString(row.updated_at, 40)
  }));
}

function isMissingDatabaseTableError(error, tableName = "") {
  const message = String(error?.message || error?.details || getErrorMessage(error) || "").toLowerCase();
  const safeTableName = String(tableName || "").toLowerCase();
  if (!message) return false;
  return (
    message.includes("does not exist")
    || message.includes("could not find the table")
    || (safeTableName && message.includes(safeTableName) && message.includes("schema cache"))
  );
}

async function dbCountTableRows(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select("id", { count: "exact", head: true });

  if (error) {
    if (isMissingDatabaseTableError(error, tableName)) return null;
    throw new Error(error.message || `Could not count ${tableName}`);
  }

  return Math.max(0, Number(count) || 0);
}

async function dbDeleteAllRows(tableName, { idColumn = "id", impossibleValue = "__find_my_tube_reset_sentinel__" } = {}) {
  const before = await dbCountTableRows(tableName);
  if (before === null) {
    return { table: tableName, before: null, deleted: 0, skipped: true };
  }

  const { count, error } = await supabase
    .from(tableName)
    .delete({ count: "exact" })
    .neq(idColumn, impossibleValue);

  if (error) {
    if (isMissingDatabaseTableError(error, tableName)) {
      return { table: tableName, before, deleted: 0, skipped: true };
    }
    throw new Error(error.message || `Could not clear ${tableName}`);
  }

  return { table: tableName, before, deleted: Math.max(0, Number(count) || 0), skipped: false };
}

async function dbDeleteStockAuditLogs() {
  const stockAuditTargetTypes = [
    "stock_request",
    "stock_requests",
    "stock_request_item",
    "stock_request_items",
    "received_stock",
    "received_stock_item",
    "received_stock_items",
    "inventory_balance",
    "inventory_balances",
    "inventory_batch",
    "inventory_batches"
  ];
  const stockAuditActions = [
    "create-request",
    "create-received-stock",
    "update-stock-request-status",
    "clear-stock-data"
  ];

  const before = await dbCountTableRows("audit_logs");
  if (before === null) {
    return { table: "audit_logs", before: null, deleted: 0, skipped: true };
  }

  const byTarget = await supabase
    .from("audit_logs")
    .delete({ count: "exact" })
    .in("target_type", stockAuditTargetTypes);
  if (byTarget.error) {
    if (isMissingDatabaseTableError(byTarget.error, "audit_logs")) {
      return { table: "audit_logs", before, deleted: 0, skipped: true };
    }
    throw new Error(byTarget.error.message || "Could not clear stock audit logs");
  }

  const byAction = await supabase
    .from("audit_logs")
    .delete({ count: "exact" })
    .in("action", stockAuditActions);
  if (byAction.error) {
    if (isMissingDatabaseTableError(byAction.error, "audit_logs")) {
      return {
        table: "audit_logs",
        before,
        deleted: Math.max(0, Number(byTarget.count) || 0),
        skipped: true
      };
    }
    throw new Error(byAction.error.message || "Could not clear stock audit logs");
  }

  return {
    table: "audit_logs",
    before,
    deleted: Math.max(0, Number(byTarget.count) || 0) + Math.max(0, Number(byAction.count) || 0),
    skipped: false
  };
}

async function dbResetInventoryBalances() {
  const before = await dbCountTableRows("inventory_balances");
  if (before === null) {
    return { table: "inventory_balances", before: null, deleted: 0, reset: 0, skipped: true };
  }

  const { count, error } = await supabase
    .from("inventory_balances")
    .update({
      quantity_on_hand: 0,
      updated_at: new Date().toISOString()
    }, { count: "exact" })
    .neq("item_key", "__find_my_tube_reset_sentinel__");

  if (error) {
    if (isMissingDatabaseTableError(error, "inventory_balances")) {
      return { table: "inventory_balances", before, deleted: 0, reset: 0, skipped: true };
    }
    throw new Error(error.message || "Could not reset inventory_balances");
  }

  return {
    table: "inventory_balances",
    before,
    deleted: 0,
    reset: Math.max(0, Number(count) || 0),
    skipped: false
  };
}

async function dbResetStockTransactionalData() {
  const uuidDeleteOptions = { impossibleValue: "00000000-0000-0000-0000-000000000000" };
  const results = [];
  const runResetStep = async (table, task) => {
    try {
      results.push(await task());
    } catch (error) {
      console.error("[stock-reset] cleanup-step-failed", {
        table,
        errorMessage: getErrorMessage(error)
      });
      results.push({
        table,
        before: null,
        deleted: 0,
        reset: 0,
        skipped: false,
        failed: true,
        error: getErrorMessage(error)
      });
    }
  };

  await runResetStep("stock_request_items", () => dbDeleteAllRows("stock_request_items", uuidDeleteOptions));
  await runResetStep("stock_requests", () => dbDeleteAllRows("stock_requests"));
  await runResetStep("received_stock_items", () => dbDeleteAllRows("received_stock_items", uuidDeleteOptions));
  await runResetStep("received_stock", () => dbDeleteAllRows("received_stock"));
  await runResetStep("inventory_balances", () => dbResetInventoryBalances());
  await runResetStep("inventory_batches", () => dbDeleteAllRows("inventory_batches", uuidDeleteOptions));
  await runResetStep("audit_logs", () => dbDeleteStockAuditLogs());

  return results;
}

async function dbInsertReceipt(payload, sessionUser) {
  const nowIso = new Date().toISOString();
  const receiptId = buildReceiptId();
  const normalizedItems = [];
  const batchExpiryMap = new Map();

  for (const rawItem of payload.items) {
    const item = { ...rawItem };
    const batchNumber = sanitizeString(item?.batchNumber, 120);
    const incomingExpiryDate = sanitizeDateOnly(item?.expiryDate);

    if (batchNumber) {
      item.batchNumber = batchNumber;
      const itemBatchKey = `${getStockBatchKey(item).toLowerCase()}::${batchNumber.toLowerCase()}`;
      const previouslySeenExpiry = batchExpiryMap.get(itemBatchKey) || "";
      if (previouslySeenExpiry && incomingExpiryDate && previouslySeenExpiry !== incomingExpiryDate) {
        const payloadConflictError = new Error(buildBatchExpiryConflictMessage(item?.label, previouslySeenExpiry));
        payloadConflictError.code = "batch_expiry_conflict";
        throw payloadConflictError;
      }
      const existingBatch = await dbFindInventoryBatch(item, batchNumber);
      const existingExpiryDate = sanitizeDateOnly(existingBatch?.expiry_date);
      if (existingExpiryDate && incomingExpiryDate && existingExpiryDate !== incomingExpiryDate) {
        const conflictError = new Error(buildBatchExpiryConflictMessage(item?.label, existingExpiryDate));
        conflictError.code = "batch_expiry_conflict";
        throw conflictError;
      }
      if (existingExpiryDate && !incomingExpiryDate) {
        item.expiryDate = existingExpiryDate;
      }
      const resolvedExpiryDate = sanitizeDateOnly(item?.expiryDate);
      if (resolvedExpiryDate) {
        batchExpiryMap.set(itemBatchKey, resolvedExpiryDate);
      }
    } else {
      item.batchNumber = "";
    }

    normalizedItems.push(item);
  }

  await dbSingle(
    supabase.from("received_stock").insert({
      id: receiptId,
      recorded_by_user_id: sessionUser?.id || null,
      supplier: payload.supplierName || null,
      reference: payload.reference || null,
      notes: payload.notes || null,
      line_item_count: payload.lineItemCount,
      total_received_quantity: payload.totalReceivedQuantity,
      submitted_at: payload.submittedAt || nowIso,
      created_at: nowIso,
      updated_at: nowIso
    })
  );

  if (normalizedItems.length) {
    const itemRows = normalizedItems.map((item) => ({
      received_stock_id: receiptId,
      item_id: item.id || null,
      item_name: item.label,
      variant_label: item.variantLabel || null,
      quantity: item.quantity,
      unit: item.unitType || "each",
      tray_size: item.traySize || null,
      packet_size: item.packetSize || null,
      inventory_units: getItemInventoryUnits(item),
      formatted_quantity: item.formattedQuantity || null,
      sheet_column_key: item.sheetColumnKey || null,
      sheet_tray_column_key: item.sheetTrayColumnKey || null,
      sheet_single_column_key: item.sheetSingleColumnKey || null,
      batch_number: item.batchNumber || null,
      expiry_date: sanitizeDateOnly(item.expiryDate) || null
    }));

    try {
      await dbSingle(
        supabase.from("received_stock_items").insert(itemRows)
      );
    } catch (error) {
      if (!isMissingOptionalStockItemColumnsError(error, "received_stock_items")) throw error;
      const fallbackRows = itemRows.map(({ batch_number: _batchNumber, expiry_date: _expiryDate, ...row }) => row);
      console.warn("[stock-receipts] received_stock_items-legacy-schema-fallback", {
        receiptId,
        errorMessage: getErrorMessage(error)
      });
      await dbSingle(
        supabase.from("received_stock_items").insert(fallbackRows)
      );
    }
  }

  for (const item of normalizedItems) {
    await dbApplyInventoryDelta(item, getItemInventoryUnits(item));
    await dbUpsertInventoryBatch(item, sessionUser, payload.submittedAt || nowIso);
  }

  await dbCreateAuditLog(sessionUser?.id || null, "create-received-stock", "received_stock", receiptId, {
    lineItemCount: payload.lineItemCount,
    totalReceivedQuantity: payload.totalReceivedQuantity
  });

  return {
    id: receiptId,
    createdAt: nowIso,
    receivedBy: normalizeElabUserNumber(sessionUser?.user_number, { allowAnyLength: true }) || "",
    savedItems: normalizedItems.map((item) => ({
      id: sanitizeString(item?.id, 80),
      label: sanitizeString(item?.label, 120),
      quantity: Math.max(0, Number(item?.quantity) || 0),
      inventoryUnits: Math.max(0, Number(getItemInventoryUnits(item)) || 0),
      unitType: sanitizeString(item?.unitType, 40),
      batchNumber: sanitizeString(item?.batchNumber, 120),
      expiryDate: sanitizeDateOnly(item?.expiryDate)
    }))
  };
}

async function dbUpdateRequestStatus(requestId, nextStatus, sessionUser) {
  const dbRecord = await dbGetRequestById(requestId);
  if (!dbRecord) return { error: "not-found" };

  const request = mapRequestFromDb(dbRecord);
  const previousStatus = slugifyStatus(request.status);
  const wasDeducted = isRequestInventoryDeducted(request);
  const shouldDeductInventory = (nextStatus === "completed" || nextStatus === "collected") && !wasDeducted;

  if (shouldDeductInventory) {
    const inventoryMap = await dbGetInventoryMap();
    const shortages = [];
    for (const item of request.items) {
      const key = getStockInventoryKey(item);
      const requiredUnits = getItemInventoryUnits(item);
      const onHand = Math.max(0, Number(inventoryMap.get(key)?.onHand || 0));
      if (requiredUnits > onHand) {
        shortages.push({
          key,
          label: getStockInventoryLabel(item),
          requiredUnits,
          onHand,
          shortBy: requiredUnits - onHand
        });
      }
    }
    if (shortages.length) {
      return { error: "insufficient-stock", shortages };
    }
  }

  const nowIso = new Date().toISOString();
  request.status = nextStatus;
  request.updatedAt = nowIso;
  request.statusUpdatedAt = nowIso;
  request.statusUpdatedBy = normalizeElabUserNumber(sessionUser?.user_number, { allowAnyLength: true }) || "";
  appendStatusAudit(request, nextStatus, request.statusUpdatedBy, nowIso);

  const updatePayload = {
    status: nextStatus,
    updated_at: nowIso,
    status_updated_by_user_id: sessionUser?.id || null,
    status_history: request.statusHistory
  };
  if (nextStatus === "cancelled") {
    updatePayload.cancelled_at = nowIso;
  } else {
    updatePayload.cancelled_at = null;
  }

  if (shouldDeductInventory) {
    const deductedItems = request.items.map((item) => ({
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

    updatePayload.inventory_deducted = true;
    updatePayload.inventory_deducted_at = nowIso;
    updatePayload.inventory_deducted_by_user_id = sessionUser?.id || null;
    updatePayload.collection_record = {
      orderId: request.id,
      collectedAt: nowIso,
      requestedBy: sanitizeString(request.requestedBy, 120),
      wardUnit: sanitizeString(request.wardUnit, 120),
      markedCollectedBy: request.statusUpdatedBy,
      collectedBy: sanitizeString(request.requestedBy, 120),
      items: deductedItems,
      totalUnitsDeducted
    };

    for (const item of request.items) {
      await dbApplyInventoryDelta(item, -getItemInventoryUnits(item));
    }
  }

  try {
    await dbSingle(supabase.from("stock_requests").update(updatePayload).eq("id", requestId));
  } catch (error) {
    const message = String(error?.message || "");
    const isCancelledAtColumnError = /cancelled_at/i.test(message) && /column/i.test(message);
    if (!isCancelledAtColumnError) throw error;
    const { cancelled_at: _cancelledAt, ...fallbackPayload } = updatePayload;
    await dbSingle(supabase.from("stock_requests").update(fallbackPayload).eq("id", requestId));
  }

  await dbCreateAuditLog(sessionUser?.id || null, "update-stock-request-status", "stock_request", requestId, {
    previousStatus,
    nextStatus
  });

  const reloaded = await dbGetRequestById(requestId);
  return {
    record: mapRequestFromDb(reloaded),
    previousStatus
  };
}

async function postJson(urlString, payload, redirectCount = 0) {
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
        resolve({ statusCode, body: responseBody });
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
        status: sanitizeString(record?.status || "submitted", 40),
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
    sendText(req, res, 400, "Bad request");
    return;
  }

  if (path.basename(filePath).startsWith(".")) {
    sendText(req, res, 404, "Not found");
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendText(req, res, 404, "Not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extension] || "application/octet-stream";
    setCorsHeaders(req, res);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      "Cache-Control": pathname.startsWith("/assets/") ? "no-cache" : "no-store"
    });
    fsSync.createReadStream(filePath).pipe(res);
  } catch {
    sendText(req, res, 404, "Not found");
  }
}

async function handleApiRequest(req, res, pathname, searchParams) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(req, res);
    res.writeHead(204, {
      "Access-Control-Max-Age": "86400",
      "Content-Length": "0"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(req, res, 200, {
      ok: true,
      service: "find-my-tube-backend",
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/config") {
    const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
    const hostHeader = String(req.headers.host || "").trim();
    const protocol = forwardedProto || "http";
    const baseUrl = hostHeader ? `${protocol}://${hostHeader}` : "";
    sendJson(req, res, 200, {
      ok: true,
      service: "find-my-tube-backend",
      environment: {
        nodeEnv: String(process.env.NODE_ENV || "development"),
        appEnv: String(process.env.APP_ENV || process.env.NODE_ENV || "development")
      },
      storage: {
        mode: "supabase",
        provider: "supabase",
        configured: HAS_SUPABASE,
        durabilityWarning: HAS_SUPABASE ? "" : "Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      },
      userSafety: {
        allowDelete: true
      },
      api: {
        baseUrl
      },
      supabase: {
        hasAnonKey: Boolean(SUPABASE_ANON_KEY),
        configured: HAS_SUPABASE,
        projectHost: SUPABASE_PROJECT_HOST
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!HAS_SUPABASE) {
    sendJson(req, res, 503, {
      ok: false,
      error: "Supabase is not configured",
      requiredEnv: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/stock-auth/session") {
    const session = await dbGetSession(req);
    const { count, error: countError } = await supabase.from("users").select("id", { count: "exact", head: true });
    if (countError) {
      throw new Error(countError.message || "Could not determine setup status");
    }
    const setupRequired = Number(count || 0) === 0;

    if (!session) {
      sendJson(req, res, 200, {
        ok: true,
        authenticated: false,
        setupRequired
      });
      return;
    }

    if (session.invalidReason) {
      sendSessionInvalidResponse(req, res, session.invalidReason);
      return;
    }

    sendJson(req, res, 200, {
      ok: true,
      authenticated: true,
      user: mapUserFromDb(session.user)
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-auth/login") {
    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const enteredUserNumber = String(payload?.userNumber || "").trim();
    const userNumber = normalizeElabUserNumber(enteredUserNumber);
    const pin = normalizePin(payload.pin);
    if (!userNumber || !pin) {
      sendJson(req, res, 400, {
        ok: false,
        error: "Use an eLab user number (2 or 3 digits) and a 4-digit PIN"
      });
      return;
    }

    let user = null;
    try {
      user = await dbFindUserByUserNumber(userNumber);
    } catch (error) {
      logStockAuthError("db-find-user-failed", error, {
        userNumber,
        route: pathname,
        method: req.method
      });
      sendJson(req, res, 503, { ok: false, code: "login_service_unavailable", error: STOCK_AUTH_SERVICE_UNAVAILABLE_MESSAGE });
      return;
    }

    if (!user || !user.is_active || !verifyPinHash(pin, user.pin_hash)) {
      sendJson(req, res, 401, { ok: false, code: "invalid_credentials", error: STOCK_AUTH_INVALID_MESSAGE });
      return;
    }

    const token = createLabSessionToken();
    const tokenHash = hashSessionToken(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LAB_SESSION_TTL_MS);

    try {
      await dbSingle(
        supabase.from("lab_sessions").insert({
          token_hash: tokenHash,
          user_id: user.id,
          expires_at: expiresAt.toISOString()
        })
      );

      await dbSingle(
        supabase
          .from("users")
          .update({
            last_login_at: now.toISOString(),
            last_seen_at: now.toISOString(),
            active_session_token_hash: tokenHash,
            updated_at: now.toISOString()
          })
          .eq("id", user.id)
      );

      await dbCreateAuditLog(user.id, "login", "session", tokenHash, {});
    } catch (error) {
      logStockAuthError("login-persistence-failed", error, {
        userId: user.id,
        userNumber,
        route: pathname,
        method: req.method
      });
      if (isMissingUserSessionColumnsError(error)) {
        sendJson(req, res, 500, {
          ok: false,
          code: "server_configuration_error",
          error: STOCK_AUTH_CONFIG_ERROR_MESSAGE
        });
        return;
      }
      sendJson(req, res, 503, {
        ok: false,
        code: "login_service_unavailable",
        error: STOCK_AUTH_SERVICE_UNAVAILABLE_MESSAGE
      });
      return;
    }

    res.setHeader("Set-Cookie", buildAuthCookie(token, req, { expiresAt }));
    sendJson(req, res, 200, {
      ok: true,
      authenticated: true,
      sessionToken: token,
      user: mapUserFromDb({ ...user, last_login_at: now.toISOString(), updated_at: now.toISOString() })
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-auth/bootstrap") {
    const { count, error: countError } = await supabase.from("users").select("id", { count: "exact", head: true });
    if (countError) {
      throw new Error(countError.message || "Could not determine setup status");
    }
    if (Number(count || 0) > 0) {
      sendJson(req, res, 403, {
        ok: false,
        error: "Initial admin has already been configured"
      });
      return;
    }

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const displayElabUserNumber = String(payload?.userNumber || "").trim();
    const userNumber = normalizeElabUserNumber(displayElabUserNumber);
    const pin = normalizePin(payload.pin);
    const displayName = sanitizeDisplayName(payload.displayName) || `Admin ${displayElabUserNumber || userNumber}`;
    if (!userNumber || !pin) {
      sendJson(req, res, 400, {
        ok: false,
        error: "Use an eLab user number (2 or 3 digits) and a 4-digit PIN"
      });
      return;
    }

    const nowIso = new Date().toISOString();
    const pinHash = hashPin(pin);
    let createdUser = null;
    let token = "";
    try {
      createdUser = await dbSingle(
        supabase.from("users").insert({
          user_number: userNumber,
          display_name: displayName,
          pin_hash: pinHash,
          role: "admin",
          is_active: true,
          created_at: nowIso,
          updated_at: nowIso,
          last_login_at: nowIso,
          last_seen_at: nowIso
        }).select("*").single()
      );

      token = createLabSessionToken();
      const tokenHash = hashSessionToken(token);
      const expiresAt = new Date(Date.now() + LAB_SESSION_TTL_MS);
      await dbSingle(
        supabase.from("lab_sessions").insert({
          token_hash: tokenHash,
          user_id: createdUser.id,
          expires_at: expiresAt.toISOString()
        })
      );

      await dbSingle(
        supabase
          .from("users")
          .update({
            active_session_token_hash: tokenHash,
            last_seen_at: nowIso,
            updated_at: nowIso
          })
          .eq("id", createdUser.id)
      );

      await dbCreateAuditLog(createdUser.id, "bootstrap-admin", "user", createdUser.id, {
        userNumber,
        displayName
      });
      res.setHeader("Set-Cookie", buildAuthCookie(token, req, { expiresAt }));
    } catch (error) {
      logStockAuthError("bootstrap-admin-failed", error, {
        userNumber,
        route: pathname,
        method: req.method
      });
      if (isMissingUserSessionColumnsError(error)) {
        sendJson(req, res, 500, {
          ok: false,
          code: "server_configuration_error",
          error: STOCK_AUTH_CONFIG_ERROR_MESSAGE
        });
        return;
      }
      sendJson(req, res, 503, {
        ok: false,
        code: "login_service_unavailable",
        error: STOCK_AUTH_SERVICE_UNAVAILABLE_MESSAGE
      });
      return;
    }

    sendJson(req, res, 201, {
      ok: true,
      authenticated: true,
      sessionToken: token,
      user: mapUserFromDb(createdUser)
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/stock-auth/logout") {
    const currentSession = await dbGetSession(req).catch(() => null);
    const token = getSessionToken(req);
    if (token) {
      const tokenHash = hashSessionToken(token);
      await dbSingle(supabase.from("lab_sessions").delete().eq("token_hash", tokenHash));
      await dbSingle(
        supabase
          .from("users")
          .update({ active_session_token_hash: null, updated_at: new Date().toISOString() })
          .eq("active_session_token_hash", tokenHash)
      );
    }
    if (currentSession?.user?.id && currentSession?.tokenHash) {
      await dbSingle(
        supabase
          .from("users")
          .update({ active_session_token_hash: null, updated_at: new Date().toISOString() })
          .eq("id", currentSession.user.id)
          .eq("active_session_token_hash", currentSession.tokenHash)
      );
    }

    res.setHeader("Set-Cookie", buildAuthClearCookies(req));
    sendJson(req, res, 200, {
      ok: true
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/users") {
    const session = await requireOwnerSession(req, res);
    if (!session) return;

    const users = await dbSingle(
      supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
    );

    sendJson(req, res, 200, {
      users: (users || []).map(mapUserFromDb)
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/users/audit") {
    const session = await requireOwnerSession(req, res);
    if (!session) return;

    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 40));
    const rows = await dbSingle(
      supabase
        .from("audit_logs")
        .select("*, users:actor_user_id(user_number,display_name)")
        .order("created_at", { ascending: false })
        .limit(limit)
    );

    sendJson(req, res, 200, {
      entries: (rows || []).map((row) => ({
        id: row.id,
        timestamp: row.created_at,
        action: row.action,
        targetUserNumber: sanitizeString(row.details?.targetUserNumber, 20),
        targetDisplayElabUserNumber: sanitizeString(row.details?.targetDisplayElabUserNumber, 20),
        targetName: sanitizeString(row.details?.targetName, 120),
        adminUserNumber: sanitizeString(row.users?.user_number, 20),
        adminName: sanitizeString(row.users?.display_name, 120),
        beforeRole: sanitizeString(row.details?.beforeRole, 40),
        afterRole: sanitizeString(row.details?.afterRole, 40),
        beforeStatus: sanitizeString(row.details?.beforeStatus, 40),
        afterStatus: sanitizeString(row.details?.afterStatus, 40),
        note: sanitizeString(row.details?.note, 240)
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
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const displayElabUserNumber = String(payload?.userNumber || "").trim();
    const userNumber = normalizeElabUserNumber(displayElabUserNumber);
    const pin = normalizePin(payload.pin);
    const displayName = sanitizeDisplayName(payload.displayName);
    const role = normalizeUserRole(payload.role);
    if (!userNumber || !pin || displayName.length < 2) {
      sendJson(req, res, 400, {
        ok: false,
        error: "Use a display name, an eLab user number (2 or 3 digits), and a 4-digit PIN"
      });
      return;
    }

    try {
      const existingUser = await dbFindUserByUserNumber(userNumber);
      if (existingUser) {
        sendJson(req, res, 409, {
          ok: false,
          error: existingUser.is_active
            ? "That eLab user number already exists"
            : "That eLab user number belongs to a disabled user. Re-enable or edit the existing user."
        });
        return;
      }

      const nowIso = new Date().toISOString();
      const user = await dbSingle(
        supabase.from("users").insert({
          user_number: userNumber,
          display_name: displayName,
          pin_hash: hashPin(pin),
          role,
          is_active: true,
          created_at: nowIso,
          updated_at: nowIso
        }).select("*").single()
      );

      await dbCreateAuditLog(session.user.id, "create", "user", String(user.id), {
        targetUserNumber: userNumber,
        targetDisplayElabUserNumber: displayElabUserNumber || userNumber,
        targetName: displayName,
        beforeRole: "",
        afterRole: role,
        beforeStatus: "",
        afterStatus: "active"
      });

      sendJson(req, res, 201, {
        ok: true,
        user: mapUserFromDb(user)
      });
    } catch (error) {
      console.error("Create user failed", {
        actorUserId: sanitizeString(session.user?.id, 80),
        userNumber,
        role,
        reason: error instanceof Error ? error.message : "Unknown error"
      });
      sendJson(req, res, 500, {
        ok: false,
        error: "Could not save user. Please try again."
      });
    }
    return;
  }

  if ((req.method === "PATCH" || req.method === "DELETE") && pathname.startsWith("/api/lab/users/")) {
    const session = await requireOwnerSession(req, res);
    if (!session) return;

    const byIdMatch = pathname.match(/^\/api\/lab\/users\/by-id\/([^/]+)$/);
    const byNumberMatch = pathname.match(/^\/api\/lab\/users\/([^/]+)$/);
    if (!byIdMatch && !byNumberMatch) {
      sendJson(req, res, 404, { ok: false, error: "Not found" });
      return;
    }

    const targetUserId = byIdMatch ? sanitizeString(decodeURIComponent(byIdMatch[1]), 80) : "";
    const targetUserNumber = byNumberMatch
      ? normalizeElabUserNumber(decodeURIComponent(byNumberMatch[1]), { allowAnyLength: true })
      : "";

    const target = byIdMatch
      ? await dbMaybeSingle(supabase.from("users").select("*").eq("id", targetUserId).limit(1).maybeSingle())
      : await dbFindUserByUserNumber(targetUserNumber);

    if (!target) {
      sendJson(req, res, 404, { ok: false, error: "User not found" });
      return;
    }

    const currentRole = normalizeUserRole(target.role);
    const currentStatus = target.is_active ? "active" : "disabled";

    const { count: adminCount, error: adminCountError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("is_active", true);
    if (adminCountError) {
      throw new Error(adminCountError.message || "Could not count admin users");
    }
    const activeAdmins = Number(adminCount || 0);

    if (req.method === "DELETE") {
      if (currentRole === "admin" && currentStatus === "active" && activeAdmins <= 1) {
        sendJson(req, res, 409, { ok: false, error: "At least one active Admin user is required." });
        return;
      }

      await dbSingle(supabase.from("users").delete().eq("id", target.id));
      await dbCreateAuditLog(session.user.id, "delete user", "user", String(target.id), {
        targetUserNumber: target.user_number,
        targetDisplayElabUserNumber: target.user_number,
        targetName: target.display_name,
        beforeRole: currentRole,
        afterRole: "",
        beforeStatus: currentStatus,
        afterStatus: ""
      });

      sendJson(req, res, 200, {
        ok: true,
        deleted: true,
        userNumber: target.user_number
      });
      return;
    }

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const nextRole = payload?.role === undefined ? "" : normalizeUserRole(payload.role);
    const nextStatus = payload?.status === undefined ? "" : normalizeUserStatus(payload.status);
    const nextPin = payload?.pin === undefined ? "" : normalizePin(payload.pin);

    if (payload?.pin !== undefined && !nextPin) {
      sendJson(req, res, 400, { ok: false, error: "Use a 4-digit PIN" });
      return;
    }

    if (!nextRole && !nextStatus && payload?.pin === undefined) {
      sendJson(req, res, 400, { ok: false, error: "No valid user changes provided" });
      return;
    }

    const update = { updated_at: new Date().toISOString() };
    if (nextRole) update.role = nextRole;
    if (nextStatus) update.is_active = nextStatus === "active";
    if (payload?.pin !== undefined) update.pin_hash = hashPin(nextPin);

    const resultingRole = nextRole || currentRole;
    const resultingStatus = nextStatus || currentStatus;

    if (currentRole === "admin" && currentStatus === "active") {
      const wouldDeactivate = resultingRole !== "admin" || resultingStatus !== "active";
      if (wouldDeactivate && activeAdmins <= 1) {
        sendJson(req, res, 409, { ok: false, error: "At least one active Admin user is required." });
        return;
      }
    }

    const updatedUser = await dbSingle(
      supabase.from("users").update(update).eq("id", target.id).select("*").single()
    );

    let action = "update";
    if (payload?.pin !== undefined) action = "reset-pin";
    if (currentStatus !== resultingStatus) action = resultingStatus === "disabled" ? "disable" : "re-enable";
    else if (currentRole !== resultingRole) action = "role-change";

    await dbCreateAuditLog(session.user.id, action, "user", String(target.id), {
      targetUserNumber: target.user_number,
      targetDisplayElabUserNumber: target.user_number,
      targetName: target.display_name,
      beforeRole: currentRole,
      afterRole: resultingRole,
      beforeStatus: currentStatus,
      afterStatus: resultingStatus
    });

    sendJson(req, res, 200, {
      ok: true,
      user: mapUserFromDb(updatedUser)
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/stock-requests") {
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));
    const includeCancelled = parseBooleanQueryFlag(searchParams.get("includeCancelled"), false);
    const includeArchived = parseBooleanQueryFlag(searchParams.get("includeArchived"), false);
    const rows = await dbListRequests(limit, {
      includeManual: false,
      includeCancelled,
      includeArchived
    });
    sendJson(req, res, 200, { requests: rows });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/stock-requests") {
    const session = await requireLabSession(req, res);
    if (!session) return;

    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));
    const includeCancelled = parseBooleanQueryFlag(searchParams.get("includeCancelled"), false);
    const includeArchived = parseBooleanQueryFlag(searchParams.get("includeArchived"), false);
    const rows = await dbListRequests(limit, {
      includeManual: true,
      includeCancelled,
      includeArchived
    });

    sendJson(req, res, 200, {
      requests: rows,
      user: {
        userNumber: normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true })
      }
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/stock-stats") {
    const session = await requireLabSession(req, res);
    if (!session) return;

    const includeCancelled = parseBooleanQueryFlag(searchParams.get("includeCancelled"), false);
    const includeArchived = parseBooleanQueryFlag(searchParams.get("includeArchived"), false);
    const rows = await dbListRequests(1000, {
      includeManual: true,
      includeCancelled,
      includeArchived
    });
    sendJson(req, res, 200, {
      stats: buildStockStats(rows),
      user: {
        userNumber: normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true })
      }
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/stock-inventory") {
    const session = await requireLabSession(req, res);
    if (!session) return;

    const [summary, recentReceipts] = await Promise.all([
      dbListInventorySummary(),
      dbListReceipts(12)
    ]);

    sendJson(req, res, 200, {
      summary,
      recentReceipts,
      user: {
        userNumber: normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true })
      }
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/received-stock") {
    const session = await requireLabSession(req, res);
    if (!session) return;

    const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit")) || 120));
    const rows = await dbListReceipts(limit);

    sendJson(req, res, 200, {
      receipts: rows,
      user: {
        userNumber: normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true })
      }
    });
    return;
  }

  if (req.method === "DELETE" && pathname === "/api/lab/stock-data") {
    const session = await requireOwnerSession(req, res);
    if (!session) return;

    const clearedTables = await dbResetStockTransactionalData();

    await dbCreateAuditLog(session.user.id, "clear-stock-data", "maintenance", "stock-transactional-data", {
      clearedTables
    });

    sendJson(req, res, 200, {
      ok: true,
      cleared: true,
      clearedTables,
      preserved: [
        "users",
        "lab_sessions",
        "app configuration",
        "static catalog/reference content",
        "tube and test definitions"
      ],
      stockOnHandReset: true,
      clearedBy: normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true })
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/lab/stock-batches/lookup") {
    const session = await requireLabSession(req, res);
    if (!session) return;

    const itemKey = sanitizeString(searchParams.get("itemKey"), 80);
    const itemId = sanitizeString(searchParams.get("itemId"), 80);
    const itemLabel = sanitizeString(searchParams.get("itemLabel"), 120);
    const batchNumber = sanitizeString(searchParams.get("batchNumber"), 120);

    if (!batchNumber) {
      sendJson(req, res, 200, {
        ok: true,
        exists: false
      });
      return;
    }

    const syntheticItem = {
      sheetColumnKey: itemKey,
      id: itemId,
      label: itemLabel
    };
    const existing = await dbFindInventoryBatch(syntheticItem, batchNumber);
    if (!existing) {
      sendJson(req, res, 200, {
        ok: true,
        exists: false,
        batchNumber
      });
      return;
    }

    sendJson(req, res, 200, {
      ok: true,
      exists: true,
      batch: {
        itemKey: sanitizeString(existing.item_key, 80),
        itemId: sanitizeString(existing.item_id, 80),
        itemName: sanitizeString(existing.item_name, 120),
        batchNumber: sanitizeString(existing.batch_number, 120),
        expiryDate: sanitizeDateOnly(existing.expiry_date),
        quantityReceived: Math.max(0, Number(existing.quantity_received) || 0),
        quantityRemaining: Math.max(0, Number(existing.quantity_remaining) || 0),
        dateReceived: sanitizeString(existing.date_received, 40),
        receivedBy: sanitizeString(existing.received_by_user_id, 80)
      }
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/lab/stock-receipts") {
    let session = null;
    try {
      session = await dbGetSession(req);
    } catch (error) {
      logStockAuthError("stock-receipts-session-check-failed", error, {
        route: req.url || "",
        method: req.method
      });
      sendJson(req, res, 503, { ok: false, code: "login_service_unavailable", error: STOCK_AUTH_SERVICE_UNAVAILABLE_MESSAGE });
      return;
    }
    if (!session || session.invalidReason) {
      sendJson(req, res, 401, {
        ok: false,
        reason: "session_required",
        error: "Not signed in"
      });
      return;
    }

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const payloadValidationError = validateStockReceiptPayload(payload);
    if (payloadValidationError) {
      sendJson(req, res, 400, {
        ok: false,
        error: payloadValidationError
      });
      return;
    }

    const cleanPayload = sanitizeStockReceiptPayload(payload);
    if (!cleanPayload.items.length) {
      sendJson(req, res, 400, {
        ok: false,
        error: "At least one item is required"
      });
      return;
    }

    let receipt = null;
    try {
      receipt = await dbInsertReceipt(cleanPayload, session.user);
    } catch (error) {
      if (error?.code === "batch_expiry_conflict") {
        sendJson(req, res, 409, {
          ok: false,
          code: "batch_expiry_conflict",
          error: error instanceof Error ? error.message : "Batch expiry conflict"
        });
        return;
      }
      throw error;
    }

    sendJson(req, res, 201, {
      ok: true,
      receiptId: receipt?.id || "",
      savedItems: Array.isArray(receipt?.savedItems) ? receipt.savedItems : [],
      receipt
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/lab/stock-requests/manual") {
    const session = await requireLabSession(req, res);
    if (!session) return;

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const cleanPayload = sanitizeStockRequestPayload({
      ...payload,
      source: "lab-manual-entry"
    });
    const itemValidationError = validateStockRequestItems(cleanPayload.items);
    if (!cleanPayload.requestedBy || !cleanPayload.wardUnit || !cleanPayload.items.length) {
      sendJson(req, res, 400, {
        ok: false,
        error: "Requested by, ward / unit, and at least one item are required"
      });
      return;
    }
    if (itemValidationError) {
      sendJson(req, res, 400, {
        ok: false,
        error: itemValidationError
      });
      return;
    }

    const record = await dbInsertRequest(cleanPayload, session.user);
    const sheetSync = await syncStockRecordToSheets(record, {
      action: "create-request",
      changedBy: normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true })
    });

    sendJson(req, res, 201, {
      ok: true,
      request: {
        id: record.id,
        status: record.status,
        statusLabel: formatStatusLabel(record.status),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        enteredBy: normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true })
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
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const cleanPayload = sanitizeStockRequestPayload(payload);
    console.info("[stock-submit] request-received", {
      origin: sanitizeString(req.headers.origin, 200),
      host: sanitizeString(req.headers.host, 200),
      requestedBy: cleanPayload.requestedBy,
      wardUnit: cleanPayload.wardUnit,
      lineItemCount: cleanPayload.lineItemCount,
      totalRequestedQuantity: cleanPayload.totalRequestedQuantity
    });
    const itemValidationError = validateStockRequestItems(cleanPayload.items);
    if (!cleanPayload.requestedBy || !cleanPayload.wardUnit || !cleanPayload.items.length) {
      console.warn("[stock-submit] validation-failed", {
        reason: "missing_required_fields",
        requestedBy: cleanPayload.requestedBy,
        wardUnit: cleanPayload.wardUnit,
        lineItemCount: cleanPayload.lineItemCount
      });
      sendJson(req, res, 400, {
        ok: false,
        error: "Requested by, ward / unit, and at least one item are required"
      });
      return;
    }
    if (itemValidationError) {
      console.warn("[stock-submit] validation-failed", {
        reason: "item_validation_failed",
        error: itemValidationError
      });
      sendJson(req, res, 400, {
        ok: false,
        error: itemValidationError
      });
      return;
    }

    let record = null;
    let sheetSync = null;
    let sheetMirror = null;
    try {
      record = await dbInsertRequest(cleanPayload, null);
      sheetSync = await syncStockRecordToSheets(record, { action: "create-request" });
      sheetMirror = await mirrorStockRequestToGoogleSheets(record);
    } catch (error) {
      console.error("[stock-submit] write-failed", {
        requestedBy: cleanPayload.requestedBy,
        wardUnit: cleanPayload.wardUnit,
        lineItemCount: cleanPayload.lineItemCount,
        errorMessage: getErrorMessage(error),
        errorCode: error?.code || "",
        errorDetails: error?.details || "",
        errorHint: error?.hint || ""
      });
      throw error;
    }

    if (!sheetMirror.ok && !sheetMirror.skipped) {
      console.error(`Find My Tube: Google Sheets mirror failed for ${record.id}: ${sheetMirror.reason}`);
    }

    console.info("[stock-submit] request-saved", {
      requestId: record.id,
      status: record.status,
      lineItemCount: record.lineItemCount,
      totalRequestedQuantity: record.totalRequestedQuantity
    });

    sendJson(req, res, 201, {
      ok: true,
      request: {
        id: record.id,
        status: record.status,
        createdAt: record.createdAt
      },
      sheetSync,
      sheetMirror: {
        ok: sheetMirror.ok,
        skipped: sheetMirror.skipped,
        reason: sheetMirror.reason || ""
      }
    });
    return;
  }

  if (req.method === "PATCH" && pathname.startsWith("/api/stock-requests/")) {
    const session = await requireLabSession(req, res);
    if (!session) return;

    const match = pathname.match(/^\/api\/stock-requests\/([^/]+)\/status$/);
    if (!match) {
      sendJson(req, res, 404, { ok: false, error: "Not found" });
      return;
    }

    let bodyText = "";
    try {
      bodyText = await collectRequestBody(req);
    } catch (error) {
      sendJson(req, res, 413, { ok: false, error: error.message || "Request body too large" });
      return;
    }

    let payload = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      sendJson(req, res, 400, { ok: false, error: "Invalid JSON payload" });
      return;
    }

    const nextStatus = slugifyStatus(payload.status);
    const requestId = sanitizeString(match[1], 80);
    const updatedResult = await dbUpdateRequestStatus(requestId, nextStatus, session.user);

    if (!updatedResult?.record) {
      if (updatedResult?.error === "insufficient-stock") {
        sendJson(req, res, 409, {
          ok: false,
          error: nextStatus === "completed"
            ? "Not enough stock on hand to complete this order."
            : "Not enough stock on hand to mark this order as collected.",
          shortages: updatedResult.shortages || []
        });
        return;
      }
      sendJson(req, res, 404, { ok: false, error: "Request not found" });
      return;
    }

    const updatedRecord = updatedResult.record;
    const changedBy = normalizeElabUserNumber(session.user?.user_number, { allowAnyLength: true });
    const sheetSync = await syncStockRecordToSheets(updatedRecord, {
      action: "update-status",
      previousStatus: updatedResult.previousStatus,
      changedBy
    });

    sendJson(req, res, 200, {
      ok: true,
      request: {
        id: updatedRecord.id,
        status: updatedRecord.status,
        statusLabel: formatStatusLabel(updatedRecord.status),
        updatedAt: updatedRecord.updatedAt,
        statusUpdatedAt: updatedRecord.statusUpdatedAt || updatedRecord.updatedAt,
        statusUpdatedBy: changedBy || "",
        inventoryDeducted: Boolean(updatedRecord.inventoryDeducted),
        collectionRecord: updatedRecord.collectionRecord || null
      },
      sheetSync
    });
    return;
  }

  sendJson(req, res, 404, { ok: false, error: "Not found" });
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
    try {
      console.error("[api] unhandled-request-error", {
        method: req.method,
        url: req.url,
        errorMessage: getErrorMessage(error),
        errorCode: error?.code || "",
        errorStack: error instanceof Error ? error.stack : ""
      });
    } catch {
      // no-op
    }
    sendJson(req, res, 500, {
      ok: false,
      code: "server_error",
      error: "Server error",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Find My Tube server running at http://${HOST}:${PORT}`);
  console.log(`SUPABASE_URL loaded: ${SUPABASE_URL ? SUPABASE_URL : "(missing)"}`);
});
