create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'scan_status') then
    create type public.scan_status as enum ('queued', 'running', 'completed', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'scan_verdict') then
    create type public.scan_verdict as enum ('safe', 'suspicious', 'phishing_likely', 'malicious_likely');
  end if;

  if not exists (select 1 from pg_type where typname = 'signal_category') then
    create type public.signal_category as enum ('lexical', 'domain', 'reputation', 'browser', 'ai', 'override');
  end if;

  if not exists (select 1 from pg_type where typname = 'feedback_label') then
    create type public.feedback_label as enum ('correct', 'false_positive', 'false_negative', 'benign', 'phishing');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.url_scan_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.scan_status not null default 'queued',
  requested_url text not null,
  normalized_url text,
  final_url text,
  source text not null default 'dashboard',
  request_meta jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_url_scan_jobs_user_created
  on public.url_scan_jobs (user_id, created_at desc);

create index if not exists idx_url_scan_jobs_status
  on public.url_scan_jobs (status);

drop trigger if exists trg_url_scan_jobs_updated_at on public.url_scan_jobs;
create trigger trg_url_scan_jobs_updated_at
before update on public.url_scan_jobs
for each row execute function public.set_updated_at();

create table if not exists public.url_scan_signals (
  id bigserial primary key,
  job_id uuid not null references public.url_scan_jobs(id) on delete cascade,
  category public.signal_category not null,
  signal_key text not null,
  is_triggered boolean not null default false,
  signal_value_num numeric(8,4),
  weight numeric(8,4) not null default 0,
  reason text,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (job_id, signal_key)
);

create index if not exists idx_url_scan_signals_job
  on public.url_scan_signals (job_id);

create index if not exists idx_url_scan_signals_category
  on public.url_scan_signals (category);

create table if not exists public.url_scan_results (
  job_id uuid primary key references public.url_scan_jobs(id) on delete cascade,
  risk_score int not null check (risk_score between 0 and 100),
  confidence int not null check (confidence between 0 and 100),
  verdict public.scan_verdict not null,
  lexical_score numeric(6,4) not null default 0 check (lexical_score between 0 and 1),
  domain_score numeric(6,4) not null default 0 check (domain_score between 0 and 1),
  reputation_score numeric(6,4) not null default 0 check (reputation_score between 0 and 1),
  browser_score numeric(6,4) not null default 0 check (browser_score between 0 and 1),
  ai_score numeric(6,4) not null default 0 check (ai_score between 0 and 1),
  override_flags text[] not null default '{}',
  reasons jsonb not null default '[]'::jsonb,
  model_provider text,
  model_name text,
  model_version text,
  latency_ms int check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_url_scan_results_updated_at on public.url_scan_results;
create trigger trg_url_scan_results_updated_at
before update on public.url_scan_results
for each row execute function public.set_updated_at();

create table if not exists public.url_scan_feedback (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.url_scan_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  label public.feedback_label not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (job_id, user_id)
);

create index if not exists idx_url_scan_feedback_job
  on public.url_scan_feedback (job_id);

create index if not exists idx_url_scan_feedback_user
  on public.url_scan_feedback (user_id);

create table if not exists public.reputation_cache (
  cache_key text primary key,
  source text not null,
  risk_score int check (risk_score is null or risk_score between 0 and 100),
  raw_response jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reputation_cache_exp
  on public.reputation_cache (expires_at);

drop trigger if exists trg_reputation_cache_updated_at on public.reputation_cache;
create trigger trg_reputation_cache_updated_at
before update on public.reputation_cache
for each row execute function public.set_updated_at();

alter table public.url_scan_jobs enable row level security;
alter table public.url_scan_signals enable row level security;
alter table public.url_scan_results enable row level security;
alter table public.url_scan_feedback enable row level security;

drop policy if exists p_jobs_select_own on public.url_scan_jobs;
create policy p_jobs_select_own
on public.url_scan_jobs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists p_jobs_insert_own on public.url_scan_jobs;
create policy p_jobs_insert_own
on public.url_scan_jobs for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists p_jobs_update_own on public.url_scan_jobs;
create policy p_jobs_update_own
on public.url_scan_jobs for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists p_jobs_delete_own on public.url_scan_jobs;
create policy p_jobs_delete_own
on public.url_scan_jobs for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists p_signals_select_own on public.url_scan_signals;
create policy p_signals_select_own
on public.url_scan_signals for select
to authenticated
using (
  exists (
    select 1 from public.url_scan_jobs j
    where j.id = url_scan_signals.job_id
      and j.user_id = auth.uid()
  )
);

drop policy if exists p_signals_insert_own on public.url_scan_signals;
create policy p_signals_insert_own
on public.url_scan_signals for insert
to authenticated
with check (
  exists (
    select 1 from public.url_scan_jobs j
    where j.id = url_scan_signals.job_id
      and j.user_id = auth.uid()
  )
);

drop policy if exists p_results_select_own on public.url_scan_results;
create policy p_results_select_own
on public.url_scan_results for select
to authenticated
using (
  exists (
    select 1 from public.url_scan_jobs j
    where j.id = url_scan_results.job_id
      and j.user_id = auth.uid()
  )
);

drop policy if exists p_results_insert_own on public.url_scan_results;
create policy p_results_insert_own
on public.url_scan_results for insert
to authenticated
with check (
  exists (
    select 1 from public.url_scan_jobs j
    where j.id = url_scan_results.job_id
      and j.user_id = auth.uid()
  )
);

drop policy if exists p_feedback_select_own on public.url_scan_feedback;
create policy p_feedback_select_own
on public.url_scan_feedback for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists p_feedback_insert_own on public.url_scan_feedback;
create policy p_feedback_insert_own
on public.url_scan_feedback for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists p_feedback_update_own on public.url_scan_feedback;
create policy p_feedback_update_own
on public.url_scan_feedback for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists p_feedback_delete_own on public.url_scan_feedback;
create policy p_feedback_delete_own
on public.url_scan_feedback for delete
to authenticated
using (auth.uid() = user_id);