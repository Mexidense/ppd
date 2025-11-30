"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DocumentCard } from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";

interface DocumentData {
  id: string;
  title: string;
  cost: number;
  tags?: Array<{ id: string; name: string }>;
  created_at: string;
  address_owner: string;
}

export default function PaymentLinkPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocument() {
      try {
        const hash = params.link as string;
        
        if (!hash) {
          setError("Invalid payment link");
          setLoading(false);
          return;
        }

        // Fetch document by hash
        const response = await fetch(`/api/documents/link/${hash}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Document not found. This payment link may be invalid or expired.");
          }
          const data = await response.json();
          throw new Error(data.error || 'Failed to load document');
        }

        const data = await response.json();
        setDocument(data.document);
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [params.link]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" aria-hidden="true" />
          <p className="text-lg text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "This payment link is invalid or has expired."}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Go to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-8">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
            aria-label="Back to marketplace"
          >
            <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
            Back to Marketplace
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Purchase Document</h1>
          <p className="text-muted-foreground">
            Review the document details below and click "Purchase Now" to buy
          </p>
        </header>

        {/* Document Card */}
        <div className="mb-6">
          <DocumentCard
            id={document.id}
            title={document.title}
            cost={document.cost}
            tags={document.tags}
            created_at={document.created_at}
            isOwned={false}
            isPurchased={false}
            redirectToViewerOnPurchase={true}
          />
        </div>

        {/* Additional Info */}
        <div className="bg-muted/30 rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold mb-3">How it works</h2>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-primary">1.</span>
              <span>Connect your BSV wallet by clicking the "Connect Wallet" button at the top right</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">2.</span>
              <span>Click "Purchase Now" on the document card above</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">3.</span>
              <span>Approve the transaction in your wallet</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">4.</span>
              <span>Once confirmed, you'll have instant access to view and download the document</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

