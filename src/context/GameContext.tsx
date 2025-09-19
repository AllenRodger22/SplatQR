'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, Timestamp, writeBatch, collection, getDocs, addDoc, getDoc } from 'firebase/firestore';
import type { Game, Player, TeamId, CaptureStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ZONE_DEFINITIONS } from '@/lib/zones';

const createDefaultCaptureStats = (): CaptureStats => ({
  totalCaptures: { splatSquad: 0, inkMasters: 0 },
  recaptures: { splatSquad: 0, inkMasters: 0 },
});

const normalizeCaptureStats = (stats?: CaptureStats): CaptureStats => {
  const defaults = createDefaultCaptureStats();
  if (!stats) {
    return defaults;
  }

  return {
    totalCaptures: {
      splatSquad: stats.totalCaptures?.splatSquad ?? defaults.totalCaptures.splatSquad,
      inkMasters: stats.totalCaptures?.inkMasters ?? defaults.totalCaptures.inkMasters,
    },
    recaptures: {
      splatSquad: stats.recaptures?.splatSquad ?? defaults.recaptures.splatSquad,
      inkMasters: stats.recaptures?.inkMasters ?? defaults.recaptures.inkMasters,
    },
  };
};

const createDefaultGame = (): Game => ({
  status: 'setup',
  teams: {
    splatSquad: { name: 'Time A', color: '#FF00FF', players: [] },
    inkMasters: { name: 'Time B', color: '#00FFFF', players: [] },
  },
  zones: ZONE_DEFINITIONS.map(({ id }) => ({
    id,
    capturedBy: null,
    capturedAt: null,
  })),
  gameDuration: 15,
  gameStartTime: null,
  votes: { 15: [], 30: [] },
  winner: null,
  readyPlayers: [],
  captureStats: createDefaultCaptureStats(),
});

interface GameContextType {
  user: User | null;
  player: Player | null;
  game: Game | null;
  loading: boolean;
  gameId: string | null;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  joinTeam: (teamId: TeamId) => Promise<void>;
  selectColor: (teamId: TeamId, color: string) => Promise<void>;
  voteToStart: (duration: 15 | 30) => Promise<void>;
  captureZone: (zoneId: string) => Promise<void>;
  resetGame: () => Promise<void>;
  toggleReady: () => Promise<void>;
  setGameId: (gameId: string | null) => void;
}

