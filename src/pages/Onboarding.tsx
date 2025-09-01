import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/Toast";

export default function Onboarding() {
  const { show, Toast } = useToast();
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ username, birthdate }).eq("id", user.id);
    if (error) show(error.message, "err"); else {
      show("Profil complété"); setTimeout(() => (window.location.href = "/"), 600);
    }
  }

  return (
    <div className="max-w-md mx-auto border rounded-2xl p-4 bg-slate-900">
      <h2 className="text-xl font-bold mb-3">Compléter mon profil</h2>
      <form onSubmit={submit} className="grid gap-3">
        <input className="bg-slate-800 p-2 rounded" placeholder="Nom d’utilisateur" value={username} onChange={e => setUsername(e.target.value)} />
        <input className="bg-slate-800 p-2 rounded" placeholder="Date de naissance" type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} />
        <button className="px-3 py-2 rounded-xl border bg-yellow-500 text-black">Enregistrer</button>
      </form>
      <Toast />
    </div>
  );
}
