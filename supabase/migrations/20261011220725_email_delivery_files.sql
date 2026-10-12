alter table public.invoices
  add column if not exists storage_path text,
  add column if not exists file_name text;

alter table public.messages
  add column if not exists attachments jsonb not null default '[]'::jsonb,
  add column if not exists status text not null default 'Borrador',
  add column if not exists sent_at timestamptz,
  add column if not exists resend_email_id text,
  add column if not exists last_error text;

alter table public.messages
  drop constraint if exists messages_attachments_array,
  add constraint messages_attachments_array check (jsonb_typeof(attachments) = 'array'),
  drop constraint if exists messages_status_valid,
  add constraint messages_status_valid check (status in ('Borrador', 'Enviado', 'Error'));

create or replace function public.get_portal_invoice_files(p_access_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', invoice.id,
    'fileId', coalesce(invoice.storage_path, ''),
    'fileName', coalesce(invoice.file_name, '')
  ) order by invoice.created_at), '[]'::jsonb)
  from public.invoices invoice
  join public.projects project on project.id = invoice.project_id
  join public.clients client on client.id = project.client_id
  where client.portal_token = p_access_token;
$$;

revoke all on function public.get_portal_invoice_files(uuid) from public;
grant execute on function public.get_portal_invoice_files(uuid) to anon, authenticated;

comment on column public.invoices.storage_path is 'Private workspace-documents object path for the issued invoice PDF.';
comment on column public.messages.attachments is 'Private PDF attachment metadata. Storage paths are revalidated by the sending Edge Function.';
