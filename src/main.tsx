import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { WalletProvider } from './context/WalletContext';
import { GameProvider } from './context/GameContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <GameProvider>
        <App />
      </GameProvider>
    </WalletProvider>
  </StrictMode>
);