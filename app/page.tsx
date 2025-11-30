"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { DocumentCard, DocumentCardProps } from "@/components/document-card";
import { useWallet } from "@/components/wallet-provider";
import { Button } from "@/components/ui/button";

type DocumentWithStatus = DocumentCardProps & {
  isOwned?: boolean;
  isPurchased?: boolean;
};

export default function HomePage() {
  const { identityKey, address, isConnected } = useWallet();
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'owned' | 'purchased'>('all');

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        const allDocs = data.documents || [];
        
        // If wallet is connected, check ownership and purchases
        if (isConnected && (identityKey || address)) {
          const userAddress = identityKey || address;
          
          // Fetch user's purchases
          let purchasedDocIds: Set<string> = new Set();
          try {
            const purchasesResponse = await fetch(`/api/purchases/buyer/${userAddress}`);
            if (purchasesResponse.ok) {
              const purchasesData = await purchasesResponse.json();
              purchasedDocIds = new Set(
                (purchasesData.purchases || []).map((p: any) => p.doc_id)
              );
            }
          } catch (err) {
            console.error('Failed to fetch purchases:', err);
          }
          
          // Mark owned and purchased documents
          const docsWithStatus = allDocs.map((doc: any) => ({
            ...doc,
            isOwned: doc.address_owner === userAddress,
            isPurchased: purchasedDocIds.has(doc.id),
          }));
          
          setDocuments(docsWithStatus);
        } else {
          setDocuments(allDocs);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [isConnected, identityKey, address]);
  
  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'owned') return doc.isOwned;
    if (filter === 'purchased') return doc.isPurchased;
    return true; // 'all'
  });

  return (
    <div className="flex flex-col h-full">
      <Header />
      
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">All Documents</h2>
          
          {isConnected && (
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({documents.length})
              </Button>
              <Button
                variant={filter === 'owned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('owned')}
              >
                My Documents ({documents.filter(d => d.isOwned).length})
              </Button>
              <Button
                variant={filter === 'purchased' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('purchased')}
              >
                Purchased ({documents.filter(d => d.isPurchased).length})
              </Button>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-destructive">Error: {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredDocuments.length === 0 && filter === 'all' && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">No documents found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload your first document to get started
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredDocuments.length === 0 && filter === 'owned' && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">No documents published</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload a document to see it here
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredDocuments.length === 0 && filter === 'purchased' && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">No purchased documents</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Purchase a document to add it to your collection
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredDocuments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                {...doc}
                isOwned={doc.isOwned}
                isPurchased={doc.isPurchased}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
