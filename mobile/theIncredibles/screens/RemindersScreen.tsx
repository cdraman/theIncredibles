import { View, Text, StyleSheet } from 'react-native'

export default function RemindersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Reminders</Text>
      <Text style={styles.sub}>Coming soon...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  text: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  sub: { color: '#888', fontSize: 14, marginTop: 8 },
})
