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
  const totalPercent = splatSquadPercent + inkMastersPercent;
  const cleanSplatSquadPercent = totalPercent > 0 ? (splatSquadPercent / totalPercent) * 100 : 50;
  
  return (
    <div className="relative w-full h-12 rounded-lg bg-secondary overflow-hidden border-2 border-border">
      <div
        className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
        style={{
          width: `${splatSquadPercent}%`,
          backgroundColor: splatSquadColor,
        }}
      />
      <div
        className="absolute top-0 right-0 h-full transition-all duration-500 ease-out"
        style={{
          width: `${inkMastersPercent}%`,
          backgroundColor: inkMastersColor,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: `url(#splat-clip)` }}>
         <div className="relative w-full h-full">
            <div 
                className="absolute left-0 top-0 h-full" 
                style={{ width: `${cleanSplatSquadPercent}%`, backgroundColor: splatSquadColor }}
            />
            <div 
                className="absolute right-0 top-0 h-full" 
                style={{ width: `${100 - cleanSplatSquadPercent}%`, backgroundColor: inkMastersColor }}
            />
         </div>
      </div>
       <svg width="0" height="0">
        <defs>
          <clipPath id="splat-clip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 H1 V1 H0 V0 M0.48,0 C0.47,0.1,0.49,0.2,0.46,0.25 C0.43,0.3,0.45,0.4,0.48,0.45 C0.51,0.5,0.5,0.6,0.53,0.65 C0.56,0.7,0.54,0.8,0.51,0.85 C0.48,0.9,0.5,1,0.52,1 H0.48 V0 Z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
