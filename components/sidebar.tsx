"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Library, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "All documents", href: "/", icon: FileText },
  { name: "My library", href: "/library", icon: Library },
  { name: "Published docs", href: "/published", icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-60 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <span className="text-2xl font-bold text-primary">PPD</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
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
      </nav>
    </div>
  );
}

