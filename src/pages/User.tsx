// src/pages/User.tsx
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Bar = {
  id: string;
  name: string;
  tchin_7d?: number | null;
  closed?: boolean | null;
};

export default function User() {
  const [bars, setBars] = useState<Bar[]>([]);
  const [banko, setBanko] = useState(250);
  const [qgId, setQGId] = useState<string | null>(null);
  const [qgStart, setQGStart] = useState<Date>(new Date());
  const QG_PERIOD_DAYS = 14;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("bars").select("*").order("tchin_7d", { ascending: false });
      const xs = (data ?? []) as Bar[];
      setBars(xs);
      if (!qgId && xs[0]) setQGId(xs[0].id);
    })();
  }, []);

  const ranked = useMemo(() => bars.map((b, i) => ({ ...b, rank: i + 1 })), [bars]);
  const qgRank = ranked.find((b) => b.id === qgId)?.rank ?? null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi title="Solde" value={banko.toFixed(2)} />
        <Kpi title="QG rang" value={qgRank ? `#${qgRank}` : "—"} />
        <Kpi
          title="Jours restants QG"
          value={Math.max(0, QG_PERIOD_DAYS - Math.floor((+new Date() - +qgStart) / 86400000))}
        />
        <Kpi title="Multiplicateur" value="x1 (démo)" />
      </div>

      <div className="p-3 border rounded bg-slate-900">
        <div className="font-semibold mb-2">Classement Tchineurs (démo)</div>
        {["Alice","Bob","Carla","David","Emma","Farid","Gina","Hugo","Inès","Juan"].map((n, i) => (
          <div key={n} className="flex justify-between text-sm py-1">
            <span>#{i + 1} {n}</span>
            <span className="opacity-70">{4200 - i * 300} Tchin/7j</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-3 border rounded bg-slate-900">
      <div className="text-xs opacity-70">{title}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}
