
-- Companies and billing state
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  plan text not null default 'free'
    check (plan in ('free', 'paid')),
  searches_used integer not null default 0,
  latest_billing_event_at timestamptz,
  created_at timestamptz not null default now()
);

-- Recruiters belong to companies
create table public.recruiters (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id),
  created_at timestamptz not null default now()
);

-- Shared candidate directory
create table public.candidates (
  id text primary key,
  name text,
  headline text,
  location text,
  years_experience numeric,
  skills jsonb not null default '[]',
  experience jsonb not null default '[]',
  education jsonb not null default '[]',
  avatar_url text,
  raw_data jsonb not null default '{}'
);

-- Searches and their structured filters
create table public.searches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  recruiter_id uuid not null references auth.users(id),
  brief text not null,
  filters jsonb not null default '{}',
  total integer not null default 0,
  created_at timestamptz not null default now()
);

-- Stable search results for pagination
create table public.search_results (
  search_id uuid not null references public.searches(id)
    on delete cascade,
  candidate_id text not null references public.candidates(id),
  rank integer not null,
  primary key (search_id, candidate_id),
  unique (search_id, rank)
);

-- Named shortlists
create table public.shortlists (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.shortlist_people (
  shortlist_id uuid not null references public.shortlists(id)
    on delete cascade,
  candidate_id text not null references public.candidates(id),
  created_at timestamptz not null default now(),
  primary key (shortlist_id, candidate_id)
);

-- Saved searches
create table public.saved_briefs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  brief text not null,
  filters jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Stripe webhook deduplication
create table public.billing_events (
  event_id text primary key,
  event_created bigint not null,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- Helper to identify signed-in recruiter's company
create function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select company_id
  from public.recruiters
  where user_id = (select auth.uid())
$$;

-- Enable row-level security
alter table public.companies enable row level security;
alter table public.recruiters enable row level security;
alter table public.candidates enable row level security;
alter table public.searches enable row level security;
alter table public.search_results enable row level security;
alter table public.shortlists enable row level security;
alter table public.shortlist_people enable row level security;
alter table public.saved_briefs enable row level security;
alter table public.billing_events enable row level security;

-- Recruiters can read only their own company
create policy companies_read on public.companies
for select to authenticated
using (id = (select public.current_company_id()));

create policy recruiters_read on public.recruiters
for select to authenticated
using (user_id = (select auth.uid()));

-- Candidates are shared across authenticated recruiters
create policy candidates_read on public.candidates
for select to authenticated
using (true);

-- Company-isolated searches
create policy searches_read on public.searches
for select to authenticated
using (company_id = (select public.current_company_id()));

create policy search_results_read on public.search_results
for select to authenticated
using (
  exists (
    select 1 from public.searches s
    where s.id = search_id
      and s.company_id = (select public.current_company_id())
  )
);

-- Company-isolated shortlists
create policy shortlists_read on public.shortlists
for select to authenticated
using (company_id = (select public.current_company_id()));

create policy shortlists_insert on public.shortlists
for insert to authenticated
with check (company_id = (select public.current_company_id()));

create policy shortlists_update on public.shortlists
for update to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));

create policy shortlists_delete on public.shortlists
for delete to authenticated
using (company_id = (select public.current_company_id()));

-- Shortlist membership isolation
create policy shortlist_people_read on public.shortlist_people
for select to authenticated
using (
  exists (
    select 1 from public.shortlists s
    where s.id = shortlist_id
      and s.company_id = (select public.current_company_id())
  )
);

create policy shortlist_people_insert on public.shortlist_people
for insert to authenticated
with check (
  exists (
    select 1 from public.shortlists s
    where s.id = shortlist_id
      and s.company_id = (select public.current_company_id())
  )
);

create policy shortlist_people_delete on public.shortlist_people
for delete to authenticated
using (
  exists (
    select 1 from public.shortlists s
    where s.id = shortlist_id
      and s.company_id = (select public.current_company_id())
  )
);

-- Company-isolated saved searches
create policy saved_briefs_read on public.saved_briefs
for select to authenticated
using (company_id = (select public.current_company_id()));

create policy saved_briefs_insert on public.saved_briefs
for insert to authenticated
with check (company_id = (select public.current_company_id()));

create policy saved_briefs_update on public.saved_briefs
for update to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));

create policy saved_briefs_delete on public.saved_briefs
for delete to authenticated
using (company_id = (select public.current_company_id()));

-- Fast pagination and tenant lookups
create index search_results_rank_idx
on public.search_results(search_id, rank);

create index searches_company_idx
on public.searches(company_id);

create index shortlists_company_idx
on public.shortlists(company_id);

create index saved_briefs_company_idx
on public.saved_briefs(company_id);

-- Restrict direct execution of the helper
revoke all on function public.current_company_id()
from public, anon;

grant execute on function public.current_company_id()
to authenticated;
