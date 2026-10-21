-- ARS Sahityik ShabdLok: starter schema
-- Review with a trusted developer before production use.
-- Do not expose service_role keys to the browser.

create extension if not exists pgcrypto;

create type public.app_role as enum ('member', 'publisher', 'admin');
create type public.submission_status as enum ('pending', 'revision_requested', 'approved', 'rejected', 'published');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  preferred_categories text[] not null default '{}',
  public_profile boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  granted_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_hi text not null,
  name_en text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  work_type text not null,
  category_id uuid references public.categories(id),
  body text not null,
  author_display_name text not null,
  originality_confirmed boolean not null default false,
  publication_consent boolean not null default false,
  status public.submission_status not null default 'pending',
  reviewer_id uuid references auth.users(id),
  reviewer_note text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submission_title_nonempty check (length(trim(title)) > 0),
  constraint submission_body_nonempty check (length(trim(body)) > 0),
  constraint submission_originality_required check (originality_confirmed = true)
);

create table if not exists public.published_works (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid unique not null references public.submissions(id) on delete restrict,
  slug text unique not null,
  title text not null,
  body text not null,
  author_display_name text not null,
  category_id uuid references public.categories(id),
  published_at timestamptz not null default now(),
  active boolean not null default true
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_number text unique not null,
  recipient_user_id uuid not null references auth.users(id) on delete restrict,
  certificate_type text not null check (certificate_type in ('membership', 'contribution')),
  submission_id uuid references public.submissions(id) on delete restrict,
  recipient_display_name text not null,
  description text not null,
  issued_by uuid references auth.users(id),
  issued_at timestamptz not null default now(),
  status text not null default 'valid' check (status in ('valid', 'revoked')),
  pdf_storage_path text,
  created_at timestamptz not null default now(),
  constraint contribution_certificate_requires_submission
    check (certificate_type <> 'contribution' or submission_id is not null)
);

create table if not exists public.author_consents (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  consent_text_version text not null,
  consented boolean not null,
  recorded_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Helper: role lookup. SECURITY DEFINER avoids recursive RLS on user_roles.
create or replace function public.has_staff_role(required_roles public.app_role[])
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = any(required_roles)
  );
$$;

revoke all on function public.has_staff_role(public.app_role[]) from public;
grant execute on function public.has_staff_role(public.app_role[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.submissions enable row level security;
alter table public.published_works enable row level security;
alter table public.certificates enable row level security;
alter table public.author_consents enable row level security;
alter table public.site_settings enable row level security;

-- Profiles: users read/update their own private profile. Public profiles expose only rows marked public;
-- production apps should use a view that excludes private fields and never add phone/email to this table.
create policy "profile owner reads own" on public.profiles
for select to authenticated using (id = auth.uid());
create policy "public profile read" on public.profiles
for select to anon, authenticated using (public_profile = true);
create policy "profile owner inserts own" on public.profiles
for insert to authenticated with check (id = auth.uid());
create policy "profile owner updates own" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Roles are readable only by the account owner or staff; no client insert/update policies are provided.
create policy "role owner or staff read" on public.user_roles
for select to authenticated using (user_id = auth.uid() or public.has_staff_role(array['admin']::public.app_role[]));

-- Categories are public to read; only staff can edit.
create policy "active categories public read" on public.categories
for select to anon, authenticated using (active = true or public.has_staff_role(array['admin','publisher']::public.app_role[]));
create policy "staff manages categories" on public.categories
for all to authenticated using (public.has_staff_role(array['admin','publisher']::public.app_role[]))
with check (public.has_staff_role(array['admin','publisher']::public.app_role[]));

-- Members see their own submissions; staff can review submissions. Only staff should change status.
create policy "author reads own submissions" on public.submissions
for select to authenticated using (author_id = auth.uid() or public.has_staff_role(array['admin','publisher']::public.app_role[]));
create policy "author creates own pending submission" on public.submissions
for insert to authenticated with check (
  author_id = auth.uid()
  and status = 'pending'
  and reviewer_id is null
  and published_at is null
  and originality_confirmed = true
);
create policy "staff updates submissions" on public.submissions
for update to authenticated using (public.has_staff_role(array['admin','publisher']::public.app_role[]))
with check (public.has_staff_role(array['admin','publisher']::public.app_role[]));

-- Public can read only active published works. Staff manage publication records.
create policy "public reads active works" on public.published_works
for select to anon, authenticated using (active = true);
create policy "staff manages works" on public.published_works
for all to authenticated using (public.has_staff_role(array['admin','publisher']::public.app_role[]))
with check (public.has_staff_role(array['admin','publisher']::public.app_role[]));

-- Members can see their own certificates; staff can issue/revoke through trusted staff workflow.
create policy "recipient reads own certificates" on public.certificates
for select to authenticated using (recipient_user_id = auth.uid() or public.has_staff_role(array['admin','publisher']::public.app_role[]));
create policy "admin manages certificates" on public.certificates
for all to authenticated using (public.has_staff_role(array['admin']::public.app_role[]))
with check (public.has_staff_role(array['admin']::public.app_role[]));

create policy "author reads own consent" on public.author_consents
for select to authenticated using (author_id = auth.uid() or public.has_staff_role(array['admin','publisher']::public.app_role[]));
create policy "author records own consent" on public.author_consents
for insert to authenticated with check (author_id = auth.uid());

create policy "public reads public settings" on public.site_settings
for select to anon, authenticated using (key in ('homepage_banner','social_links','public_intro'));
create policy "admin manages settings" on public.site_settings
for all to authenticated using (public.has_staff_role(array['admin']::public.app_role[]))
with check (public.has_staff_role(array['admin']::public.app_role[]));

-- Initial categories
insert into public.categories (slug, name_hi, name_en, description) values
('love-shayari', 'प्रेम शायरी', 'Love Shayari', 'प्रेम और रिश्तों से जुड़ी शायरी'),
('sad-emotional', 'दर्द और एहसास', 'Sad & Emotional', 'यादें, भावनाएँ और जीवन के एहसास'),
('friendship', 'दोस्ती', 'Friendship', 'दोस्ती और रिश्तों पर रचनाएँ'),
('motivation', 'प्रेरणा', 'Motivation', 'मेहनत, आत्मविश्वास और जीवन की सीख'),
('poetry-ghazal', 'कविता और ग़ज़ल', 'Poetry & Ghazal', 'कविता, मुक्तक, दोहे और ग़ज़ल'),
('moral-stories', 'नैतिक कहानियाँ', 'Moral Stories', 'सीख और मूल्यों वाली कहानियाँ'),
('horror-mystery', 'हॉरर और रहस्य', 'Horror & Mystery', 'रहस्य, रोमांच और डर की कहानियाँ'),
('quotes', 'सुविचार', 'Quotes', 'छोटे प्रेरक विचार और सुविचार')
on conflict (slug) do nothing;

-- IMPORTANT:
-- 1) Never let public users assign their own role.
-- 2) Staff role assignment must happen through trusted SQL/admin process, not a public signup form.
-- 3) Approval/publication/certificate issuance should be implemented as audited server-side actions or carefully constrained RPCs.
-- 4) Review these policies and test with anon, member, publisher, and admin accounts before production.
