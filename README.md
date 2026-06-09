# Commerce Connect

A partner GTM engine and event companion app for Salesforce Commerce SI/partner events. Built with Next.js 15, PostgreSQL, and Tailwind CSS.

## Features

**Attendee features:** Event landing page, agenda with session interests, speakers directory, contact registration, Q&A by topic, session feedback.

**Partner features:** Profile builder, partner matchmaking/directory, capability map, deal board, live polls (SWR), GTM idea wall, enablement passport, post-event action plan.

**AI:** Streaming AI concierge powered by OpenAI GPT-4o-mini with full event context.

**Admin:** CRUD for agenda/speakers, read views + CSV exports for all data, poll management, passport award/revoke, GTM moderation, feature flag toggles.

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)

### Setup

```bash
npm install

cp .env.example .env.local
# Edit .env.local with your values

npm run db:migrate   # creates tables
npm run db:seed      # seeds Commerce Summit 2026 data
node scripts/create-admin.js  # creates admin user

npm run dev
```

Visit `http://localhost:3000`. Admin panel at `http://localhost:3000/admin`.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `ADMIN_PASSWORD` | Password for the admin user (used by `scripts/create-admin.js`) |
| `OPENAI_API_KEY` | OpenAI API key for the AI concierge |
| `NODE_ENV` | Set to `production` on Heroku |

## Heroku Deployment

```bash
# 1. Create app and add PostgreSQL
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0

# 2. Set config vars
heroku config:set \
  NEXTAUTH_SECRET=$(openssl rand -base64 32) \
  ADMIN_PASSWORD=YourSecurePassword \
  OPENAI_API_KEY=sk-... \
  NODE_ENV=production

# 3. Deploy
git push heroku main

# 4. Run migrations and seed
heroku run npm run db:migrate
heroku run npm run db:seed
heroku run node scripts/create-admin.js
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS (Salesforce Lightning design tokens)
- **Database:** PostgreSQL via `pg` (raw SQL, no ORM)
- **Auth:** JWT in httpOnly cookie via `jose` + `bcryptjs` (admin only)
- **Real-time:** SWR polling at 5-second intervals
- **AI:** OpenAI SDK with streaming responses
- **Deployment:** Heroku (`output: standalone`)

## Project Structure

```
src/
├── app/               # Next.js App Router pages + API routes
│   ├── admin/         # Admin area (auth-protected)
│   ├── partners/      # Partner hub + sub-pages
│   └── api/           # All API routes
├── components/        # Reusable UI components
├── contexts/          # React contexts (SettingsContext)
├── hooks/             # Custom hooks (useContactId, useInterests)
├── lib/               # Shared utilities (db, auth, csv, passport)
├── types/             # TypeScript interfaces
└── db/                # SQL schema + seed data
```
