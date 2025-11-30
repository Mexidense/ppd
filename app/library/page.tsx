"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { DocumentCard, DocumentCardProps } from "@/components/document-card";
import { useWallet } from "@/components/wallet-provider";

export default function LibraryPage() {
  const { identityKey, address, isConnected } = useWallet();
  const [documents, setDocuments] = useState<DocumentCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyDocuments() {
      if (!isConnected || (!identityKey && !address)) {
        setLoading(false);
        return;
      }

      try {
        const walletAddress = identityKey || address;
        
        const response = await fetch(`/api/purchases/buyer/${walletAddress}`);
        if (!response.ok) {
          throw new Error("Failed to fetch your library");
        }
        const data = await response.json();
        
        // Extract documents from purchases and mark them as purchased
        const purchasedDocs = (data.purchases || []).map((purchase: any) => ({
          id: purchase.documents?.id,
          title: purchase.documents?.title,
          cost: purchase.documents?.cost,
          tags: [], // Tags not included in purchase response
          created_at: purchase.created_at,
          isPurchased: true, // Mark as purchased so they can view it
        }));
        
        setDocuments(purchasedDocs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchMyDocuments();
  }, [isConnected, identityKey, address]);

  return (
    <div className="flex flex-col h-full">
      <Header />
      
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">My Library</h2>
          <p className="text-muted-foreground">Documents you've purchased</p>
        </div>

        {!isConnected && !loading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">Wallet not connected</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please connect your wallet to view your library
              </p>
            </div>
          </div>
        )}

        {loading && isConnected && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading your library...</p>
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

        {!loading && !error && documents.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">Your library is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Purchase documents to add them to your library
              </p>
            </div>
          </div>
        )}

        {!loading && !error && documents.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} {...doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

