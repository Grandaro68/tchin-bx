import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Bar } from "../types";

export default function Bars() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [windowKey, setWindowKey] = useState<"tchin_7d"|"tchin_30d"|"tchin_90d">("tchin_7d");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("bars").select("*");
      setBars((data ?? []) as Bar[]);
    })();
  }, []);

  const ranked = useMemo(() => {
    const key = windowKey;
    return [...bars].sort((a,b)=>((b[key] ?? 0) - (a[key] ?? 0))).map((b,i)=>({ ...b, rank: i+1 }));
  }, [bars, windowKey]);

  const avg7 = useMemo(()=>{
    const arr = bars.map(b => b.tchin_7d ?? 0);
    return arr.length ? arr.reduce((a,c)=>a+c,0)/arr.length : 0;
  }, [bars]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className={`px-2 py-1 border rounded ${windowKey==="tchin_7d"?"bg-yellow-500 text-black":""}`} onClick={()=>setWindowKey("tchin_7d")}>7 jours</button>
        <button className={`px-2 py-1 border rounded ${windowKey==="tchin_30d"?"bg-yellow-500 text-black":""}`} onClick={()=>setWindowKey("tchin_30d")}>30 jours</button>
        <button className={`px-2 py-1 border rounded ${windowKey==="tchin_90d"?"bg-yellow-500 text-black":""}`} onClick={()=>setWindowKey("tchin_90d")}>90 jours</button>
      </div>

      <div className="border p-3 rounded bg-slate-900">
        <table className="text-sm w-full">
          <thead>
            <tr>
              <th className="text-left pr-2">Rang</th>
              <th className="text-left pr-2">Nom</th>
              <th className="text-left pr-2">Valeur (Tchin)</th>
              <th className="text-left pr-2">Nb Tchin gagnés</th>
              <th className="text-left pr-2">% vs moy (7j)</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(b=>{
              const vsAvg = avg7 ? Math.round((((b.tchin_7d ?? 0) - avg7)/avg7)*100) : 0;
              const value = +(1 + 0.01*(b.rank)).toFixed(2);
              const count = b[windowKey] ?? 0;
              return (
                <tr key={b.id}>
                  <td className="py-1 pr-2">#{b.rank}</td>
                  <td className="py-1 pr-2">{b.name} {b.closed ? <span className="ml-2 text-xs bg-red-600 text-white px-2 rounded">CLOSED</span> : null}</td>
                  <td className="py-1 pr-2">{value}</td>
                  <td className="py-1 pr-2">{count}</td>
                  <td className="py-1 pr-2">{vsAvg}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
