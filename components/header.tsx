"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { WalletButton } from "./wallet-button";
import { Button } from "./ui/button";
import { Home, Upload, BookOpen } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-8">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-bold tracking-wide">
          Pay per document
        </h1>
        
        <nav className="flex items-center gap-2">
          <Link href="/">
            <Button 
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Library
            </Button>
          </Link>
          
          <Link href="/published">
            <Button 
              variant={pathname === "/published" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Published
            </Button>
          </Link>
          
          <Link href="/upload">
            <Button 
              variant={pathname === "/upload" ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <WalletButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
