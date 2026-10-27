# Stock and workflow rules

- A request needs a requester, ward/unit, and at least one current catalogue item.
- Quantities are positive whole numbers and are capped by the canonical catalogue.
- Tray and packet inventory units are calculated server-side. Browser totals are display-only.
- Lab bags and current Vacutainer needle options are ordered in packs of 50. Blood culture bottles are ordered individually. Pack summaries show both pack count and total items.
- New needle packs use `vacutainer-needle-green-pack` and `vacutainer-needle-black-pack`. Historical individual IDs remain supported for older clients but are hidden from the current order/receipt catalogue. Pack entries retain the original individual needle inventory keys. Never reinterpret an old quantity of two needles as two packs.
- An active duplicate for the same ward and item is blocked. High-volume repeats fulfilled in the previous 48 hours require a reason.
- Normal status flow is `Pending -> Ready -> Collected` (or `Completed`). `Cancelled` and `No Stock` are terminal alternatives.
- Stock is deducted once, only when an order reaches `Collected` or `Completed`.
- The atomic Supabase transition checks every required balance before changing any balance.
- Collected/Completed require that atomic transition; there is no separate-write inventory fallback. Repeating an already-saved status does not deduct again. Status confirmation is independent of secondary audit logging or Google Sheets delivery. See `docs/order-status-updates.md`.
- Reset current stock clears balances, received-stock records, and batches. It preserves requests, archived orders, users, sessions, and audit logs.
- Admins manage users and destructive maintenance; Medical Technologists can operate the work queue and received-stock workflow.

- Packed is a legacy alias for Ready: a packed order is available for collection. Existing history is retained. Apply `supabase/migrations/20261012_merge_packed_into_ready.sql` to merge the database workflow too. Until then the API promotes legacy packed records to Ready through the atomic RPC before collecting them; inventory checks and history remain intact.

- Extension/speed dial is optional private order metadata. It is validated, stored separately from notes/request text and omitted from public tracking. Authenticated lab order details can display it. Apply `supabase/migrations/20261012_private_order_contact.sql` for storage.
- Exact in-house inventory is available only through a valid lab session. Signed-out catalogue requests receive no balance rows. Nurse registration and owner-specific reporting require the separate permission design in `docs/nurse-account-design.md`.
