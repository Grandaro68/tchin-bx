import GuidedTour from "../components/GuidedTour";
import { useEffect, useRef, useState } from "react";
import type { Bar } from "../types";
import { supabase } from "../lib/supabase";
import QGPicker from "../components/QGPicker";
import { useToast } from "../components/Toast";

const BASE = 1, BONUS = 0.01;
const QG_PERIOD_DAYS = 14;
const TOTAL_BARS = 500;
const PRIMES_DECILE = [10000,7000,5000,3500,2500,1800,1200,700,300,0];

function computeTchinValue(rank: number){ return Math.round((BASE + BONUS*rank)*100)/100; }
function qgChangeCost(rank: number){ const span=1000-500; const step=span/(TOTAL_BARS-1); return Math.round(1000-(rank-1)*step); }
function daysBetween(a: Date,b: Date){ return Math.floor((+b-+a)/86400000); }

// debounce util pour l’auto-save
function debounce<F extends (...a:any[])=>void>(fn:F, ms:number){
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export default function Home() {
  const { show, Toast } = useToast();
  const [bars, setBars] = useState<Bar[]>([]);
  const [ranked, setRanked] = useState<(Bar & {rank:number})[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [banko, setBanko] = useState(250);
  const [qg, setQG] = useState<string | null>(null);
  const [qgStart, setQGStart] = useState<Date>(new Date());
  const [mode, setMode] = useState<"outside"|"inQG"|"inOther">("outside");
  const [showPicker, setShowPicker] = useState(false);

  // session Supabase pour l’auto-save
  const [session, setSession] = useState<import("@supabase/supabase-js").Session | null>(null);

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

  // Charge bars + QG par défaut
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("bars")
        .select("*")
        .order("tchin_7d", { ascending: false });
      const xs = (data ?? []) as Bar[];
      setBars(xs);
      setRanked(xs.map((b, i) => ({ ...b, rank: i+1 })));
      if (!qg && xs[0]) setQG(xs[0].id);
    })();
  }, []);

  // Auth Supabase (pour l’auto-save)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Charge état utilisateur si connecté
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const { data, error } = await supabase
        .from("user_state")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) return; // silencieux

      if (data) {
        setBanko(Number(data.banko) || 0);
        setQG(data.qg ?? null);
        setQGStart(data.qg_start ? new Date(data.qg_start) : new Date());
        setMode((data.mode as any) ?? "outside");
        setFavs(Array.isArray(data.favs) ? data.favs : []);
      } else {
        // créer une ligne par défaut
        await supabase.from("user_state").insert({
          user_id: session.user.id,
          banko,
          qg,
          qg_start: qgStart.toISOString(),
          mode,
          favs
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Auto-save (debounced) quand un champ important change
  const saveState = debounce(async (payload: any) => {
    if (!session?.user) return;
    await supabase.from("user_state").upsert({
      user_id: session.user.id,
      ...payload,
      updated_at: new Date().toISOString()
    });
  }, 800);

  useEffect(() => {
    saveState({ banko, qg, qg_start: qgStart.toISOString(), mode, favs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banko, qg, qgStart, mode, favs, session?.user?.id]);

  // Particules “🍻 Tchin!” qui démarrent depuis le bouton
  function spawnTchinParticles() {
    const btn = btnRef.current;
    if (!btn) return;

    // reflow + anim sur frame suivante (plus robuste)
    btn.getBoundingClientRect();
    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    const create = () => {
      for (let i = 0; i < 12; i++) {
        const el = document.createElement("div");
        el.textContent = "🍻 Tchin!";
        Object.assign(el.style, {
          position: "fixed",
          left: `${originX}px`,
          top: `${originY}px`,
          fontSize: "14px",
          fontWeight: "700",
          color: "white",
          textShadow: "0 2px 6px rgba(0,0,0,.5)",
          pointerEvents: "none",
          zIndex: "99999",
          willChange: "transform,opacity"
        } as CSSStyleDeclaration);

        document.body.appendChild(el);

        const angle = (-90 + (Math.random() * 80 - 40)) * (Math.PI / 180);
        const distance = 90 + Math.random() * 140;
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
        setTimeout(() => el.remove(), duration + 80);
      }
    };

    requestAnimationFrame(create);
  }

  // Empêche l’ANCIENNE animation globale de se déclencher
  // (si un listener ancien écoute le document, on coupe la propagation depuis le bouton)
  function stopLegacyPropagation(e: React.SyntheticEvent) {
    e.stopPropagation();
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
        </div>
        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Top 10 Tchineurs (démo)</div>
          {["Alice","Bob","Carla","David","Emma","Farid","Gina","Hugo","Inès","Juan"].map((n,i)=>(
            <div key={n} className="flex justify-between py-1 text-sm">
              <span>#{i+1} {n}</span>
              <span className="opacity-70">{4200 - i*300} Tchin/7j</span>
            </div>
          ))}
        </div>
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
          {qgBar ? <>QG: <span className="font-semibold">{qgBar.name}</span> (rang {qgBar.rank}) — coût changement: {qgChangeCost(qgBar.rank)} Tchin</> : "Aucun QG"}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="mode-select">Mode :</label>
          <select
            id="mode-select"
            className="border px-2 py-1 rounded bg-slate-800"
            value={mode}
            onChange={e => setMode(e.target.value as any)}
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
            className="px-6 py-4 rounded-xl bg-yellow-500 text-black font-extrabold text-xl border active:translate-y-px"
            onClickCapture={stopLegacyPropagation}   // coupe les vieux listeners (capture)
            onMouseDownCapture={stopLegacyPropagation}
            onClick={() => {
              // son
              try {
                const a = audioRef.current;
                if (a) { a.currentTime = 0; void a.play(); }
              } catch {}
              // particules
              spawnTchinParticles();

              // logique de gain
              if (!qg) { show("Choisis un QG", "err"); return; }
              const target = ranked.find(b => b.id === qg);
              if (!target) { show("QG introuvable", "err"); return; }
              const val = computeTchinValue(target.rank);
              const gain = +((val - 1) * multiplier).toFixed(2);
              setBanko(b => +(b + gain).toFixed(2));
              show(`+${gain} Tchin 🍻`, "ok");
              // TODO: edge function pour tracer le tchin
            }}
          >
            TCHIN !
          </button>
          <button
            id="choose-qg"
            className="px-3 py-2 border rounded"
            onClick={() => setShowPicker(true)}
          >
            Choisir / Changer QG
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

      {showPicker && (
        <QGPicker
          bars={ranked.slice(0, 20)}
          cost={(r)=>qgChangeCost(r)}
          onChoose={(b)=>{
            if (qgBar) {
              const cost = qgChangeCost(qgBar.rank);
              if (banko < cost){ show(`Fonds insuffisants (${cost})`, "err"); return; }
              setBanko(v => +(v - cost).toFixed(2));
            }
            setQG(b.id); setQGStart(new Date()); setShowPicker(false);
          }}
          onClose={()=>setShowPicker(false)}
        />
      )}
      {/* >>> Tuto à bulles (overlay global) <<< */}

      <GuidedTour />
      
      <Toast />
    </div>
  );
}
