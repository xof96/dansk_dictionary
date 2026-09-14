import Ionicons from '@expo/vector-icons/Ionicons';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionButton, AppText } from '@/components/ui';
import { useAppTheme } from '@/hooks/use-app-theme';

const NORMAL_SPEECH_RATE = 0.95;
const SLOW_SPEECH_RATE = 0.3;

export function TtsButton({ text, slow = false }: { text: string; slow?: boolean }) {
  const colors = useAppTheme();
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string>();
  const label = playing ? 'Detener voz sintética' : slow ? 'Escuchar lento' : 'Escuchar';

  const toggle = async () => {
    setError(undefined);
    await Speech.stop();
    if (playing) {
      setPlaying(false);
      return;
    }

    setPlaying(true);
    Speech.speak(text, {
      language: 'da-DK',
      rate: slow ? SLOW_SPEECH_RATE : NORMAL_SPEECH_RATE,
      onDone: () => setPlaying(false),
      onStopped: () => setPlaying(false),
      onError: () => {
        setPlaying(false);
        setError('El motor de voz no pudo reproducir este texto.');
      },
    });
  };

  return (
    <View style={styles.wrapper}>
      <ActionButton
        label={label}
        kind="secondary"
        onPress={() => void toggle()}
        accessibilityHint="Usa la voz sintética danesa instalada en el dispositivo"
        accessibilityState={{ busy: playing }}
        icon={<Ionicons name={playing ? 'stop' : 'volume-medium'} size={20} color={colors.text} />}
      />
      <AppText variant="caption">Voz sintética · da-DK{slow ? ' · velocidad lenta' : ''}</AppText>
      {error ? (
        <AppText variant="caption" accessibilityRole="alert" accessibilityLiveRegion="assertive">
          {error} Pulsa de nuevo para reintentar.
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrapper: { gap: 6, alignItems: 'flex-start' } });
