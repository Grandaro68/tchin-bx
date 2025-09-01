import { useEffect, useMemo, useState } from "react";
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

  const multiplier = mode==="inQG" ? 3 : mode==="inOther" ? 1.5 : 1;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("bars").select("*").order("tchin_7d", { ascending: false });
      const xs = (data ?? []) as Bar[];
      setBars(xs);
      setRanked(xs.map((b, i) => ({ ...b, rank: i+1 })));
      if (!qg && xs[0]) setQG(xs[0].id);
    })();
  }, []);

  function tchiner() {
    if (!qg) { show("Choisis un QG", "err"); return; }
    const target = ranked.find(b => b.id === qg);
    if (!target) { show("QG introuvable", "err"); return; }
    const val = computeTchinValue(target.rank);
    const gain = +( (val-1) * multiplier ).toFixed(2);
    setBanko(b => +(b + gain).toFixed(2));
    show(`+${gain} Tchin 🍻`, "ok");
    // TODO: appeler une Edge Function pour enregistrer le tchin + increm bar
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
            <div key={n} className="flex justify-between py-1 text-sm"><span>#{i+1} {n}</span><span className="opacity-70">{4200 - i*300} Tchin/7j</span></div>
          ))}
        </div>
      </div>

      {/* Centre */}
      <div className="p-4 border rounded bg-slate-900 md:col-span-2 flex flex-col items-center gap-4">
        <div className="text-sm">
          {qgBar ? <>QG: <span className="font-semibold">{qgBar.name}</span> (rang {qgBar.rank}) — coût changement: {qgChangeCost(qgBar.rank)} Tchin</> : "Aucun QG"}
        </div>
        <div className="flex items-center gap-2">
          <label>Mode :</label>
          <select className="border px-2 py-1 rounded bg-slate-800" value={mode} onChange={e => setMode(e.target.value as any)}>
            <option value="outside">Hors bar</option>
            <option value="inQG">Dans mon QG (x3)</option>
            <option value="inOther">Dans un autre bar (x1.5)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-4 rounded-xl bg-yellow-500 text-black font-extrabold text-xl border" onClick={tchiner}>TCHIN !</button>
          <button className="px-3 py-2 border rounded" onClick={() => setShowPicker(true)}>Choisir / Changer QG</button>
        </div>
        <div className="text-xs opacity-70">
          Banko: <b>{banko.toFixed(2)}</b> • Valeur: {qgBar ? computeTchinValue(qgBar.rank).toFixed(2) : "—"} • multiplicateur x{multiplier}
        </div>
      </div>

      {/* Droite */}
      <div className="space-y-4 md:col-span-1">
        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Bars favoris</div>
          {favs.length===0 ? <div className="text-sm opacity-70">Aucun favori</div> : favs.map(fid=>{
            const b = ranked.find(x=>x.id===fid); if(!b) return null;
            return <div key={fid} className="flex justify-between py-1 text-sm">
              <span>{b.name}</span>
              <button className="text-xs border px-2 py-0.5 rounded" onClick={()=>setFavs(favs.filter(x=>x!==fid))}>Retirer</button>
            </div>
          })}
        </div>
        <div className="p-3 border rounded bg-slate-900">
          <div className="font-semibold mb-2">Stats perso</div>
          <div className="text-sm">Jours restants QG: {Math.max(0, QG_PERIOD_DAYS - daysBetween(qgStart, new Date()))} j</div>
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
              setBanko(b => +(b - cost).toFixed(2));
            }
            setQG(b.id); setQGStart(new Date()); setShowPicker(false);
          }}
          onClose={()=>setShowPicker(false)}
        />
      )}
      <Toast />
    </div>
  );
}
