window.FMT_APP_CONFIG = Object.assign({}, window.FMT_APP_CONFIG, {
  // Optional: override the local stock API base, for example "http://localhost:3000".
  stockApiBaseUrl: "https://find-my-tube-api.onrender.com",
  // Leave blank to submit through the hosted backend, which can then mirror to Google Sheets.
  stockOrderSubmitUrl: ""
});
