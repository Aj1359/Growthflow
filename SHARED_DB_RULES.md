# Shared Database Rules (GrowthFlow & ReachFlow)

GrowthFlow and ReachFlow share a single Supabase / PostgreSQL database. To prevent service disruptions, regressions, or cross-tenant data leaks, all developers and maintainers must strictly adhere to the following rules:

---

## 1. Schema Authority & Migrations
- **All schema migrations are owned and run exclusively from the ReachFlow repository.**
- The GrowthFlow repository **NEVER** runs automated database migrations upon build or deployment.
- No DDL scripts should be automated in Render build steps for GrowthFlow.

## 2. Backward Compatibility & Additive Changes
- Any database change must be **purely additive**:
  - Add new columns with reasonable defaults or `NULL`.
  - Never drop existing columns or tables without multi-phase deprecation.
  - Never rename tables or columns.
- Before deploying code changes that depend on a new column, the migration must already be successfully executed in PostgreSQL.

## 3. Brand & Organization Scoping
Every data query in both backends must be scoped:
- **Tenant Scope**: Always filter by `org_id` (or `organization_id`).
- **Brand Scope**: Background workers, batch ticks, auth verification, and webhook handlers must always filter by `brand = APP_BRAND`.
- The central helper `scopeToBrand(targetColOrAlias, brand)` must be used across all SQL queries that join or inspect `organizations`.

## 4. Deployment Order
When deploying breaking or coordinated database modifications:
1. Apply the backward-compatible SQL migration in the Supabase SQL editor.
2. Deploy ReachFlow backend & frontend.
3. Deploy GrowthFlow backend & frontend.
4. Verify that neither brand's workers, schedulers, or webhook receivers cross-read the other brand's records.
