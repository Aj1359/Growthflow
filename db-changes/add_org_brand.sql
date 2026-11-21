-- ============================================================
-- GrowthFlow & ReachFlow: Multi-Brand Database Scoping
-- File: add_org_brand.sql
-- Safe to run multiple times (idempotent)
-- ============================================================

-- 1. Add brand column to organizations (default 'reachflow' for all existing data)
alter table organizations add column if not exists brand text not null default 'reachflow';

-- 2. Drop constraint if it already exists to allow idempotent re-runs
alter table organizations drop constraint if exists organizations_brand_check;

-- 3. Add constraint limiting brand to allowed application brands
alter table organizations add constraint organizations_brand_check check (brand in ('reachflow', 'growthflow'));

-- 4. Create index on brand for high-performance scoped queries
create index if not exists organizations_brand_idx on organizations (brand);
