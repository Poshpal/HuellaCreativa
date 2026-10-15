-- La página lee por Edge Functions con la clave de servicio.
-- El rol anónimo deja de poder consultar estas tablas directo.

alter table public.site_links enable row level security;
alter table public.testimonials enable row level security;
alter table public.models enable row level security;
alter table public.petpops enable row level security;
alter table public.special_editions enable row level security;

do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'site_links',
        'testimonials',
        'models',
        'petpops',
        'special_editions'
      )
      and (
        'anon' = any (roles)
        or 'public' = any (roles)
      )
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      pol.policyname,
      pol.tablename
    );
  end loop;
end $$;

revoke select on table
  public.site_links,
  public.testimonials,
  public.models,
  public.petpops,
  public.special_editions
from anon;
