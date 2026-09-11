import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { StoredEntryRow } from '@/components/stored-entry-row';
import {
  AppText,
  Card,
  DenmarkFlag,
  EmptyState,
  GradientHeader,
  PageScroll,
  SectionHeading,
  SuggestionButton,
} from '@/components/ui';
import { typography } from '@/constants/theme';
import { normalizeSearchTerm } from '@/domain/services/dictionary-policy';
import { useHistory } from '@/features/history/use-history';
import { useAppTheme } from '@/hooks/use-app-theme';

function openEntry(term: string) {
  router.push({ pathname: '/entry/[term]', params: { term } });
}

export default function SearchScreen() {
  const colors = useAppTheme();
  const [term, setTerm] = useState('');
  const history = useHistory(6);

  const submit = () => {
    const normalized = normalizeSearchTerm(term);
    if (!normalized) return;
    Keyboard.dismiss();
    openEntry(normalized);
  };

  return (
    <PageScroll>
      <GradientHeader
        eyebrow="Dansk → español · English"
        title="Encuentra la palabra exacta."
        description="Busca una palabra danesa tal como aparece, también cuando está flexionada."
        action={<DenmarkFlag />}
      >
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={21} color={colors.muted} />
          <TextInput
            accessibilityLabel="Palabra danesa"
            accessibilityHint="Admite las letras æ, ø y å"
            autoCapitalize="none"
            autoCorrect={false}
            enterKeyHint="search"
            onChangeText={setTerm}
            onSubmitEditing={submit}
            placeholder="hus, hedde, hedder…"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            style={[styles.input, { color: colors.text }]}
            value={term}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            disabled={!term.trim()}
            onPress={submit}
            style={({ pressed }) => [
              styles.searchButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
              !term.trim() && styles.disabled,
            ]}
          >
            <Ionicons name="arrow-forward" size={21} color={colors.primaryForeground} />
          </Pressable>
        </View>
        <View style={styles.exactNote}>
          <Ionicons name="git-branch-outline" size={18} color={colors.accent} />
          <AppText variant="caption" style={[styles.exactText, { color: colors.muted }]}>
            Cada forma conserva su propia entrada: hedder no se sustituye por hedde.
          </AppText>
        </View>
      </GradientHeader>

      <Card tone="soft">
        <View style={styles.suggestionTitle}>
          <View style={[styles.spark, { backgroundColor: colors.accentPink }]} />
          <AppText variant="heading">Empieza por una palabra</AppText>
        </View>
        <AppText variant="caption">
          Abre una consulta exacta para ver pronunciación, flexiones, traducciones y procedencia.
        </AppText>
        <View style={styles.quickTerms}>
          {['hus', 'hedde', 'hedder'].map((quickTerm) => (
            <SuggestionButton
              key={quickTerm}
              label={quickTerm}
              onPress={() => openEntry(quickTerm)}
            />
          ))}
        </View>
      </Card>

      <SectionHeading
        title="Recientes"
        action={
          <Pressable accessibilityRole="link" onPress={() => router.push('/history')}>
            <AppText style={[styles.link, { color: colors.accent }]}>Ver todo</AppText>
          </Pressable>
        }
      />
      {history.loading ? (
        <Card>
          <AppText variant="caption">Cargando historial…</AppText>
        </Card>
      ) : history.items.length === 0 ? (
        <EmptyState
          title="Aún no hay búsquedas"
          message="Las consultas exactas aparecerán aquí y seguirán disponibles sin conexión."
        />
      ) : (
        <Card style={styles.listCard}>
          {history.items.map((item) => (
            <StoredEntryRow
              key={item.query}
              term={item.displayTerm}
              entryKind={item.entryKind}
              subtitle={new Date(item.searchedAt).toLocaleString('es-ES')}
              onOpen={() => openEntry(item.query)}
            />
          ))}
        </Card>
      )}
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    padding: 6,
    paddingLeft: 13,
    gap: 8,
  },
  input: { flex: 1, minHeight: 46, fontFamily: typography.regular, fontSize: 17 },
  searchButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  exactNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  exactText: { flex: 1 },
  suggestionTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  spark: { width: 11, height: 11, borderRadius: 3, transform: [{ rotate: '15deg' }] },
  quickTerms: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingVertical: 4 },
  link: { fontFamily: typography.semibold, fontSize: 15 },
  listCard: { paddingTop: 2, paddingBottom: 2 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
});
