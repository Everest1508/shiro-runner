import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Play, Pause } from 'lucide-react';
import GameOver from './GameOver';

const Game: React.FC = () => {
  const { gameState, startGame, incrementScore, endGame, pauseGame, resumeGame } = useGame();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLImageElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [obstacles, setObstacles] = useState<{ id: number; left: number }[]>([]);
  const obstacleIdRef = useRef(0);
  const lastObstacleTimeRef = useRef(0);
  const [frameIndex, setFrameIndex] = useState(0);


  useEffect(() => {
    if (gameState.status === 'idle') {
      setObstacles([]);
      obstacleIdRef.current = 0;
      lastObstacleTimeRef.current = 0;
    }
  }, [gameState.status]);

  useEffect(() => {
    if (gameState.status !== 'playing') return;
  
    const frameCount = 9;
    const frameDuration = 100; // ms between frames
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frameCount);
    }, frameDuration);
  
    return () => clearInterval(interval);
  }, [gameState.status]);
  
  
  
  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (gameState.status === 'idle') {
          startGame();
        } else if (gameState.status === 'playing') {
          jump();
        } else if (gameState.status === 'paused') {
          resumeGame();
        }
      } else if (e.code === 'Escape' && gameState.status === 'playing') {
        pauseGame();
      } else if (e.code === 'Escape' && gameState.status === 'paused') {
        resumeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status]);

  // Jumping function
  const jump = useCallback(() => {
    if (!playerRef.current) return;
    
    if (playerRef.current.classList.contains('player-jump')) return;
    
    playerRef.current.classList.add('player-jump');
    setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.classList.remove('player-jump');
      }
    }, 500);
  }, []);

  // Handle touch events for mobile
  const handleTouch = useCallback(() => {
    if (gameState.status === 'idle') {
      startGame();
    } else if (gameState.status === 'playing') {
      jump();
    } else if (gameState.status === 'paused') {
      resumeGame();
    }
  }, [gameState.status, startGame, jump, resumeGame]);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    let lastTimestamp = 0;
    const obstacleSpeed = 5 + gameState.speed * 0.5;

    const gameLoop = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Generate new obstacles
      const now = Date.now();
      const minGap = Math.max(1000, 2000 - gameState.speed * 100);
      if (now - lastObstacleTimeRef.current > minGap) {
        setObstacles(prev => [...prev, { id: obstacleIdRef.current++, left: 100 }]);
        lastObstacleTimeRef.current = now;
      }

      // Update obstacle positions
      setObstacles(prev => {
        const newObstacles = prev
          .map(obs => ({
            ...obs,
            left: obs.left - (obstacleSpeed * deltaTime) / 100,
          }))
          .filter(obs => obs.left > -10);

        // Check for collisions
        if (playerRef.current && gameContainerRef.current) {
          const playerRect = playerRef.current.getBoundingClientRect();
          const containerRect = gameContainerRef.current.getBoundingClientRect();

          for (const obstacle of newObstacles) {
            const obstacleLeft = (obstacle.left * containerRect.width) / 100;
            const obstacleWidth = 30;
            const obstacleRight = obstacleLeft + obstacleWidth;

            const playerLeft = playerRect.left - containerRect.left;
            const playerRight = playerRect.right - containerRect.left;

            if (
              obstacleRight > playerLeft &&
              obstacleLeft < playerRight &&
              !playerRef.current.classList.contains('player-jump')
            ) {
              endGame();
              return newObstacles;
            }
          }

          // Score points for passed obstacles
          const passedObstacles = prev.filter(
            obs => obs.left < 20 && !newObstacles.find(o => o.id === obs.id)
          );
          if (passedObstacles.length > 0) {
            incrementScore();
          }
        }

        return newObstacles;
      });

      if (gameState.status === 'playing') {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState.status, gameState.speed, endGame, incrementScore]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  if (gameState.status === 'idle') {
    return (
      <div className="game-container flex flex-col items-center justify-center" ref={gameContainerRef}>
        <h2 className="text-3xl font-bold mb-6">Shiro Runner</h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Jump over obstacles and collect points. Your score is saved on the blockchain!
        </p>
        <button 
          className="btn btn-primary text-lg px-8 py-3 animate-pulse"
          onClick={startGame}
        >
          Start Game
        </button>
        <p className="text-gray-500 mt-4 text-sm">Press SPACE to jump</p>
      </div>
    );
  }

  if (gameState.status === 'paused') {
    return (
      <div className="game-container flex flex-col items-center justify-center" ref={gameContainerRef}>
        <h2 className="text-3xl font-bold mb-6">Game Paused</h2>
        <button 
          className="btn btn-primary text-lg px-8 py-3"
          onClick={resumeGame}
        >
          Resume Game
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {gameState.status === 'gameover' && <GameOver />}
      <div className="flex justify-between items-center mb-4">
        <div className="glass-panel py-2 px-4">
          <span className="font-medium">Score: </span>
          <span className="text-primary-500 font-bold">{gameState.score}</span>
        </div>
        <div className="glass-panel py-2 px-4">
          <span className="font-medium">High Score: </span>
          <span className="text-primary-500 font-bold">{gameState.highScore}</span>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={gameState.status === 'playing' ? pauseGame : resumeGame}
        >
          {gameState.status === 'playing' ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
      
      <div 
        className="game-container bg-gradient-to-b from-sky-700 to-sky-300 border border-dark-600 select-none cursor-pointer"
        ref={gameContainerRef}
        onClick={handleTouch}
        onTouchStart={handleTouch}
      >
        {/* Ground */}
        <div className="absolute bottom-0 left-0 w-full h-[50px] bg-dark-600"></div>
        
        {/* Player */}
        <img
          ref={playerRef}
          src={`/images/shiro/${frameIndex + 1}.png`}
          alt="Player"
          className="absolute bottom-[50px] left-[100px] w-[70px] h-[100px]"
        />


        {obstacles.map(obstacle => (
          <img 
            key={obstacle.id}
            src="/images/obstacles.png"
            alt="Obstacle"
            className="absolute bottom-[50px] w-[60px] h-[60px]"
            style={{
              left: `${obstacle.left}%`,
            }}
          />
        ))}

      </div>
    </div>
  );
};

export default Game;