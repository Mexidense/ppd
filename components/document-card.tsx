"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ShoppingCart, Loader2, Eye } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { P2PKH, PublicKey, Utils, WalletProtocol } from "@bsv/sdk";

const brc29ProtocolID: WalletProtocol = [2, '3241645161d8'];

export interface DocumentCardProps {
  id: string;
  title: string;
  cost: number;
  description?: string;
  tags?: Array<{ id: string; name: string }>;
  created_at: string;
  isOwned?: boolean;
  isPurchased?: boolean;
}

export function DocumentCard({
  id,
  title,
  cost,
  description,
  tags = [],
  created_at,
  isOwned = false,
  isPurchased = false,
}: DocumentCardProps) {
  const { wallet, identityKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Truncate description to ~100 characters
  const truncatedDescription = description
    ? description.length > 100
      ? description.substring(0, 100) + "..."
      : description
    : "Descripción del documento medio explicativa sobre de que trata la cosa...";

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleViewDocument = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!wallet || !identityKey) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    console.log('Navigating to viewer with wallet:', identityKey);

    // Navigate to the viewer page
    window.location.href = `/view/${id}`;
  };

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOwned) {
      showMessage('You own this document', 'info');
      return;
    }

    if (isPurchased) {
      showMessage('You already purchased this document', 'info');
      return;
    }

    if (!wallet || !identityKey) {
      showMessage('Please connect your wallet first', 'error');
      return;
    }

    setLoading(true);

    try {
      showMessage('Preparing purchase...', 'info');

      // Step 1: Get backend wallet identity
      const backendResponse = await fetch('/api/wallet-info');
      const { identityKey: backendIdentityKey } = await backendResponse.json();

      if (!backendIdentityKey) {
        throw new Error('Backend wallet not available');
      }

      // Step 2: Initial request to trigger 402
      let response = await fetch(`/api/documents/${id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 402) {
        // Step 3: Get payment derivation prefix from 402 response
        const derivationPrefix = response.headers.get('x-bsv-payment-derivation-prefix');

        if (!derivationPrefix) {
          throw new Error('Missing payment derivation prefix from server');
        }

        // Step 4: Create derivation suffix
        const derivationSuffix = Utils.toBase64(Utils.toArray('purchase' + Date.now(), 'utf8'));

        // Step 5: Derive public key for payment
        const { publicKey: derivedPublicKey } = await wallet.getPublicKey({
          counterparty: backendIdentityKey,
          protocolID: brc29ProtocolID,
          keyID: `${derivationPrefix} ${derivationSuffix}`,
          forSelf: false
        });

        // Step 6: Create locking script for payment
        const lockingScript = new P2PKH().lock(PublicKey.fromString(derivedPublicKey).toAddress()).toHex();

        showMessage(`Creating transaction for ${cost} sats...`, 'info');

        // Step 7: Create BSV transaction
        const result = await wallet.createAction({
          outputs: [{
            lockingScript,
            satoshis: Math.round(cost), // Ensure it's a whole number
            outputDescription: `Purchase document: ${title}`
          }],
          description: `Purchase ${title}`,
          options: { randomizeOutputs: false }
        });

        if (!result.tx) {
          throw new Error('Transaction creation failed');
        }

        // Step 8: Prepare payment header
        const paymentHeader = JSON.stringify({
          derivationPrefix,
          derivationSuffix,
          transaction: Utils.toBase64(result.tx),
          senderIdentityKey: identityKey,
          amount: Math.round(cost)
        });

        showMessage('Sending payment to blockchain...', 'info');

        // Step 9: Send payment proof to server
        response = await fetch(`/api/documents/${id}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bsv-payment': paymentHeader
          }
        });
      }

      const data = await response.json();

      if (response.ok) {
        showMessage(`Purchase successful! ${data.amountPaid} sats paid. Reloading...`, 'success');
        
        // Reload the page after a short delay to show the success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showMessage(data.error || 'Purchase failed', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      showMessage('Error: ' + errorMessage, 'error');
      setLoading(false);
    }
  };

  return (
    <article 
      className={`group h-full transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1 flex flex-col shadow-md rounded-lg border bg-card text-card-foreground ${
        isOwned ? 'border-green-500/50 bg-green-50 dark:bg-green-500/5' : 
        isPurchased ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-500/5' : 'bg-card'
      }`}
      aria-label={`Document: ${title}`}
    >
      <div className="p-6 flex-1">
        <div className="space-y-4">
          {/* Status Badges */}
          {(isOwned || isPurchased) && (
            <div className="flex gap-2 mb-2" role="status" aria-live="polite">
              {isOwned && (
                <Badge className="bg-green-600 hover:bg-green-700 text-white border-0" aria-label="You own this document">
                  Owner
                </Badge>
              )}
              {isPurchased && !isOwned && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0" aria-label="You purchased this document">
                  Purchased
                </Badge>
              )}
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            {title}
          </h2>

          {/* Price and Tags */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(cost)}
            </span>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="default"
                    className="bg-primary/90 hover:bg-primary"
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Badge variant="secondary">+{tags.length - 3}</Badge>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {truncatedDescription}
          </p>

          {/* CTA Button */}
          {(isOwned || isPurchased) ? (
            <Button
              onClick={handleViewDocument}
              disabled={loading}
              className="w-full gap-2 bg-green-600 text-white hover:bg-green-700"
              aria-label={`View ${title}`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Opening...</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  <span>View Document</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={loading || !wallet}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label={`Purchase ${title} for ${formatCurrency(cost)}`}
              aria-disabled={loading || !wallet}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                  <span>Purchase Document</span>
                </>
              )}
            </Button>
          )}

          {/* Message Display */}
          {message && (
            <div 
              className={`text-xs p-2 rounded-md ${
                messageType === 'success' ? 'bg-green-600/10 text-green-500' :
                messageType === 'error' ? 'bg-red-600/10 text-red-500' :
                'bg-blue-600/10 text-blue-400'
              }`}
              role={messageType === 'error' ? 'alert' : 'status'}
              aria-live={messageType === 'error' ? 'assertive' : 'polite'}
            >
              {message}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-muted/50 border-t border-border p-4 text-center">
        <p className="w-full text-xs font-medium text-muted-foreground">
          Posted <time dateTime={created_at}>{formatDate(created_at)}</time>
        </p>
      </footer>
    </article>
  );
}

