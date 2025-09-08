import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Bar } from "../types";

type RankYesterday = Record<string, number>; // bar_id -> rank (yesterday)

function Arrow({ diff }: { diff: number }) {
  if (diff === 0) return <span className="opacity-60">•</span>;
  const up = diff > 0;
  const sign = up ? "+" : "";
  return (
    <span className={up ? "text-green-400" : "text-red-400"}>
      {up ? "▲" : "▼"} {sign}{diff}
    </span>
  );
}

export default function Bars() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [yday, setYday] = useState<RankYesterday>({});
  const [loading, setLoading] = useState(true);

  // charge bars (classement courant) + rangs d’hier
  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) bars actuels
      const { data: barData, error: e1 } = await supabase
        .from("bars")
        .select("*")
        .order("tchin_7d", { ascending: false });

      if (e1) { console.error(e1); setLoading(false); return; }
      const xs = (barData ?? []) as Bar[];

      // 2) rangs d’hier (snapshot quotidien)
      const { data: snap, error: e2 } = await supabase
        .from("bar_rank_daily")
        .select("bar_id, rank")
        .eq("snapshot_date", new Date(Date.now() - 86400000).toISOString().slice(0,10)); // yyyy-mm-dd

      if (e2) console.warn("[bar_rank_daily] read:", e2.message);

      const map: RankYesterday = {};
      (snap ?? []).forEach((r: any) => { map[r.bar_id] = r.rank; });

      setBars(xs);
      setYday(map);
      setLoading(false);
    })();
  }, []);

  // ajoute le rang courant et la diff 24h
  const ranked = useMemo(() => {
    return bars.map((b, idx) => {
      const rank = idx + 1;
      const yesterday = yday[b.id];
      const diff = typeof yesterday === "number" ? (yesterday - rank) : 0; // positif = on monte
      return { ...b, rank, diff24h: diff };
    });
  }, [bars, yday]);

  return (
    <div className="p-4 border rounded bg-slate-900">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Classement des Bars</h1>
        <div className="text-xs opacity-70">
          Variation = différence de rang depuis hier (snapshot quotidien)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b border-white/10">
            <tr>
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Bar</th>
              <th className="py-2 pr-3">Tchin 7j</th>
              <th className="py-2 pr-3">Δ 24h</th>
              <th className="py-2">Adresse</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="py-3 opacity-70" colSpan={5}>Chargement…</td></tr>
            )}
            {!loading && ranked.map(b => (
              <tr key={b.id} className="border-b border-white/5">
                <td className="py-2 pr-3 font-semibold">#{b.rank}</td>
                <td className="py-2 pr-3">{b.name}{b.closed ? " (fermé)" : ""}</td>
                <td className="py-2 pr-3">{b.tchin_7d ?? 0}</td>
                <td className="py-2 pr-3"><Arrow diff={b.diff24h} /></td>
                <td className="py-2">{b.address ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && ranked.length === 0 && (
        <div className="mt-4 text-sm opacity-70">Aucun bar.</div>
      )}
    </div>
  );
}
