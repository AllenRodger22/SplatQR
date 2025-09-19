'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, serverTimestamp, Timestamp, writeBatch, collection, getDocs } from 'firebase/firestore';
import type { Game, Player, TeamId } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const GAME_ID = 'splattag-main';
const NUM_ZONES = 11;

const defaultGame: Game = {
  status: 'setup',
  teams: {
    splatSquad: { name: 'Splat Squad', color: '#FF00FF', players: [] },
    inkMasters: { name: 'Ink Masters', color: '#00FFFF', players: [] },
  },
  zones: Array.from({ length: NUM_ZONES }, (_, i) => ({
    id: `zone-${String.fromCharCode(97 + i)}`,
    capturedBy: null,
    capturedAt: null,
  })),
  gameDuration: 15,
  gameStartTime: null,
  votes: { 15: [], 30: [] },
  winner: null,
};

interface GameContextType {
  player: Player | null;
  game: Game | null;
  loading: boolean;
  login: (name: string, emoji: string) => void;
  logout: () => void;
  joinTeam: (teamId: TeamId) => Promise<void>;
  selectColor: (teamId: TeamId, color: string) => Promise<void>;
  voteToStart: (duration: 15 | 30) => Promise<void>;
  captureZone: (zoneId: string) => Promise<void>;
  resetGame: () => Promise<void>;
}

export const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [player, setPlayer] = useLocalStorage<Player | null>('splattag-player', null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const gameDocRef = doc(db, 'games', GAME_ID);

  const resetGame = useCallback(async () => {
    try {
      await setDoc(gameDocRef, defaultGame);
      toast({ title: 'Game Reset!', description: 'Ready for a new match.' });
    } catch (error) {
      console.error('Error resetting game:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not reset the game.' });
    }
  }, [gameDocRef, toast]);

  useEffect(() => {
    const unsubscribe = onSnapshot(gameDocRef, (doc) => {
      if (doc.exists()) {
        setGame(doc.data() as Game);
      } else {
        resetGame();
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching game state:', error);
      toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not sync game state.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameDocRef, resetGame, toast]);

  const login = (name: string, emoji: string) => {
    const newPlayer: Player = { id: uuidv4(), name, emoji };
    setPlayer(newPlayer);
    toast({ title: `Welcome, ${name}!`, description: 'Get ready to splat!' });
  };

  const logout = () => {
    setPlayer(null);
  };
  
  const joinTeam = async (teamId: TeamId) => {
    if (!player || !game) return;
  
    const otherTeamId: TeamId = teamId === 'splatSquad' ? 'inkMasters' : 'splatSquad';
    const isPlayerInOtherTeam = game.teams[otherTeamId].players.some(p => p.id === player.id);
    const isPlayerInTeam = game.teams[teamId].players.some(p => p.id === player.id);

    if (isPlayerInTeam) {
        toast({ title: "You're already on this team!" });
        return;
    }

    const batch = writeBatch(db);
  
    // Add to new team
    batch.update(gameDocRef, {
      [`teams.${teamId}.players`]: arrayUnion(player)
    });
  
    // Remove from other team if exists
    if (isPlayerInOtherTeam) {
      const otherTeamPlayers = game.teams[otherTeamId].players.filter(p => p.id !== player.id);
      batch.update(gameDocRef, {
        [`teams.${otherTeamId}.players`]: otherTeamPlayers
      });
    }
  
    try {
      await batch.commit();
      toast({ title: 'Team Joined!', description: `You are now part of ${game.teams[teamId].name}!` });
    } catch (error) {
      console.error("Error joining team: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not join the team.' });
    }
  };

  const selectColor = async (teamId: TeamId, color: string) => {
    if (!game) return;
    const otherTeamId = teamId === 'splatSquad' ? 'inkMasters' : 'splatSquad';
    if (game.teams[otherTeamId].color === color) {
      toast({ variant: 'destructive', title: 'Color Taken!', description: 'The other team has already chosen this color.' });
      return;
    }
    try {
      await updateDoc(gameDocRef, { [`teams.${teamId}.color`]: color });
    } catch (error) {
      console.error("Error selecting color: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not select color.' });
    }
  };

  const voteToStart = async (duration: 15 | 30) => {
    if (!player || !game || game.status !== 'setup') return;

    const { splatSquad, inkMasters } = game.teams;
    if (splatSquad.players.length < 2 || inkMasters.players.length < 2) {
      toast({ variant: 'destructive', title: 'Not enough players!', description: 'Each team needs at least 2 players to start.' });
      return;
    }
    
    // Check if player has already voted
    const hasVoted15 = game.votes[15].includes(player.id);
    const hasVoted30 = game.votes[30].includes(player.id);
    if(hasVoted15 || hasVoted30) {
        toast({title: "You've already voted!"});
        return;
    }

    const firstVote = game.votes[15].length === 0 && game.votes[30].length === 0;

    const updates: any = {
      [`votes.${duration}`]: arrayUnion(player.id)
    };

    if (firstVote) {
      updates.status = 'playing';
      updates.gameStartTime = serverTimestamp();
      updates.gameDuration = duration;
      toast({ title: 'Game On!', description: `The match has started and will last ${duration} minutes!` });
    } else {
        toast({title: 'Vote Cast!', description: `You voted for a ${duration} minute game.`});
    }

    try {
      await updateDoc(gameDocRef, updates);
    } catch (error) {
      console.error("Error voting to start: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not start the game.' });
    }
  };
  
  const captureZone = async (zoneId: string) => {
    if (!player || !game || game.status !== 'playing') return;

    const playerTeamId = game.teams.splatSquad.players.some(p => p.id === player.id)
      ? 'splatSquad'
      : game.teams.inkMasters.players.some(p => p.id === player.id)
      ? 'inkMasters'
      : null;

    if (!playerTeamId) {
      toast({ variant: 'destructive', title: 'Not on a team!', description: 'You must join a team to capture zones.' });
      return;
    }

    const zone = game.zones.find(z => z.id === zoneId);
    if (!zone) {
      toast({ variant: 'destructive', title: 'Invalid Zone', description: 'This QR code is not for a valid zone.' });
      return;
    }
    
    if (zone.capturedBy === playerTeamId) {
        toast({ title: 'Zone Secured!', description: 'Your team already holds this zone.' });
        return;
    }

    const updatedZones = game.zones.map(z => 
      z.id === zoneId 
      ? { ...z, capturedBy: playerTeamId, capturedAt: Timestamp.now() } 
      : z
    );

    try {
      await updateDoc(gameDocRef, { zones: updatedZones });
      toast({ title: 'Zone Captured!', description: `You captured zone ${zoneId.split('-')[1].toUpperCase()} for your team!` });
      
      const allZonesCaptured = updatedZones.every(z => z.capturedBy === playerTeamId);
      if (allZonesCaptured) {
        await updateDoc(gameDocRef, {
            status: 'finished',
            winner: playerTeamId
        });
      }

    } catch (error) {
      console.error('Error capturing zone:', error);
      toast({ variant: 'destructive', title: 'Capture Failed', description: 'Could not capture the zone.' });
    }
  };

  return (
    <GameContext.Provider value={{ player, game, loading, login, logout, joinTeam, selectColor, voteToStart, captureZone, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};
