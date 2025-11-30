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
      className="flex h-16 items-center justify-between gap-4 border-b border-border px-4 lg:px-8 bg-card/50 backdrop-blur-sm shadow-sm"
      role="banner"
    >
      {/* Hamburger menu for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Spacer for desktop */}
      <div className="hidden lg:block" />
      
      <nav aria-label="User actions" className="flex items-center gap-2 lg:gap-4">
        <WalletButton />
        <ThemeToggle />
      </nav>
    </header>
  );
}

