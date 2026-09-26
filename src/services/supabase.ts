import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qgyablhsvrkspufresrl.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFneWFibGhzdnJrc3B1ZnJlc3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDE4MTksImV4cCI6MjEwNjAxNzgxOX0.4Ma_kFXYSjWCtVnpevA3CMNLOBDWxsxXHVKf6unE6sk';

export const supabase = createClient(supabaseUrl, supabaseKey);
