import { useEffect, useState } from "react";
import { WalletClient } from "@bsv/sdk";

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletClient | null>(null);
  const [identityKey, setIdentityKey] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function initWallet() {
    setIsConnecting(true);
    setError(null);
    try {
      console.log('Initializing BSV wallet...');
      
      // Use environment variable for wallet host, fallback to localhost
      const walletHost = process.env.NEXT_PUBLIC_WALLET_HOST || "localhost";
      console.log('Connecting to wallet at:', walletHost);
      
      const w = new WalletClient("json-api", walletHost);
      const identityKeyResult = await w.getPublicKey({ identityKey: true });
      
      console.log('Wallet initialized successfully. Identity key:', identityKeyResult.publicKey?.substring(0, 20) + '...');
      
      setWallet(w);
      setIdentityKey(identityKeyResult.publicKey);
      setAddress(identityKeyResult.publicKey);
    } catch (error) {
      console.error('Wallet connection error:', error);
      const errorMessage = (error as Error).message || "Failed to connect wallet";
      
      // Provide helpful error message
      if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        setError("No BSV wallet found on localhost. Please ensure your wallet is running with JSON-API enabled on port 3321.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    // Don't auto-connect on mount - let user click "Connect Wallet"
    // This prevents errors when no local wallet is running
    setIsConnecting(false);
  }, []);

  const connect = async () => {
    await initWallet();
  };

  const disconnect = () => {
    setWallet(null);
    setIdentityKey(null);
    setAddress(null);
    setBalance(0);
    setError(null);
  };

  const refreshBalance = async () => {
    // TODO: Implement balance fetching
    console.log('Balance refresh not implemented yet');
  };

  return {
    wallet,
    identityKey,
    address,
    balance,
    isConnected: !!wallet && !!identityKey,
    isConnecting,
    error,
    connect,
    disconnect,
    refreshBalance,
  };
};
