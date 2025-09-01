import { useState } from "react";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

const Form = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirm: z.string().min(6),
  username: z.string().min(3),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  birthdate: z.string(), // yyyy-mm-dd
  certify: z.boolean().refine(v => v, "Vous devez certifier")
}).refine(d => d.password === d.confirm, { message: "Mots de passe différents", path: ["confirm"] });

function isAdult(birthdateStr: string) {
  const d = new Date(birthdateStr);
  const now = new Date();
  const limit = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return d <= limit;
}

export default function SignUp() {
  const { show, Toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>({
    email: "", password: "", confirm: "",
    username: "", first_name: "", last_name: "", birthdate: "", certify: false
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsed = Form.parse(data);
      if (!isAdult(parsed.birthdate)) throw new Error("Vous devez avoir 18 ans ou plus.");
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: parsed.email,
        password: parsed.password,
        options: {
          data: {
            username: parsed.username,
            first_name: parsed.first_name,
            last_name: parsed.last_name,
            birthdate: parsed.birthdate
          }
        }
      });
      if (error) throw error;
      show("Inscription OK. Vérifie tes emails.");
    } catch (err: any) {
      show(err.message ?? "Erreur", "err");
    } finally {
      setLoading(false);
    }
  }

  async function signInGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) show(error.message, "err");
  }

  return (
    <div className="max-w-xl mx-auto border rounded-2xl p-4 bg-slate-900">
      <h2 className="text-xl font-bold mb-3">Créer un compte</h2>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-3">
        <input className="bg-slate-800 p-2 rounded" placeholder="Email" type="email"
          value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Nom d’utilisateur (public)"
          value={data.username} onChange={e => setData({ ...data, username: e.target.value })} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Prénom"
          value={data.first_name} onChange={e => setData({ ...data, first_name: e.target.value })} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Nom"
          value={data.last_name} onChange={e => setData({ ...data, last_name: e.target.value })} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Date de naissance" type="date"
          value={data.birthdate} onChange={e => setData({ ...data, birthdate: e.target.value })} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Mot de passe" type="password"
          value={data.password} onChange={e => setData({ ...data, password: e.target.value })} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Confirmation" type="password"
          value={data.confirm} onChange={e => setData({ ...data, confirm: e.target.value })} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={data.certify} onChange={e => setData({ ...data, certify: e.target.checked })} />
          Je certifie l’exactitude des informations fournies
        </label>
        <div className="md:col-span-2 flex gap-2">
          <button className="px-3 py-2 rounded-xl border bg-yellow-500 text-black" disabled={loading}>S’inscrire</button>
          <button type="button" className="px-3 py-2 rounded-xl border" onClick={signInGoogle}>Google</button>
        </div>
      </form>
      <Toast />
    </div>
  );
}
