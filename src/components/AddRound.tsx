import React, { useState } from 'react';
import { Player } from '../types';
import { X, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface AddRoundProps {
  players: Player[];
  onAdd: (scores: Record<string, number>) => void;
  onCancel: () => void;
}

export default function AddRound({ players, onAdd, onCancel }: AddRoundProps) {
  const [scores, setScores] = useState<Record<string, string>>(
    players.reduce((acc, p) => ({ ...acc, [p.id]: '' }), {})
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalScores: Record<string, number> = {};
    players.forEach(p => {
      finalScores[p.id] = parseInt(scores[p.id]) || 0;
    });
    onAdd(finalScores);
  };

  const updateScore = (playerId: string, value: string) => {
    // Only allow numbers and minus sign
    if (value === '' || value === '-' || !isNaN(parseInt(value))) {
      setScores(prev => ({ ...prev, [playerId]: value }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight uppercase">Indtast point</h2>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Ny runde resultater</p>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                <label className="flex-1 font-bold text-slate-700">{player.name}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus={players.indexOf(player) === 0}
                  value={scores[player.id]}
                  onChange={(e) => updateScore(player.id, e.target.value)}
                  placeholder="0"
                  className="w-24 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-right font-mono font-black text-xl text-slate-900 shadow-inner"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 hover:text-slate-700 transition-all uppercase text-xs tracking-widest"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              <Check size={18} />
              Gem runde
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
