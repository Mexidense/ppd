"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { DocumentCard, DocumentCardProps } from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/components/wallet-provider";
import { Upload } from "lucide-react";

export default function PublishedPage() {
  const router = useRouter();
  const { identityKey, address, isConnected } = useWallet();
  const [documents, setDocuments] = useState<DocumentCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublishedDocuments() {
      if (!isConnected || (!identityKey && !address)) {
        setLoading(false);
        return;
      }

      try {
        const walletAddress = identityKey || address || "";
        
        // Fetch all documents and filter by owner
        const response = await fetch("/api/documents");
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        
        // Filter documents by owner
        const ownedDocs = (data.documents || []).filter(
          (doc: any) => doc.address_owner === walletAddress
        );
        
        setDocuments(ownedDocs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchPublishedDocuments();
  }, [isConnected, identityKey, address]);

  return (
    <div className="flex flex-col h-full">
      <Header />
      
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Published Documents</h2>
            <p className="text-muted-foreground">Documents you've uploaded</p>
          </div>
          <Button 
            className="gap-2"
            onClick={() => router.push('/upload')}
            disabled={!isConnected}
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {!isConnected && !loading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">Wallet not connected</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please connect your wallet to view your published documents
              </p>
            </div>
          </div>
        )}

        {loading && isConnected && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading your documents...</p>
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
              <p className="text-xl text-muted-foreground">No published documents</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload your first document to start selling
              </p>
              <Button 
                className="mt-4 gap-2"
                onClick={() => router.push('/upload')}
                disabled={!isConnected}
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
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

