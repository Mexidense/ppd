import { PrivateKey, PublicKey, Hash, BigNumber, Signature } from "@bsv/sdk";

/**
 * Utility functions for BSV operations
 */

/**
 * Generate a new BSV key pair
 */
export function generateKeyPair() {
  const privateKey = PrivateKey.fromRandom();
  const publicKey = PublicKey.fromPrivateKey(privateKey);
  const address = publicKey.toAddress();

  return {
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
    address,
  };
}

/**
 * Derive public key and address from private key
 */
export function deriveFromPrivateKey(privateKeyString: string) {
  const privateKey = PrivateKey.fromString(privateKeyString);
  const publicKey = PublicKey.fromPrivateKey(privateKey);
  const address = publicKey.toAddress();

  return {
    publicKey: publicKey.toString(),
    address,
  };
}

/**
 * Sign a message with a private key
 */
export function signMessage(privateKeyString: string, message: string): string {
  const privateKey = PrivateKey.fromString(privateKeyString);
  const messageBuffer = Buffer.from(message, 'utf8');
  const signature = privateKey.sign(Array.from(messageBuffer));
  
  // Handle both string and number array returns
  if (typeof signature === 'string') {
    return signature;
  } else if (Array.isArray(signature)) {
    return Buffer.from(signature).toString('hex');
  }
  return String(signature);
}

/**
 * Verify a signature
 */
export function verifySignature(
  publicKeyString: string,
  message: string,
  signatureHex: string
): boolean {
  try {
    const publicKey = PublicKey.fromString(publicKeyString);
    const messageBuffer = Buffer.from(message, 'utf8');
    const signature = Signature.fromDER(signatureHex, 'hex');
    
    return publicKey.verify(Array.from(messageBuffer), signature);
  } catch (error) {
    console.error("Failed to verify signature:", error);
    return false;
  }
}

/**
 * Hash data using SHA256
 */
export function sha256Hash(data: string): string {
  const buffer = Buffer.from(data, 'utf8');
  const hash = Hash.sha256(Array.from(buffer));
  
  // Handle both string and number array returns
  if (typeof hash === 'string') {
    return hash;
  } else if (Array.isArray(hash)) {
    return Buffer.from(hash).toString('hex');
  }
  return String(hash);
}

/**
 * Create a double SHA256 hash (used in Bitcoin)
 */
export function doubleSha256Hash(data: string): string {
  const buffer = Buffer.from(data, 'utf8');
  const hash1 = Hash.sha256(Array.from(buffer));
  
  // Convert hash1 to number array for second hash
  const hash1Array = typeof hash1 === 'string' 
    ? Array.from(Buffer.from(hash1, 'hex'))
    : Array.isArray(hash1) 
    ? hash1 
    : Array.from(Buffer.from(String(hash1)));
    
  const hash2 = Hash.sha256(hash1Array);
  
  // Handle both string and number array returns
  if (typeof hash2 === 'string') {
    return hash2;
  } else if (Array.isArray(hash2)) {
    return Buffer.from(hash2).toString('hex');
  }
  return String(hash2);
}

/**
 * Validate a Bitcoin address
 */
export function isValidAddress(address: string): boolean {
  try {
    // Basic validation for Bitcoin address format
    const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    return addressRegex.test(address);
  } catch (error) {
    return false;
  }
}

/**
 * Format satoshis to BSV
 */
export function satoshisToBSV(satoshis: number): string {
  return (satoshis / 100000000).toFixed(8);
}

/**
 * Format BSV to satoshis
 */
export function bsvToSatoshis(bsv: number): number {
  return Math.round(bsv * 100000000);
}

