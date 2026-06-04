import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Local network IP of the MacBook
// When accessing via Tailscale (on the go), replace with MacBook's Tailscale IP e.g. http://100.x.x.x:8000
const SUPABASE_URL = 'http://192.168.86.218:8000'

// ANON_KEY from ~/builds/theIncredibles/backend/supabase/docker/.env
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
