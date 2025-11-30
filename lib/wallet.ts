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
      const w = new WalletClient("json-api", "localhost");
      const identityKeyResult = await w.getPublicKey({ identityKey: true });
      
      console.log('Wallet initialized successfully. Identity key:', identityKeyResult.publicKey?.substring(0, 20) + '...');
      
      setWallet(w);
      setIdentityKey(identityKeyResult.publicKey);
      setAddress(identityKeyResult.publicKey);
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError((error as Error).message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }

  useEffect(() => {
    initWallet();
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
