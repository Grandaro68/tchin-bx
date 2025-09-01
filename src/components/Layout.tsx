import { Link, NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 pb-20">
      <header className="flex items-center justify-between mb-4">
        <Link to="/" className="text-2xl font-bold">Tchin BX</Link>
      </header>

      <Outlet />

      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-slate-900/80 rounded-2xl border">
        <Tab to="/" label="Accueil" />
        <Tab to="/bars" label="Bars" />
        <Tab to="/me" label="Moi" />
        <Tab to="/shop" label="Shop" />
      </nav>
    </div>
  );
}

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl border bg-slate-800 ${isActive ? "bg-yellow-500 text-black" : ""}`
      }
    >
      {label}
    </NavLink>
  );
}
