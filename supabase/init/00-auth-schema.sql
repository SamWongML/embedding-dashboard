create schema if not exists auth;

grant usage on schema auth to anon, authenticated, service_role;
