// src/pages/Settings.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Settings() {
  const [email, setEmail] = useState<string>("");
  const [language, setLanguage] = useState<"fr"|"en">("fr");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;
      if (user?.email) setEmail(user.email);

      if (user?.id) {
        const { data } = await supabase.from("profiles").select("language").eq("id", user.id).maybeSingle();
        if (data?.language) setLanguage(data.language);
        else {
          // crée la ligne profile si absente
          await supabase.from("profiles").insert({ id: user.id, language: "fr" }).onConflict("id").ignore();
        }
      }
    })();
  }, []);

  async function saveLanguage() {
    setLoading(true); setMsg(null);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) { setMsg("Non connecté."); setLoading(false); return; }
    const { error } = await supabase.from("profiles").upsert({ id: uid, language });
    setLoading(false);
    setMsg(error ? "Erreur de sauvegarde" : "Langue mise à jour ✅");
  }

  async function changePassword() {
    const newPwd = prompt("Nouveau mot de passe (min. 6 caractères)");
    if (!newPwd) return;
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setLoading(false);
    setMsg(error ? "Erreur de changement de mot de passe" : "Mot de passe mis à jour ✅");
  }

  return (
    <div className="max-w-lg mx-auto p-4 border rounded bg-slate-900">
      <h1 className="text-xl font-bold mb-4">Paramètres du compte</h1>
      <div className="space-y-3">
        <div>
          <div className="text-xs text-slate-400">Email</div>
          <div className="font-mono">{email || "—"}</div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Langue</label>
          <select
            value={language}
            onChange={(e)=>setLanguage(e.target.value as "fr"|"en")}
            className="border rounded px-2 py-1 bg-slate-800"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          <button
            className="ml-2 px-3 py-1 rounded bg-yellow-500 text-black"
            onClick={saveLanguage}
            disabled={loading}
          >
            Enregistrer
          </button>
        </div>

        <div>
          <button
            className="px-3 py-1 rounded border"
            onClick={changePassword}
            disabled={loading}
          >
            Changer le mot de passe
          </button>
        </div>

        {msg && <div className="text-sm mt-2 opacity-90">{msg}</div>}
      </div>
    </div>
  );
}
