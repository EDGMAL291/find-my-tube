# Site review — 12 October 2026

Reviewed the local site, server, deployment workflows, and accumulated UI changes. This is a source and local-runtime review; production data and authenticated production operations were not inspected. The environment blocked requests to the public website and Render API, so live deployment and database migration state could not be confirmed.

## What is working well

- The server validates stock items, quantities, and inventory units against a canonical catalogue instead of trusting browser totals.
- Supabase privileged credentials stay on the server. Protected dashboard routes enforce sessions and roles.
- Search and Tube Plan have substantial responsive browser regression coverage.
- The updated UI has consistent cool-blue/warm-amber photographic treatment, neutral frost, clearer menus and order tracking, and lighter contact icons.
- Packed is now read as Ready. Historical status entries are preserved, and compatibility with the old database function uses its existing atomic transition checks.

## Findings, in priority order

### 1. High: the public tracking API returns more order information than a public lookup needs

`server.js` (`GET /api/stock-requests`, `mapRequestFromDb`) returns a list without authentication or an order-specific lookup token. Records include requester names, wards, free-text notes, request text, collection records, and status history. CORS does not prevent direct clients from calling the endpoint.

**Impact:** anyone who can reach the API can enumerate operational order details. This is confirmed in the code; production content was not retrieved.

**Recommendation:** separate the public tracking response from the staff response. Use an opaque order lookup token or authenticated ward access, and expose only the fields needed to track that order. Keep audit history, staff identifiers, and free-text notes on protected routes.

### 2. High, conditional: inventory fulfilment falls back to separate database writes when the atomic function is missing

`server.js` (`dbTryAtomicStockTransition`, `dbUpdateRequestStatus`) returns to separate balance reads, item deductions, and order updates when the RPC is unavailable.

**Impact:** concurrent collections or a failure between writes can leave inventory and order status inconsistent. This risk depends on the production migration state, which could not be verified.

**Recommendation:** verify the September atomic/RLS migration and the new Packed/Ready migration in production, then fail collection safely if the atomic function is unavailable. Do not rely on the fallback for fulfilment. The new migration and existing atomic function were exercised locally against PostgreSQL via PGlite, including repeated collection and shortage cases; that does not prove production installation.

### 3. Medium: tracking filters only search the most recent 100 returned orders

`assets/js/track-orders.js` requests 250 records and filters name/ward in the browser. `server.js` caps the public endpoint at 100; `dbListRequests` applies that limit before the browser's name/ward filter. Typing a ward triggers another fetch but sends no ward filter to the API.

**Impact:** a valid older or less recent order can disappear from searches even though it exists in the database.

**Recommendation:** add server-side name/ward filters and pagination. Keep automatic refresh for the current filtered page rather than repeatedly downloading the same global list.

### 4. Medium: deployment is not gated on the test workflow

`.github/workflows/deploy-pages.yml` and `test-discovery.yml` are independent workflows triggered by a push to `main`.

**Impact:** GitHub Pages can publish a commit while its tests are still running, or even when they fail. The Pages artifact also includes the whole checkout rather than a dedicated public build directory.

**Recommendation:** make deployment depend on successful checks and browser tests; publish an explicit frontend artifact that excludes backend source, tooling, and archives. Gate backend releases similarly.

### 5. Medium: Order Details does not trap or restore keyboard focus

`assets/js/script.js` (`ensureStockRequestDetailsModal`, `showStockRequestDetails`) focuses Close and supports Escape, but does not trap Tab inside the dialog or return focus to the triggering View Order button.

**Impact:** keyboard users can tab into the obscured page and lose their position after closing the dialog.

**Recommendation:** use a native dialog or the existing planner's focus-management approach, including focus restoration and an inert background.

### 6. Medium: style and script size make changes fragile and expensive to load

`style.css` and `modern.css` total over 670 KB uncompressed; `script.js` is about 370 KB. Numerous repeated overrides and `!important` declarations make the cascade difficult to predict. The shared scene treatment is now isolated in `assets/css/scenes.css`, but the larger legacy cascade remains.

**Impact:** small visual changes can affect other pages, and mobile devices parse substantial code even for simple workflows.

**Recommendation:** gradually move each workflow into its own stylesheet/module, remove superseded rules after visual checks, and measure performance on a real mid-range phone. Preserve the existing regression suite while doing this.

## Validation and release notes

- Syntax checks, all 18 unit tests, and order/Sheets regression checks passed.
- The complete discovery and stock browser suites passed: discovery checks at 360, 390, 412, 430, 768, and 1280 pixels in light/dark themes, plus stock checks at 360, 390, and 1280 pixels. Local Chromium was used; API responses were mocked for the browser checks.
- The page background audit covered all 11 HTML pages at 390 and 1280 pixels, checking the cool/warm overlay and horizontal overflow.
- Local PostgreSQL checks exercised both old and new transition functions, Packed-to-Ready compatibility, single inventory deduction on repeated collection, shortages, retained history, and restricted RPC execute permissions.
- The new migration is committed for production application; it was not applied to the live database. The API compatibility path supports legacy packed records until then.
- The generated Order Details background and green safety-needle illustration are local product assets. The needle image is illustrative, not a manufacturer product photograph.
- A Git push confirms source publication, not successful frontend/backend deployment. Production health, migration status, and a staff receipt/collection smoke test remain release checks.
