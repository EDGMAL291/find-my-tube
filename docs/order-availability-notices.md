# Unavailable-item notices

## Lab workflow

1. Sign in to Stock Dashboard and choose **View order** on an active request.
2. Under **Notify requester about unavailable items**, select the unavailable items.
3. Choose **Publish notice** and wait for confirmation.
4. When an item is available again, uncheck it and publish. Unchecking every item clears the notice.

The requester sees **Stock update** with the unavailable item names in Track Orders and an item-specific label inside the order details. It appears on the next tracking refresh or normal polling update, including when the unavailable item falls outside the compact three-item summary. This is an on-site notice; it does not send an email, SMS, WhatsApp message or phone push notification.

The notice does not cancel an order, remove items, change requested quantities, deduct inventory or enable partial fulfilment. Existing status transitions and inventory checks still apply. Notices are hidden after an order is collected, completed or cancelled; their audit history remains. Stock balances and private extensions remain restricted to the dashboard.

## Storage and API

No new database column, migration or messaging-service credentials are needed. An authenticated lab session can PATCH `/api/lab/stock-requests/:id/availability` with `unavailableItemIds` and the `expectedRevision` of the current notice (zero when absent).

The API accepts only IDs already present on an active order. It stores a typed `item-availability-notice` event in the existing Supabase `stock_requests.status_history` array and updates the order's activity timestamp. The latest event is a complete snapshot; an empty selection clears the notice without erasing earlier events. Responses derive `availabilityNotice` from that history.

A revision check rejects an editor opened before a newer notice. The write also compares the original status and JSON history, so another notice or a status transition between reading and writing cannot be overwritten. Conflicts require reviewing the refreshed order. A failed write is never reported as published.

The browser uses a bounded request timeout and instructs staff to check the saved order when confirmation is uncertain. Public notices contain only ordered item names and availability flags, with no inventory balance or private contact number. Deploy both the backend and frontend before relying on the publishing control.

Tests: `test/order-availability-http.test.js` covers persistence, authorization, validation, clearing, conflicts, failed writes and public privacy. `tests/order-availability-browser.cjs` covers staff publishing and clearing, failed-save recovery, public notices and unchanged quantities at mobile and desktop widths.
