"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { PrivateKey, PublicKey } from "@bsv/sdk";

interface WalletImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (address: string, publicKey: string, privateKey: string) => void;
}

export function WalletImportDialog({ isOpen, onClose, onImport }: WalletImportDialogProps) {
  const [privateKeyInput, setPrivateKeyInput] = React.useState("");
  const [error, setError] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);

  const handleImport = () => {
    setError("");
    setIsImporting(true);

    try {
      // Clean the input
      const cleanedInput = privateKeyInput.trim();
      
      if (!cleanedInput) {
        setError("Please enter your private key");
        setIsImporting(false);
        return;
      }

      // Try to parse the private key (supports WIF and hex formats)
      let privateKey: PrivateKey;
      
      try {
        // Try WIF format first (starts with 5, K, or L)
        if (cleanedInput.match(/^[5KL]/)) {
          privateKey = PrivateKey.fromWif(cleanedInput);
        } else {
          // Try hex format
          privateKey = PrivateKey.fromString(cleanedInput);
        }
      } catch (e) {
        setError("Invalid private key format. Please use WIF (starts with 5/K/L) or hex format.");
        setIsImporting(false);
        return;
      }

      // Derive public key and address
      const publicKey = PublicKey.fromPrivateKey(privateKey);
      const address = publicKey.toAddress();
      const pubKeyHex = publicKey.toString();

      console.log("Successfully imported wallet:", address);

      // Pass the wallet data to parent
      onImport(address, pubKeyHex, privateKey.toString());
      
      // Clear form
      setPrivateKeyInput("");
      setError("");
      onClose();
    } catch (error) {
      console.error("Failed to import wallet:", error);
      setError("Failed to import wallet. Please check your private key and try again.");
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Import BSV Desktop Wallet</h2>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Private Key (WIF or Hex)
            </label>
            <textarea
              value={privateKeyInput}
              onChange={(e) => setPrivateKeyInput(e.target.value)}
              placeholder="Enter your private key from BSV Desktop Wallet"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Supported formats: WIF (5..., K..., L...) or Hex
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-md border border-yellow-600 bg-yellow-600/10 p-3 text-sm text-yellow-600">
            ⚠️ Warning: Your private key will be stored in your browser's localStorage.
            Only import wallets you use for testing or small amounts.
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isImporting ? "Importing..." : "Import Wallet"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              <strong>How to export from BSV Desktop Wallet:</strong>
              <br />
              1. Open your BSV Desktop Wallet
              <br />
              2. Go to Settings → Keys
              <br />
              3. Select your address
              <br />
              4. Click "Export Private Key" or "Show WIF"
              <br />
              5. Copy and paste the key here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

