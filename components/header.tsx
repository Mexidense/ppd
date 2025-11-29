"use client";

import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-8">
      <h1 className="text-3xl font-bold uppercase tracking-wider">
        All Documents
      </h1>
      
      <div className="flex items-center gap-4">
        <WalletButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
