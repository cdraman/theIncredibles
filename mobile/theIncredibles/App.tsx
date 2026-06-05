import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import LoginScreen from './screens/LoginScreen'
import TasksScreen from './screens/TasksScreen'
import NotesScreen from './screens/NotesScreen'
import RemindersScreen from './screens/RemindersScreen'
import PhotosScreen from './screens/PhotosScreen'

const Tab = createBottomTabNavigator()

function MainApp({ session }: { session: Session }) {
  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#0f0f0f' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity onPress={signOut} style={{ marginRight: 16 }}>
              <Text style={{ color: '#e63946', fontSize: 14 }}>Sign Out</Text>
            </TouchableOpacity>
          ),
          tabBarStyle: {
            backgroundColor: '#0f0f0f',
            borderTopColor: '#222',
          },
          tabBarActiveTintColor: '#e63946',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen
          name="Tasks"
          component={TasksScreen}
          options={{ tabBarLabel: 'Tasks' }}
        />
        <Tab.Screen
          name="Notes"
          component={NotesScreen}
          options={{ tabBarLabel: 'Notes' }}
        />
        <Tab.Screen
          name="Reminders"
          component={RemindersScreen}
          options={{ tabBarLabel: 'Reminders' }}
        />
        <Tab.Screen
          name="Photos"
          component={PhotosScreen}
          options={{ tabBarLabel: 'Photos' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

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

  return <MainApp session={session} />
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
})
