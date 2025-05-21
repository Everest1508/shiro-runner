import { useState } from 'react';
import Layout from './components/Layout';
import Game from './components/Game';
import WalletConnection from './components/WalletConnection';
import Leaderboard from './components/Leaderboard';
import { useWallet } from './context/WalletContext';

function App() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'game' | 'leaderboard'>('game');

  return (
    <Layout>
      <div className="flex flex-col w-full max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Shiro Runner
          </h1>
          <WalletConnection />
        </div>

        {/* Game tabs */}
        <div className="flex mb-6 border-b border-dark-600">
          <button
            className={`px-4 py-2 mr-4 font-medium ${
              activeTab === 'game' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('game')}
          >
            Game
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'leaderboard' ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
        </div>

        {/* Main content */}
        <div className="w-full">
          {activeTab === 'game' ? (
            <>
              {!isConnected ? (
                <div className="glass-panel p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Connect Your Wallet to Play</h2>
                  <p className="text-gray-400 mb-6">
                    Connect your Ethereum wallet to start playing, save your scores on the blockchain, and compete on the leaderboard.
                  </p>
                  <WalletConnection />
                </div>
              ) : (
                <Game />
              )}
            </>
          ) : (
            <Leaderboard />
          )}
        </div>

        
      </div>
    </Layout>
  );
}

export default App;