import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Buscar', tabBarAccessibilityLabel: 'Buscar en el diccionario' }}
      />
      <Tabs.Screen name="favorites" options={{ title: 'Favoritos' }} />
      <Tabs.Screen name="history" options={{ title: 'Historial' }} />
      <Tabs.Screen name="information" options={{ title: 'Información' }} />
    </Tabs>
  );
}
