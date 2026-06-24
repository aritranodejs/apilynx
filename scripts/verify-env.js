#!/usr/bin/env node
/**
 * Ensure .env has MONGODB_URI before packaging installers.
 * Run automatically via electron:build / dist:* scripts.
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('\n❌ Missing .env — copy .env.example and set MONGODB_URI before building.\n');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const match = content.match(/^MONGODB_URI=(.+)$/m);
const value = match?.[1]?.trim();

if (!value || value.startsWith('#')) {
  console.error('\n❌ MONGODB_URI is not set in .env (required for packaged installs).\n');
  process.exit(1);
}

if (value.includes('127.0.0.1') || value.includes('localhost')) {
  console.error('\n❌ MONGODB_URI points to localhost. Use your MongoDB Atlas URL for distribution builds.\n');
  process.exit(1);
}

console.log('✓ .env OK — MONGODB_URI is set for packaging');
