import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fotzqgxtwmoakiygslub.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdHpxZ3h0d21vYWtpeWdzbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNzYwNTMsImV4cCI6MjA4Nzk1MjA1M30.B1pBonYAO0aKNNX9_zOtp1VuToF33sii4v9NMtKmTak';

export const supabase = createClient(supabaseUrl, supabaseKey);