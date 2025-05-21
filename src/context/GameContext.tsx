import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { storeScore, getLeaderboard } from '../services/blockchain';
import { JsonRpcProvider } from 'ethers';

interface Score {
  address: string;
  score: number;
  timestamp: number;
}

interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'gameover';
  score: number;
  highScore: number;
  speed: number;
}

interface GameContextType {
  gameState: GameState;
  leaderboard: Score[];
  startGame: () => void;
  endGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  incrementScore: () => void;
  saveScore: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  resetGame: () => void;
  isLoading: boolean;
}

const GameContext = createContext<GameContextType>({
  gameState: { status: 'idle', score: 0, highScore: 0, speed: 5 },
  leaderboard: [],
  startGame: () => {},
  endGame: () => {},
  pauseGame: () => {},
  resumeGame: () => {},
  incrementScore: () => {},
  saveScore: async () => {},
  refreshLeaderboard: async () => {},
  isLoading: false,
  resetGame: () => {},
});

export const useGame = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isConnected, account, signer } = useWallet();
  const [gameState, setGameState] = useState<GameState>({
    status: 'idle',
    score: 0,
    highScore: 0,
    speed: 5,
  });
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load high score from localStorage on init
  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(savedHighScore, 10) }));
    }
  }, []);

  // Update high score when score changes
  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      setGameState(prev => ({ ...prev, highScore: prev.score }));
      localStorage.setItem('highScore', gameState.score.toString());
    }
  }, [gameState.score]);

  // Update game speed based on score
  useEffect(() => {
    const newSpeed = 5 + Math.floor(gameState.score / 10);
    setGameState(prev => ({ ...prev, speed: newSpeed }));
  }, [gameState.score]);

  // Load leaderboard on mount and when connection status changes
  useEffect(() => {
    if (isConnected) {
      refreshLeaderboard();
    }
  }, [isConnected]);

  const startGame = () => {
    setGameState({
      status: 'playing',
      score: 0,
      highScore: gameState.highScore,
      speed: 5,
    });
  };

  const resetGame = () => {
    setGameState({
      status: 'idle',
      score: 0,
      highScore: gameState.highScore, // keep high score
      speed: 5,
    });
  };
  
  const endGame = () => {
    setGameState(prev => ({ ...prev, status: 'gameover' }));
  };

  const pauseGame = () => {
    if (gameState.status === 'playing') {
      setGameState(prev => ({ ...prev, status: 'paused' }));
    }
  };

  const resumeGame = () => {
    if (gameState.status === 'paused') {
      setGameState(prev => ({ ...prev, status: 'playing' }));
    }
  };

  const incrementScore = () => {
    setGameState(prev => ({ ...prev, score: prev.score + 1 }));
  };

  const saveScore = async () => {
    if (!isConnected || !signer || !account) return;
    
    setIsLoading(true);
    try {
      await storeScore(signer, gameState.score);
      await refreshLeaderboard();
      setGameState(prev => ({ ...prev, status: 'idle' }));
    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeaderboard = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      if (!signer || !signer.provider) {
        throw new Error('Signer or provider is not available');
      }
      const scores = await getLeaderboard(signer.provider as unknown as JsonRpcProvider);
      setLeaderboard(scores);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        leaderboard,
        startGame,
        endGame,
        pauseGame,
        resumeGame,
        incrementScore,
        saveScore,
        refreshLeaderboard,
        isLoading,
        resetGame
      }}
    >
      {children}
    </GameContext.Provider>
  );
};