import { Ionicons } from '@expo/vector-icons';
import type { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const tabIcons: Record<
  string,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  index: { active: 'search', inactive: 'search-outline' },
  favorites: { active: 'heart', inactive: 'heart-outline' },
  history: { active: 'time', inactive: 'time-outline' },
  information: { active: 'information-circle', inactive: 'information-circle-outline' },
};
const defaultTabIcons = { active: 'ellipse', inactive: 'ellipse-outline' } as const;
type AppTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const colors = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="tab-bar-area"
      style={[
        styles.tabBarArea,
        {
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.navBackground,
            borderColor: colors.border,
            shadowColor: colors.shadow,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;
          const options = descriptor.options;
          const focused = state.index === index;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;
          const icons = tabIcons[route.name] ?? defaultTabIcons;
          const foregroundColor = focused ? colors.primaryForeground : colors.muted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              testID={`tab-${route.name}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onLongPress={onLongPress}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabButton,
                focused && { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                accessible={false}
                name={focused ? icons.active : icons.inactive}
                color={foregroundColor}
                size={21}
              />
              <Text
                maxFontSizeMultiplier={2}
                numberOfLines={2}
                style={[styles.tabLabel, { color: foregroundColor }]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarArea: { paddingHorizontal: 12, paddingTop: 8 },
  tabBar: {
    flexDirection: 'row',
    padding: 5,
    borderWidth: 1,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 3,
    paddingVertical: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontFamily: typography.medium,
    fontSize: 10.5,
    lineHeight: 13,
    letterSpacing: -0.15,
    textAlign: 'center',
    flexShrink: 1,
  },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
