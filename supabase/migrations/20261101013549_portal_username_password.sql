alter table public.clients
  add column portal_username text unique,
  add column portal_auth_user_id uuid unique references auth.users(id) on delete set null;

alter table public.clients
  add constraint clients_portal_username_format
  check (portal_username is null or portal_username ~ '^[a-z0-9][a-z0-9._-]{2,39}$');

comment on column public.clients.portal_username is 'Login name chosen by the workspace administrator. Passwords live only in Supabase Auth.';
comment on column public.clients.portal_auth_user_id is 'Supabase Auth account assigned to this client portal.';
