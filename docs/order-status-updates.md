# Reliable order status updates

The main dashboard flow is **Pending → Ready → Collected**. Each active order offers one next-step button. Cancellation and whole-order No Stock remain under **Other actions**; the historical Completed status remains supported by the API and reporting. Collected requires an inline confirmation explaining that stock is deducted and the order moves to Archives.

An order displays Saving, Checking, Saved or a specific failure beside its controls. Repeated taps are locked while saving or checking. A confirmed collection leaves a receipt with the order number and a View order action after the order leaves the active queue.

## Confirmation and recovery

- PATCH sends the expected current status. A valid success response contains the saved order and requested status; a success HTTP code alone is insufficient.
- Interrupted or invalid responses trigger a read of the authenticated single-order endpoint, `GET /api/lab/stock-requests/:id`. It can read archived orders and does not depend on dashboard statistics or inventory summaries loading.
- If that read confirms the target status, the UI acknowledges the save without repeating the write. If a different status is saved, it shows that state and the error. If the saved status remains unknown, further writes are blocked behind **Check saved status**.
- Older dashboard loads are discarded after a mutation or a newer load. A failed summary refresh preserves the confirmed order and reports the summary problem separately.
- A fresh poll can confirm a previously uncertain save. In-flight controls remain available for checking even if an old order falls outside the recent list. Late acknowledgements and verification reads cannot replace a record with a longer saved audit history.
- Logout clears pending UI state; a response from the old session cannot restore it.

## Database writes

Ready, Cancelled and No Stock updates compare the original status and JSON audit history when saving. Concurrent availability notices or status changes cannot be overwritten. The saved record is read back before the API acknowledges it. Repeating a request for the already-saved status is a no-op.

Collection and completion use the existing `transition_stock_request_status` Supabase function. Its transaction locks the order and required inventory balances, checks shortages, deducts once and records the status/history together. The old fallback that deducted inventory through separate REST writes has been removed. The API retains compatibility with legacy Packed records by promoting them through Ready using the same RPC before collection when necessary.

The order's `status_history` remains the primary persisted audit. Secondary `audit_logs` writes and Google Sheets sync run after the HTTP confirmation; failures are logged as `[stock-status] secondary-audit-failed` or `[stock-status] sheet-sync-failed`. These secondary operations are best effort, without a durable retry queue, and cannot turn a committed status into an apparent failed save.

## Administrator checks

- Shortages are reported explicitly in the signed-in dashboard. Review the request and recorded received stock before collecting; the stock checks are not bypassed.
- `collection_setup_required` means the atomic inventory function is missing. Apply the repository's existing `supabase/migrations/20260930_atomic_inventory_and_rls.sql` and then `supabase/migrations/20261012_merge_packed_into_ready.sql` through the normal database migration process. A Git push does not run SQL. Do not manually deduct stock as a retry workaround.
- Existing database prerequisites remain required. No additional migration is introduced by this release. Verify the deployed backend release and a genuine workflow before treating production as validated.

`test/order-status-http.test.js` uses a Supabase HTTP/RPC fixture to test confirmation, stalled Sheets, failed secondary audit, stale transitions, concurrent notice updates, shortages, a missing RPC, legacy compatibility and repeated/concurrent collection without direct inventory writes. It does not replace validating the deployed database function. `tests/order-status-browser.cjs` covers mobile and desktop controls, repeated taps, old polling responses, collection confirmation, interrupted acknowledgements, uncertain states, malformed replies and logout.
