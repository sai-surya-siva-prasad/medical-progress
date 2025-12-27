
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsjevateboqejxetajcm.supabase.co';
const supabaseAnonKey = 'sb_publishable_APSDrERK3IUREJP5Mwoq5w_CWO8t2w7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
