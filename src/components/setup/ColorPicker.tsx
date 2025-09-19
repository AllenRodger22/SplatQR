'use client';

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import type { TeamId } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const TEAM_COLORS = [
  '#FF4500', // OrangeRed
  '#2E8B57', // SeaGreen
  '#4169E1', // RoyalBlue
  '#FFD700', // Gold
  '#DA70D6', // Orchid
  '#00CED1', // DarkTurquoise
  '#ADFF2F', // GreenYellow
  '#FF69B4', // HotPink
];

interface ColorPickerProps {
  teamId: TeamId;
}

export function ColorPicker({ teamId }: ColorPickerProps) {
  const context = useContext(GameContext);
  if (!context || !context.game) return null;

  const { game, selectColor } = context;
  const team = game.teams[teamId];
  const otherTeamId = teamId === 'splatSquad' ? 'inkMasters' : 'splatSquad';
  const otherTeamColor = game.teams[otherTeamId].color;

  return (
    <div className="grid grid-cols-8 gap-2">
      {TEAM_COLORS.map(color => {
        const isSelected = team.color === color;
        const isDisabled = otherTeamColor === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => selectColor?.(teamId, color)}
            disabled={isDisabled}
            className={cn(
              'relative flex aspect-square items-center justify-center rounded-md border-2 transition-all',
              isSelected ? 'border-foreground scale-110 shadow-lg' : 'border-transparent',
              isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105'
            )}
            style={{ backgroundColor: color }}
            aria-label={`Selecionar cor ${color}`}
          >
            {isSelected && <Check className="h-6 w-6 text-black/70 stroke-[3]" />}
            {isDisabled && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xs">USADA</div>}
          </button>
        );
      })}
    </div>
  );
}
