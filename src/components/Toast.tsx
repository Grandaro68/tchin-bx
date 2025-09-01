import { useEffect, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const [type, setType] = useState<"ok" | "err">("ok");
  function show(message: string, t: "ok" | "err" = "ok") {
    setType(t); setMsg(message);
  }
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(id);
  }, [msg]);
  return { show, Toast: () => msg ? (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl border ${type==="ok"?"bg-emerald-200 text-black":"bg-rose-200 text-black"}`}>
      {msg}
    </div>
  ) : null };
}
