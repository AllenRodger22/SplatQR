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
    splatSquad: { name: 'Time A', color: '#FF00FF', players: [] },
    inkMasters: { name: 'Time B', color: '#00FFFF', players: [] },
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
      toast({ title: 'Jogo Reiniciado!', description: 'Pronto para uma nova partida.' });
    } catch (error) {
      console.error('Error resetting game:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível reiniciar o jogo.' });
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
      toast({ variant: 'destructive', title: 'Erro de Conexão', description: 'Não foi possível sincronizar o estado do jogo.' });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameDocRef, resetGame, toast]);

  const login = (name: string, emoji: string) => {
    const newPlayer: Player = { id: uuidv4(), name, emoji };
    setPlayer(newPlayer);
    toast({ title: `Bem-vindo, ${name}!`, description: 'Prepare-se para a batalha!' });
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
        toast({ title: "Você já está nesta equipe!" });
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
      toast({ title: 'Entrou na Equipe!', description: `Você agora faz parte do ${game.teams[teamId].name}!` });
    } catch (error) {
      console.error("Error joining team: ", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível entrar na equipe.' });
    }
  };

  const selectColor = async (teamId: TeamId, color: string) => {
    if (!game) return;
    const otherTeamId = teamId === 'splatSquad' ? 'inkMasters' : 'splatSquad';
    if (game.teams[otherTeamId].color === color) {
      toast({ variant: 'destructive', title: 'Cor já escolhida!', description: 'A outra equipe já escolheu esta cor.' });
      return;
    }
    try {
      await updateDoc(gameDocRef, { [`teams.${teamId}.color`]: color });
    } catch (error) {
      console.error("Error selecting color: ", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível selecionar a cor.' });
    }
  };

  const voteToStart = async (duration: 15 | 30) => {
    if (!player || !game || game.status !== 'setup') return;

    const { splatSquad, inkMasters } = game.teams;
    // Allow starting with at least one player in one team
    if (splatSquad.players.length < 1 && inkMasters.players.length < 1) {
      toast({ variant: 'destructive', title: 'Jogadores insuficientes!', description: 'Pelo menos um jogador precisa estar em uma equipe para começar.' });
      return;
    }
    
    // Check if player has already voted
    const hasVoted15 = game.votes[15].includes(player.id);
    const hasVoted30 = game.votes[30].includes(player.id);
    if(hasVoted15 || hasVoted30) {
        toast({title: "Você já votou!"});
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
      toast({ title: 'Jogo Começou!', description: `A partida começou e durará ${duration} minutos!` });
    } else {
        toast({title: 'Voto Computado!', description: `Você votou por um jogo de ${duration} minutos.`});
    }

    try {
      await updateDoc(gameDocRef, updates);
    } catch (error) {
      console.error("Error voting to start: ", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar o jogo.' });
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
      toast({ variant: 'destructive', title: 'Você não está em uma equipe!', description: 'Você deve se juntar a uma equipe para capturar zonas.' });
      return;
    }

    const zone = game.zones.find(z => z.id === zoneId);
    if (!zone) {
      toast({ variant: 'destructive', title: 'Zona Inválida', description: 'Este QR code não corresponde a uma zona válida.' });
      return;
    }

    const updatedZones = game.zones.map(z => 
      z.id === zoneId 
      ? { ...z, capturedBy: playerTeamId, capturedAt: Timestamp.now() } 
      : z
    );

    try {
      await updateDoc(gameDocRef, { zones: updatedZones });
      toast({ title: 'Zona Capturada!', description: `Você capturou a zona ${zoneId.split('-')[1].toUpperCase()} para sua equipe!` });
      
      const allZonesCaptured = updatedZones.every(z => z.capturedBy === playerTeamId);
      if (allZonesCaptured) {
        await updateDoc(gameDocRef, {
            status: 'finished',
            winner: playerTeamId
        });
      }

    } catch (error) {
      console.error('Error capturing zone:', error);
      toast({ variant: 'destructive', title: 'Captura Falhou', description: 'Não foi possível capturar a zona.' });
    }
  };

  return (
    <GameContext.Provider value={{ player, game, loading, login, logout, joinTeam, selectColor, voteToStart, captureZone, resetGame }}>
      {children}
    </GameContext.Provider>
  );
};
