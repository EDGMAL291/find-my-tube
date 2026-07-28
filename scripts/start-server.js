const fs = require("fs");
const Module = require("module");
const path = require("path");

const serverPath = path.join(__dirname, "..", "server.js");
let source = fs.readFileSync(serverPath, "utf8");

const legacyHelper = `function isStockRequestStatusConstraintError(error) {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("stock_requests_status_check");
}`;

const patchedHelper = `function isStockRequestStatusConstraintError(error) {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("stock_requests_status_check")
    || (message.includes("stock_requests") && message.includes("status") && message.includes("check constraint"))
    || (message.includes("violates check constraint") && message.includes("status"))
  );
}`;

if (source.includes(legacyHelper)) {
  source = source.replace(legacyHelper, patchedHelper);
} else if (!source.includes("message.includes(\"violates check constraint\") && message.includes(\"status\")")) {
  console.warn("[startup] stock status compatibility patch was not applied; helper shape changed.");
}

const serverModule = new Module(serverPath, module.parent);
serverModule.filename = serverPath;
serverModule.paths = Module._nodeModulePaths(path.dirname(serverPath));
serverModule._compile(source, serverPath);
