import { FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pwd,
    });
    setLoading(false);

    if (error) {
      setErr(error.message || "Connexion impossible");
      return;
    }

    // Succès → redirige vers la page d’origine
    if (data.session) {
      navigate(from, { replace: true });
    } else {
      // Cas rarissime: pas de session (policy/confirm) → bascule page d’accueil
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md p-6 border rounded-xl bg-slate-900"
      >
        <h1 className="text-xl font-bold mb-4">Se connecter</h1>

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          required
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <label className="block text-sm mb-1">Mot de passe</label>
        <input
          type="password"
          required
          className="w-full mb-4 px-3 py-2 rounded bg-slate-800 border"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          autoComplete="current-password"
        />

        {err && (
          <div className="mb-3 text-sm text-red-300">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Connexion"}
        </button>

        <p className="mt-4 text-sm text-slate-300">
          Pas encore de compte ?{" "}
          <Link to="/signup" state={{ from }} className="underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
