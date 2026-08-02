import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';

export function Screen({ children }: PropsWithChildren) {
  const colors = useAppTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {children}
    </SafeAreaView>
  );
}

export function PageScroll({ children }: PropsWithChildren) {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </Screen>
  );
}

export function AppText({
  children,
  variant = 'body',
  style,
  ...textProps
}: PropsWithChildren<
  Omit<TextProps, 'style'> & {
    variant?: 'title' | 'heading' | 'body' | 'caption';
    style?: TextStyle;
  }
>) {
  const colors = useAppTheme();
  return (
    <Text
      maxFontSizeMultiplier={1.8}
      {...textProps}
      style={[
        styles[variant],
        { color: variant === 'caption' ? colors.muted : colors.text },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  const colors = useAppTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
    >
      {children}
    </View>
  );
}

export function Pill({ children }: PropsWithChildren) {
  const colors = useAppTheme();
  return (
    <View style={[styles.pill, { backgroundColor: colors.primarySoft }]}>
      <AppText variant="caption" style={{ color: colors.primary }}>
        {children}
      </AppText>
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  icon,
  disabled = false,
  kind = 'primary',
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  kind?: 'primary' | 'secondary' | 'danger';
  accessibilityHint?: string;
}) {
  const colors = useAppTheme();
  const backgroundColor = kind === 'primary' ? colors.primary : colors.surface;
  const foregroundColor =
    kind === 'primary' ? colors.background : kind === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: kind === 'primary' ? colors.primary : colors.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: foregroundColor }]}>{label}</Text>
    </Pressable>
  );
}

export function LoadingState({ label = 'Consultando fuentes…' }: { label?: string }) {
  const colors = useAppTheme();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.centerState}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText>{label}</AppText>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card style={styles.centerState}>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="caption" style={styles.centerText}>
        {message}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '800', letterSpacing: -0.8 },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 25 },
  caption: { fontSize: 14, lineHeight: 20 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  button: {
    minHeight: 48,
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.45 },
  centerState: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 30 },
  centerText: { textAlign: 'center' },
});
