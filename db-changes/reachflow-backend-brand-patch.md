# ReachFlow Backend Multi-Brand Scoping Patch (`APP_BRAND=reachflow`)

This patch instructions explain how to apply the exact same multi-brand scoping to the **original ReachFlow codebase** so that both ReachFlow and GrowthFlow safely share one PostgreSQL database without collisions or cross-tenant leaks.

---

## 1. Database Schema Prerequisite

Before deploying the backends, run `growthflow/db-changes/add_org_brand.sql` once in the Supabase SQL editor:

```sql
alter table organizations add column if not exists brand text not null default 'reachflow';
alter table organizations drop constraint if exists organizations_brand_check;
alter table organizations add constraint organizations_brand_check check (brand in ('reachflow','growthflow'));
create index if not exists organizations_brand_idx on organizations (brand);
```

All existing ReachFlow organizations will automatically receive `brand = 'reachflow'`.

---

## 2. Environment Variables

In ReachFlow's backend (`.env` and Render service):

```env
APP_BRAND=reachflow
```

Update `backend/src/config/env.ts`:

```typescript
const envSchema = z.object({
  APP_BRAND: z.enum(['reachflow', 'growthflow']).default('reachflow'),
  ...
});
```

---

## 3. Brand Helper (`backend/src/db/brand.ts`)

Create `backend/src/db/brand.ts`:

```typescript
import { env } from '../config/env.js';

export function scopeToBrand(targetColOrAlias: string = 'org_id', brand: string = env.APP_BRAND): string {
  const safeBrand = brand === 'growthflow' ? 'growthflow' : 'reachflow';
  if (targetColOrAlias === 'o' || targetColOrAlias === 'organizations') {
    return `${targetColOrAlias}.brand = '${safeBrand}'`;
  }
  return `${targetColOrAlias} IN (SELECT id FROM organizations WHERE brand = '${safeBrand}')`;
}
```

---

## 4. Auth Middleware (`backend/src/middleware/auth.ts`)

In `requireAuth`, after verifying the JWT:

```typescript
// Query memberships joined with organizations
let { rows: allMemberships } = await client.query(
  `SELECT m.org_id, m.role, o.brand
   FROM memberships m
   JOIN organizations o ON m.org_id = o.id
   WHERE m.user_id = $1`,
  [userId]
);

// Filter memberships strictly by APP_BRAND ('reachflow')
const memberships = allMemberships.filter((m) => m.brand === env.APP_BRAND);

if (memberships.length === 0) {
  res.status(403).json({
    error: {
      code: 'WRONG_APP',
      message: 'This account is not registered for this app.',
    },
  });
  return;
}
```

---

## 5. Sender Worker Claim & Sweeper (`backend/src/services/senderWorker.ts`)

1. **`sweepStuckMessages()`**:
```typescript
await client.query(`
  UPDATE messages
  SET status = 'failed',
      failed_at = NOW(),
      error_code = 'INTERRUPTED',
      error_message = 'Message dispatch was interrupted (stuck in sending > 5 min)'
  WHERE status = 'sending'
    AND (locked_at < NOW() - INTERVAL '5 minutes' OR (locked_at IS NULL AND next_attempt_at < NOW() - INTERVAL '5 minutes'))
    AND ${scopeToBrand('org_id')}
`);
```

2. **`processSendingBatch()`**:
Join `organizations o ON m.org_id = o.id` and add `AND ${scopeToBrand('o')}` to the `batch` query.
When `batch.length === 0`, scope campaign completion:
```typescript
UPDATE campaigns
SET status = 'completed', completed_at = NOW()
WHERE status = 'running'
  AND ${scopeToBrand('org_id')}
  AND NOT EXISTS (
    SELECT 1 FROM messages WHERE campaign_id = campaigns.id AND status IN ('queued', 'sending')
  )
```

---

## 6. Internal Tick Router (`backend/src/routes/internal.ts`)

1. **Brand-Scoped Advisory Lock**:
```typescript
const lockRes = await client.query(
  "SELECT pg_try_advisory_lock(hashtext('tick:' || $1)) as acquired",
  [env.APP_BRAND]
);
// And unlock with pg_advisory_unlock(hashtext('tick:' || $1))
```

2. **Scope all tick steps**:
- Step 1 (scheduled campaigns): `AND ${scopeToBrand('org_id')}`
- Step 2 (due daily entries): `AND ${scopeToBrand('de.org_id')}`
- Step 3 (missed daily entries): `AND ${scopeToBrand('org_id')}`
- Step 7 (retry failed forwards): `AND ${scopeToBrand('f.org_id')}`
- Step 8 (template sync): `WHERE ${scopeToBrand('wa.org_id')}`
- Step 9 (cleanup): `AND (org_id IS NULL OR ${scopeToBrand('org_id')})`

---

## 7. Webhook Handler (`backend/src/routes/webhooks.ts`)

In `POST /webhooks/whatsapp`:

```typescript
const { rows } = await client.query(
  `SELECT wa.org_id, wa.app_secret_encrypted, o.brand
   FROM whatsapp_accounts wa
   JOIN organizations o ON wa.org_id = o.id
   WHERE wa.phone_number_id = $1`,
  [phoneNumberId]
);

// If phone belongs to growthflow (or unknown), return 200 and write nothing
if (!orgId || orgBrand !== env.APP_BRAND) {
  logger.warn(
    { phone: maskPhoneNumber(phoneNumberId), brand: orgBrand, expectedBrand: env.APP_BRAND },
    'Webhook received for another brand or unknown number; storing nothing and returning 200'
  );
  return res.status(200).send('EVENT_RECEIVED');
}
```

---

## 8. Connection Pool (`backend/src/db/pool.ts`)

Set `max: 5` and `application_name: 'reachflow-backend'`.
