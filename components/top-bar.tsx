"use client";

import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <div className="flex h-16 items-center justify-end gap-4 border-b border-border px-8">
      <WalletButton />
      <ThemeToggle />
    </div>
  );
}

