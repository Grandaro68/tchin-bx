import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("birthdate")
        .eq("id", user.id)
        .single();
      if (!profile?.birthdate) window.location.assign("/onboarding");
      else window.location.assign("/");
    })();
  }, []);
  return <div className="p-6">Redirection…</div>;
}
