"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Library, Upload, BarChart3, FolderKanban, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navigation = {
  documents: [
    { name: "Documents", href: "/", icon: FileText },
  ],
  creator: [
    { name: "Published docs", href: "/published", icon: Upload },
    { name: "Analytics", href: "/creator/stats", icon: BarChart3 },
  ],
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-border shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0",
        "bg-white dark:bg-gray-900 lg:bg-card",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4 lg:px-6 bg-gray-50 dark:bg-gray-800 lg:bg-background/50">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary" aria-hidden="true">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <span className="text-2xl font-bold text-primary">
            PPD
            <span className="sr-only">Pay Per Document</span>
          </span>
        </div>
        
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Document sections">
        {/* Documents Section */}
        <div className="mb-6">
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documents
          </h2>
          <ul className="space-y-1" role="list">
            {navigation.documents.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Creator Space Section */}
        <div>
          <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
            Creator Space
          </h2>
          <ul className="space-y-1" role="list">
            {navigation.creator.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

