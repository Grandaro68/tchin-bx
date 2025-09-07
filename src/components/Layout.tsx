// src/components/Layout.tsx
import { Link, NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Layout() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-20">
      <header className="flex items-center justify-between mb-4">
        <Link to="/" className="text-2xl font-bold">Tchin BX</Link>

        <div className="flex items-center gap-2">
          <Link
            to="/infos"
            className="text-sm px-3 py-1 border rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            Infos
          </Link>

          {email ? (
            <Link
              to="/settings"       // <— page paramètres (langue, mot de passe)
              className="text-sm px-3 py-1 border rounded-lg bg-slate-800 hover:bg-slate-700"
              title={email}
            >
              {email}
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link to="/signin" className="text-sm px-3 py-1 border rounded-lg bg-slate-800 hover:bg-slate-700">
                Se connecter
              </Link>
              <Link to="/signup" className="text-sm px-3 py-1 border rounded-lg bg-slate-800 hover:bg-slate-700">
                Créer un compte
              </Link>
            </div>
          )}
        </div>
      </header>

      <Outlet />

      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-slate-900/80 rounded-2xl border">
        <Tab to="/" label="Accueil" id="nav-home" />
        <Tab to="/bars" label="Bars" id="nav-bars" />
        <Tab to="/me" label="Moi" id="nav-moi" />
        <Tab to="/shop" label="Shop" id="nav-shop" />
      </nav>
    </div>
  );
}

function Tab({ to, label, id }: { to: string; label: string; id?: string }) {
  return (
    <NavLink
      id={id}
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl border bg-slate-800 ${
          isActive ? "bg-yellow-500 text-black" : ""
        }`
      }
    >
      {label}
    </NavLink>
  );
}
