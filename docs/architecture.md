# Architecture

Find My Tube is a progressively enhanced, multi-page web application. GitHub Pages serves the static frontend and PWA assets. The browser calls the Render-hosted Node API, which is the only component allowed to use the Supabase service-role key.

## Product surfaces

- `index.html`: photographic home and Find My Test clinical workup.
- `find-my-tube.html`: test-to-specimen lookup and Tube Plan selection.
- `order-stock.html`: public consumables request workflow.
- `track-orders.html`: public request-status view.
- `stock-dashboard.html`: authenticated work queue, receipts, inventory, export, and user administration.

## Data flow

1. Public pages load static clinical datasets and the shared stock catalogue.
2. Stock requests are validated again by `server.js`; client-supplied labels, unit sizes, and inventory totals are ignored.
3. The API persists requests and audit data through the Supabase service role.
4. Lab users authenticate with an eLab number and PIN. Session records are server-side; the cross-origin bearer fallback is stored only in the current browser tab.
5. Final fulfilment should use `transition_stock_request_status`, which locks the order and relevant balances in one database transaction.

## Security boundary

Supabase tables have RLS enabled with no browser roles granted. Public and protected data are exposed only through explicit API routes. Production browser origins are allowlisted with `ALLOWED_ORIGINS`; local loopback origins remain available for development.

## Known structural debt

`assets/js/script.js`, `assets/css/style.css`, `assets/css/modern.css`, and `server.js` are still large. Future work should split them by product surface after browser regression coverage is expanded.
