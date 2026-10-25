# Mizan

A small bilingual shop (English / Arabic) built with Next.js and PostgreSQL.

## Install

```bash
npm install
```

## Database

PostgreSQL needs to be running locally. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` in `.env.local`.

```bash
npm run db:setup
```

That applies `migrations/001_init.sql` and loads a sample catalog.

## Run

```bash
npm run dev
```

- Shop: http://localhost:3000/en
- Arabic shop: http://localhost:3000/ar
- Admin: http://localhost:3000/en/admin/login
- First admin: `admin@mizan.shop` / `admin123`
