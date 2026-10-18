# Stock order emails

The backend can notify **2milclinpathlab@gmail.com** when a new stock request is saved, including requests entered manually by signed-in lab staff. Validation failures, duplicate requests, failed database writes and status updates do not send a new-order email. The email contains the order number, requester, ward, submitted time, extension if provided, requested items and quantities, notes, and a link to the protected lab dashboard. It does not copy inventory balances or the legacy request text.

## Enable on Render

1. Verify a sending domain in [Resend](https://resend.com/domains), following its DNS verification instructions. The receiving Gmail address is the destination; it does not have to be the sender.
2. Create a sending API key for that domain.
3. In the Render environment settings for `find-my-tube-api`, set these **server-only** variables:
   - `RESEND_API_KEY`: the sending API key.
   - `STOCK_ORDER_EMAIL_FROM`: an address on the verified domain. For example, `Find My Tube <orders@findmytube.co.za>` can be used after that domain is verified. This example does not create a mailbox or verify the domain.
4. Save and deploy the backend. No frontend setting or database migration is needed. Do not put the API key in browser code, Git, or chat.
5. `/api/health` reports `notifications.stockOrderEmailConfigured`. `true` means the variables are present; it does not prove that the provider has accepted them or delivered an email. Check receipt of an email after the next genuine order, including the Gmail spam folder.

For local development, use the same variables in the ignored `.env` file. Leaving either variable blank disables email delivery and keeps ordering available. Remove the API key to disable notifications later.

## Delivery behavior

- Email starts only after the request and all its item rows have been persisted. It runs alongside the existing Sheets synchronization, with an eight-second timeout per email attempt.
- Network failures, timeouts, rate limits and provider server errors receive up to three attempts. Every attempt uses the identical payload and an idempotency key derived from the saved order number to avoid duplicate emails within the provider's idempotency retention window.
- Provider acceptance is recorded only when a successful response contains an email ID. This is an acceptance acknowledgement, not proof of inbox delivery.
- Missing configuration or an email failure never rejects or deletes the saved order. The order endpoint returns a separate `emailNotification` result. Delivery failures are logged as `[stock-email] delivery-failed`, with the order ID, provider status and attempt count; credentials and order contact details are not logged by this notifier.
- Retries are bounded to the submission request; there is no persistent retry queue. If all attempts fail or the process stops before sending, staff must follow the order in the dashboard and investigate the backend/provider logs. Do not resubmit the stock order merely to retry an email.

Automated tests replace the email provider with fixtures and never email the lab.
