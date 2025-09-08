import { FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignIn() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

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

    if (data.session) {
      navigate(from, { replace: true });
    } else {
      // très rare : pas de session — on renvoie à l’accueil par sécurité
      navigate("/", { replace: true });
    }
  }

  async function loginWithGoogle() {
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://tchinbx.netlify.app/auth/callback",
        queryParams: { prompt: "select_account" }, // optionnel
      },
    });
    if (error) setErr(error.message || "Connexion Google impossible");
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md p-6 border rounded-xl bg-slate-900"
      >
        <h1 className="text-xl font-bold mb-4">Se connecter</h1>

        {/* OAuth Google */}
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full mb-4 px-4 py-2 rounded-lg border bg-slate-800"
        >
          Continuer avec Google
        </button>

        <div className="my-3 text-center text-xs text-slate-400">ou</div>

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
        <div className="relative mb-4">
          <input
            type={showPwd ? "text" : "password"}
            required
            className="w-full px-3 py-2 rounded bg-slate-800 border pr-12"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-80"
          >
            {showPwd ? "Masquer" : "Voir"}
          </button>
        </div>

        {err && <div className="mb-3 text-sm text-red-300">{err}</div>}

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
