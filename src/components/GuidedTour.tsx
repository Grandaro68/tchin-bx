// GuidedTour.tsx
import { useEffect, useState } from "react";

type Step = { target: string; text: string; placement?: "top"|"bottom"|"left"|"right" };

const STEPS: Step[] = [
  { target: "#btn-tchin", text: "Clique sur TCHIN ! pour gagner des Tchin." },
  { target: "#mode-select", text: "Ici tu choisis le mode : hors bar, en bar, ou défi." },
  { target: "#choose-qg", text: "Sélectionne ton QG. Il booste tes gains !" },
  { target: "#nav-bars", text: "L’onglet Bars te montre le classement des légendes." },
  { target: "#nav-moi", text: "Onglet Moi : ton profil, tes stats, tes favoris." },
  { target: "#nav-shop", text: "Shop : upgrades et bonus pour t’aider à tchin plus." },
];

export default function GuidedTour(){
  const [i, setI] = useState(0);
  const step = STEPS[i];

  useEffect(() => {
    if (!step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;

    const handler = () => setI(x => Math.min(x+1, STEPS.length));
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [i, step]);

  if (!step) return null;

  const el = document.querySelector(step.target) as HTMLElement | null;
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: "fixed",
    left: rect.left + rect.width / 2,
    top: rect.top - 10,
    transform: "translate(-50%, -100%)",
    zIndex: 10000
  };

  return (
    <>
      {/* backdrop cliquable pour passer */}
      <div
        onClick={() => setI(i+1)}
        style={{position:"fixed", inset:0, background:"rgba(0,0,0,.35)", zIndex:9999}}
      />
      <div className="tour-bubble" style={style}>
        {step.text}
        <div className="tour-cta">Clique sur l’élément pour continuer</div>
      </div>
    </>
  );
}
