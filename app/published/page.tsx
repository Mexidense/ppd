"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { DocumentCard, DocumentCardProps } from "@/components/document-card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function PublishedPage() {
  const [documents, setDocuments] = useState<DocumentCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublishedDocuments() {
      try {
        // TODO: Replace with actual wallet address from Web3 context
        const walletAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
        
        // For now, we'll filter all documents by address_owner
        const response = await fetch("/api/documents");
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        const data = await response.json();
        
        // Filter documents by owner (in a real app, this should be done server-side)
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
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header />
      
      <div className="flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Published Documents</h2>
            <p className="text-muted-foreground">Documents you've uploaded</p>
          </div>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {loading && (
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
              <Button className="mt-4 gap-2">
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

