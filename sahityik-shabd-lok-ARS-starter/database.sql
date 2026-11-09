-- Run in Supabase SQL Editor. Review before production use.
create extension if not exists pgcrypto;
create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 role text not null default 'reader' check(role in ('reader','author','publisher','admin')),
 created_at timestamptz not null default now()
);
create table if not exists public.submissions(
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.profiles(id) on delete cascade,
 title text not null, type text not null check(type in ('shayari','poem','story')),
 category text not null, body text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected','revision')),
 created_at timestamptz not null default now()
);
create table if not exists public.works(
 id uuid primary key default gen_random_uuid(),
 title text not null, author_name text not null, type text not null check(type in ('shayari','poem','story')),
 category text not null, body text not null, status text not null default 'published' check(status in ('draft','published')),
 source_submission uuid references public.submissions(id), created_at timestamptz not null default now()
);
create table if not exists public.certificates(
 id uuid primary key default gen_random_uuid(), certificate_id text unique not null,
 user_id uuid not null references public.profiles(id) on delete cascade,
 recipient_name text not null, certificate_type text not null,
 issued_at timestamptz not null default now(), status text not null default 'active' check(status in ('active','revoked'))
);
create table if not exists public.site_settings(
 id integer primary key check(id=1), settings jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.works enable row level security;
alter table public.certificates enable row level security;
alter table public.site_settings enable row level security;
create or replace function public.current_role() returns text language sql stable security definer set search_path=public as $$
 select role from public.profiles where id=auth.uid()
$$;
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
 begin
 insert into public.profiles(id,full_name,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),case when new.raw_user_meta_data->>'requested_role'='author' then 'author' else 'reader' end);
 return new;
 end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create policy "profile self read" on public.profiles for select to authenticated using(id=auth.uid() or public.current_role()='admin');
-- Profile role changes are intentionally not allowed from the public client.
create policy "works published public read" on public.works for select using(status='published' or public.current_role() in ('admin','publisher'));
create policy "admin publisher insert works" on public.works for insert to authenticated with check(public.current_role() in ('admin','publisher'));
create policy "admin publisher update works" on public.works for update to authenticated using(public.current_role() in ('admin','publisher')) with check(public.current_role() in ('admin','publisher'));
create policy "admin delete works" on public.works for delete to authenticated using(public.current_role()='admin');
create policy "author create own submission" on public.submissions for insert to authenticated with check(author_id=auth.uid() and public.current_role()='author');
create policy "author view own or staff all" on public.submissions for select to authenticated using(author_id=auth.uid() or public.current_role() in ('admin','publisher'));
create policy "staff update submissions" on public.submissions for update to authenticated using(public.current_role() in ('admin','publisher')) with check(public.current_role() in ('admin','publisher'));
create policy "owner or admin certificates read" on public.certificates for select using(user_id=auth.uid() or public.current_role()='admin');
create policy "admin manage certificates" on public.certificates for all to authenticated using(public.current_role()='admin') with check(public.current_role()='admin');
create policy "public read site settings" on public.site_settings for select using(true);
create policy "admin manage settings" on public.site_settings for all to authenticated using(public.current_role()='admin') with check(public.current_role()='admin');
-- IMPORTANT: after registering your own account, promote it manually using the SQL below:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR-ADMIN-EMAIL');
-- Do not expose Supabase service_role key in browser code.
