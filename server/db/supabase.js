import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_plastysurgSUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_plastysurgSUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Supabase credentials missing from .env');
} else {
  console.log('✅ Supabase Client initialized');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
