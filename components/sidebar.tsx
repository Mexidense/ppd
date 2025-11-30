"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Library, Upload, BarChart3, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = {
  documents: [
    { name: "Documents", href: "/", icon: FileText },
  ],
  creator: [
    { name: "Published docs", href: "/published", icon: Upload },
    { name: "Analytics", href: "/creator/stats", icon: BarChart3 },
  ],
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-60 flex-col border-r border-border bg-card shadow-sm">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6 bg-background/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <span className="text-2xl font-bold text-primary">PPD</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Documents Section */}
        <div className="mb-6">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documents
          </h3>
          <div className="space-y-1">
            {navigation.documents.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Creator Space Section */}
        <div>
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FolderKanban className="h-3.5 w-3.5" />
            Creator Space
          </h3>
          <div className="space-y-1">
            {navigation.creator.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

