#!/usr/bin/env node
// copy-anon-key.js
// Copies ANON_KEY from Supabase .env into the mobile app's .env.local

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const supabaseEnv = path.join(root, 'backend/supabase/docker/.env');
const mobileEnv = path.join(root, 'mobile/theIncredibles/.env.local');

const envContent = fs.readFileSync(supabaseEnv, 'utf8');
const match = envContent.match(/^ANON_KEY=(.+)$/m);
if (!match) {
  console.error('ANON_KEY not found in Supabase .env');
  process.exit(1);
}

const anonKey = match[1].trim();
fs.writeFileSync(mobileEnv, `EXPO_PUBLIC_SUPABASE_ANON_KEY=${anonKey}\n`);
console.log('✅ ANON_KEY written to mobile/.env.local');
