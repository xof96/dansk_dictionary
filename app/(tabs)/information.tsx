import { Ionicons } from '@expo/vector-icons';
import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, DenmarkFlag, GradientHeader, PageScroll, Pill } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';

function InformationCard({
  icon,
  title,
  children,
  tone = 'blue',
}: PropsWithChildren<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tone?: 'blue' | 'pink' | 'yellow';
}>) {
  const colors = useAppTheme();
  const iconBackground =
    tone === 'pink'
      ? colors.accentPink
      : tone === 'yellow'
        ? colors.accentYellow
        : colors.accentSoft;
  const iconColor = tone === 'blue' ? colors.text : '#171717';
  return (
    <Card>
      <View style={styles.cardHeading}>
        <View style={[styles.cardIcon, { backgroundColor: iconBackground }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <AppText variant="heading" style={styles.headingText}>
          {title}
        </AppText>
      </View>
      {children}
    </Card>
  );
}

export default function InformationScreen() {
  return (
    <PageScroll>
      <GradientHeader
        eyebrow="Cómo funciona"
        title="Información"
        description="Fuentes, privacidad y convenciones lingüísticas explicadas con claridad."
        action={<DenmarkFlag />}
      />
      <InformationCard icon="library-outline" title="Fuentes y licencias">
        <AppText>
          Las entradas se consultan mediante la API oficial de Wiktionary en inglés y se validan
          antes de mostrarse. El texto reutilizado se atribuye bajo CC BY-SA 4.0 con enlace y
          revisión de origen.
        </AppText>
        <AppText>
          Las traducciones al español y los ejemplos marcados como pedagógicos son contenido
          editorial propio. Den Danske Ordbog se usa solo como referencia funcional: no se copia ni
          se extrae su contenido.
        </AppText>
      </InformationCard>
      <InformationCard icon="shield-checkmark-outline" title="Privacidad y conexión" tone="pink">
        <AppText>
          No hay cuentas, anuncios ni analítica. La palabra buscada se envía a Wiktionary.
          Historial, favoritos y caché se guardan únicamente en SQLite dentro del dispositivo.
        </AppText>
      </InformationCard>
      <InformationCard icon="text-outline" title="Género: en / et" tone="yellow">
        <View style={styles.pillRow}>
          <Pill tone="pink">en · género común</Pill>
          <Pill tone="yellow">et · género neutro</Pill>
        </View>
        <AppText>
          El artículo forma parte de la información que conviene aprender con cada sustantivo: en
          dag, et hus.
        </AppText>
      </InformationCard>
      <InformationCard icon="pulse-outline" title="IPA y stød">
        <AppText>
          /…/ representa una transcripción fonémica; […] una transcripción fonética más concreta. El
          signo ˈ marca el acento principal y ː la longitud. El stød es un rasgo laríngeo
          característico del danés y suele marcarse con ˀ en estas transcripciones.
        </AppText>
        <AppText>
          La aplicación nunca construye IPA de frases concatenando palabras ni copia la del lema a
          una forma flexionada.
        </AppText>
      </InformationCard>
      <InformationCard icon="volume-high-outline" title="Audio humano y TTS" tone="pink">
        <AppText>
          Una grabación solo se mostrará como humana cuando la fuente y su licencia lo acrediten.
          Actualmente el botón de audio usa el motor TTS danés del dispositivo y siempre aparece
          identificado como “voz sintética”.
        </AppText>
      </InformationCard>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingText: { flex: 1 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
