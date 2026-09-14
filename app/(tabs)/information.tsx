import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import {
  ActionButton,
  AppText,
  Card,
  DenmarkFlag,
  GradientHeader,
  PageScroll,
  Pill,
} from '@/components/ui';
import { legalLinks, privacyContactEmail } from '@/features/privacy/legal-links';
import { LocalDataScope, useLocalDataControls } from '@/features/privacy/use-local-data-controls';
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
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[styles.cardIcon, { backgroundColor: iconBackground }]}
        >
          <Ionicons accessible={false} name={icon} size={22} color={iconColor} />
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
  const localData = useLocalDataControls();

  const confirmClear = (
    scope: LocalDataScope,
    title: string,
    description: string,
    actionLabel: string,
  ) => {
    Alert.alert(title, description, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: actionLabel,
        style: 'destructive',
        onPress: () => void localData.clear(scope),
      },
    ]);
  };

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
          antes de mostrarse. Cada entrada enlaza una revisión concreta, acredita a sus
          contribuidores e indica la fecha, licencia y modificaciones realizadas.
        </AppText>
        <AppText>
          El texto original de Wiktionary se ofrece bajo CC BY-SA 4.0 y GFDL. Esta aplicación usa CC
          BY-SA 4.0 como vía para reutilizar ese texto; las aportaciones adaptadas deben conservar
          atribución, aviso de cambios y compartir-igual.
        </AppText>
        <View style={styles.actionList}>
          <ActionButton
            label="Derechos de Wiktionary"
            kind="secondary"
            onPress={() => void Linking.openURL(legalLinks.wiktionaryCopyright)}
          />
          <ActionButton
            label="Términos de uso de Wikimedia"
            kind="secondary"
            onPress={() => void Linking.openURL(legalLinks.wikimediaTerms)}
          />
          <ActionButton
            label="Licencia CC BY-SA 4.0"
            kind="secondary"
            onPress={() => void Linking.openURL(legalLinks.ccBySa)}
          />
          <ActionButton
            label="Licencia GFDL"
            kind="secondary"
            onPress={() => void Linking.openURL(legalLinks.gfdl)}
          />
        </View>
        <AppText variant="caption">
          Dansk Dictionary no está desarrollado, patrocinado ni respaldado por Wikimedia. Las
          traducciones y ejemplos pedagógicos son contenido editorial propio y mantienen una
          atribución separada.
        </AppText>
        <AppText variant="caption">
          Durante la beta, el código y el contenido editorial propio no tienen una licencia pública
          y mantienen todos los derechos reservados. Den Danske Ordbog es solo una referencia
          funcional: no se copia ni se extrae su contenido, audio o diseño.
        </AppText>
      </InformationCard>
      <InformationCard icon="shield-checkmark-outline" title="Privacidad y conexión" tone="pink">
        <AppText>
          No hay cuentas, anuncios, analítica, rastreadores ni un servidor propio. Cuando buscas, la
          palabra se envía a la API de Wikimedia para recuperar Wiktionary. Como en cualquier
          conexión web, Wikimedia recibe datos técnicos como la dirección IP, el agente de usuario,
          el sistema operativo y la fecha de la solicitud conforme a su propia política.
        </AppText>
        <AppText>
          Historial, favoritos y caché se guardan en SQLite únicamente en este dispositivo hasta que
          los borres desde esta pantalla o desinstales la aplicación. Dansk Dictionary no los envía
          a terceros ni los sincroniza.
        </AppText>
        <ActionButton
          label="Política de privacidad de Wikimedia"
          kind="secondary"
          onPress={() => void Linking.openURL(legalLinks.wikimediaPrivacy)}
        />
        <ActionButton
          label="Política de privacidad de Dansk Dictionary"
          kind="secondary"
          onPress={() => void Linking.openURL(legalLinks.danskDictionaryPrivacy)}
        />
        <ActionButton
          label="Contactar sobre privacidad"
          kind="secondary"
          onPress={() => void Linking.openURL(`mailto:${privacyContactEmail}`)}
        />
        <AppText variant="caption">
          Contacto de privacidad: {privacyContactEmail}. La política se publicará mediante GitHub
          Pages antes de enviar la aplicación a Google Play.
        </AppText>
      </InformationCard>
      <InformationCard icon="trash-outline" title="Control de datos locales" tone="yellow">
        <AppText>
          Puedes borrar cada categoría por separado o eliminar todos los datos locales. La acción no
          se puede deshacer y siempre requiere confirmación.
        </AppText>
        <View style={styles.actionList}>
          <ActionButton
            label="Borrar historial"
            kind="danger"
            disabled={Boolean(localData.activeScope)}
            accessibilityState={{ busy: localData.activeScope === 'history' }}
            onPress={() =>
              confirmClear(
                'history',
                '¿Borrar todo el historial?',
                'Se eliminarán todas las palabras consultadas.',
                'Borrar historial',
              )
            }
          />
          <ActionButton
            label="Borrar favoritos"
            kind="danger"
            disabled={Boolean(localData.activeScope)}
            accessibilityState={{ busy: localData.activeScope === 'favorites' }}
            onPress={() =>
              confirmClear(
                'favorites',
                '¿Borrar todos los favoritos?',
                'Se eliminarán todas las palabras guardadas como favoritas.',
                'Borrar favoritos',
              )
            }
          />
          <ActionButton
            label="Borrar caché"
            kind="danger"
            disabled={Boolean(localData.activeScope)}
            accessibilityState={{ busy: localData.activeScope === 'cache' }}
            onPress={() =>
              confirmClear(
                'cache',
                '¿Borrar toda la caché?',
                'Las entradas dejarán de estar disponibles sin conexión hasta que vuelvas a consultarlas.',
                'Borrar caché',
              )
            }
          />
          <ActionButton
            label="Borrar todos los datos locales"
            kind="danger"
            disabled={Boolean(localData.activeScope)}
            accessibilityState={{ busy: localData.activeScope === 'all' }}
            onPress={() =>
              confirmClear(
                'all',
                '¿Borrar todos los datos locales?',
                'Se eliminarán el historial, los favoritos y todas las entradas guardadas en caché.',
                'Borrar todo',
              )
            }
          />
        </View>
        {localData.message ? (
          <AppText accessibilityRole="alert" accessibilityLiveRegion="polite">
            {localData.message}
          </AppText>
        ) : null}
        {localData.error ? (
          <AppText accessibilityRole="alert" accessibilityLiveRegion="assertive">
            {localData.error} Puedes volver a intentarlo con el mismo botón.
          </AppText>
        ) : null}
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
  actionList: { gap: 10 },
});
