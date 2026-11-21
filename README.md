# GrowthFlow

GrowthFlow is an automated WhatsApp customer engagement, broadcast, and lifecycle messaging platform built specifically for high-conversion communication.

---

## Architecture & How GrowthFlow Differs from ReachFlow

GrowthFlow runs as an **independent application** with its own repository, branding, and Render deployment services, while safely sharing a single Supabase / PostgreSQL database with ReachFlow:

1. **Shared Database with Brand Isolation**:
   - Both backends communicate with the same PostgreSQL instance.
   - Every organization belongs to an `APP_BRAND` (`growthflow` vs `reachflow`).
   - The database enforces brand isolation via the `organizations.brand` column and check constraint (`organizations_brand_check`).
   - Auth middleware filters user memberships by `APP_BRAND = 'growthflow'`. Users belonging strictly to ReachFlow cannot authenticate against GrowthFlow (returns `403 WRONG_APP`).
   - Sender workers and internal schedulers only claim and process messages for `growthflow` organizations.
   - Advisory lock keys are partitioned by brand (`hashtext('tick:growthflow')`), preventing scheduler locks from blocking ReachFlow.
   - Inbound Meta webhooks verify whether the destination WhatsApp account belongs to a GrowthFlow organization before taking any action.

2. **Distinct Branding & UI**:
   - Modern design tokens (`#0F766E` deep teal primary, `#F59E0B` warm amber accent, `#0C3C37` dark teal sidebar).
   - Plus Jakarta Sans heading and Inter body typography.
   - Tailored customer onboarding copy, illustrations, and dashboard views.

3. **Strict Zero-Default Configuration**:
   - The backend and frontend fail immediately on startup if any required environment variable is omitted.
   - No hardcoded backend URLs or fallback secret keys exist anywhere in the code.

---

## Local Development

### Prerequisites
- Node.js >= 20
- PostgreSQL database (Supabase instance)
- Meta WhatsApp Cloud API credentials

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your database and Supabase keys in .env
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Fill in VITE_API_URL and Supabase credentials
npm install
npm run dev
```

### Running Tests
```bash
npm --prefix backend test
```

---

## Deployment on Render (Blueprint)

GrowthFlow includes a ready-to-deploy [`render.yaml`](./render.yaml) blueprint consisting of two services:
1. **`growthflow-backend`** (Node.js Web Service)
   - Health check endpoint: `/healthz`
   - Build command: `npm install --include=dev && npm run build`
   - Start command: `node dist/index.js`
2. **`growthflow-frontend`** (Static Site)
   - Build command: `npm install && npm run build`
   - Publish path: `dist`
   - Rewrite rule: `/*` -> `/index.html`

### Required Environment Variables

#### Backend (`growthflow-backend`)
| Variable | Value / Description |
| :--- | :--- |
| `APP_BRAND` | Set to `growthflow` (preset in blueprint) |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase pooler connection string (port 6543) with `?sslmode=require` |
| `SUPABASE_URL` | `https://<YOUR_PROJECT_ID>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret |
| `SUPABASE_JWKS_URL` | `https://<YOUR_PROJECT_ID>.supabase.co/auth/v1/.well-known/jwks.json` |
| `ENCRYPTION_KEY` | 32-byte base64 string for encrypting WhatsApp API credentials |
| `META_APP_ID` | Your Meta App ID for GrowthFlow |
| `META_APP_SECRET` | Your Meta App Secret |
| `WEBHOOK_VERIFY_TOKEN` | Unique verification token configured in Meta App Webhook settings |
| `CRON_SECRET` | Secret token for triggering `/internal/tick` |
| `FRONTEND_ORIGIN` | Comma-separated list of allowed origins (e.g. `https://growthflow-frontend.onrender.com`) |

#### Frontend (`growthflow-frontend`)
| Variable | Value / Description |
| :--- | :--- |
| `VITE_BRAND` | `growthflow` |
| `VITE_API_URL` | URL of the deployed `growthflow-backend` web service |
| `VITE_SUPABASE_URL` | `https://<YOUR_PROJECT_ID>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key |

---

## Automated Scheduler (Cron Tick)

To process scheduled campaigns, automated sequence steps, and stuck messages, set up a recurring cron job that pings the backend every minute:

- **Method**: `POST`
- **URL**: `https://<growthflow-backend-url>/internal/tick`
- **Header**: `X-Cron-Secret: <YOUR_CRON_SECRET>`
- **Schedule**: Every minute (`* * * * *`)
- **Recommended Tools**: [cron-job.org](https://cron-job.org) or Supabase `pg_cron`.
