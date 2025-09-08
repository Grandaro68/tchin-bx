import { useEffect, useRef, useState } from "react";
import type { Bar } from "../types";
import { supabase } from "../lib/supabase";
import QGPicker from "../components/QGPicker";
import { useToast } from "../components/Toast";

const BASE = 1, BONUS = 0.01;
const QG_PERIOD_DAYS = 14;
const TOTAL_BARS = 500;

function computeTchinValue(rank: number){ return Math.round((BASE + BONUS*rank)*100)/100; }
function qgChangeCost(rank: number){ const span=1000-500; const step=span/(TOTAL_BARS-1); return Math.round(1000-(rank-1)*step); }
function daysBetween(a: Date,b: Date){ return Math.floor((+b-+a)/86400000); }
function maskEmail(x?: string | null) {
  if (!x) return "Joueur";
  const [a,b] = x.split("@"); if(!a || !b) return x;
  return a.slice(0,2) + "…" + a.slice(-1) + "@" + b;
}

type UserStateRow = {
  user_id: string;
  banko: number;
  qg: string | null;
  qg_start: string | null;   // ISO
  mode: "outside"|"inQG"|"inOther";
  favs: string[] | null;
};

export default function Home() {
  const { show, Toast } = useToast();

  // Bars & leaderboard
  const [ranked, setRanked] = useState<(Bar & {rank:number})[]>([]);
  const [leaders, setLeaders] = useState<
    { user_id: string; gains: number; rank: number; username?: string | null; email?: string | null }[]
  >([]);

  // État joueur
  const [banko, setBanko] = useState(250);
  const [qg, setQG] = useState<string | null>(null);
  const [qgStart, setQGStart] = useState<Date>(new Date());
  const [mode, setMode] = useState<"outside"|"inQG"|"inOther">("outside");
  const [favs, setFavs] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const multiplier = mode==="inQG" ? 3 : mode==="inOther" ? 1.5 : 1;

  // refs pour bouton et audio
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Précharge audio
  useEffect(() => {
    const a = new Audio("/sounds/tchin.wav");
    a.preload = "auto";
    audioRef.current = a;
  }, []);

  // Helpers DB
  async function ensureUserState(): Promise<UserStateRow | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("user_state")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") { // not found = PGRST116
      console.warn("[user_state] load error:", error.message);
      return null;
    }

    if (!data) {
      const init: Partial<UserStateRow> = {
        user_id: user.id,
        banko: 250,
        qg: null,
        qg_start: null,
        mode: "outside",
        favs: [],
      };
      const { data: created, error: e2 } = await supabase
        .from("user_state")
        .insert(init)
        .select()
        .single();
      if (e2) { console.warn("[user_state] create error:", e2.message); return null; }
      return created as any;
    }

    return data as any;
  }

  async function saveUserState(patch: Partial<UserStateRow>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_state").update(patch).eq("user_id", user.id);
  }

  // Charge bars + user_state
  useEffect(() => {
    (async () => {
      // Bars
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .order("tchin_7d", { ascending: false });
      if (!data || error) { console.error(error); show("Erreur de chargement des bars", "err"); return; }
      const xs = data as Bar[];
      setRanked(xs.map((b, i) => ({ ...b, rank: i+1 })));

      // User state
      const st = await ensureUserState();
      if (st) {
        setBanko(Number(st.banko ?? 250));
        setQG(st.qg ?? null);
        setQGStart(st.qg_start ? new Date(st.qg_start) : new Date());
        setMode((st.mode as any) ?? "outside");
        setFavs(st.favs ?? []);
      }
      // Si pas de QG => ouvrir le picker
      setShowPicker(!st?.qg);
    })();
  }, []); // 1er render

  // Leaderboard réel (table matérialisée)
  useEffect(() => {
    (async () => {
      let { data, error } = await supabase
        .from("user_stats_7d")
        .select("user_id,gains,rank,profiles(username,email)")
        .order("rank", { ascending: true })
        .limit(10);
      if (error) {
        console.warn("[leaderboard] fallback:", error.message);
        const res = await supabase
          .from("user_stats_7d")
          .select("user_id,gains,rank")
          .order("rank", { ascending: true })
          .limit(10);
        data = res.data ?? [];
      }
      const rows = (data ?? []).map((r: any) => ({
        user_id: r.user_id,
        gains: Number(r.gains ?? 0),
        rank: Number(r.rank ?? 0),
        username: r.profiles?.username ?? null,
        email: r.profiles?.email ?? null,
      }));
      setLeaders(rows);
    })();
  }, []);

  // Particules
  function spawnTchinParticles() {
    const btn = btnRef.current; if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("div");
      el.textContent = "🍻 Tchin!";
      el.style.position = "fixed";
      el.style.left = `${originX}px`;
      el.style.top = `${originY}px`;
      el.style.fontWeight = "700";
      el.style.zIndex = "9999";
      el.style.pointerEvents = "none";
      el.style.textShadow = "0 2px 6px rgba(0,0,0,.35)";
      el.style.willChange = "transform,opacity";
      document.body.appendChild(el);

      const angle = (-90 + (Math.random() * 80 - 40)) * (Math.PI / 180);
      const distance = 80 + Math.random() * 140;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const duration = 700 + Math.random() * 600;

      el.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(${0.9 + Math.random()*0.4})`, opacity: 0 }
        ],
        { duration, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      );
      setTimeout(() => el.remove(), duration + 60);
    }
  }

  async function tchiner() {
    if (!qg) { show("Choisis d’abord ton QG 🍺", "err"); setShowPicker(true); return; }
    const target = ranked.find(b => b.id === qg);
    if (!target) { show("QG introuvable", "err"); return; }

    try { const a = audioRef.current; if (a) { a.currentTime = 0; void a.play(); } } catch {}
    spawnTchinParticles();

    const val = computeTchinValue(target.rank);
    const gain = +((val - 1) * multiplier).toFixed(2);
    setBanko(b => +(b + gain).toFixed(2));
    show(`+${gain} Tchin 🍻`, "ok");

    // Persist: +banque, +ligne tchins
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_state")
        .update({ banko: banko + gain })
        .eq("user_id", user.id);
      await supabase.from("tchins").insert({
        user_id: user.id,
        bar_id: target.id,
        value: val,
        multiplier,
        user_gain: gain,
        bar_gain: gain,
      });
    }
  }

  const qgBar = ranked.find(b => b.id === qg) || null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Col gauche */}
      <div className="space-y-4 md:col-span-1 md:sticky md:top-4">
        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Top 10 Bars</div>
          {ranked.slice(0,10).map(b => (
            <div key={b.id} className="flex justify-between py-1 text-sm">
              <div><span className="font-bold">#{b.rank} </span>{b.name}</div>
              <div className="opacity-70">{computeTchinValue(b.rank)}</div>
            </div>
          ))}
          {ranked.length===0 && <div className="text-sm opacity-70">Chargement…</div>}
        </div>

        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Top 10 Tchineurs</div>
          {leaders.length === 0 ? (
            <div className="text-sm opacity-70">Aucun score (encore) cette semaine.</div>
          ) : leaders.map((r) => (
            <div key={r.user_id} className="flex justify-between py-1 text-sm">
              <span>#{r.rank} {r.username || maskEmail(r.email)}</span>
              <span className="opacity-70">{r.gains.toFixed(0)} Tchin/7j</span>
            </div>
          ))}
        </div>
      </div>

      {/* Centre */}
      <div className="p-4 border rounded bg-slate-900 md:col-span-2 flex flex-col items-center gap-4">
        {/* BANQUE */}
        <div className="w-full max-w-md text-center rounded-lg border bg-slate-800/40 px-4 py-3" role="status" aria-live="polite">
          <div className="uppercase tracking-wider text-xs text-slate-300">Banque</div>
          <div className="text-3xl font-extrabold leading-none text-yellow-300 mt-1">
            {banko.toFixed(2)} <span className="text-sm text-slate-300 font-semibold">Tchin</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Valeur: {qgBar ? computeTchinValue(qgBar.rank).toFixed(2) : "—"} • multiplicateur x{multiplier}
          </div>
        </div>

        <div className="text-sm">
          {qgBar
            ? <>QG: <span className="font-semibold">{qgBar.name}</span> (rang {qgBar.rank}) — coût changement: {qgChangeCost(qgBar.rank)} Tchin</>
            : <span className="text-yellow-300">Aucun QG — choisis-en un pour commencer</span>}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="mode-select">Mode :</label>
          <select
            id="mode-select"
            className="border px-2 py-1 rounded bg-slate-800"
            value={mode}
            onChange={async (e) => {
              const v = e.target.value as "outside"|"inQG"|"inOther";
              setMode(v);
              const { data: { user } } = await supabase.auth.getUser();
              if (user) await supabase.from("user_state").update({ mode: v }).eq("user_id", user.id);
            }}
            disabled={!qg}
          >
            <option value="outside">Hors bar</option>
            <option value="inQG">Dans mon QG (x3)</option>
            <option value="inOther">Dans un autre bar (x1.5)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            id="btn-tchin"
            ref={btnRef}
            className="px-6 py-4 rounded-xl bg-yellow-500 text-black font-extrabold text-xl border active:translate-y-px disabled:opacity-60"
            onClick={tchiner}
            disabled={!qg}
          >
            TCHIN !
          </button>
          <button
            id="choose-qg"
            className="px-3 py-2 border rounded"
            onClick={() => setShowPicker(true)}
          >
            {qg ? "Choisir / Changer QG" : "Choisir mon QG"}
          </button>
        </div>
      </div>

      {/* Droite */}
      <div className="space-y-4 md:col-span-1">
        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Bars favoris</div>
          {favs.length===0 ? (
            <div className="text-sm opacity-70">Aucun favori</div>
          ) : favs.map(fid=>{
            const b = ranked.find(x=>x.id===fid); if(!b) return null;
            return (
              <div key={fid} className="flex justify-between py-1 text-sm">
                <span>{b.name}</span>
                <button
                  className="text-xs border px-2 py-0.5 rounded"
                  onClick={async ()=>{
                    const next = favs.filter(x=>x!==fid);
                    setFavs(next);
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) await supabase.from("user_state").update({ favs: next }).eq("user_id", user.id);
                  }}
                >
                  Retirer
                </button>
              </div>
            );
          })}
        </div>
        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Stats perso</div>
          <div className="text-sm">
            Jours restants QG: {qg ? Math.max(0, QG_PERIOD_DAYS - daysBetween(qgStart, new Date())) : "—"} j
          </div>
        </div>
      </div>

      {/* QG Picker */}
      {showPicker && (
        <QGPicker
          bars={ranked.slice(0, 30)}
          cost={(r)=>qgChangeCost(r)}
          onChoose={async (b)=>{
            const isChange = Boolean(qg);
            if (isChange) {
              const current = ranked.find(x=>x.id===qg);
              if (current) {
                const cost = qgChangeCost(current.rank);
                if (banko < cost){ show(`Fonds insuffisants (${cost})`, "err"); return; }
                setBanko(v => +(v - cost).toFixed(2));
                const { data: { user } } = await supabase.auth.getUser();
                if (user) await supabase.from("user_state").update({ banko: banko - cost }).eq("user_id", user.id);
              }
            }
            const start = new Date();
            setQG(b.id); setQGStart(start); setShowPicker(false);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await supabase.from("user_state").update({ qg: b.id, qg_start: start.toISOString() }).eq("user_id", user.id);
          }}
          onClose={()=>{
            if (!qg) { show("Tu dois choisir un QG pour commencer 👇", "err"); return; }
            setShowPicker(false);
          }}
        />
      )}
      <Toast />
    </div>
  );
}
