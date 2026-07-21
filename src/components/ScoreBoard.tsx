import React from 'react';
import { Player, Round } from '../types';
import { motion } from 'motion/react';
import { Trash2, RotateCcw } from 'lucide-react';

interface ScoreBoardProps {
  players: Player[];
  rounds: Round[];
  onAddRound: () => void;
  onReset: () => void;
  onDeleteRound: (roundId: string) => void;
}

export default function ScoreBoard({ players, rounds, onAddRound, onReset, onDeleteRound }: ScoreBoardProps) {
  const totals = players.reduce((acc, player) => {
    acc[player.id] = rounds.reduce((sum, round) => sum + (round.scores[player.id] || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const hasWinner = Object.values(totals).some(score => score >= 500);
  const winner = hasWinner 
    ? players.reduce((prev, curr) => (totals[curr.id] > totals[prev.id] ? curr : prev))
    : null;

  return (
    <div className="grid grid-cols-12 h-full gap-0 overflow-hidden">
      {/* Sidebar: Round History */}
      <aside className="col-span-12 lg:col-span-3 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Runde Historik</h3>
          <button 
            onClick={onReset}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-tighter transition-colors"
          >
            Nulstil spil
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white border-b border-slate-100 shadow-sm z-10">
              <tr className="text-slate-400 text-[10px] uppercase font-bold">
                <th className="p-3">Rnd</th>
                <th className="p-3">Detaljer</th>
                <th className="p-3 text-right">Slet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rounds.slice().reverse().map((round, index) => {
                const roundIndex = rounds.length - index;
                return (
                  <motion.tr 
                    key={round.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-3 font-mono text-slate-400">{roundIndex.toString().padStart(2, '0')}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {players.map(p => (
                          <span key={p.id} className={`text-[10px] font-medium px-1 rounded ${round.scores[p.id] >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {p.name.charAt(0)}: {round.scores[p.id] > 0 ? '+' : ''}{round.scores[p.id]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => onDeleteRound(round.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
              {rounds.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 italic text-xs">
                    Ingen runder endnu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-900 text-slate-300 text-[10px] uppercase leading-relaxed shrink-0">
          <p className="mb-2 font-bold text-white">Point Guide</p>
          <div className="flex justify-between">
            <span>Spar / Klør / Ruder</span>
            <span>40 / 60 / 80</span>
          </div>
          <div className="flex justify-between">
            <span>Hjerter / Uden</span>
            <span>100 / 120</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 italic">
            +100 pr. overstik efter 6.
          </div>
        </div>
      </aside>

      {/* Main Content: Player Scores */}
      <div className="col-span-12 lg:col-span-9 p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-100 overflow-y-auto">
        {players.map((player) => {
          const score = totals[player.id];
          const isWinner = score >= 500;
          const isLeading = !isWinner && score === Math.max(...Object.values(totals));
          const isAtRisk = score < 0;

          return (
            <motion.div 
              key={player.id}
              layout
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between relative overflow-hidden h-[240px]"
            >
              <div className="z-10">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spiller {players.indexOf(player) + 1}</h2>
                  {isWinner && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm animate-bounce">VINDER</span>
                  )}
                  {isLeading && !isWinner && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded">FØRER</span>
                  )}
                  {isAtRisk && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded">I FARE</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-800">{player.name}</div>
              </div>

              <div className={`text-8xl font-black tracking-tighter ${score < 0 ? 'text-rose-600 italic' : 'text-slate-900'}`}>
                {score}
              </div>

              <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none">
                <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </motion.div>
          );
        })}

        {hasWinner && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full bg-indigo-600 p-8 rounded-3xl text-white text-center shadow-xl shadow-indigo-200 mt-4"
          >
            <h2 className="text-4xl font-black mb-2">SPIL SLUT!</h2>
            <p className="text-indigo-100 text-xl font-medium">
              {winner?.name} har vundet med {totals[winner!.id]} point.
            </p>
            <button 
              onClick={onReset}
              className="mt-6 px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Start nyt spil
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
