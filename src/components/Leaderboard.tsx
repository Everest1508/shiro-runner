import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, RefreshCw } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const { leaderboard, refreshLeaderboard, isLoading } = useGame();

  useEffect(() => {
    refreshLeaderboard();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-primary-500" />
          Global Leaderboard
        </h2>
        <button 
          className="btn btn-secondary flex items-center gap-2"
          onClick={() => refreshLeaderboard()}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No scores have been recorded yet.</p>
          <p className="mt-2">Be the first to add your score to the blockchain!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Player</th>
                <th className="text-left py-3 px-4">Score</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-dark-700 hover:bg-dark-700/50 transition-colors ${
                    index === 0 ? 'bg-dark-700/30' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    {index === 0 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-warning-500 text-dark-900 rounded-full font-bold">1</span>
                    ) : index === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-400 text-dark-900 rounded-full font-bold">2</span>
                    ) : index === 2 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-700 text-dark-900 rounded-full font-bold">3</span>
                    ) : (
                      <span className="px-2">{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono">{formatAddress(entry.address)}</td>
                  <td className="py-3 px-4 font-bold text-primary-500">{entry.score}</td>
                  <td className="py-3 px-4 text-gray-400 hidden md:table-cell">{formatDate(entry.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;