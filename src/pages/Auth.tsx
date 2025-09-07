// src/pages/Auth.tsx
import { Link, useLocation } from "react-router-dom";

export default function Auth() {
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="w-full max-w-md p-6 border rounded-xl bg-slate-900">
        <h1 className="text-xl font-bold mb-4">Bienvenue 👋</h1>
        <p className="text-sm text-slate-300 mb-6">
          Connecte-toi ou crée un compte pour sauvegarder ta progression.
        </p>
        <div className="flex gap-3">
          <Link
            to="/signin"
            state={{ from }}
            className="flex-1 text-center px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold"
          >
            Se connecter
          </Link>
          <Link
            to="/signup"
            state={{ from }}
            className="flex-1 text-center px-4 py-2 rounded-lg border bg-slate-800"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
