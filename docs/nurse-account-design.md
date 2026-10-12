# Nurse accounts: recommended next phase

Nurse accounts would be useful for personal order history, monthly usage and repeat-request visibility. They should be separate from the existing lab dashboard accounts.

## First release

- Sign in and sign up using verified work email. Require an administrator to approve the ward/unit association before granting ward-level visibility.
- Give nurses a distinct `nurse` role. Nurses can create orders, see their own orders and contact number, and see monthly totals for their own requests. Lab staff retain stock balances, receipts and fulfilment. Admins retain user and role management.
- Link each authenticated request to `requested_by_user_id` on the server. Do not identify an owner by a typed name, ward or a browser-supplied user ID.
- Report requested and fulfilled quantities separately. Exclude cancelled/no-stock orders from fulfilled totals and make tray/packet versus individual-unit counts explicit.
- Group reporting months in the site's South African business timezone, including orders around midnight at month boundaries.
- Add server-side pagination and filters before exposing personal or ward history; the current public tracking list is capped at 100 orders.

## Permission boundary

Every lab route must explicitly require a staff/admin role before a nurse role is introduced. The existing lab session guard currently distinguishes signed-in lab users from guests, not nurses from lab staff. Adding a nurse value to the users table without changing those route guards could grant excessive access.

Use account-specific API responses and database policies. Nurses should not receive in-house balances, private contacts belonging to other requesters, audit logs, receipts, or user-management data. An approved ward coordinator role could be considered separately if a ward needs collective monthly reporting.

## Current change

Public registration has not been opened. This release collects an optional extension/speed dial on orders, keeps it out of public tracking responses and Sheets request text, and reveals it in authenticated lab order details. Exact inventory balances are returned only after a valid lab session. A future nurse-account response can reveal the saved contact only to its verified owner.

Apply `supabase/migrations/20261012_private_order_contact.sql` before accepting an extension on a production order. The migration adds a nullable validated `contact_extension` column and was tested for repeatability locally. Orders without an extension continue to use the existing schema. If the migration is missing, the API reports a contact-storage error rather than silently discarding the number.
