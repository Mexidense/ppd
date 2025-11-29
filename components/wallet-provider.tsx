"use client";

import * as React from "react";
import { useWallet as useWalletHook } from "@/lib/wallet";

type WalletState = ReturnType<typeof useWalletHook>;

const WalletContext = React.createContext<WalletState | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWalletHook();

  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = React.useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  
  return context;
}
