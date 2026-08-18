-- Elementalis : stockage cloud Supabase
-- 1) Crée un projet Supabase.
-- 2) Dans SQL Editor, colle ce fichier et exécute-le.
-- 3) Dans Authentication > Providers, active Email.
-- 4) Pour une première utilisation simple, tu peux désactiver "Confirm email".
create table if not exists public.elementalis_documents (
  owner uuid not null references auth.users(id) on delete cascade,
  document_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner, document_id)
);

alter table public.elementalis_documents enable row level security;

drop policy if exists "elementalis_select_own" on public.elementalis_documents;
drop policy if exists "elementalis_insert_own" on public.elementalis_documents;
drop policy if exists "elementalis_update_own" on public.elementalis_documents;
drop policy if exists "elementalis_delete_own" on public.elementalis_documents;

create policy "elementalis_select_own"
on public.elementalis_documents for select
to authenticated
using (auth.uid() = owner);

create policy "elementalis_insert_own"
on public.elementalis_documents for insert
to authenticated
with check (auth.uid() = owner);

create policy "elementalis_update_own"
on public.elementalis_documents for update
to authenticated
using (auth.uid() = owner)
with check (auth.uid() = owner);

create policy "elementalis_delete_own"
on public.elementalis_documents for delete
to authenticated
using (auth.uid() = owner);
