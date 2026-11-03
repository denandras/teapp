#!/bin/bash
# Apply sing_insert.sql to teapp DB inside a transaction
export PGPASSWORD=$(grep '^SB_TEAPP_DBPW=' ~/.hermes/secrets/supabase-tokens.env | cut -d= -f2-)
psql "postgresql://postgres.ikitllhvepqkghrajoox@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -v ON_ERROR_STOP=1 -f "$1"