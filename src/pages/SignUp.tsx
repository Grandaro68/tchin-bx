import { FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    // 1) inscription
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pwd,
    });
    if (error) {
      setLoading(false);
      setErr(error.message || "Inscription impossible");
      return;
    }

    try {
      // 2) si on a déjà une session (email confirm off), on crée le profile
      const uid = data.session?.user?.id ?? data.user?.id;
      if (uid) {
        await supabase
          .from("profiles")
          .upsert({ id: uid, language: "fr" }, { onConflict: "id" });
      }
    } catch (e: any) {
      console.error("[SignUp] upsert profile error:", e?.message || e);
      // on ne bloque pas l’utilisateur si l’upsert profile échoue
    }

    setLoading(false);

    // 3) deux scénarios selon ta config Supabase:
    if (data.session) {
      // a) confirmation d’email désactivée → l’utilisateur est déjà loggé
      navigate(from, { replace: true });
    } else {
      // b) confirmation d’email activée → inviter à vérifier sa boîte
      setMsg(
        "Un email de confirmation vient de t’être envoyé. Valide-le puis reviens te connecter."
      );
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md p-6 border rounded-xl bg-slate-900"
      >
        <h1 className="text-xl font-bold mb-4">Créer un compte</h1>

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
          minLength={6}
          className="w-full mb-4 px-3 py-2 rounded bg-slate-800 border"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          autoComplete="new-password"
        />

        {err && <div className="mb-3 text-sm text-red-300">{err}</div>}
        {msg && <div className="mb-3 text-sm text-green-300">{msg}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold disabled:opacity-60"
        >
          {loading ? "Création du compte..." : "Créer le compte"}
        </button>

        <p className="mt-4 text-sm text-slate-300">
          Déjà inscrit ?{" "}
          <Link to="/signin" state={{ from }} className="underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
