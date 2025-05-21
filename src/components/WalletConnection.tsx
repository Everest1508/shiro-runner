import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, LogOut } from 'lucide-react';

const WalletConnection: React.FC = () => {
  const { isConnected, account, connect, disconnect } = useWallet();

  const formatAccount = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {!isConnected ? (
        <button
          onClick={connect}
          className="btn btn-primary flex items-center gap-2"
        >
          <Wallet size={18} />
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="glass-panel py-1 px-3 text-sm font-medium text-gray-200">
            {account && formatAccount(account)}
          </div>
          <button
            onClick={disconnect}
            className="btn btn-secondary flex items-center"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;