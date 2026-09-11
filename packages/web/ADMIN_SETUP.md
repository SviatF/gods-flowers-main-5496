# GOD'S FLOWERS Mini Builder

The CMS is file-based. It does not require Supabase, Firebase, Base44, or another database.

## Runtime

The production CityHost runtime uses Node.js.

```bash
npm install
npm run build
npm start
```

Open:

- Website: `/`
- Admin: `/admin`

## Persistent files

By default the CMS stores data in:

- `data/site-content.json` — published content
- `data/leads.json` — website form submissions and lead statuses
- `data/uploads/` — images uploaded through admin
- `data/wayforpay-orders.json` — generated WayForPay orders and verified callback statuses

The hosting account must allow the application process to write to these paths.

For production CityHost use persistent paths outside the deploy directory:

```bash
CONTENT_FILE_PATH=/absolute/persistent/path/site-content.json
LEADS_FILE_PATH=/absolute/persistent/path/leads.json
UPLOAD_DIR=/absolute/persistent/path/uploads
WAYFORPAY_ORDERS_FILE_PATH=/absolute/persistent/path/wayforpay-orders.json
```

## Applications

The public lead form writes each successful submission directly to `LEADS_FILE_PATH`. The `/admin` → `Заявки` tab reads this same file and allows the administrator to change a lead status between `Нова`, `В роботі`, and `Закрито`.

After a successful lead submission the checkout opens immediately.

## Admin security

Required environment variables:

```bash
ADMIN_LOGIN=admin@example.com
ADMIN_PASSWORD=your-strong-password
ADMIN_SESSION_SECRET=a-long-random-secret
```

Do not expose these values in frontend/Vite variables.

## Dynamic WayForPay checkout

The WayForPay invoice amount is generated server-side from the current CMS value `offer.price`. If the admin changes the price and publishes content, all new invoices use that new amount automatically.

Required production secrets/settings:

```bash
WAYFORPAY_MERCHANT_ACCOUNT=your-merchant-account
WAYFORPAY_MERCHANT_SECRET=your-secret-key
WAYFORPAY_MERCHANT_DOMAIN=godsflowersschool.online
PUBLIC_SITE_URL=https://godsflowersschool.online
WAYFORPAY_ORDERS_FILE_PATH=/absolute/persistent/path/wayforpay-orders.json
```

`WAYFORPAY_MERCHANT_SECRET` must exist only on the server. Never put it in GitHub, Vite variables, or browser code.

Checkout flow:

1. server reads the current `offer.price` from the published CMS JSON;
2. server creates a signed WayForPay `CREATE_INVOICE` request using HMAC-MD5;
3. browser opens the returned `invoiceUrl` inside the WayForPay widget;
4. WayForPay sends a signed payment result to `/api/payments/wayforpay/callback`;
5. the server verifies the callback signature and records the order status;
6. `/thanks?order=...` verifies the server-side order before exposing the Telegram course link.

The old 399 UAH hosted payment button is retained only as a temporary fallback while merchant API credentials are not configured, and only while the CMS price is exactly 399 UAH. If the CMS price changes, checkout refuses to use the old fixed-price button.

## Vercel note

The Vercel project is used as a build/preview safety check. Persistent CMS writes and production WayForPay callbacks are intended for the CityHost Node runtime with persistent storage.
