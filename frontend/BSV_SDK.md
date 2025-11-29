# BSV SDK Integration

This project uses the official [@bsv/sdk](https://www.npmjs.com/package/@bsv/sdk) package for Bitcoin SV blockchain operations.

## Features

### Wallet Provider (`components/wallet-provider.tsx`)

The wallet provider manages the user's BSV wallet connection and provides the following functionality:

- **Connect Wallet**: Generates a new BSV key pair using the BSV SDK or connects to browser extensions (Panda Wallet, HandCash)
- **Disconnect Wallet**: Clears wallet data from state and localStorage
- **Sign Messages**: Sign arbitrary messages with the user's private key
- **Persistent Sessions**: Stores wallet data in localStorage for seamless reconnection

### Using the Wallet Hook

```typescript
import { useWallet } from '@/components/wallet-provider';

function MyComponent() {
  const { address, publicKey, isConnected, connect, disconnect, signMessage } = useWallet();
  
  // Check if wallet is connected
  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }
  
  // Use wallet address
  console.log('My BSV Address:', address);
  
  // Sign a message
  const handleSign = async () => {
    const signature = await signMessage('Hello BSV!');
    console.log('Signature:', signature);
  };
  
  return (
    <div>
      <p>Connected: {address}</p>
      <button onClick={handleSign}>Sign Message</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## BSV Utility Functions (`lib/bsv-utils.ts`)

Helper functions for common BSV operations:

### Key Management

```typescript
import { generateKeyPair, deriveFromPrivateKey } from '@/lib/bsv-utils';

// Generate new key pair
const keyPair = generateKeyPair();
console.log('Address:', keyPair.address);

// Derive from existing private key
const derived = deriveFromPrivateKey(privateKeyString);
console.log('Derived Address:', derived.address);
```

### Signing and Verification

```typescript
import { signMessage, verifySignature } from '@/lib/bsv-utils';

// Sign a message
const signature = signMessage(privateKey, 'Hello World');

// Verify signature
const isValid = verifySignature(publicKey, 'Hello World', signature);
```

### Hashing

```typescript
import { sha256Hash, doubleSha256Hash } from '@/lib/bsv-utils';

// Single SHA256
const hash1 = sha256Hash('data');

// Double SHA256 (Bitcoin standard)
const hash2 = doubleSha256Hash('data');
```

### Address Validation

```typescript
import { isValidAddress } from '@/lib/bsv-utils';

const valid = isValidAddress('1H76H6sqLy56txWKDN2iLqro5wwygbjmP1');
console.log('Valid address:', valid); // true
```

### Currency Conversion

```typescript
import { satoshisToBSV, bsvToSatoshis } from '@/lib/bsv-utils';

// Convert satoshis to BSV
const bsv = satoshisToBSV(100000000); // "1.00000000"

// Convert BSV to satoshis
const sats = bsvToSatoshis(1.5); // 150000000
```

## Wallet Data Structure

The wallet provider stores the following data:

```typescript
type WalletState = {
  address: string | null;           // BSV address (e.g., "1H76H...")
  publicKey: string | null;         // Public key hex string
  isConnected: boolean;             // Connection status
  isConnecting: boolean;            // Loading state
  connect: () => Promise<void>;     // Connect function
  disconnect: () => void;           // Disconnect function
  signMessage: (message: string) => Promise<string | null>; // Sign function
};
```

## Browser Extension Support

The wallet provider supports the following BSV wallet browser extensions:

1. **Panda Wallet** - Checks for `window.panda`
2. **HandCash Connect** - Checks for `window.handCash`

If no browser extension is detected, it automatically generates a new key pair using the BSV SDK for development purposes.

## Security Notes

⚠️ **Important**: The development fallback stores private keys in localStorage. This is only for development and testing. In production:

- Always use a browser extension wallet for security
- Never store private keys in localStorage
- Consider using hardware wallets for high-value transactions
- Implement proper key management and security practices

## Example: Document Upload with Signature

Here's an example of how to use the wallet to sign document metadata:

```typescript
import { useWallet } from '@/components/wallet-provider';
import { sha256Hash } from '@/lib/bsv-utils';

async function uploadDocument(file: File) {
  const { address, signMessage } = useWallet();
  
  // Calculate document hash
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const documentHash = sha256Hash(buffer.toString('hex'));
  
  // Create signature
  const message = `Upload document: ${documentHash}`;
  const signature = await signMessage(message);
  
  // Send to API with signature
  const formData = new FormData();
  formData.append('file', file);
  formData.append('address_owner', address);
  formData.append('signature', signature);
  
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}
```

## API Reference

For complete API documentation, see the [@bsv/sdk documentation](https://www.npmjs.com/package/@bsv/sdk).

### Key Classes Used

- `PrivateKey` - Private key management and signing
- `PublicKey` - Public key derivation and verification
- `Hash` - Cryptographic hashing functions
- `BigNumber` - Large number arithmetic

## Testing

To test the wallet functionality:

1. Start the development server: `npm run dev`
2. Open the app in your browser
3. Click "Connect Wallet"
4. Check the browser console for the generated BSV address
5. Test signing by calling `signMessage()` from the wallet hook

The wallet data is persisted in localStorage and will be restored on page refresh.

