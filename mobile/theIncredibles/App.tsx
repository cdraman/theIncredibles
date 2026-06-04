import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import LoginScreen from './screens/LoginScreen'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  // Placeholder — will be replaced with main navigation
  return (
    <View style={styles.home}>
      <Text style={styles.homeText}>Welcome, {session.user.email}</Text>
      <Text style={styles.homeSubText}>Dashboard coming soon...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  home: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  homeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  homeSubText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
})
