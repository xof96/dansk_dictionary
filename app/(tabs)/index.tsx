import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { StoredEntryRow } from '@/components/stored-entry-row';
import { AppText, Card, EmptyState, PageScroll } from '@/components/ui';
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
      <View style={styles.hero}>
        <AppText variant="caption" style={{ color: colors.primary, fontWeight: '800' }}>
          DANSK → ESPAÑOL · ENGLISH
        </AppText>
        <AppText variant="title">¿Qué palabra buscas?</AppText>
        <AppText variant="body" style={{ color: colors.muted }}>
          Busca una palabra danesa exacta, también si está flexionada.
        </AppText>
      </View>

      <View
        style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Ionicons name="search" size={22} color={colors.muted} />
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
          <Ionicons name="arrow-forward" size={23} color={colors.background} />
        </Pressable>
      </View>

      <Card>
        <AppText variant="heading">Prueba el corte vertical</AppText>
        <View style={styles.quickTerms}>
          {['hus', 'hedde', 'hedder'].map((quickTerm) => (
            <Pressable
              key={quickTerm}
              accessibilityRole="button"
              onPress={() => openEntry(quickTerm)}
              style={[styles.quickTerm, { backgroundColor: colors.primarySoft }]}
            >
              <AppText style={{ color: colors.primary, fontWeight: '800' }}>{quickTerm}</AppText>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.sectionTitle}>
        <AppText variant="heading">Recientes</AppText>
        <Pressable accessibilityRole="link" onPress={() => router.push('/history')}>
          <AppText style={{ color: colors.primary, fontWeight: '700' }}>Ver todo</AppText>
        </Pressable>
      </View>
      {history.loading ? (
        <AppText variant="caption">Cargando historial…</AppText>
      ) : history.items.length === 0 ? (
        <EmptyState
          title="Aún no hay búsquedas"
          message="Las consultas exactas aparecerán aquí y seguirán disponibles sin conexión."
        />
      ) : (
        <Card>
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
  hero: { gap: 8, paddingTop: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 17,
    padding: 7,
    paddingLeft: 14,
    gap: 8,
  },
  input: { flex: 1, minHeight: 48, fontSize: 18 },
  searchButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  quickTerms: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  quickTerm: {
    minHeight: 48,
    minWidth: 76,
    paddingHorizontal: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  sectionTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
