"use client";

import { Check, Wallet, LogOut, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useWallet } from "./wallet-provider";
import { Button } from "./ui/button";

export function WalletButton() {
  const { identityKey, balance, isConnected, isConnecting, error, connect, disconnect, refreshBalance } = useWallet();

  const formatKey = (key: string) => {
    if (key.length <= 12) return key;
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  const formatBalance = (sats: number | null) => {
    if (sats === null) return "...";
    return sats.toLocaleString();
  };

  if (isConnected && identityKey) {
    return (
      <div className="flex items-center gap-1.5 lg:gap-2" role="status" aria-live="polite">        
        {/* Wallet Connected */}
        <div 
          className="flex items-center gap-1.5 lg:gap-2 rounded-md border border-green-600 bg-green-600/10 px-2 lg:px-3 py-1.5"
          aria-label={`Wallet connected: ${formatKey(identityKey)}`}
        >
          <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-green-500" aria-hidden="true" />
          <span className="hidden sm:inline text-sm font-medium text-green-500">
            {formatKey(identityKey)}
          </span>
        </div>
        
        {/* Disconnect Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={disconnect}
          className="border-border h-9 w-9 lg:h-10 lg:w-10"
          aria-label="Disconnect wallet"
        >
          <LogOut className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden="true" />
          <span className="sr-only">Disconnect wallet</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={connect}
        disabled={isConnecting}
        className="gap-1.5 lg:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm lg:text-base px-3 lg:px-4"
        aria-label={isConnecting ? "Connecting to wallet" : "Connect wallet"}
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 lg:h-4 lg:w-4 animate-spin" aria-hidden="true" />
            <span className="hidden sm:inline">Connecting...</span>
            <span className="sm:hidden">...</span>
          </>
        ) : (
          <>
            <Wallet className="h-3.5 w-3.5 lg:h-4 lg:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </>
        )}
      </Button>
      {error && (
        <div 
          className="flex items-center gap-1 text-xs text-red-500" 
          role="alert"
          aria-label={`Wallet error: ${error}`}
        >
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">{error}</span>
        </div>
      )}
    </div>
  );
}
