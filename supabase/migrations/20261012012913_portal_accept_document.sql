create or replace function public.portal_accept_document(
  p_access_token uuid,
  p_document_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.documents document
  set status = 'Aceptado',
      updated_at = now()
  from public.projects project, public.clients client
  where document.id = p_document_id
    and document.status in ('Compartido', 'Aceptado')
    and project.id = document.project_id
    and client.id = project.client_id
    and client.portal_token = p_access_token;

  return found;
end;
$$;

revoke all on function public.portal_accept_document(uuid, text) from public;
grant execute on function public.portal_accept_document(uuid, text) to anon, authenticated;
