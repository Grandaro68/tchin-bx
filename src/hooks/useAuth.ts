import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(await supabase.auth.getSession().then(r => r.data.session));

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    setLoading(false);
    return () => sub.subscription.unsubscribe();
  }, []);

  return { loading, session, user: session?.user ?? null };
}
