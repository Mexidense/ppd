import { PrivateKey, KeyDeriver, WalletInterface } from '@bsv/sdk';
import { Wallet, WalletStorageManager, WalletSigner, Services, StorageClient, Chain } from '@bsv/wallet-toolbox';
import dotenv from 'dotenv';

dotenv.config();

// Initialize wallet configuration
const privateKeyHex = process.env.BACKEND_PRIVATE_KEY;
const storageUrl = process.env.STORAGE_URL || 'https://storage.babbage.systems';
const network = (process.env.NETWORK || 'main') as Chain;

let walletInstance: WalletInterface | null = null;

async function initWallet(): Promise<WalletInterface> {
  if (walletInstance) {
    return walletInstance;
  }

  if (!privateKeyHex) {
    throw new Error('BACKEND_PRIVATE_KEY not found in .env. Run: npm run setup:wallet');
  }

  // Initialize wallet from private key
  const privateKey = PrivateKey.fromHex(privateKeyHex);
  const keyDeriver = new KeyDeriver(privateKey);
  const storageManager = new WalletStorageManager(keyDeriver.identityKey);
  const signer = new WalletSigner(network, keyDeriver, storageManager);
  const services = new Services(network);
  walletInstance = new Wallet(signer, services);

  // Setup storage
  const client = new StorageClient(walletInstance, storageUrl);
  await client.makeAvailable();
  await storageManager.addWalletStorageProvider(client);

  console.log('✓ Backend wallet initialized');
  console.log(`✓ Identity: ${keyDeriver.identityKey}`);

  return walletInstance;
}

export const wallet = initWallet();

