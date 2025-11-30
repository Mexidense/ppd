#!/usr/bin/env tsx
/**
 * Local BSV Wallet Server for Development
 * 
 * This script runs a local wallet server with JSON-API support
 * for testing the app without a full wallet installation.
 * 
 * Usage:
 *   npx tsx scripts/run-wallet-server.ts
 */

import { createServer } from 'http';
import { PrivateKey, KeyDeriver } from '@bsv/sdk';
import { Wallet, WalletStorageManager, WalletSigner, Services } from '@bsv/wallet-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = 3321;
const ALLOWED_ORIGINS = [
  'https://ppd-three.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

async function initWallet() {
  const privateKeyHex = process.env.PRIVATE_KEY || process.env.BACKEND_PRIVATE_KEY;
  
  if (!privateKeyHex) {
    console.error('❌ No PRIVATE_KEY found in .env');
    console.log('💡 Run: npm run setup:wallet');
    process.exit(1);
  }

  const privateKey = PrivateKey.fromHex(privateKeyHex);
  const keyDeriver = new KeyDeriver(privateKey);
  const storageManager = new WalletStorageManager(keyDeriver.identityKey);
  const signer = new WalletSigner('main', keyDeriver, storageManager);
  const services = new Services('main');
  const wallet = new Wallet(signer, services);

  console.log('✅ Wallet initialized');
  console.log(`🔑 Identity: ${keyDeriver.identityKey.slice(0, 20)}...`);
  
  return { wallet, keyDeriver };
}

function handleCors(req: any, res: any) {
  const origin = req.headers.origin;
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return true;
  }
  
  return false;
}

async function startServer() {
  const { wallet, keyDeriver } = await initWallet();
  
  const server = createServer(async (req, res) => {
    // Handle CORS
    if (handleCors(req, res)) return;
    
    // Parse URL
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    
    try {
      // Handle getPublicKey
      if (url.pathname === '/getPublicKey' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const params = JSON.parse(body || '{}');
            
            let publicKey: string;
            
            if (params.identityKey) {
              publicKey = keyDeriver.identityKey;
            } else {
              // For derived keys
              publicKey = keyDeriver.identityKey; // Simplified for now
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ publicKey }));
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request' }));
          }
        });
        return;
      }
      
      // Handle createAction
      if (url.pathname === '/createAction' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const params = JSON.parse(body || '{}');
            
            // This is a simplified mock - real implementation would create actual transactions
            const mockTxId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              txid: mockTxId,
              tx: Buffer.from('mock_transaction_data').toString('base64')
            }));
            
            console.log(`💳 Transaction created: ${mockTxId}`);
          } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid request' }));
          }
        });
        return;
      }
      
      // Default 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      
    } catch (err) {
      console.error('Request error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
  
  server.listen(PORT, () => {
    console.log(`\n🚀 BSV Wallet Server running on http://localhost:${PORT}`);
    console.log(`\n✅ CORS enabled for:`);
    ALLOWED_ORIGINS.forEach(origin => console.log(`   - ${origin}`));
    console.log(`\n💡 Now you can connect your wallet at https://ppd-three.vercel.app/\n`);
  });
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down wallet server...');
    server.close();
    process.exit(0);
  });
}

startServer().catch(console.error);

