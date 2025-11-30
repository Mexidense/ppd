"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/components/wallet-provider";
import { Upload, Eye, Trash2, Loader2, Link2, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  cost: number;
  hash: string;
  address_owner: string;
  created_at: string;
  tags?: Array<{ id: string; name: string }>;
}

export default function PublishedPage() {
  const router = useRouter();
  const { identityKey, address, isConnected } = useWallet();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

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

  const handleDelete = async (docId: string, title: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(docId);

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      // Remove from state
      setDocuments(documents.filter(doc => doc.id !== docId));
      
      // Show success message
      alert('Document deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to delete document'}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyPaymentLink = async (docId: string) => {
    setGeneratingLink(docId);

    try {
      const response = await fetch(`/api/documents/${docId}/payment-link`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate payment link');
      }

      const data = await response.json();
      
      // Copy to clipboard
      await navigator.clipboard.writeText(data.full_url);
      
      // Show copied state
      setCopiedLink(docId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Payment link error:', err);
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to generate payment link'}`);
    } finally {
      setGeneratingLink(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Published Documents</h2>
            <p className="mt-1 text-muted-foreground">
              Manage and track your uploaded content
            </p>
          </div>
          <Button 
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all"
            onClick={() => router.push('/upload')}
            disabled={!isConnected}
          >
            <Upload className="h-5 w-5" />
            Upload New Document
          </Button>
        </div>
        
        {/* Stats Summary */}
        {!loading && !error && documents.length > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
              <p className="mt-2 text-3xl font-bold">{documents.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold">
                {documents.reduce((sum, doc) => sum + (doc.cost || 0), 0).toLocaleString()} sats
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
              <p className="mt-2 text-3xl font-bold">
                {documents.length > 0 
                  ? Math.round(documents.reduce((sum, doc) => sum + (doc.cost || 0), 0) / documents.length)
                  : 0
                } sats
              </p>
            </div>
          </div>
        )}

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
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tags</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Published</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, index) => (
                    <tr 
                      key={doc.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                      }`}
                    >
                      {/* Title */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.hash.substring(0, 8)}...
                          </p>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {doc.tags && doc.tags.length > 0 ? (
                            doc.tags.slice(0, 3).map((tag) => (
                              <Badge 
                                key={tag.id} 
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          )}
                          {doc.tags && doc.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{doc.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-foreground">
                          {formatCurrency(doc.cost)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ≈ {(doc.cost / 100000000).toFixed(6)} BSV
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(doc.created_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.push(`/view/${doc.id}`)}
                            disabled={deleting === doc.id}
                            aria-label={`View ${doc.title}`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            View
                          </Button>

                          <Button
                            size="sm"
                            variant={copiedLink === doc.id ? "default" : "outline"}
                            className="gap-2"
                            onClick={() => handleCopyPaymentLink(doc.id)}
                            disabled={generatingLink === doc.id || deleting === doc.id}
                            aria-label="Copy payment link"
                            title="Generate and copy shareable payment link"
                          >
                            {generatingLink === doc.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                <span className="sr-only">Generating link...</span>
                              </>
                            ) : copiedLink === doc.id ? (
                              <>
                                <Check className="h-4 w-4" aria-hidden="true" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Link2 className="h-4 w-4" aria-hidden="true" />
                                Copy Link
                              </>
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => handleDelete(doc.id, doc.title)}
                            disabled={deleting === doc.id}
                            aria-label={`Delete ${doc.title}`}
                          >
                            {deleting === doc.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

