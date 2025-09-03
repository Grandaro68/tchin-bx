// TchinButton.tsx
import { useRef, useState, useEffect, useCallback } from "react";

type Props = {
  onTchin?: () => void;
  disabled?: boolean;
};

export default function TchinButton({ onTchin, disabled }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Précharge du son (doit résider dans /public/sounds/)
  useEffect(() => {
    const a = new Audio("/sounds/tchin.wav");
    a.preload = "auto";
    setAudio(a);
  }, []);

  // Fabrique une “bulle Tchin” qui part DU bouton
  const spawnTchin = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // Crée 12 particules “🍻 Tchin!”
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("div");
      el.className = "tchin-particle";
      el.textContent = "🍻 Tchin!";
      // position absolue dans la page
      el.style.left = `${originX}px`;
      el.style.top = `${originY}px`;

      // trajectoire aléatoire (vers le haut)
      const angle = (-90 + (Math.random() * 80 - 40)) * (Math.PI / 180);
      const distance = 80 + Math.random() * 140;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const duration = 700 + Math.random() * 600;

      el.animate(
        [
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(${0.9 + Math.random()*0.4})`, opacity: 0 }
        ],
        { duration, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      );

      document.body.appendChild(el);
      setTimeout(() => el.remove(), duration + 50);
    }
  }, []);

  const handleClick = useCallback(() => {
    // joue le son (le premier click utilisateur débloque l'audio sur mobile)
    audio?.currentTime !== undefined && (audio.currentTime = 0);
    audio?.play().catch(() => {/* silencieux si bloqué */});

    spawnTchin();
    onTchin?.();
  }, [audio, onTchin, spawnTchin]);

  return (
    <button
      id="btn-tchin"
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      className="btn-tchin"
      aria-label="Tchin !"
    >
      TCHIN !
    </button>
  );
}