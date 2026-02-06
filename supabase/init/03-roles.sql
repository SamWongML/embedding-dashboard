do $$
begin
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;

  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;

  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;

  if not exists (select from pg_roles where rolname = 'authenticator') then
    create role authenticator noinherit login password 'postgres';
  else
    alter role authenticator with password 'postgres';
  end if;

  if not exists (select from pg_roles where rolname = 'supabase_auth_admin') then
    create role supabase_auth_admin noinherit login password 'postgres';
  else
    alter role supabase_auth_admin with password 'postgres';
  end if;

  if not exists (select from pg_roles where rolname = 'postgres') then
    create role postgres with login superuser password 'postgres';
  end if;
end $$;
