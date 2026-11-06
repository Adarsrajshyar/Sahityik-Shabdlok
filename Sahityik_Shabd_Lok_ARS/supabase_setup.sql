-- ARS / Sahityik Shabd Lok database setup
-- Run this in Supabase SQL Editor. Review policies before public launch.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'ARS लेखक',
  role text not null default 'author' check (role in ('author','publisher','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  title text not null,
  type text not null check (type in ('शायरी','कविता','कहानी')),
  category text not null default 'अन्य',
  body text not null,
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  recipient_name text not null,
  certificate_type text not null check (certificate_type in ('participation','publication')),
  description text not null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  issued_by uuid references auth.users(id)
);

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.certificates enable row level security;

-- Create a basic author profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name','ARS लेखक'), 'author')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Role lookup helper. Security definer avoids recursive profile RLS checks.
create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Profiles: users can read/update their own display name; users cannot promote themselves.
drop policy if exists "profile read own" on public.profiles;
create policy "profile read own" on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_role() in ('admin','publisher'));

drop policy if exists "profile update own name" on public.profiles;
create policy "profile update own name" on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = 'author');

-- Submissions: authors can create and read their own; reviewers can read and update.
drop policy if exists "authors submit own" on public.submissions;
create policy "authors submit own" on public.submissions for insert to authenticated
with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "read own or reviewer" on public.submissions;
create policy "read own or reviewer" on public.submissions for select to authenticated
using (user_id = auth.uid() or public.current_user_role() in ('admin','publisher'));

drop policy if exists "reviewer updates submissions" on public.submissions;
create policy "reviewer updates submissions" on public.submissions for update to authenticated
using (public.current_user_role() in ('admin','publisher'))
with check (public.current_user_role() in ('admin','publisher'));

-- Published works can be read by everyone; anonymous users cannot read drafts.
drop policy if exists "public read published" on public.submissions;
create policy "public read published" on public.submissions for select to anon
using (status = 'published');

-- Certificates: public can verify non-revoked certificates; only admins manage records.
drop policy if exists "public verify certificates" on public.certificates;
create policy "public verify certificates" on public.certificates for select to anon, authenticated
using (revoked_at is null);

drop policy if exists "admin manages certificates" on public.certificates;
create policy "admin manages certificates" on public.certificates for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- IMPORTANT:
-- 1) After creating your first account, promote the site owner manually in SQL:
-- update public.profiles set role='admin' where id='YOUR_AUTH_USER_UUID';
-- 2) Promote trusted reviewers only:
-- update public.profiles set role='publisher' where id='PUBLISHER_AUTH_USER_UUID';
-- 3) Do not expose service_role key in website files.
-- 4) Test policies with separate author, publisher, admin and anonymous accounts.