export const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user);
        if (user) {
            const playerDocRef = doc(db, 'players', user.uid);
            const playerDoc = await getDoc(playerDocRef);
            if (playerDoc.exists()) {
                setPlayer({ id: user.uid, ...playerDoc.data() } as Player);
            } else {
                // Auto-create player on first login
                const newPlayer = {
                    name: user.displayName || 'Jogador Anônimo',
                    emoji: '🦑',
                };
                await setDoc(playerDocRef, newPlayer);
                setPlayer({ id: user.uid, ...newPlayer });
            }
        } else {
            setPlayer(null);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  const resetGame = useCallback(async () => {
    if (!gameId || !db) return;
    const gameDocRef = doc(db, 'games', gameId);
    try {
      const captureEventsRef = collection(db, 'games', gameId, 'captureEvents');
      const captureEvents = await getDocs(captureEventsRef);

      if (!captureEvents.empty) {
        const deletionBatch = writeBatch(db);
        captureEvents.forEach((eventDoc) => {
          deletionBatch.delete(eventDoc.ref);
        });
        await deletionBatch.commit();
      }

      await setDoc(gameDocRef, createDefaultGame());
      toast({ title: 'Jogo Reiniciado!', description: 'Pronto para uma nova partida.' });
    } catch (error) {
      console.error('Error resetting game:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível reiniciar o jogo.' });
    }
  }, [gameId, toast]);

  useEffect(() => {
    if (!gameId || !db) {
      setGame(null);
      return;
    }
    setLoading(true);
    const gameDocRef = doc(db, 'games', gameId);

    const unsubscribe = onSnapshot(gameDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        const gameData = rawData as Game;
        if (!gameData.readyPlayers) gameData.readyPlayers = [];
        
        const captureStats = normalizeCaptureStats(gameData.captureStats);
        gameData.captureStats = captureStats;
        
        if (!('captureStats' in rawData) || !rawData.captureStats) {
          updateDoc(gameDocRef, { captureStats }).catch((error) =>
            console.error('Error updating capture stats metadata:', error)
          );
        }
        setGame(gameData);
      } else {
        await setDoc(gameDocRef, createDefaultGame());
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching game state:', error);
      toast({ variant: 'destructive', title: 'Erro de Conexão', description: 'Não foi possível sincronizar o estado do jogo.' });
      setGame(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId, toast]);

  const signInWithGoogle = async (): Promise<User | null> => {
    if (!auth) return null;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      toast({ title: 'Login bem-sucedido!', description: `Bem-vindo, ${result.user.displayName}!` });
      return result.user;
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro de Login', description: 'Não foi possível fazer login com o Google.' });
      console.error("Google sign-in error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        setUser(null);
        setPlayer(null);
        toast({ title: 'Você saiu.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro ao Sair', description: error.message });
    }
  };
  
  const joinTeam = async (teamId: TeamId) => {
    if (!player || !game || !gameId || !db) return;
    const gameDocRef = doc(db, 'games', gameId);

    if (game.status !== 'setup') {
      toast({
        variant: 'destructive',
        title: 'Jogo em andamento',
        description: 'Não é possível trocar de equipe durante uma partida ativa.'
      });
      return;
    }
  
    const otherTeamId: TeamId = teamId === 'splatSquad' ? 'inkMasters' : 'splatSquad';
    const isPlayerInOtherTeam = game.teams[otherTeamId].players.some(p => p.id === player.id);
    const isPlayerInTeam = game.teams[teamId].players.some(p => p.id === player.id);

    if (isPlayerInTeam) {
        toast({ title: "Você já está nesta equipe!" });
        return;
    }
    
    if (game.readyPlayers.includes(player.id)) {
      toast({ variant: 'destructive', title: "Você já está pronto!", description: "Não é possível trocar de time."});
      return;
    }

    const batch = writeBatch(db);
  
    batch.update(gameDocRef, {
      [`teams.${teamId}.players`]: arrayUnion(player)
    });
  
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
    if (!game || !player || !gameId || !db) return;
    const gameDocRef = doc(db, 'games', gameId);

    if (game.status !== 'setup') {
      toast({
        variant: 'destructive',
        title: 'Jogo em andamento',
        description: 'A cor da equipe só pode ser alterada antes da partida começar.'
      });
      return;
    }

    if (game.readyPlayers.includes(player.id)) {
        toast({ variant: 'destructive', title: "Você já está pronto!", description: "Não é possível trocar a cor."});
        return;
    }

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
    if (!player || !game || !gameId || game.status !== 'setup' || !db) return;
    const gameDocRef = doc(db, 'games', gameId);

    if (game.readyPlayers.includes(player.id)) {
      toast({ variant: 'destructive', title: "Você já está pronto!", description: "Não é possível votar agora."});
      return;
    }
    
    const hasVoted15 = game.votes[15].includes(player.id);
    const hasVoted30 = game.votes[30].includes(player.id);
    if(hasVoted15 || hasVoted30) {
        toast({title: "Você já votou!"});
        return;
    }

    const updates: any = {
      [`votes.${duration}`]: arrayUnion(player.id)
    };

    toast({title: 'Voto Computado!', description: `Você votou por um jogo de ${duration} minutos.`});

    try {
      await updateDoc(gameDocRef, updates);
    } catch (error) {
      console.error("Error voting to start: ", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível registrar seu voto.' });
    }
  };

  const toggleReady = async () => {
    if (!player || !game || !gameId || !db) return;
    const gameDocRef = doc(db, 'games', gameId);

    if (game.status !== 'setup') {
      toast({
        variant: 'destructive',
        title: 'Jogo em andamento',
        description: 'O status de pronto só pode ser alterado no lobby.'
      });
      return;
    }

    const isReady = game.readyPlayers.includes(player.id);

    const updates: any = {};
    if (isReady) {
      updates.readyPlayers = arrayRemove(player.id);
      toast({ title: 'Você não está mais pronto.' });
    } else {
      const isInATeam = game.teams.splatSquad.players.some(p => p.id === player.id) || game.teams.inkMasters.players.some(p => p.id === player.id);
      if (!isInATeam) {
        toast({ variant: 'destructive', title: 'Entre em um time!', description: 'Você precisa estar em um time para ficar pronto.' });
        return;
      }
      updates.readyPlayers = arrayUnion(player.id);
      toast({ title: 'Você está pronto!' });
    }

    const allPlayersInTeams = [...game.teams.splatSquad.players, ...game.teams.inkMasters.players];
    const newReadyPlayers = isReady 
      ? game.readyPlayers.filter(id => id !== player.id) 
      : [...game.readyPlayers, player.id];

    const allPlayersReady = allPlayersInTeams.length > 0 && allPlayersInTeams.every(p => newReadyPlayers.includes(p.id));

    if (allPlayersReady) {
      const voteCount15 = game.votes[15].length;
      const voteCount30 = game.votes[30].length;
      const duration = voteCount30 > voteCount15 ? 30 : 15;

      updates.status = 'playing';
      updates.gameStartTime = serverTimestamp();
      updates.gameDuration = duration;
      toast({ title: 'O Jogo Começou!', description: `Todos estão prontos! A partida durará ${duration} minutos.` });
    }

    try {
      await updateDoc(gameDocRef, updates);
    } catch (error) {
      console.error("Error toggling ready state:", error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar seu status.' });
    }
  };
  
  const captureZone = async (zoneId: string) => {
    if (!player || !game || !gameId || game.status !== 'playing' || !db) return;
    const gameDocRef = doc(db, 'games', gameId);

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

    const previousOwner = zone.capturedBy;
    const isRepeatCapture = previousOwner === playerTeamId;
    const isRecapture = previousOwner !== null && previousOwner !== playerTeamId;

    const updatedZones = game.zones.map(z =>
      z.id === zoneId
        ? { ...z, capturedBy: playerTeamId, capturedAt: Timestamp.now() }
        : z
    );

    const currentStats = normalizeCaptureStats(game.captureStats);
    const updatedStats: CaptureStats = {
      totalCaptures: { ...currentStats.totalCaptures },
      recaptures: { ...currentStats.recaptures },
    };

    if (!isRepeatCapture) {
      updatedStats.totalCaptures[playerTeamId] = (updatedStats.totalCaptures[playerTeamId] ?? 0) + 1;
      if (isRecapture) {
        updatedStats.recaptures[playerTeamId] = (updatedStats.recaptures[playerTeamId] ?? 0) + 1;
      }
    }

    try {
      await updateDoc(gameDocRef, {
        zones: updatedZones,
        captureStats: updatedStats,
      });

      if (!isRepeatCapture) {
        await addDoc(collection(db, 'games', gameId, 'captureEvents'), {
          zoneId,
          teamId: playerTeamId,
          playerId: player.id,
          timestamp: serverTimestamp(),
          isRecapture,
        });
      }

      const zoneLabel = zoneId.split('-')[1].toUpperCase();
      if (isRepeatCapture) {
        toast({
          title: 'Zona Protegida!',
          description: `Sua equipe já controla a zona ${zoneLabel}. Continuem firmes!`,
        });
      } else {
        toast({
          title: isRecapture ? 'Zona Reconquistada!' : 'Zona Capturada!',
          description: `${isRecapture ? 'Você retomou' : 'Você capturou'} a zona ${zoneLabel} para sua equipe!`,
        });
      }

      const allZonesCaptured = updatedZones.every(z => z.capturedBy === playerTeamId);
      if (allZonesCaptured) {
        await updateDoc(gameDocRef, {
          status: 'finished',
          winner: playerTeamId,
        });
      }
    } catch (error) {
      console.error('Error capturing zone:', error);
      toast({ variant: 'destructive', title: 'Captura Falhou', description: 'Não foi possível capturar a zona.' });
    }
  };

  return (
    <GameContext.Provider value={{ user, player, game, loading, gameId, setGameId, signInWithGoogle, logout, joinTeam, selectColor, voteToStart, captureZone, resetGame, toggleReady }}>
      {children}
    </GameContext.Provider>
  );
};
