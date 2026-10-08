-- Run this in Supabase SQL Editor.
create table if not exists public.arcade_users (
  id text primary key,
  username text not null,
  username_normalized text unique not null,
  pin_salt text not null,
  pin_hash text not null,
  stats jsonb not null default '{}'::jsonb,
  following text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.arcade_chat (
  id bigint generated always as identity primary key,
  user_id text not null references public.arcade_users(id) on delete cascade,
  username text not null,
  text text not null check (char_length(text) between 1 and 300),
  created_at timestamptz not null default now()
);
create table if not exists public.arcade_direct_messages (
  id bigint generated always as identity primary key,
  sender_id text not null references public.arcade_users(id) on delete cascade,
  recipient_id text not null references public.arcade_users(id) on delete cascade,
  sender_name text not null,
  text text not null check (char_length(text) between 1 and 300),
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);
create index if not exists arcade_chat_created_idx on public.arcade_chat(created_at desc);
create index if not exists arcade_direct_sender_recipient_idx on public.arcade_direct_messages(sender_id, recipient_id, id);
create index if not exists arcade_direct_recipient_sender_idx on public.arcade_direct_messages(recipient_id, sender_id, id);
-- Server-only tables: do NOT expose these tables directly to the browser.
-- Keep RLS enabled and use the Supabase secret key only on Render.
alter table public.arcade_users enable row level security;
alter table public.arcade_chat enable row level security;
alter table public.arcade_direct_messages enable row level security;
