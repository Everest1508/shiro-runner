import React from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { Trophy, Save, RefreshCw as Refresh } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';

const GameOver: React.FC = () => {
  const { gameState, startGame, saveScore, isLoading, resetGame } = useGame();
  const { width, height } = useWindowSize();
  const isNewHighScore = gameState.score === gameState.highScore && gameState.score > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
      {isNewHighScore && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      <motion.div 
        className="glass-panel p-8 w-full max-w-md mx-4 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={() => startGame()}
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center mb-2">Game Over</h2>
        
        {isNewHighScore && (
          <div className="flex items-center justify-center gap-2 text-warning-500 mb-4">
            <Trophy size={24} />
            <span className="text-lg font-medium">New High Score!</span>
          </div>
        )}
        
        <div className="bg-dark-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Score:</span>
            <span className="font-bold text-primary-500">{gameState.score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">High Score:</span>
            <span className="font-bold">{gameState.highScore}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            className="btn btn-primary flex items-center justify-center gap-2"
            onClick={saveScore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Score to Blockchain</span>
              </>
            )}
          </button>
          
          <button 
            className="btn btn-secondary flex items-center justify-center gap-2"
            onClick={resetGame}
          >
            <Refresh size={18} />
            <span>Play Again</span>
          </button>
          <a
            className="btn btn-accent flex items-center justify-center gap-2"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `I just scored ${gameState.score} in Shiro Runner! 🏃‍♂️ Can you beat me? Play now: https://shiro-runner.vercel.app`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
            </svg>
            <span>Share on Twitter</span>
          </a>

        </div>
      </motion.div>
    </div>
  );
};

export default GameOver;