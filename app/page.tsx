"use client";

import { useEffect, useState } from "react";
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
  const [filter, setFilter] = useState<'all' | 'purchased'>('all');

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
    if (filter === 'purchased') {
      // Show purchased documents or owned documents in library view
      return doc.isPurchased || doc.isOwned;
    }
    return true; // 'all' - show everything
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8">
        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, purchase, and manage your document collection
          </p>
        </header>

        {/* Tabs Navigation */}
        <nav className="mb-8" aria-label="Document filters" role="tablist">
          <div className="flex gap-2" role="tablist">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3.5 font-semibold text-sm transition-all rounded-t-lg relative ${
                filter === 'all'
                  ? 'text-primary-foreground bg-gradient-to-br from-primary via-primary to-primary/90 border-2 border-b-0 border-primary shadow-[0_-4px_12px_rgba(0,0,0,0.15),0_8px_16px_rgba(var(--primary-rgb),0.4)] z-10'
                  : 'text-muted-foreground hover:text-foreground bg-muted/30 border-2 border-transparent hover:border-border/50 hover:bg-muted/50 hover:shadow-md'
              }`}
              role="tab"
              aria-selected={filter === 'all'}
              aria-controls="marketplace-panel"
              id="marketplace-tab"
            >
              <div className="flex items-center gap-2">
                <span>🏪 Marketplace</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  filter === 'all' 
                    ? 'bg-white/40 text-primary-foreground shadow-sm' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {documents.length}
                </span>
              </div>
            </button>
            
            {isConnected && (
              <button
                onClick={() => setFilter('purchased')}
                className={`px-6 py-3.5 font-semibold text-sm transition-all rounded-t-lg relative ${
                  filter === 'purchased'
                    ? 'text-primary-foreground bg-gradient-to-br from-primary via-primary to-primary/90 border-2 border-b-0 border-primary shadow-[0_-4px_12px_rgba(0,0,0,0.15),0_8px_16px_rgba(var(--primary-rgb),0.4)] z-10'
                    : 'text-muted-foreground hover:text-foreground bg-muted/30 border-2 border-transparent hover:border-border/50 hover:bg-muted/50 hover:shadow-md'
                }`}
                role="tab"
                aria-selected={filter === 'purchased'}
                aria-controls="library-panel"
                id="library-tab"
              >
                <div className="flex items-center gap-2">
                  <span>📚 My Library</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    filter === 'purchased' 
                      ? 'bg-white/40 text-primary-foreground shadow-sm' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {documents.filter(d => d.isPurchased || d.isOwned).length}
                  </span>
                </div>
              </button>
            )}
          </div>
          
          {/* Content Area with Border */}
          <section 
            className="border-2 border-primary rounded-lg rounded-tl-none p-6 bg-background shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
            role="tabpanel"
            id={filter === 'all' ? 'marketplace-panel' : 'library-panel'}
            aria-labelledby={filter === 'all' ? 'marketplace-tab' : 'library-tab'}
          >
            {/* Tab Content Description */}
            {filter === 'all' && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  📖 Browse all available documents • Purchase to unlock and view
                </p>
              </div>
            )}
            {filter === 'purchased' && isConnected && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  ✅ Documents you own or have purchased • Ready to view anytime
                </p>
              </div>
            )}
            
            {/* Content */}
            <div className="-mx-6 -mb-6 px-6 pb-6">

        {loading && (
          <div className="flex h-full items-center justify-center" role="status" aria-live="polite">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" aria-hidden="true"></div>
              <p className="mt-4 text-muted-foreground">Loading documents...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center" role="alert">
            <div className="text-center">
              <p className="text-destructive">Error: {error}</p>
            </div>
          </div>
        )}

        {!loading && !error && filteredDocuments.length === 0 && (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center max-w-md">
              {filter === 'all' && (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-3xl">📄</span>
                  </div>
                  <p className="text-xl font-semibold mb-2">No documents available</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to upload and share your content
                  </p>
                </>
              )}
              {filter === 'purchased' && (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <p className="text-xl font-semibold mb-2">Your library is empty</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Purchase documents from the Marketplace to build your collection
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setFilter('all')}
                  >
                    Browse Marketplace
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {!loading && !error && filteredDocuments.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
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
          </section>
        </nav>
      </div>
    </div>
  );
}
