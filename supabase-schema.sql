-- Map Diary - Supabase schema
-- Run this in the Supabase SQL editor

create table if not exists diary_entries (
  date        text primary key,                          -- 'YYYY-MM-DD'
  title       text default '',
  mood        text default null,
  pins        jsonb default '[]'::jsonb,                 -- [{id, emoji, lat, lng, note, createdAt}]
  route       jsonb default '[]'::jsonb,                 -- [{lat, lng}]
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger diary_entries_updated_at
  before update on diary_entries
  for each row execute function set_updated_at();

-- Enable RLS (allow all for now; add auth later)
alter table diary_entries enable row level security;

create policy "Allow all" on diary_entries
  for all using (true) with check (true);
