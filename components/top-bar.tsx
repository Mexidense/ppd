"use client";

import { Menu } from "lucide-react";
import { WalletButton } from "./wallet-button";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header 
      className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 sm:px-8 bg-card/50 backdrop-blur-sm shadow-sm"
      role="banner"
    >
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Burger menu button for mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-wide">
          Pay per document
        </h1>
      </div>
      
      <nav aria-label="User actions" className="flex items-center gap-2 sm:gap-4">
        <WalletButton />
        <ThemeToggle />
      </nav>
    </header>
  );
}

