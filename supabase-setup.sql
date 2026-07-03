-- One-time setup script for the sDotLabs photo gallery.
-- Run this in the Supabase Dashboard -> SQL Editor for your project.
--
-- Before running:
--   1. Create the owner account: Dashboard -> Authentication -> Users -> Add user.
--   2. Copy that user's UUID and replace every occurrence of
--      '00000000-0000-0000-0000-000000000000' below with it.
-- This account is the ONLY identity ever allowed to write to the gallery --
-- there is no signup flow in the app, so this hardcoded UUID is the actual
-- access-control boundary (the /admin route guard in the app is UX only).

-- === Tables ===
create table if not exists albums (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover_photo_id uuid,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references albums(id) on delete cascade,
  storage_path text not null,
  title text,
  caption text,
  sort_order int not null default 0,
  width int,
  height int,
  created_at timestamptz not null default now()
);

alter table albums
  add constraint albums_cover_photo_fk
  foreign key (cover_photo_id) references photos(id) on delete set null;

create index if not exists photos_album_sort_idx on photos (album_id, sort_order);
create index if not exists albums_sort_idx on albums (sort_order);

-- === Row Level Security ===
alter table albums enable row level security;
alter table photos enable row level security;

-- Public read access
create policy "albums are publicly readable" on albums
  for select using (true);
create policy "photos are publicly readable" on photos
  for select using (true);

-- Owner-only writes
create policy "owner can insert albums" on albums
  for insert with check (auth.uid() = '00000000-0000-0000-0000-000000000000');
create policy "owner can update albums" on albums
  for update using (auth.uid() = '00000000-0000-0000-0000-000000000000');
create policy "owner can delete albums" on albums
  for delete using (auth.uid() = '00000000-0000-0000-0000-000000000000');

create policy "owner can insert photos" on photos
  for insert with check (auth.uid() = '00000000-0000-0000-0000-000000000000');
create policy "owner can update photos" on photos
  for update using (auth.uid() = '00000000-0000-0000-0000-000000000000');
create policy "owner can delete photos" on photos
  for delete using (auth.uid() = '00000000-0000-0000-0000-000000000000');

-- === Storage bucket ===
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "gallery bucket is publicly readable" on storage.objects
  for select using (bucket_id = 'gallery');

create policy "owner can upload to gallery bucket" on storage.objects
  for insert with check (
    bucket_id = 'gallery' and auth.uid() = '00000000-0000-0000-0000-000000000000'
  );
create policy "owner can update gallery bucket objects" on storage.objects
  for update using (
    bucket_id = 'gallery' and auth.uid() = '00000000-0000-0000-0000-000000000000'
  );
create policy "owner can delete gallery bucket objects" on storage.objects
  for delete using (
    bucket_id = 'gallery' and auth.uid() = '00000000-0000-0000-0000-000000000000'
  );
