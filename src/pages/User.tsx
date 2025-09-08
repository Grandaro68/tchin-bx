import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Bar } from "../types";

const QG_PERIOD_DAYS = 14;
function daysBetween(a: Date,b: Date){ return Math.floor((+b-+a)/86400000); }
function maskEmail(x?: string | null) {
  if (!x) return "Joueur";
  const [a,b] = x.split("@"); if(!a || !b) return x;
  return a.slice(0,2) + "…" + a.slice(-1) + "@" + b;
}

export default function User() {
  const [banko, setBanko] = useState<number>(0);
  const [mode, setMode] = useState<string>("outside");
  const [qg, setQG] = useState<string | null>(null);
  const [qgStart, setQGStart] = useState<Date | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [leaders, setLeaders] = useState<{user_id:string; gains:number; rank:number; username?:string|null; email?:string|null}[]>([]);

  useEffect(() => {
    (async () => {
      // Etat utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_state").select("*").eq("user_id", user.id).single();
      if (data) {
        setBanko(Number(data.banko ?? 0));
        setMode(data.mode ?? "outside");
        setQG(data.qg ?? null);
        setQGStart(data.qg_start ? new Date(data.qg_start) : null);
      }
      // Bars
      const b = await supabase.from("bars").select("*").order("tchin_7d", { ascending:false });
      setBars((b.data ?? []) as Bar[]);

      // Leaderboard
      const lb = await supabase
        .from("user_stats_7d")
        .select("user_id,gains,rank,profiles(username,email)")
        .order("rank", { ascending: true })
        .limit(10);
      const rows = (lb.data ?? []).map((r:any)=>({
        user_id: r.user_id,
        gains: Number(r.gains ?? 0),
        rank: Number(r.rank ?? 0),
        username: r.profiles?.username ?? null,
        email: r.profiles?.email ?? null,
      }));
      setLeaders(rows);
    })();
  }, []);

  const qgBar = qg ? bars.find(b => b.id === qg) ?? null : null;
  const jours = qgStart ? Math.max(0, QG_PERIOD_DAYS - daysBetween(qgStart, new Date())) : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoCard title="Solde">
          <div className="text-3xl font-bold">{banko.toFixed(2)} Tchin</div>
        </InfoCard>

        <InfoCard title="QG">
          <div className="text-xl font-semibold">
            {qgBar ? qgBar.name : "—"}
          </div>
        </InfoCard>

        <InfoCard title="Jours restants QG">
          <div className="text-2xl">{jours ?? "—"}</div>
        </InfoCard>

        <InfoCard title="Mode">
          <div className="text-xl">{mode === "outside" ? "Hors bar" : mode === "inQG" ? "Dans mon QG (x3)" : "Dans un autre bar (x1.5)"}</div>
        </InfoCard>
      </div>

      <div className="p-4 border rounded bg-slate-900">
        <div className="font-semibold mb-2">Top 10 Tchineurs</div>
        {leaders.length === 0 ? (
          <div className="text-sm opacity-70">Aucun score (encore) cette semaine.</div>
        ) : leaders.map(r=>(
          <div key={r.user_id} className="flex justify-between py-1 text-sm">
            <span>#{r.rank} {r.username || maskEmail(r.email)}</span>
            <span className="opacity-70">{r.gains.toFixed(0)} Tchin/7j</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ title, children }:{ title:string; children:any }) {
  return (
    <div className="p-4 border rounded bg-slate-900">
      <div className="text-sm opacity-70 mb-1">{title}</div>
      {children}
    </div>
  );
}
