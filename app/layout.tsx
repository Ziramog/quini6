import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quini 6 — Tablero de Mando',
  description: 'Dashboard histórico y análisis estadístico del Quini 6 Argentina',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}