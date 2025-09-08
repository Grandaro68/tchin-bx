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

export default function Home() {
  const { show, Toast } = useToast();
  const [ranked, setRanked] = useState<(Bar & {rank:number})[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [banko, setBanko] = useState(250);
  const [qg, setQG] = useState<string | null>(null);
  const [qgStart, setQGStart] = useState<Date>(new Date());
  const [mode, setMode] = useState<"outside"|"inQG"|"inOther">("outside");
  const [showPicker, setShowPicker] = useState(false); // <- on forcera l’ouverture au 1er lancement

  const multiplier = mode==="inQG" ? 3 : mode==="inOther" ? 1.5 : 1;

  // refs pour bouton et audio (pour les particules + son)
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Précharge l’audio
  useEffect(() => {
    const a = new Audio("/sounds/tchin.wav");
    a.preload = "auto";
    audioRef.current = a;
  }, []);

  // Charge les bars et **n’impose pas** de QG : on ouvre le picker si aucun QG
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("bars")
        .select("*")
        .order("tchin_7d", { ascending: false });

      if (error) { console.error(error); show("Erreur de chargement des bars", "err"); return; }

      const xs = (data ?? []) as Bar[];
      setRanked(xs.map((b, i) => ({ ...b, rank: i+1 })));

      // si aucun QG enregistré → ouvrir le picker
      if (!qg) setShowPicker(true);
    })();
  }, []); // qg volontairement pas en dépendance

  // Particules “🍻 Tchin!” depuis le bouton
  function spawnTchinParticles() {
    const btn = btnRef.current;
    if (!btn) return;
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

    // son
    try { const a = audioRef.current; if (a) { a.currentTime = 0; void a.play(); } } catch {}

    // particules
    spawnTchinParticles();

    // gains (coté client)
    const val = computeTchinValue(target.rank);
    const gain = +((val - 1) * multiplier).toFixed(2);
    setBanko(b => +(b + gain).toFixed(2));
    show(`+${gain} Tchin 🍻`, "ok");

    // (optionnel) côté serveur : enregistrer le tchin
    // await supabase.rpc('add_tchin', { bar_id: qg, mode });
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

        {/* ⛔️ Suppression du faux classement des tchineurs (démo) */}
        {/* (On remettra un vrai leaderboard quand user_stats_7d sera câblé) */}
      </div>

      {/* Centre */}
      <div className="p-4 border rounded bg-slate-900 md:col-span-2 flex flex-col items-center gap-4">
        {/* BANQUE */}
        <div
          className="w-full max-w-md text-center rounded-lg border bg-slate-800/40 px-4 py-3"
          role="status"
          aria-live="polite"
          title="Solde de Tchin"
        >
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
            onChange={e => setMode(e.target.value as any)}
            disabled={!qg} // pas de mode tant que pas de QG
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
            disabled={!qg} // <- désactivé tant que pas de QG
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
                <button className="text-xs border px-2 py-0.5 rounded" onClick={()=>setFavs(favs.filter(x=>x!==fid))}>
                  Retirer
                </button>
              </div>
            );
          })}
        </div>
        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Stats perso</div>
          <div className="text-sm">
            Jours restants QG: {Math.max(0, QG_PERIOD_DAYS - daysBetween(qgStart, new Date()))} j
          </div>
        </div>
      </div>

      {/* Sélecteur QG — ouvert automatiquement si aucun QG */}
      {showPicker && (
        <QGPicker
          bars={ranked.slice(0, 30)}
          cost={(r)=>qgChangeCost(r)}
          onChoose={(b)=>{
            if (qg) {
              const current = ranked.find(x=>x.id===qg);
              if (current) {
                const cost = qgChangeCost(current.rank);
                if (banko < cost){ show(`Fonds insuffisants (${cost})`, "err"); return; }
                setBanko(v => +(v - cost).toFixed(2));
              }
            }
            setQG(b.id); setQGStart(new Date()); setShowPicker(false);
          }}
          onClose={()=>{
            // si aucun QG encore choisi → on laisse ouvert (QG obligatoire)
            if (!qg) { show("Tu dois choisir un QG pour commencer 👇", "err"); return; }
            setShowPicker(false);
          }}
        />
      )}
      <Toast />
    </div>
  );
}
