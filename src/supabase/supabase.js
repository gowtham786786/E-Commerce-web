import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fsevwxuukhgufbksvesx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9DFF-ci7pj-ATBec6zPWkA_WumllW3d';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
