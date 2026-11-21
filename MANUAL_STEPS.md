# GrowthFlow Manual Setup Steps

Follow these exact steps to complete the deployment and link your shared database to the new GrowthFlow Render instance.

---

### Step 1: Run Brand Column Migration in Supabase
In your Supabase project dashboard, open the **SQL Editor** and run the contents of [`growthflow/db-changes/add_org_brand.sql`](./db-changes/add_org_brand.sql):

```sql
-- 1. Add brand column if it doesn't already exist (default 'reachflow' preserves existing data)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'reachflow';

-- 2. Ensure only valid brands can be assigned
ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS organizations_brand_check;

ALTER TABLE organizations 
ADD CONSTRAINT organizations_brand_check CHECK (brand IN ('reachflow', 'growthflow'));

-- 3. Create an index for performant brand-scoped filtering
CREATE INDEX IF NOT EXISTS organizations_brand_idx ON organizations (brand);
```

---

### Step 2: Apply ReachFlow Backend Brand Patch
To ensure ReachFlow also filters its workers to only its own brand (`reachflow`):
- Refer to [`growthflow/db-changes/reachflow-backend-brand-patch.md`](./db-changes/reachflow-backend-brand-patch.md).
- Set `APP_BRAND=reachflow` in ReachFlow's Render backend environment.
- Redeploy the ReachFlow backend.

---

### Step 3: Deploy GrowthFlow on Render
1. Push this `growthflow` repository to your GitHub/GitLab account.
2. In Render, select **New +** -> **Blueprint**.
3. Select your GrowthFlow repository. Render will automatically parse [`render.yaml`](./render.yaml) and create both:
   - `growthflow-backend` (Web Service)
   - `growthflow-frontend` (Static Site)
4. Provide the secret environment variables in the Render dashboard:
   - **`DATABASE_URL`**: Supabase transaction pooler URL (port 6543) with `?sslmode=require`
   - **`SUPABASE_URL`**: Your Supabase project URL (`https://xyz.supabase.co`)
   - **`SUPABASE_SERVICE_ROLE_KEY`**: Your Supabase service role key
   - **`SUPABASE_JWKS_URL`**: `https://xyz.supabase.co/auth/v1/.well-known/jwks.json`
   - **`ENCRYPTION_KEY`**: A fresh 32-byte base64 string (generate via `openssl rand -base64 32`)
   - **`META_APP_ID` & `META_APP_SECRET`**: Your Meta developer app credentials for GrowthFlow
   - **`WEBHOOK_VERIFY_TOKEN`**: A random string of your choice
   - **`CRON_SECRET`**: A random secret token of your choice
   - **`FRONTEND_ORIGIN`**: The public URL of `growthflow-frontend.onrender.com`
   - **`VITE_API_URL`**: The public URL of `growthflow-backend.onrender.com`
   - **`VITE_SUPABASE_URL`**: Your Supabase project URL
   - **`VITE_SUPABASE_ANON_KEY`**: Your Supabase anonymous public key

---

### Step 4: Configure Supabase Auth Allowed Redirect URLs
1. In the Supabase dashboard, go to **Authentication** -> **URL Configuration**.
2. Add your deployed GrowthFlow frontend URL (`https://growthflow-frontend.onrender.com/**`) under **Redirect URLs**.

---

### Step 5: Configure Meta WhatsApp Webhook
1. Go to your Meta Developer Portal for GrowthFlow's Meta App.
2. Under WhatsApp -> Configuration -> Webhook:
   - **Callback URL**: `https://<growthflow-backend-url>/webhooks/meta`
   - **Verify Token**: The `WEBHOOK_VERIFY_TOKEN` you set in Step 3.
   - Subscribe to the `messages` event.

---

### Step 6: Create the First GrowthFlow Organization
Run this in the Supabase SQL editor (or register via GrowthFlow's signup page, which automatically sets `brand = 'growthflow'`):
```sql
-- Replace with the user's Supabase auth.users id
INSERT INTO organizations (name, brand) 
VALUES ('Client Name', 'growthflow')
RETURNING id;

-- Link user to the org as owner:
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('<ORG_ID_FROM_ABOVE>', '<USER_AUTH_ID>', 'owner');
```

---

### Step 7: Configure the 1-Minute Cron Job (Keep-Alive & Scheduler)
To ensure the backend stays alive and processes background message queues:
- Create a free job on [cron-job.org](https://cron-job.org):
  - **URL**: `https://<growthflow-backend-url>/internal/tick`
  - **Schedule**: Every 1 minute (`* * * * *`)
  - **Request Method**: `POST`
  - **Headers**:
    `X-Cron-Secret: <YOUR_CRON_SECRET>`
