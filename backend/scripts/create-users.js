#!/usr/bin/env node
// create-users.js
// Creates family member accounts in Supabase Auth and inserts their profiles

const fs = require('fs');
const path = require('path');

// Read keys from .env
const envPath = path.join(__dirname, '../supabase/docker/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envContent.match(new RegExp(`^${name}=(.+)$`, 'm'));
  if (!match) { console.error(`${name} not found in .env`); process.exit(1); }
  return match[1].trim();
}

const serviceKey = getEnvVar('SERVICE_ROLE_KEY');
const apiUrl = 'http://127.0.0.1:8000';

// Family members to create
const users = [
  { email: 'dasa@theincredibles.local',   password: 'Dasa#2026!',   name: 'Dasa',   role: 'admin'  },
  { email: 'harini@theincredibles.local', password: 'Harini#2026!', name: 'Harini', role: 'admin'  },
  { email: 'smaran@theincredibles.local', password: 'Smaran#2026!', name: 'Smaran', role: 'member' },
];

async function createUser(user) {
  // Step 1: Create auth user
  const authRes = await fetch(`${apiUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
    }),
  });

  const authData = await authRes.json();
  if (!authRes.ok) {
    console.error(`❌ Failed to create auth user for ${user.name}:`, authData);
    return;
  }

  const userId = authData.id;
  console.log(`✅ Auth user created for ${user.name} (${userId})`);

  // Step 2: Insert profile
  const profileRes = await fetch(`${apiUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      id: userId,
      name: user.name,
      role: user.role,
    }),
  });

  if (!profileRes.ok) {
    const profileData = await profileRes.text();
    console.error(`❌ Failed to create profile for ${user.name}:`, profileData);
    return;
  }

  console.log(`✅ Profile created for ${user.name} (role: ${user.role})`);
}

(async () => {
  console.log('Creating family member accounts...\n');
  for (const user of users) {
    await createUser(user);
  }
  console.log('\nDone! Passwords are set to temporary defaults.');
  console.log('Make sure to change them after first login.');
})();
