import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Pill } from '@/components/ui';
import { EntryKind } from '@/domain/models/dictionary';
import { useAppTheme } from '@/hooks/use-app-theme';

export function StoredEntryRow({
  term,
  entryKind,
  subtitle,
  onOpen,
  onRemove,
}: {
  term: string;
  entryKind: EntryKind;
  subtitle: string;
  onOpen: () => void;
  onRemove?: () => void;
}) {
  const colors = useAppTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Abrir ${term}`}
        onPress={onOpen}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={styles.termLine}>
          <AppText variant="heading">{term}</AppText>
          <Pill>{entryKind === 'lemma' ? 'lema' : 'forma'}</Pill>
        </View>
        <AppText variant="caption">{subtitle}</AppText>
      </Pressable>
      {!onRemove ? (
        <Ionicons accessible={false} name="chevron-forward" size={20} color={colors.muted} />
      ) : null}
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${term}`}
          accessibilityHint="Elimina esta entrada de la lista"
          hitSlop={10}
          onPress={onRemove}
          style={styles.remove}
        >
          <Ionicons accessible={false} name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  main: { flex: 1, minHeight: 68, paddingVertical: 13, gap: 5, justifyContent: 'center' },
  termLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  remove: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
});
