"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { useWallet } from "@/components/wallet-provider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

export default function ViewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { identityKey, address, isConnected, isConnecting } = useWallet();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [walletCheckComplete, setWalletCheckComplete] = useState(false);

  useEffect(() => {
    // Wait for wallet to finish connecting/checking
    if (!isConnecting) {
      setWalletCheckComplete(true);
    }
  }, [isConnecting]);

  useEffect(() => {
    if (!walletCheckComplete) {
      return; // Wait for wallet check to complete
    }

    async function loadDocument() {
      console.log('Wallet state:', { isConnected, isConnecting, identityKey, address });

      // Check if wallet is connected
      if (!isConnected || (!identityKey && !address)) {
        setError("wallet_not_connected");
        setLoading(false);
        return;
      }

      try {
        const walletAddress = identityKey || address;
        console.log('Loading document with wallet:', walletAddress);
        
        const response = await fetch(`/api/documents/${params.id}/view?buyer=${walletAddress}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load document');
        }

        const data = await response.json();
        console.log('Document loaded:', data);
        
        setPdfUrl(data.url);
        setDocumentTitle(data.title || 'Document');
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [params.id, walletCheckComplete, isConnected, identityKey, address]);

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${documentTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      {/* Viewer Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">{documentTitle}</h1>
        </div>
        
        {pdfUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Loading document...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md">
              <p className="text-xl font-semibold text-destructive mb-2">
                {error === "wallet_not_connected" ? "Wallet Not Connected" : "Error Loading Document"}
              </p>
              <p className="text-muted-foreground mb-4">
                {error === "wallet_not_connected" 
                  ? "Please connect your wallet to view this document. Click the wallet button in the top right corner."
                  : error}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => router.back()}>
                  Go Back
                </Button>
                {error === "wallet_not_connected" && (
                  <Button onClick={() => router.push('/')}>
                    Go to Home
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && pdfUrl && (
          <div className="w-full h-full">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title={documentTitle}
            />
          </div>
        )}
      </div>
    </div>
  );
}

