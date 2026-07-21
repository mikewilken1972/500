export interface Player {
  id: string;
  name: string;
}

export interface Round {
  id: string;
  scores: Record<string, number>; // playerId -> score
}

export interface GameState {
  players: Player[];
  rounds: Round[];
  status: 'setup' | 'playing' | 'finished';
}
