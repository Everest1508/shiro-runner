import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

const TabiChainParams = {
  chainId: '0x263C', // 9788 in hexadecimal
  chainName: 'TabiChain Testnet v2',
  nativeCurrency: {
    name: 'Tabi',
    symbol: 'TABI',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnetv2.tabichain.com'],
  blockExplorerUrls: ['https://testnetv2.tabiscan.com/'],
};


interface WalletContextType {
  isConnected: boolean;
  account: string | null;
  signer: JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  account: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  useEffect(() => {
    // Check if previously connected
    const checkConnection = async () => {
      if (window.ethereum && localStorage.getItem('walletConnected') === 'true') {
        try {
          await connect();
        } catch (error) {
          console.error('Failed to reconnect wallet:', error);
          localStorage.removeItem('walletConnected');
        }
      }
    };
    
    checkConnection();
  }, []);

  // Set up event listeners for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnect();
    } else {
      // Update the connected account
      setAccount(accounts[0]);
    }
  };

  
const connect = async () => {
  if (window.ethereum) {
    const targetChainId = TabiChainParams.chainId;

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (currentChainId !== targetChainId) {
        try {
          // Try switching to the chain first
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError: any) {
          // If chain is not added, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [TabiChainParams],
              });
            } catch (addError) {
              console.error('Error adding TabiChain:', addError);
              throw addError;
            }
          } else {
            console.error('Error switching chain:', switchError);
            throw switchError;
          }
        }
      }

      // Now connect wallet
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const newSigner = await provider.getSigner();

      setAccount(accounts[0]);
      setSigner(newSigner);
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    alert('Please install MetaMask or another Ethereum wallet extension to use this feature.');
  }
};
  

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    setIsConnected(false);
    localStorage.removeItem('walletConnected');
  };

  return (
    <WalletContext.Provider value={{ isConnected, account, signer, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};