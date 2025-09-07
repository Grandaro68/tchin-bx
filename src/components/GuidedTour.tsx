// src/components/GuidedTour.tsx
import { useEffect, useLayoutEffect, useState } from "react";

type Step = { target: string; text: string };

const STEPS: Step[] = [
  { target: "#btn-tchin",  text: "Clique sur TCHIN ! pour gagner des Tchin." },
  { target: "#mode-select", text: "Ici tu choisis le mode : hors bar, en bar, ou défi." },
  { target: "#choose-qg",   text: "Sélectionne ton QG. Il booste tes gains !" },
  { target: "#nav-bars",    text: "L’onglet Bars te montre le classement des légendes." },
  { target: "#nav-moi",     text: "Onglet Moi : ton profil, tes stats, tes favoris." },
  { target: "#nav-shop",    text: "Shop : upgrades et bonus pour t’aider à tchin plus." },
];

export default function GuidedTour() {
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);

  const step = running ? STEPS[i] : null;

  // Démarre le tuto depuis la page Infos (bouton -> window.dispatchEvent(new Event("start-tour")))
  useEffect(() => {
    const start = () => { setI(0); setRunning(true); };
    window.addEventListener("start-tour", start);
    return () => window.removeEventListener("start-tour", start);
  }, []);

  // Si la cible n’existe pas (page pas rendue), on attend un tick puis on réessaie
  useLayoutEffect(() => {
    if (!running || !step) return;
    const tryFocus = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) {
        // réessaie une fois au prochain frame
        requestAnimationFrame(() => {
          const el2 = document.querySelector(step.target) as HTMLElement | null;
          if (!el2) return; // on laisse l’étape affichée, l’utilisateur peut naviguer jusqu’à la cible
          el2.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    tryFocus();
  }, [running, step]);

  // Avance à l’étape suivante lorsqu’on clique la cible
  useEffect(() => {
    if (!running || !step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;

    const advance = () => {
      setI(x => {
        if (x + 1 >= STEPS.length) { setRunning(false); return x; }
        return x + 1;
      });
    };
    el.addEventListener("click", advance);
    return () => el.removeEventListener("click", advance);
  }, [running, step]);

  if (!running || !step) return null;

  const el = document.querySelector(step.target) as HTMLElement | null;
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: "fixed",
    left: rect.left + rect.width / 2,
    top: rect.top - 12,
    transform: "translate(-50%, -100%)",
    zIndex: 10000,
    pointerEvents: "auto",
  };

  return (
    <>
      {/* Backdrop : clic = passer à l’étape suivante (ou fermer à la fin) */}
      <div
        onClick={() => setI(x => (x + 1 >= STEPS.length ? (setRunning(false), x) : x + 1))}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 9999 }}
      />
      <div
        className="max-w-xs bg-slate-900 text-white border border-white/10 rounded-xl p-3 shadow-xl"
        style={style}
      >
        <div className="text-sm">{step.text}</div>
        <div className="text-xs text-slate-300 mt-1">Clique sur l’élément pour continuer</div>
      </div>
    </>
  );
}
