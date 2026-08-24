-- WBSL member activity period migration
-- Existing member data is preserved.

alter table public.members
  add column if not exists start_month date,
  add column if not exists end_month date;

comment on column public.members.start_month is 'Member activity start month. Store as first day of month.';
comment on column public.members.end_month is 'Member activity end month. NULL means currently active / unspecified.';
