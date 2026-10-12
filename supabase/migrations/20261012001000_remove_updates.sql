drop function if exists public.get_portal_workspace(uuid);

drop table if exists public.updates;

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
      'paidAt', coalesce(invoice.paid_at::text, ''),
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
    'bankAccounts', coalesce((select jsonb_agg(jsonb_build_object(
      'id', account.id,
      'bankName', account.bank_name,
      'accountHolder', account.account_holder,
      'accountNumber', account.account_number,
      'paymentUrl', account.payment_url,
      'currency', account.currency,
      'instructions', account.instructions,
      'iconFileId', coalesce(account.icon_path, ''),
      'iconFileName', coalesce(account.icon_file_name, ''),
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
