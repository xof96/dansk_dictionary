import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode } from 'react';
import {
  type AccessibilityState,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { typography } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export function Screen({ children }: PropsWithChildren) {
  const colors = useAppTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      {children}
    </SafeAreaView>
  );
}

export function PageScroll({
  children,
  contentContainerStyle,
}: PropsWithChildren<{ contentContainerStyle?: StyleProp<ViewStyle> }>) {
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.page, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
    variant?: 'display' | 'title' | 'heading' | 'body' | 'caption';
    style?: StyleProp<TextStyle>;
  }
>) {
  const colors = useAppTheme();
  const accessibilityRole =
    textProps.accessibilityRole ??
    (variant === 'display' || variant === 'title' || variant === 'heading' ? 'header' : undefined);
  return (
    <Text
      {...textProps}
      accessibilityRole={accessibilityRole}
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

export function Card({
  children,
  style,
  tone = 'surface',
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; tone?: 'surface' | 'soft' }>) {
  const colors = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tone === 'soft' ? colors.accentSoft : colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Pill({
  children,
  tone = 'accent',
}: PropsWithChildren<{ tone?: 'accent' | 'neutral' | 'pink' | 'yellow' }>) {
  const colors = useAppTheme();
  const backgroundColor =
    tone === 'pink'
      ? colors.accentPink
      : tone === 'yellow'
        ? colors.accentYellow
        : tone === 'neutral'
          ? colors.background
          : colors.primarySoft;
  const foregroundColor =
    tone === 'accent'
      ? colors.accent
      : tone === 'pink' || tone === 'yellow'
        ? '#171717'
        : colors.text;
  return (
    <View style={[styles.pill, { backgroundColor, borderColor: colors.border }]}>
      <AppText variant="caption" style={[styles.pillText, { color: foregroundColor }]}>
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
  compact = false,
  accessibilityHint,
  accessibilityState,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  kind?: 'primary' | 'secondary' | 'danger';
  compact?: boolean;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
}) {
  const colors = useAppTheme();
  const backgroundColor = kind === 'primary' ? colors.primary : colors.surface;
  const foregroundColor =
    kind === 'primary' ? colors.primaryForeground : kind === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compactButton,
        {
          backgroundColor,
          borderColor: kind === 'primary' ? colors.primary : colors.muted,
          shadowColor: colors.shadow,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon ? (
        <View accessible={false} importantForAccessibility="no-hide-descendants">
          {icon}
        </View>
      ) : null}
      <Text style={[styles.buttonText, { color: foregroundColor }]}>{label}</Text>
    </Pressable>
  );
}

export function SuggestionButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Buscar ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.suggestion,
        {
          backgroundColor: colors.surface,
          borderColor: colors.accent,
          shadowColor: colors.glow,
        },
        pressed && styles.pressed,
      ]}
    >
      <AppText style={[styles.suggestionText, { color: colors.accent }]}>{label}</AppText>
    </Pressable>
  );
}

export function DenmarkFlag() {
  const colors = useAppTheme();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Bandera de Dinamarca"
      style={[styles.flag, { borderColor: colors.surface, shadowColor: colors.shadow }]}
    >
      <View style={styles.flagHorizontal} />
      <View style={styles.flagVertical} />
    </View>
  );
}

export function GradientHeader({
  eyebrow,
  title,
  description,
  action,
  children,
}: PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}>) {
  const colors = useAppTheme();
  return (
    <LinearGradient
      colors={[colors.heroStart, colors.heroMiddle, colors.heroEnd]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[styles.gradientHeader, { borderColor: colors.border }]}
    >
      <View style={styles.headerTopLine}>
        <View style={styles.headerCopy}>
          {eyebrow ? (
            <AppText variant="caption" style={[styles.eyebrow, { color: colors.accent }]}>
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="display">{title}</AppText>
        </View>
        {action}
      </View>
      {description ? (
        <AppText style={[styles.headerDescription, { color: colors.text }]}>{description}</AppText>
      ) : null}
      {children}
    </LinearGradient>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeading}>
      <AppText variant="heading" style={styles.sectionHeadingTitle}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

export function LoadingState({ label = 'Consultando fuentes…' }: { label?: string }) {
  const colors = useAppTheme();
  return (
    <Card>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        style={styles.centerState}
      >
        <View style={[styles.loadingOrb, { backgroundColor: colors.accentSoft }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
        <AppText>{label}</AppText>
      </View>
    </Card>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  const colors = useAppTheme();
  return (
    <Card style={styles.centerState}>
      <View style={[styles.emptyMark, { backgroundColor: colors.accentSoft }]} />
      <AppText variant="heading">{title}</AppText>
      <AppText variant="caption" style={styles.centerText}>
        {message}
      </AppText>
    </Card>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <AppText variant="heading" accessibilityRole="alert" accessibilityLiveRegion="assertive">
        {title}
      </AppText>
      <AppText>{message}</AppText>
      <ActionButton label="Reintentar" onPress={onRetry} />
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { padding: 18, gap: 18, paddingBottom: 38 },
  display: {
    fontFamily: typography.extraBold,
    fontSize: 38,
    lineHeight: 41,
    letterSpacing: -1.4,
  },
  title: {
    fontFamily: typography.extraBold,
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.1,
  },
  heading: {
    fontFamily: typography.semibold,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.3,
  },
  body: { fontFamily: typography.regular, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: typography.regular, fontSize: 13, lineHeight: 19 },
  card: { borderRadius: 20, borderWidth: 1, padding: 17, gap: 12 },
  pill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  pillText: { fontFamily: typography.medium, lineHeight: 17 },
  button: {
    minHeight: 48,
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  compactButton: { minHeight: 48, paddingHorizontal: 13, paddingVertical: 8 },
  buttonText: { fontFamily: typography.semibold, fontSize: 15, lineHeight: 20 },
  suggestion: {
    minHeight: 48,
    minWidth: 74,
    paddingHorizontal: 17,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestionText: { fontFamily: typography.semibold },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
  flag: {
    width: 58,
    height: 38,
    overflow: 'hidden',
    backgroundColor: '#C8102E',
    borderRadius: 9,
    borderWidth: 2,
    transform: [{ rotate: '3deg' }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 4,
  },
  flagHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 15,
    height: 7,
    backgroundColor: '#FFFFFF',
  },
  flagVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 18,
    width: 7,
    backgroundColor: '#FFFFFF',
  },
  gradientHeader: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    gap: 13,
    overflow: 'hidden',
  },
  headerTopLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  headerCopy: { flex: 1, gap: 7 },
  eyebrow: {
    fontFamily: typography.bold,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  headerDescription: { maxWidth: 520 },
  sectionHeading: {
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionHeadingTitle: { flex: 1 },
  centerState: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 30 },
  centerText: { textAlign: 'center', maxWidth: 320 },
  loadingOrb: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMark: { width: 46, height: 7, borderRadius: 999 },
});
