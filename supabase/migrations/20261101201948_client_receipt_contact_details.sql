alter table public.clients
  add column phone text not null default '',
  add column country text not null default '';
