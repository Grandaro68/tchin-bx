// src/components/GuidedTour.tsx
import { useEffect, useLayoutEffect, useState } from "react";

type Step = { target: string; text: string };

const STEPS: Step[] = [
  { target: "#choose-qg",   text: "Commence par choisir ton QG : il booste tes gains." },
  { target: "#mode-select", text: "Ensuite règle le mode : hors bar, ou dans ton QG pour le x3." },
  { target: "#btn-tchin",   text: "Clique sur TCHIN ! pour gagner des Tchin (avec son et confettis 🍻)." },
  { target: "#nav-bars",    text: "L’onglet Bars te montre le classement des légendes." },
  { target: "#nav-moi",     text: "Onglet Moi : ton profil, tes stats, tes favoris." },
  { target: "#nav-shop",    text: "Shop : upgrades et bonus pour t’aider à tchin plus." },
];

export default function GuidedTour() {
  const [running, setRunning] = useState(false);
  const [i, setI] = useState(0);
  const step = running ? STEPS[i] : null;

  // Démarrage depuis la page Infos (ou ailleurs)
  useEffect(() => {
    const start = () => { setI(0); setRunning(true); };
    window.addEventListener("start-tour", start);
    return () => window.removeEventListener("start-tour", start);
  }, []);

  // Scroll vers la cible quand l’étape change
  useLayoutEffect(() => {
    if (!running || !step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [running, step]);

  // Cliquer la cible = étape suivante (sinon clic backdrop)
  useEffect(() => {
    if (!running || !step) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;

    const next = () => {
      setI(x => {
        if (x + 1 >= STEPS.length) { setRunning(false); return x; }
        return x + 1;
      });
    };

    el.addEventListener("click", next);
    return () => el.removeEventListener("click", next);
  }, [running, step]);

  if (!running || !step) return null;

  const el = document.querySelector(step.target) as HTMLElement | null;
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: "fixed",
    left: Math.min(Math.max(rect.left + rect.width / 2, 12), window.innerWidth - 12),
    top: rect.top - 12,
    transform: "translate(-50%, -100%)",
    zIndex: 10000,
    pointerEvents: "auto",
  };

  // Si l’élément est désactivé, on ajoute une note (ex. TCHIN sans QG)
  const disabled = (el as HTMLButtonElement).disabled;

  return (
    <>
      <div
        onClick={() => setI(x => (x + 1 >= STEPS.length ? (setRunning(false), x) : x + 1))}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 9999 }}
      />
      <div
        className="max-w-xs bg-slate-900 text-white border border-white/10 rounded-xl p-3 shadow-xl"
        style={style}
      >
        <div className="text-sm">{step.text}</div>
        <div className="text-xs text-slate-300 mt-1">
          {disabled ? "Active d’abord l’étape précédente pour utiliser cet élément." : "Clique sur l’élément pour continuer."}
        </div>
      </div>
    </>
  );
}
