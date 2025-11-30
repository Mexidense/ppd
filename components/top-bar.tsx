"use client";

import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <div className="flex h-16 items-center justify-end gap-4 border-b border-border px-8 bg-card/50 backdrop-blur-sm shadow-sm">
      <WalletButton />
      <ThemeToggle />
    </div>
  );
}

