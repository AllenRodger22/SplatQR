'use client';

import { cn } from '@/lib/utils';

const EMOJIS = ['🦑', '🐙', '🎨', '💥', '💦', '🔫', '😈', '😎', '👻', '🔥', '✨', '👑'];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={cn(
            'flex aspect-square items-center justify-center rounded-md border-2 text-3xl transition-all duration-200',
            value === emoji
              ? 'border-primary scale-110 shadow-lg'
              : 'border-transparent hover:bg-white/10 hover:scale-105'
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
