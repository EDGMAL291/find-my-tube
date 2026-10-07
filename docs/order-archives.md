# Order inactivity archives

Orders leave the active queue after 14 full days without recorded activity, including pending orders nobody has acted on. Activity is the latest valid update, status-history timestamp, cancellation, inventory deduction, submission or creation timestamp. Viewing or refreshing an order does not restart its clock.

The shared `assets/js/order-archive.js` policy is used by the API, Stock Dashboard and Track Orders. Archive membership is computed on each request/refresh, so existing orders qualify immediately without a database migration or scheduled job. Original statuses, items, timestamps and stock balances are preserved. A genuine new update restarts the inactivity clock.

Track Orders → Archives displays these records alongside completed orders. The default API request list excludes archives; `includeArchived=true` retains them for history and exports. Invalid or missing timestamps alone do not archive an order.
