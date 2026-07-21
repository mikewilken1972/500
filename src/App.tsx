/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Setup from './components/Setup';
import ScoreBoard from './components/ScoreBoard';
import AddRound from './components/AddRound';
import { Player, Round, GameState } from './types';
import { db } from './lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = '500_current_game_id';

export default function App() {
  const [currentGameId, setCurrentGameId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const [gameState, setGameState] = useState<GameState>({
    id: '',
    name: '',
    players: [],
    rounds: [],
    status: 'setup'
  });

  const [isAddingRound, setIsAddingRound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentGameId) {
      setGameState({
        id: '',
        name: '',
        players: [],
        rounds: [],
        status: 'setup'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(doc(db, 'games', currentGameId), (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data() as GameState);
      } else {
        // Game might have been deleted
        setCurrentGameId(null);
        localStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentGameId]);

  const updateFirebase = async (newState: GameState) => {
    if (!newState.id) return;
    try {
      await setDoc(doc(db, 'games', newState.id), {
        ...newState,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error updating Firebase', e);
    }
  };

  const handleStart = (players: Player[], gameName: string) => {
    const gameId = Date.now().toString();
    const newState: GameState = {
      id: gameId,
      name: gameName,
      players,
      rounds: [],
      status: 'playing'
    };
    setCurrentGameId(gameId);
    localStorage.setItem(STORAGE_KEY, gameId);
    updateFirebase(newState);
  };

  const handleSelectGame = (gameId: string) => {
    setCurrentGameId(gameId);
    localStorage.setItem(STORAGE_KEY, gameId);
  };

  const handleReset = () => {
    if (confirm('Er du sikker på, at du vil afslutte dette spil og gå til hovedmenuen? (Spillet slettes ikke fra historikken)')) {
      setCurrentGameId(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleAddRound = (scores: Record<string, number>) => {
    const newRound: Round = {
      id: Date.now().toString(),
      scores
    };

    const newState: GameState = {
      ...gameState,
      rounds: [...gameState.rounds, newRound]
    };
    updateFirebase(newState);
    setIsAddingRound(false);
  };

  const handleDeleteRound = (roundId: string) => {
    const newState: GameState = {
      ...gameState,
      rounds: gameState.rounds.filter(r => r.id !== roundId)
    };
    updateFirebase(newState);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Henter data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <header className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl cursor-pointer hover:bg-indigo-400 transition-colors"
            onClick={() => {
              setCurrentGameId(null);
              localStorage.removeItem(STORAGE_KEY);
            }}
          >
            5
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">
              {gameState.status === 'playing' ? gameState.name : '500 Pointtavle'}
            </h1>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
              {gameState.status === 'playing' ? `Aktivt spil • ${gameState.players.length} spillere` : 'Velkommen'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {gameState.status === 'playing' && (
            <>
              <button 
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded border border-slate-700 text-sm font-medium transition-colors"
              >
                Menu
              </button>
              <button 
                onClick={() => setIsAddingRound(true)}
                className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded font-bold text-sm shadow-inner transition-colors"
              >
                NY RUNDE +
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {gameState.status === 'setup' ? (
          <div className="h-full overflow-y-auto py-12 px-4">
            <Setup onStart={handleStart} onSelectGame={handleSelectGame} />
          </div>
        ) : (
          <ScoreBoard 
            players={gameState.players} 
            rounds={gameState.rounds}
            onAddRound={() => setIsAddingRound(true)}
            onReset={handleReset}
            onDeleteRound={handleDeleteRound}
          />
        )}

        {isAddingRound && (
          <AddRound 
            players={gameState.players}
            onAdd={handleAddRound}
            onCancel={() => setIsAddingRound(false)}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 flex justify-between items-center text-slate-500 text-xs font-medium shrink-0">
        <div className="flex gap-6">
          <span>{gameState.status === 'playing' ? `Runder: ${gameState.rounds.length}` : 'Klar til spil'}</span>
          <span>{gameState.players.length > 0 ? `Spillere: ${gameState.players.length}` : 'Ingen spillere valgt'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
          System aktiv
        </div>
      </footer>
    </div>
  );
}
