'use client';
import { useEffect, useState } from 'react';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400); // fade out transition
    }, 2600);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 transition-opacity duration-400 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {/* Logo grande */}
      <div className="mb-6 animate-pulse">
        <img
          src="/duende.png"
          alt="duende"
          className="w-32 h-32 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Frase principal */}
      <h1 className="text-4xl sm:text-5xl font-black text-center leading-tight text-white">
        El Secreto del
      </h1>
      <h1 className="text-5xl sm:text-6xl font-black text-center text-blue-400 tracking-tight">
        Quini 6
      </h1>

      {/* El Duende decorativo entre lineas */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-px w-12 bg-blue-400/50" />
        <img src="/duende.png" alt="duende" className="w-8 h-8 object-contain" />
        <div className="h-px w-12 bg-blue-400/50" />
      </div>

      <p className="mt-6 text-sm text-slate-400 tracking-widest uppercase">Tablero de Mando</p>
    </div>
  );
}