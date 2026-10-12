alter table public.invoices
  add column line_items jsonb not null default '[]'::jsonb;

update public.invoices
set line_items = jsonb_build_array(jsonb_build_object(
  'id', id || '-line-1',
  'description', coalesce(nullif(btrim(title), ''), 'Servicio'),
  'amount', amount
))
where line_items = '[]'::jsonb;

alter table public.invoices
  add constraint invoices_line_items_array
  check (jsonb_typeof(line_items) = 'array');

create table public.bank_accounts (
  id text primary key,
  label text not null check (btrim(label) <> ''),
  bank_name text not null check (btrim(bank_name) <> ''),
  account_holder text not null check (btrim(account_holder) <> ''),
  account_number text not null check (btrim(account_number) <> ''),
  currency text not null check (currency in ('USD', 'UYU', 'EUR', 'GBP')),
  instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_bank_accounts (
  client_id text not null references public.clients(id) on delete cascade,
  bank_account_id text not null references public.bank_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, bank_account_id)
);

create index client_bank_accounts_bank_account_id_idx
  on public.client_bank_accounts(bank_account_id);

alter table public.bank_accounts enable row level security;
alter table public.client_bank_accounts enable row level security;

create policy "workspace admins manage bank accounts" on public.bank_accounts
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));

create policy "workspace admins manage bank assignments" on public.client_bank_accounts
  for all to authenticated
  using ((select private.is_workspace_admin()))
  with check ((select private.is_workspace_admin()));

revoke all on table public.bank_accounts from anon;
revoke all on table public.client_bank_accounts from anon;
grant select, insert, update, delete on table public.bank_accounts to authenticated;
grant select, insert, update, delete on table public.client_bank_accounts to authenticated;

create or replace function public.get_portal_workspace(p_access_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'version', 1,
    'clients', jsonb_build_array(jsonb_build_object(
      'id', client.id,
      'company', client.company,
      'name', client.name,
      'email', client.email,
      'language', client.language,
      'notes', '',
      'logoFileId', coalesce(client.logo_path, ''),
      'logoFileName', coalesce(client.logo_file_name, '')
    )),
    'projects', coalesce((select jsonb_agg(jsonb_build_object(
      'id', project.id,
      'clientId', project.client_id,
      'title', project.title,
      'description', project.description,
      'status', project.status,
      'start', project.start_date::text,
      'due', project.due_date::text,
      'nextStep', project.next_step,
      'intake', project.intake
    ) order by project.created_at) from public.projects project where project.client_id = client.id), '[]'::jsonb),
    'tasks', coalesce((select jsonb_agg(jsonb_build_object(
      'id', task.id,
      'projectId', task.project_id,
      'title', task.title,
      'status', task.status,
      'due', task.due_date::text,
      'owner', task.owner,
      'kind', task.kind
    ) order by task.created_at) from public.tasks task join public.projects project on project.id = task.project_id where project.client_id = client.id and task.kind <> 'Interna'), '[]'::jsonb),
    'documents', coalesce((select jsonb_agg(jsonb_build_object(
      'id', document.id,
      'projectId', document.project_id,
      'title', document.title,
      'kind', document.kind,
      'status', document.status,
      'date', document.document_date::text,
      'content', document.content,
      'fileId', coalesce(document.storage_path, ''),
      'fileName', coalesce(document.file_name, '')
    ) order by document.created_at) from public.documents document join public.projects project on project.id = document.project_id where project.client_id = client.id and document.status <> 'Borrador'), '[]'::jsonb),
    'invoices', coalesce((select jsonb_agg(jsonb_build_object(
      'id', invoice.id,
      'projectId', invoice.project_id,
      'title', invoice.title,
      'number', invoice.number,
      'amount', invoice.amount,
      'currency', invoice.currency,
      'due', invoice.due_date::text,
      'paid', invoice.paid,
      'paymentInfo', '',
      'date', invoice.invoice_date::text,
      'lines', invoice.line_items,
      'fileId', coalesce(invoice.storage_path, ''),
      'fileName', coalesce(invoice.file_name, '')
    ) order by invoice.created_at) from public.invoices invoice join public.projects project on project.id = invoice.project_id where project.client_id = client.id), '[]'::jsonb),
    'approvals', coalesce((select jsonb_agg(jsonb_build_object(
      'id', approval.id,
      'projectId', approval.project_id,
      'title', approval.title,
      'description', approval.description,
      'status', approval.status,
      'due', approval.due_date::text,
      'response', approval.response,
      'respondedAt', coalesce(approval.responded_at::text, '')
    ) order by approval.created_at) from public.approvals approval join public.projects project on project.id = approval.project_id where project.client_id = client.id), '[]'::jsonb),
    'resources', coalesce((select jsonb_agg(jsonb_build_object(
      'id', resource.id,
      'projectId', resource.project_id,
      'title', resource.title,
      'url', resource.url,
      'kind', resource.kind,
      'description', resource.description
    ) order by resource.created_at) from public.resources resource join public.projects project on project.id = resource.project_id where project.client_id = client.id), '[]'::jsonb),
    'updates', coalesce((select jsonb_agg(jsonb_build_object(
      'id', update_item.id,
      'projectId', update_item.project_id,
      'title', update_item.title,
      'content', update_item.content,
      'date', update_item.update_date::text
    ) order by update_item.update_date desc, update_item.created_at desc) from public.updates update_item join public.projects project on project.id = update_item.project_id where project.client_id = client.id), '[]'::jsonb),
    'bankAccounts', coalesce((select jsonb_agg(jsonb_build_object(
      'id', account.id,
      'label', account.label,
      'bankName', account.bank_name,
      'accountHolder', account.account_holder,
      'accountNumber', account.account_number,
      'currency', account.currency,
      'instructions', account.instructions,
      'clientIds', jsonb_build_array(client.id)
    ) order by account.created_at)
    from public.bank_accounts account
    join public.client_bank_accounts assignment on assignment.bank_account_id = account.id
    where assignment.client_id = client.id), '[]'::jsonb),
    'messages', '[]'::jsonb
  )
  from public.clients client
  where client.portal_token = p_access_token;
$$;

revoke all on function public.get_portal_workspace(uuid) from public;
grant execute on function public.get_portal_workspace(uuid) to anon, authenticated;

alter publication supabase_realtime add table
  public.bank_accounts,
  public.client_bank_accounts;
