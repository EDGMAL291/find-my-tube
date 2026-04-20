window.FMT_APP_CONFIG = Object.assign({}, window.FMT_APP_CONFIG, {
  // Live frontend is static (GitHub Pages/custom domain), so API must target hosted backend.
  stockApiBaseUrl: "https://find-my-tube-api.onrender.com"
});
