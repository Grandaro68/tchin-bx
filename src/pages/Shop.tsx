import { useEffect, useRef } from "react";

export default function Shop() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let i=0;
    const id = setInterval(()=>{
      i=(i+5)%105;
      if(ref.current) ref.current.style.width = `${i}%`;
    }, 120);
    return ()=>clearInterval(id);
  }, []);
  return (
    <div className="p-6 border rounded bg-slate-900">
      <div className="font-semibold mb-2">Boutique & Investissements — A VENIR !</div>
      <div className="w-full bg-zinc-800 h-3 rounded">
        <div
          ref={ref}
          className="h-3 bg-yellow-500 rounded shop-progress-bar"
        />
      </div>
    </div>
  );
}
