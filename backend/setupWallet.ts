import { PrivateKey } from '@bsv/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Generate a new private key for the backend wallet
const privateKey = PrivateKey.fromRandom();
const privateKeyHex = privateKey.toHex();

console.log('\n=== Backend Wallet Setup ===\n');
console.log('Generated new backend wallet private key:');
console.log(privateKeyHex);
console.log('\nAdd this to your .env.local file:');
console.log(`BACKEND_PRIVATE_KEY=${privateKeyHex}`);
console.log('\n⚠️  Important: Keep this private key secure and never commit it to version control!');
console.log('\n');

// Optionally write to .env.local if it exists or create it
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

if (!envContent.includes('BACKEND_PRIVATE_KEY=')) {
  const newContent = envContent + `\n# Backend Wallet Private Key\nBACKEND_PRIVATE_KEY=${privateKeyHex}\n`;
  fs.writeFileSync(envPath, newContent);
  console.log('✓ Added BACKEND_PRIVATE_KEY to .env.local');
} else {
  console.log('⚠️  BACKEND_PRIVATE_KEY already exists in .env.local - not overwriting');
  console.log('   If you want to replace it, manually update the file');
}

