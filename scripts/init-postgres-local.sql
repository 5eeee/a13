-- Выполнить от суперпользователя postgres (локальная установка PostgreSQL).
-- PowerShell (подставьте свой пароль postgres):
--   $env:PGPASSWORD = "ВАШ_ПАРОЛЬ_POSTGRES"
--   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h 127.0.0.1 -U postgres -d postgres -f scripts\init-postgres-local.sql

CREATE USER a13 WITH PASSWORD 'a13';
CREATE DATABASE a13 OWNER a13;
GRANT ALL PRIVILEGES ON DATABASE a13 TO a13;
