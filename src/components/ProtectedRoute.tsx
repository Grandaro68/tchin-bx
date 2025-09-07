import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const location = useLocation();

useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data }) => {
    if (!mounted) return;
    setIsAuth?.(!!data.session);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
    if (!mounted) return;
    setIsAuth?.(!!session);
  });

  return () => { mounted = false; subscription.unsubscribe(); };
}, []);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-300">
        Chargement…
      </div>
    );
  }

  return isAuth ? (
    <>{children}</>
  ) : (
    <Navigate to="/signin" replace state={{ from: location }} />
  );
}
