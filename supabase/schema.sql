-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

-- Public profile: username and display name.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Private progress for each account (attempts, bests, sound, theme).
create table if not exists public.app_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.app_data enable row level security;

-- Anyone can read profiles (so anyone can open a user's profile). Only the owner can change theirs.
drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public" on public.profiles for select using (true);
drop policy if exists "Owner updates profile" on public.profiles;
create policy "Owner updates profile" on public.profiles for update using (auth.uid() = id);

-- Progress is private: each user sees and writes only their own row.
drop policy if exists "Owner reads data" on public.app_data;
create policy "Owner reads data" on public.app_data for select using (auth.uid() = user_id);
drop policy if exists "Owner inserts data" on public.app_data;
create policy "Owner inserts data" on public.app_data for insert with check (auth.uid() = user_id);
drop policy if exists "Owner updates data" on public.app_data;
create policy "Owner updates data" on public.app_data for update using (auth.uid() = user_id);

-- When someone registers, create their profile automatically from the sign-up details.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
