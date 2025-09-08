import { FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SignUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (pwd !== pwd2) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);

    // 1) inscription (avec redirection après confirmation d’email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: {
        emailRedirectTo: "https://tchinbx.netlify.app/signin",
        data: { source: "signup-form" }, // (optionnel) metadata
      },
    });

    if (error) {
      setLoading(false);
      setErr(error.message || "Inscription impossible");
      return;
    }

    // 2) si on a déjà une session (confirmation d’email désactivée),
    //    créer/mettre à jour le profil immédiatement
    try {
      const uid = data.session?.user?.id ?? data.user?.id;
      if (uid) {
        await supabase.from("profiles").upsert(
          { id: uid, language: "fr" },
          { onConflict: "id" }
        );
      }
    } catch (e: any) {
      console.error("[SignUp] upsert profile error:", e?.message || e);
      // on ne bloque pas l’utilisateur si l’upsert profile échoue
    }

    setLoading(false);

    // 3) deux scénarios selon la config Supabase
    if (data.session) {
      // a) confirmation d’email désactivée → déjà connecté
      navigate(from, { replace: true });
    } else {
      // b) confirmation activée → informer + proposer renvoi
      setMsg(
        "Un email de confirmation vient de t’être envoyé. Valide-le puis reviens te connecter."
      );
    }
  }

  async function resendConfirm() {
    setErr(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) setErr(error.message || "Échec du renvoi de l’email");
    else setMsg("Email de confirmation renvoyé ✅");
  }

  async function signUpWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://tchinbx.netlify.app/auth/callback",
        queryParams: { prompt: "select_account" }, // (optionnel)
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
        <h1 className="text-xl font-bold mb-4">Créer un compte</h1>

        {/* Bouton Google */}
        <button
          type="button"
          onClick={signUpWithGoogle}
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
        <div className="relative mb-3">
          <input
            type={showPwd ? "text" : "password"}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded bg-slate-800 border pr-12"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-80"
          >
            {showPwd ? "Masquer" : "Voir"}
          </button>
        </div>

        <label className="block text-sm mb-1">Confirme le mot de passe</label>
        <div className="relative mb-4">
          <input
            type={showPwd2 ? "text" : "password"}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded bg-slate-800 border pr-12"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPwd2((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-80"
          >
            {showPwd2 ? "Masquer" : "Voir"}
          </button>
        </div>

        {err && <div className="mb-3 text-sm text-red-300">{err}</div>}
        {msg && (
          <div className="mb-3 text-sm text-green-300">
            {msg}{" "}
            <button
              type="button"
              onClick={resendConfirm}
              className="underline ml-2"
            >
              Renvoyer l’email
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold disabled:opacity-60"
        >
          {loading ? "Création du compte..." : "Créer le compte"}
        </button>

        <p className="mt-3 text-xs text-slate-400">
          En créant un compte, vous acceptez nos{" "}
          <Link to="/cgu" className="underline">Conditions d’utilisation</Link>.  
          Les établissements cités sont intégrés à titre informatif et ludique, 
          sans affiliation ni validation de leur part.
        </p>

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
