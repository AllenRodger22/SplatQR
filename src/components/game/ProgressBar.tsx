'use client';

interface ProgressBarProps {
  splatSquadPercent: number;
  inkMastersPercent: number;
  splatSquadColor: string;
  inkMastersColor: string;
}

export function ProgressBar({
  splatSquadPercent,
  inkMastersPercent,
  splatSquadColor,
  inkMastersColor,
}: ProgressBarProps) {
  return (
    <div className="relative w-full h-12 rounded-lg bg-secondary overflow-hidden border-2 border-border">
      {/* Barra do Splat Squad (vem da esquerda) */}
      <div
        className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
        style={{
          width: `${splatSquadPercent}%`,
          backgroundColor: splatSquadColor,
        }}
      />
      {/* Barra do Ink Masters (vem da direita) */}
      <div
        className="absolute top-0 right-0 h-full transition-all duration-500 ease-out"
        style={{
          width: `${inkMastersPercent}%`,
          backgroundColor: inkMastersColor,
        }}
      />
    </div>
  );
}
