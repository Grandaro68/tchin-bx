import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

export default function SignIn() {
  const { show, Toast } = useToast();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) show(error.message, "err"); else show("Connecté !");
  }

  return (
    <div className="max-w-md mx-auto border rounded-2xl p-4 bg-slate-900">
      <h2 className="text-xl font-bold mb-3">Se connecter</h2>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className="bg-slate-800 p-2 rounded" placeholder="Email" type="email"
          value={email} onChange={e => setEmail(e.target.value)} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Mot de passe" type="password"
          value={password} onChange={e => setPassword(e.target.value)} />
        <button className="px-3 py-2 rounded-xl border bg-yellow-500 text-black">Connexion</button>
      </form>
      <Toast />
    </div>
  );
}
