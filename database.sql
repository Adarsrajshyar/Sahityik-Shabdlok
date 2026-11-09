
-- =========================================================
-- SAHITYIK SHABDLOK - ARS DATABASE
-- Supabase PostgreSQL schema and Row Level Security
-- =========================================================

create extension if not exists pgcrypto;

-- 1. USER PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'author'
    check (role in ('reader', 'author', 'publisher', 'admin')),
  created_at timestamptz not null default now()
);

-- Create a profile automatically when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'author'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- 2. SUBMISSIONS
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text,
  title text not null,
  body text not null,
  category text not null,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);


-- 3. CERTIFICATES
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_code text not null unique,
  submission_id uuid unique references public.submissions(id) on delete set null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  title text not null,
  issued_at timestamptz not null default now(),
  status text not null default 'valid'
    check (status in ('valid', 'revoked'))
);


-- 4. WEBSITE SETTINGS
create table if not exists public.site_settings (
  id integer primary key check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, settings)
values (
  1,
  '{
    "site_name": "साहित्यिक शब्द लोक",
    "youtube_url": "https://www.youtube.com/@Adarshshyari",
    "instagram_url": "",
    "contact_email": "",
    "ars_book_text": "ARS का Book"
  }'::jsonb
)
on conflict (id) do nothing;


-- 5. ROLE CHECK HELPERS
-- These functions read the current user's role.
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.current_user_role() in ('admin', 'publisher'),
    false
  );
$$;


-- 6. AUTO-ISSUE CERTIFICATE WHEN A SUBMISSION IS PUBLISHED
create or replace function public.issue_publication_certificate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_author_name text;
begin
  if new.status = 'published'
     and old.status is distinct from 'published' then

    select coalesce(p.full_name, p.email, 'ARS Author')
    into v_author_name
    from public.profiles p
    where p.id = new.author_id;

    insert into public.certificates (
      certificate_code,
      submission_id,
      author_id,
      author_name,
      title
    )
    values (
      'ARS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      new.id,
      new.author_id,
      coalesce(v_author_name, new.author_name, 'ARS Author'),
      new.title
    )
    on conflict (submission_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists submission_published_certificate
on public.submissions;

create trigger submission_published_certificate
after update of status on public.submissions
for each row
execute procedure public.issue_publication_certificate();


-- 7. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;
alter table public.site_settings enable row level security;


-- 8. PROFILES POLICIES
drop policy if exists "Read own profile or staff" on public.profiles;
create policy "Read own profile or staff"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_staff()
);

drop policy if exists "Update own basic profile" on public.profiles;
create policy "Update own basic profile"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and role = public.current_user_role()
);

drop policy if exists "Admin manages profiles" on public.profiles;
create policy "Admin manages profiles"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- 9. SUBMISSIONS POLICIES
drop policy if exists "Public reads published submissions" on public.submissions;
create policy "Public reads published submissions"
on public.submissions
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Authors read own submissions" on public.submissions;
create policy "Authors read own submissions"
on public.submissions
for select
to authenticated
using (
  author_id = (select auth.uid())
  or public.is_staff()
);

drop policy if exists "Authors submit own work" on public.submissions;
create policy "Authors submit own work"
on public.submissions
for insert
to authenticated
with check (
  author_id = (select auth.uid())
  and status = 'pending'
);

drop policy if exists "Staff reviews submissions" on public.submissions;
create policy "Staff reviews submissions"
on public.submissions
for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

drop policy if exists "Admin deletes submissions" on public.submissions;
create policy "Admin deletes submissions"
on public.submissions
for delete
to authenticated
using (public.is_admin());


-- 10. CERTIFICATE POLICIES
drop policy if exists "Public verifies valid certificates" on public.certificates;
create policy "Public verifies valid certificates"
on public.certificates
for select
to anon, authenticated
using (status = 'valid');

drop policy if exists "Authors read own certificates" on public.certificates;
create policy "Authors read own certificates"
on public.certificates
for select
to authenticated
using (
  author_id = (select auth.uid())
  or public.is_staff()
);

drop policy if exists "Admin manages certificates" on public.certificates;
create policy "Admin manages certificates"
on public.certificates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- 11. SITE SETTINGS POLICIES
drop policy if exists "Public reads website settings" on public.site_settings;
create policy "Public reads website settings"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Admin manages website settings" on public.site_settings;
create policy "Admin manages website settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- =========================================================
-- SETUP COMPLETE
--
-- IMPORTANT:
-- 1. The first registered account is NOT automatically Admin.
-- 2. After registering your own account, find its UUID in
--    Authentication -> Users.
-- 3. Replace YOUR-USER-UUID below with that UUID and run
--    the separate statement manually:
--
-- update public.profiles
-- set role = 'admin'
-- where id = 'YOUR-USER-UUID';
--
-- 4. Never expose the service_role key in frontend files.
-- =========================================================
