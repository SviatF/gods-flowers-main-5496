# GOD'S FLOWERS Mini Builder

The CMS is file-based. It does not require Supabase, Firebase, Base44, or another database.

## Runtime

The current project server runs with Bun.

```bash
bun install
bun run build
ADMIN_PASSWORD="your-strong-password" \
ADMIN_SESSION_SECRET="a-long-random-secret" \
bun run start
```

Open:

- Website: `/`
- Admin: `/admin`

## Persistent files

By default the CMS stores data in:

- `data/site-content.json` — published content
- `data/uploads/` — images uploaded through admin

The hosting account must allow the application process to write to these paths.

You can override them with environment variables:

```bash
CONTENT_FILE_PATH=/absolute/persistent/path/site-content.json
UPLOAD_DIR=/absolute/persistent/path/uploads
```

For production hosting, point these variables to a persistent directory that is not replaced during deployment.

## Security

Required environment variables:

- `ADMIN_PASSWORD` — password for `/admin`
- `ADMIN_SESSION_SECRET` — long random value used to sign the HttpOnly admin session cookie

Do not expose these values in frontend/Vite variables.

## Vercel note

The current Vercel project is configured as a static Vite deployment. It can build the admin UI, but file writes are intentionally intended for the purchased Bun/Node hosting with persistent storage. The public site keeps its bundled content as a fallback if `/api/site-content` is unavailable.
