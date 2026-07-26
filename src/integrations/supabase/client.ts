import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://jjynszwhwmbkwuoezorb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeW5zendod21ia3d1b2V6b3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODUwMTYsImV4cCI6MjA2OTA2MTAxNn0.TDHwVJd0idhZv19kF2mwQZW94nNzLjvOmf1QXQt50C8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});