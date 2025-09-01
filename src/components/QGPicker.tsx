import React from "react";
import type { Bar } from "../types";

export function QGPicker({
  bars, onChoose, onClose, cost
}: {
  bars: (Bar & { rank?: number })[];
  onChoose: (bar: Bar & { rank?: number }) => void;
  onClose: () => void;
  cost: (rank: number) => number;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-slate-900 border rounded-2xl p-4 w-[680px] max-w-[92vw]">
        <div className="font-semibold mb-3">Choisir / Changer mon QG</div>
        <div className="max-h-[60vh] overflow-auto divide-y divide-slate-800">
          {bars.map((b) => {
            const r = b.rank ?? 500;
            return (
              <div key={b.id} className="flex items-center justify-between py-2">
                <div><span className="font-bold">#{b.rank ?? "?"}</span> {b.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-80">{cost(r)} Tchin</span>
                  <button className="px-2 py-1 border rounded text-xs" onClick={() => onChoose(b)}>Choisir</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-right mt-3">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
export default QGPicker;
