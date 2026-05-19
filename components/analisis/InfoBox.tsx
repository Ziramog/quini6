'use client';

interface Props {
  title: string;
  description: string;
}

export function InfoBox({ title, description }: Props) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
      <p className="text-xs font-semibold text-blue-800 mb-1">{title}</p>
      <p className="text-xs text-blue-700 leading-relaxed">{description}</p>
    </div>
  );
}