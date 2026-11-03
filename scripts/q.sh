#!/bin/bash
# Query teapp Supabase DB via psql pooler. Usage: q.sh "SQL"
export PGPASSWORD="$(grep '^SB_TEAPP_DBPW=' ~/.hermes/secrets/supabase-tokens.env | cut -d= -f2-)"
psql "postgresql://postgres.ikitllhvepqkghrajoox@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -tAc "$1"