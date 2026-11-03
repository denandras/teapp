#!/bin/bash
# Apply rename SQL to teapp DB
export PGPASSWORD=*** '^SB_TEAPP_DBPW=' ~/.hermes/secrets/supabase-tokens.env | cut -d= -f2-)"
psql "postgresql://postgres.ikitllhvepqkghrajoox@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" -v ON_ERROR_STOP=1 -f "$1"