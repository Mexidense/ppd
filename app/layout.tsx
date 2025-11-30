import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/components/wallet-provider";
import { LayoutContent } from "@/components/layout-content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PPD - Pay Per Document",
  description: "Decentralized document marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="dark">
          <WalletProvider>
            {/* Skip to main content link for keyboard navigation */}
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            
            <LayoutContent>{children}</LayoutContent>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
