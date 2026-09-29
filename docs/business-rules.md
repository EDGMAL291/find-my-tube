# Stock and workflow rules

- A request needs a requester, ward/unit, and at least one current catalogue item.
- Quantities are positive whole numbers and are capped by the canonical catalogue.
- Tray and packet inventory units are calculated server-side. Browser totals are display-only.
- An active duplicate for the same ward and item is blocked. High-volume repeats fulfilled in the previous 48 hours require a reason.
- Normal status flow is `Pending -> Packed -> Ready -> Collected` (or `Completed`). `Cancelled` and `No Stock` are terminal alternatives.
- Stock is deducted once, only when an order reaches `Collected` or `Completed`.
- The atomic Supabase transition checks every required balance before changing any balance.
- Reset current stock clears balances, received-stock records, and batches. It preserves requests, archived orders, users, sessions, and audit logs.
- Admins manage users and destructive maintenance; Medical Technologists can operate the work queue and received-stock workflow.
