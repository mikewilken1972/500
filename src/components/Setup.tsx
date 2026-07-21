import React, { useState } from 'react';
import { Player } from '../types';
import { UserPlus, UserMinus, Play, Trophy, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SavedGames from './SavedGames';

interface SetupProps {
  onStart: (players: Player[], gameName: string) => void;
  onSelectGame: (gameId: string) => void;
}

export default function Setup({ onStart, onSelectGame }: SetupProps) {
  const [names, setNames] = useState<string[]>(['', '']);
  const [gameName, setGameName] = useState('');

  const addPlayer = () => {
    if (names.length < 6) {
      setNames([...names, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (names.length > 2) {
      setNames(names.filter((_, i) => i !== index));
    }
  };

  const updateName = (index: number, name: string) => {
    const newNames = [...names];
    newNames[index] = name;
    setNames(newNames);
  };

  const handleStart = () => {
    const validPlayers: Player[] = names
      .filter(name => name.trim() !== '')
      .map((name, i) => ({
        id: `p${i}`,
        name: name.trim()
      }));

    if (validPlayers.length >= 2) {
      onStart(validPlayers, gameName.trim() || `Spil ${new Date().toLocaleDateString('da-DK')}`);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-200">
            5
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">500 Pointtavle</h1>
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">Klargør nyt spil</p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          {/* Game Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Navn på spil</label>
            <div className="relative">
              <input
                type="text"
                placeholder="F.eks. Søndagshygge"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
              />
              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>

          {/* Players */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deltagere</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{names.length} / 6</span>
            </div>
            <AnimatePresence initial={false}>
              {names.map((name, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-2 group"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={`Spiller ${index + 1}`}
                      value={name}
                      onChange={(e) => updateName(index, e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent outline-none transition-all text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
                    />
                  </div>
                  {names.length > 2 && (
                    <button
                      onClick={() => removePlayer(index)}
                      className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      <UserMinus size={20} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {names.length < 6 && (
              <button
                onClick={addPlayer}
                className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold text-sm"
              >
                <UserPlus size={18} />
                Tilføj deltager
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={names.filter(n => n.trim() !== '').length < 2}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98] uppercase tracking-wide"
        >
          <Play size={22} fill="currentColor" />
          Begynd spillet
        </button>
      </div>

      <SavedGames onSelect={onSelectGame} />
    </div>
  );
}
