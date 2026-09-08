import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function TabLayout() {
  const colors = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryForeground,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: colors.primary,
        tabBarStyle: {
          height: 70,
          marginHorizontal: 12,
          marginBottom: 10,
          paddingHorizontal: 6,
          paddingVertical: 6,
          backgroundColor: colors.navBackground,
          borderTopWidth: 0,
          borderRadius: 16,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.16,
          shadowRadius: 14,
          elevation: 8,
        },
        tabBarItemStyle: {
          marginHorizontal: 2,
          marginVertical: 4,
          paddingVertical: 4,
          borderRadius: 10,
        },
        tabBarLabelStyle: { fontFamily: typography.medium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Buscar',
          tabBarAccessibilityLabel: 'Buscar en el diccionario',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="information"
        options={{
          title: 'Información',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
