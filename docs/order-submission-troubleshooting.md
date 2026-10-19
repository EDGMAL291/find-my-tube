# Order submission troubleshooting

Check the exact message before retrying an order. A connection failure can occur after an order has been saved, so check Track Orders first when confirmation is uncertain.

## Extension could not be stored

The API returns `503` with code `contact_storage_unavailable` when a request containing an extension fails because the private `contact_extension` column is unavailable. This failure happens before the request is saved. The browser retains the order and explains that the optional extension can be left blank for another submission.

The permanent database fix is to apply `supabase/migrations/20261012_private_order_contact.sql` to the application's Supabase database through its normal migration process. A Git push does not apply SQL migrations. After applying it, confirm the column is available to the API and verify a genuine order with an extension. Keep that value private; do not move it into notes or request text as a workaround.

## Other failures

- A duplicate-order response directs the requester to Track Orders. Do not bypass the duplicate check.
- For a connection error or a generic service error, check Track Orders before trying again. The API may have saved the order before the connection failed.
- Operators should inspect Render logs for `[stock-submit] write-failed` or `[api] unhandled-request-error`, and check `/api/health` and `/api/config`. Health responding alone does not establish that the database can accept orders.
- Missing email configuration does not prevent order saving. Do not resubmit an order to retry an email notification.

Local fixtures cover the missing-contact-column response and successful saving without the optional extension. These checks do not establish which database migrations are applied in production.
