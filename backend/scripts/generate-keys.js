#!/usr/bin/env node
// generate-keys.js
// Generates new ANON_KEY and SERVICE_ROLE_KEY and updates .env directly

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Read JWT_SECRET from .env
const envPath = path.join(__dirname, '../supabase/docker/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const jwtSecretMatch = envContent.match(/^JWT_SECRET=(.+)$/m);
if (!jwtSecretMatch) {
  console.error('JWT_SECRET not found in .env');
  process.exit(1);
}
const secret = jwtSecretMatch[1].trim();

// Simple JWT signer (HS256) without external dependencies
function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function signJWT(payload, secret) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${header}.${body}.${sig}`;
}

const now = Math.floor(Date.now() / 1000);
const exp = now + (10 * 365 * 24 * 60 * 60); // 10 years

const anonKey = signJWT({ role: 'anon', iss: 'supabase', iat: now, exp }, secret);
const serviceKey = signJWT({ role: 'service_role', iss: 'supabase', iat: now, exp }, secret);

// Replace keys in .env
let updated = envContent
  .replace(/^ANON_KEY=.+$/m, `ANON_KEY=${anonKey}`)
  .replace(/^SERVICE_ROLE_KEY=.+$/m, `SERVICE_ROLE_KEY=${serviceKey}`);

fs.writeFileSync(envPath, updated, 'utf8');
console.log('✅ ANON_KEY and SERVICE_ROLE_KEY updated in .env');
console.log('Next step: restart docker compose to apply changes.');
