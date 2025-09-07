// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error("[Supabase] Env manquante:", { urlPresent: !!url, anonPresent: !!anon });
}

export const supabase = createClient(url!, anon!, {
  auth: { persistSession: true, autoRefreshToken: true },
});