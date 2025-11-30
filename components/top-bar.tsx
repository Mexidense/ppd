"use client";

import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <header 
      className="flex h-16 items-center justify-end gap-4 border-b border-border px-8 bg-card/50 backdrop-blur-sm shadow-sm"
      role="banner"
    >
      <nav aria-label="User actions" className="flex items-center gap-4">
        <WalletButton />
        <ThemeToggle />
      </nav>
    </header>
  );
}

