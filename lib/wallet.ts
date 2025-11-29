import { useEffect, useState } from "react";
import { WalletClient } from "@bsv/sdk";

export const useWallet = () => {
  const [wallet, setWallet] = useState<WaletClient | null>(null);
  const [identityKey, setIdentityKey] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function initWallet() {
    setIsConnecting(true);
    setError(null);
    try {
      const w = new WalletClient("json-api", "localhost");
      const identityKeyResult = await w.getPublicKey({ identityKey: true });
      
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

  return {
    wallet,
    identityKey,
    address,
    balance,
    isConnected: !!wallet,
    isConnecting,
    error,
    connect,
    disconnect,
  };
};
