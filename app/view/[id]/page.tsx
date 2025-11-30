"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/components/wallet-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2, FileText, Coins, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DocumentMetadata {
  id: string;
  title: string;
  cost: number;
  address_owner: string;
  created_at: string;
  tags?: Array<{ id: string; name: string }>;
}

export default function ViewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { identityKey, address, isConnected, isConnecting } = useWallet();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
  const [walletCheckComplete, setWalletCheckComplete] = useState(false);

  useEffect(() => {
    // Wait for wallet to finish connecting/checking
    console.log('Wallet check - isConnecting:', isConnecting);
    if (!isConnecting) {
      console.log('Wallet check complete - identityKey:', identityKey, 'address:', address);
      setWalletCheckComplete(true);
    }
  }, [isConnecting, identityKey, address]);

  useEffect(() => {
    if (!walletCheckComplete) {
      return; // Wait for wallet check to complete
    }

    async function loadDocument() {
      console.log('Wallet state:', { isConnected, isConnecting, identityKey, address });

      // Check if params is available
      if (!params || !params.id) {
        console.error('No document ID available');
        setError("invalid_document_id");
        setLoading(false);
        return;
      }

      // Check if wallet is connected
      const walletAddress = identityKey || address;
      
      if (!walletAddress) {
        console.error('No wallet address available');
        setError("wallet_not_connected");
        setLoading(false);
        return;
      }

      try {
        console.log('Loading document with wallet:', walletAddress);
        
        // First, fetch document metadata
        const metadataResponse = await fetch(`/api/documents/${params.id}`);
        
        if (!metadataResponse.ok) {
          const data = await metadataResponse.json();
          throw new Error(data.error || 'Failed to load document metadata');
        }
        
        const metadataData = await metadataResponse.json();
        setDocumentMetadata(metadataData.document);
        console.log('Document metadata loaded:', metadataData.document);
        
        // Then fetch the PDF file
        const response = await fetch(`/api/documents/${params.id}/view?buyer=${walletAddress}`);
        
        console.log('View API response status:', response.status);
        console.log('View API response content-type:', response.headers.get('content-type'));
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            const data = await response.json();
            throw new Error(data.error || `Failed to load document (${response.status})`);
          } else {
            throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
          }
        }

        // Check if response is JSON or binary
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          // Error response
          const data = await response.json();
          throw new Error(data.error || 'Failed to load document');
        }
        
        // Binary PDF response - create a blob URL
        const blob = await response.blob();
        console.log('Received blob:', blob.size, 'bytes, type:', blob.type);
        
        if (blob.size === 0) {
          throw new Error('Received empty file data');
        }
        
        const blobUrl = URL.createObjectURL(blob);
        console.log('Document PDF loaded as blob URL:', blobUrl);
        
        setPdfUrl(blobUrl);
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [params, walletCheckComplete, isConnected, identityKey, address]);

  const handleDownload = () => {
    if (pdfUrl && documentMetadata) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${documentMetadata.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Viewer Header */}
      <div className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4">
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
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">{documentMetadata?.title || 'Loading...'}</h1>
            </div>
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
        
        {/* Document Info Bar */}
        {documentMetadata && (
          <div className="px-6 py-3 bg-accent/30 border-t border-border">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatCurrency(documentMetadata.cost)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Owner: {documentMetadata.address_owner.substring(0, 8)}...{documentMetadata.address_owner.substring(documentMetadata.address_owner.length - 6)}
                </span>
              </div>
              {documentMetadata.tags && documentMetadata.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  {documentMetadata.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                  {documentMetadata.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{documentMetadata.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
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
                  ? "Please connect your BSV wallet to view this document. Make sure you have the BSV Wallet extension installed and unlocked."
                  : error}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                {error === "wallet_not_connected" && (
                  <Button variant="secondary" onClick={() => router.push('/')}>
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
              src={pdfUrl}
              className="w-full h-full border-0"
              title={documentMetadata?.title || 'Document'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

