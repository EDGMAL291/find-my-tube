# Dashboard-only stock balances

Stock balances are available through `/api/lab/stock-inventory` after server validation of an active, unexpired, current lab session. Missing, invalid, expired, disabled and replaced/revoked sessions cannot query balances.

The former `/api/stock-inventory` endpoint returns an empty private response for every caller, including callers with a valid dashboard cookie. This retains compatibility with older public clients without exposing inventory.

Public ordering no longer requests or stores balances, forwards a dashboard token for inventory, includes inventory metadata in submitted lines, or adds availability/balance wording to order summaries and shareable request text. Public request Details ignore legacy inventory metadata. Public tracking responses omit raw `requestText`, which could contain balance snapshots in older saved orders; stored records and staff responses are preserved.

Signing out clears the dashboard inventory list, status and in-memory summary. The standalone inventory loader validates that its original session and authentication generation are still current before accepting a response, including after JSON parsing. An in-flight response cannot repopulate balances after logout or an account change. The main dashboard loader retains its existing session-generation checks.

The service worker never caches or serves cached `/api/` responses. Server JSON responses retain `Cache-Control: no-store`. Advancing the service-worker cache version removes previous shell/runtime caches when activated.

## Validation

- `npm run check` passed.
- `npm test` passed: 26 unit tests plus order and Sheets regressions. HTTP fixtures exercise public bearer/cookie access, authorized dashboard reads and rejected missing/invalid/expired/disabled/revoked sessions. Service-worker coverage verifies API requests bypass the cache.
- The existing discovery, stock visual and laboratory catalogue browser suites passed.
- `tests/stock-privacy-browser.cjs` passed at 390 and 1280px: no public inventory requests even with a dashboard token, empty availability placeholders, no balances in submitted/shared/public-detail content, authorized dashboard rendering, cleared logout state and ignored late inventory responses.

No database migrations are needed. The backend and frontend must deploy together; a Git push alone does not verify live behaviour.

## Contact icons

The phone and WhatsApp icons use the original Bootstrap Icons v1.11.3 SVG silhouettes at 38px within the existing borderless tap targets. The existing MIT attribution is in `docs/bootstrap-icons-LICENSE.txt`. Phone/WhatsApp destinations and accessible labels are unchanged.
