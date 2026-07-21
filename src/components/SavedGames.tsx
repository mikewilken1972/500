import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { GameState } from '../types';
import { History, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SavedGamesProps {
  onSelect: (gameId: string) => void;
}

export default function SavedGames({ onSelect }: SavedGamesProps) {
  const [games, setGames] = useState<GameState[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'games'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const gameList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GameState[];
      setGames(gameList);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDelete = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    if (confirm('Er du sikker på, at du vil slette dette spil?')) {
      try {
        await deleteDoc(doc(db, 'games', gameId));
      } catch (err) {
        console.error('Error deleting game', err);
      }
    }
  };

  if (loading) return null;
  if (games.length === 0) return null;

  return (
    <div className="mt-12 space-y-4">
      <div className="flex items-center gap-2 px-1">
        <History size={16} className="text-slate-400" />
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gemte spil</h3>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {games.map((game) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelect(game.id)}
              className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <History size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">{game.name || 'Uden navn'}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      {game.players.length} spillere
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      {game.rounds.length} runder
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(e, game.id)}
                  className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-indigo-300 transition-colors" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
