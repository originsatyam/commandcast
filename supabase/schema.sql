-- ============================================================================
-- CAMPUS RADAR — SUPABASE PRODUCTION DATABASE SCHEMA & AUTHENTICATION
-- Compatible with Supabase Auth, Row Level Security (RLS), and Storage
-- ============================================================================

-- Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- 1. Profiles Table (Student Profile & Academic Criteria)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  email text,
  name text not null default 'Student',
  college text not null default 'National Institute of Design (NID)',
  degree text not null default 'B.Des',
  branch text not null default 'Interaction & Product Design',
  year_of_study text not null default '3rd Year',
  graduation_batch text not null default '2027',
  cgpa numeric(3, 2) default 8.0,
  preferred_location text default 'Remote',
  skills text[] default array['Figma', 'Design Systems', 'UI/UX Design']::text[],
  resume_url text,
  resume_file_name text,
  resume_file_size text,
  resume_parsed boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Opportunities Table (Verified ATS Campus Listings)
create table if not exists public.opportunities (
  id text primary key,
  title text not null,
  company text not null,
  logo_letter text,
  logo_bg text default '#E7EDFC',
  location text not null,
  workplace_type text not null check (workplace_type in ('Remote', 'Hybrid', 'In-Office')),
  category text not null check (category in ('Internship', 'Hackathon', 'Fellowship', 'New Grad')),
  stipend text not null,
  degrees_eligible text[] not null,
  years_eligible text[] not null,
  batches_eligible text[] not null,
  allowed_branches text[] default array[]::text[],
  min_cgpa numeric(3, 2),
  skills text[] default array[]::text[],
  deadline timestamptz not null,
  verified_date timestamptz default timezone('utc'::text, now()) not null,
  verified_by text default 'Live Autonomous ATS Scanner',
  direct_apply_url text not null,
  source_platform text not null,
  description text not null,
  eligibility_highlights text[] default array[]::text[],
  selection_stages text[] default array[]::text[],
  trust_score integer default 98,
  is_active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Application Tracker Table (Pipelines: Saved -> Applied -> Interviewing -> Offer -> Closed)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  opportunity_id text references public.opportunities(id) on delete cascade not null,
  status text not null default 'Saved' check (status in ('Saved', 'Applied', 'Interviewing', 'Offer', 'Closed')),
  notes text default '',
  deadline_reminder_set boolean default true,
  saved_at timestamptz default timezone('utc'::text, now()) not null,
  applied_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, opportunity_id)
);

-- 4. Enable Row Level Security (RLS) on all exposed tables
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;

-- Opportunities Policies (Publicly viewable by anyone, unauthenticated or authenticated)
create policy "Opportunities are viewable by everyone"
  on public.opportunities for select
  using (is_active = true);

-- Profiles Policies (Secured per authenticated user)
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Applications Policies (Secured per authenticated user)
create policy "Users can view own applications"
  on public.applications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own applications"
  on public.applications for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own applications"
  on public.applications for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own applications"
  on public.applications for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 5. Automatic Profile Provisioning Trigger on Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    email,
    name,
    college,
    degree,
    branch,
    year_of_study,
    graduation_batch
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'college', 'National Institute of Design (NID)'),
    coalesce(new.raw_user_meta_data->>'degree', 'B.Des'),
    coalesce(new.raw_user_meta_data->>'branch', 'Interaction & Product Design'),
    coalesce(new.raw_user_meta_data->>'year_of_study', '3rd Year'),
    coalesce(new.raw_user_meta_data->>'graduation_batch', '2027')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Storage Bucket Configuration for Resumes
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Storage Policies (SELECT + INSERT + UPDATE for full upsert capabilities)
create policy "Resumes are publicly downloadable"
  on storage.objects for select
  using (bucket_id = 'resumes');

create policy "Authenticated users can upload resumes"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'resumes');

create policy "Authenticated users can update their resumes"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'resumes');
