'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition no-print"
    >
      🖨️ Imprimir / Exportar PDF
    </button>
  );
}