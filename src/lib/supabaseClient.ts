import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikitllhvepqkghrajoox.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_p81cYHXBlRjOCmz6sFGyFA_SZMZpfnF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);