import type { Timestamp } from 'firebase/firestore';

export interface CaptureStats {
  totalCaptures: Record<TeamId, number>;
  recaptures: Record<TeamId, number>;
}

export interface CaptureEvent {
  zoneId: string;
  teamId: TeamId;
  playerId: string;
  timestamp: Timestamp;
  isRecapture: boolean;
}

export interface Player {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  emoji: string;
}

export type TeamId = 'splatSquad' | 'inkMasters';

export interface Team {
  name: string;
  color: string;
  players: Player[];
}

export interface Zone {
  id: string;
  capturedBy: TeamId | null;
  capturedAt: Timestamp | null;
}

export interface Game {
  status: 'setup' | 'playing' | 'finished';
  teams: {
    splatSquad: Team;
    inkMasters: Team;
  };
  zones: Zone[];
  gameDuration: number; // in minutes
  gameStartTime: Timestamp | null;
  votes: {
    15: string[]; // player ids
    30: string[]; // player ids
  };
  winner: TeamId | 'draw' | null;
  readyPlayers: string[]; // player ids
  captureStats: CaptureStats;
}
