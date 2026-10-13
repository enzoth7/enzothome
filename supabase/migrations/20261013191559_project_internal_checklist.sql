alter table public.projects
  add column internal_checklist text[] not null default '{}';

comment on column public.projects.internal_checklist is
  'Private launch checklist state for workspace administrators. Deliberately omitted from get_portal_workspace.';
