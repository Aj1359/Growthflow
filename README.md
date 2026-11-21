# GrowthFlow — Production WhatsApp Broadcast & Customer Growth Platform

GrowthFlow is an enterprise-grade multi-tenant WhatsApp Cloud API broadcasting and customer growth platform built with:
- **Backend**: Node.js, Express, TypeScript, Supabase PostgreSQL with Row Level Security (RLS)
- **Frontend**: React 18, Vite, Tailwind CSS, TypeScript
- **Infrastructure**: Meta WhatsApp Cloud API (v21.0), Render Cloud Hosting

---

## 🔒 Core Architecture & Security Model

1. **Authentication & Tenant Isolation**:
   - Every `/api/*` route is protected by Supabase JWT verification (`jose`) and organization membership checks.
   - Cross-organization data leakage is completely blocked at both the database level (foreign keys & constraints) and application layer.
   - `X-Org-Id` is accepted only if the caller's JWT is verified as an active member of that organization.
   - Tokens and secrets are encrypted at rest using AES-256-GCM. Decrypted tokens are never returned over the network or saved in client-side storage.

2. **Asynchronous Broadcast Sending Worker**:
   - Broadcast requests create a `campaigns` record and enqueue recipient rows in `messages` with `status = 'queued'`. Zero messages are dispatched inside the HTTP request.
   - A dedicated worker claims pending rows using `SELECT ... FOR UPDATE OF m SKIP LOCKED LIMIT 40`.
   - Supports rate limiting per organization, exponential backoff for retryable errors (30s, 2m, 10m, 30m), and automatic stuck-message sweeping.
   - Header images are uploaded once to Meta (`POST /{phone-number-id}/media`) and shared across recipient dispatches via `media_id`.

3. **Live, Verified Delivery & Engagement Sync**:
   - The webhook endpoint `/webhooks/whatsapp` requires strict HMAC-SHA256 signature verification (`X-Hub-Signature-256`) using timing-safe comparisons.
   - Lifecycle state progression strictly enforces `sent` &rarr; `delivered` &rarr; `read`.
   - Inbound customer replies are captured, linked to prior campaign dispatches, and trigger real-time threads in the **Replies Inbox**.
   - Optional auto-forwarding dispatches incoming customer inquiries to a business owner's personal WhatsApp number via an approved Meta utility template.

4. **Multi-Tenant Opt-Out (STOP)**:
   - When a contact replies `STOP`, `UNSUBSCRIBE`, `CANCEL`, `END`, or `QUIT`, their contact status is marked `opted_out` **strictly within that organization**.
   - All pending queued messages for that contact are skipped automatically.

---

## 🛠️ Required Environment Variables

All variables are strictly validated on server startup with **zero fallback defaults**.

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?sslmode=require
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SUPABASE_SERVICE_ROLE_KEY]
ENCRYPTION_KEY=[32_BYTE_BASE64_ENCODED_KEY]
META_APP_ID=[YOUR_META_APP_ID]
META_APP_SECRET=[YOUR_META_APP_SECRET]
WEBHOOK_VERIFY_TOKEN=[YOUR_RANDOM_SECURE_TOKEN]
CRON_SECRET=[YOUR_RANDOM_CRON_SECRET]
FRONTEND_ORIGIN=https://growthflow-frontend.onrender.com
```

### Frontend (`frontend/.env.production`)

```env
VITE_API_URL=https://growthflow-backend.onrender.com
VITE_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_SUPABASE_ANON_KEY]
```

---

## 📱 Meta Setup Guide

1. **Meta Developer App**:
   - Create a **Business App** in [Meta Developers](https://developers.facebook.com).
   - Set app status to **Live** (published).

2. **WhatsApp Business Account (WABA)**:
   - Add a valid payment method under **WhatsApp Manager &rarr; Billing**.

3. **System User & Permanent Access Token**:
   - In [Meta Business Settings](https://business.facebook.com/settings) &rarr; **System Users**, create an Admin system user.
   - Assign full control over the App and WhatsApp Business Account.
   - Generate a token with expiration set to **Never** and check permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`

4. **Webhooks Setup**:
   - In Meta Developer Console under **WhatsApp &rarr; Configuration**:
     - **Callback URL**: `https://<YOUR_BACKEND_URL>/webhooks/whatsapp`
     - **Verify Token**: Must match `WEBHOOK_VERIFY_TOKEN` in your `.env`.
   - Under **Webhook fields**, subscribe to:
     - `messages`
     - `message_template_status_update`

---

## 🧪 Testing

To run the unit and integration tests:

```bash
cd backend
npm test
```
