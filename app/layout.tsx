"use client";

import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/components/wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>PPD - Pay Per Document</title>
        <meta name="description" content="Decentralized document marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="dark">
          <WalletProvider>
            {/* Skip to main content link for keyboard navigation */}
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            
            <div className="flex h-screen overflow-hidden">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar onMenuClick={() => setSidebarOpen(true)} />
                <main id="main-content" className="flex-1 overflow-y-auto" tabIndex={-1}>
                  {children}
                </main>
              </div>
            </div>
            
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
            )}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
