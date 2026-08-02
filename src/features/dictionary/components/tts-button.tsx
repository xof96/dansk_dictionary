import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionButton, AppText } from '@/components/ui';

export function TtsButton({ text, slow = false }: { text: string; slow?: boolean }) {
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
      rate: slow ? 0.65 : 0.95,
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
        icon={<Ionicons name={playing ? 'stop' : 'volume-medium'} size={20} />}
      />
      <AppText variant="caption">Voz sintética · da-DK{slow ? ' · velocidad lenta' : ''}</AppText>
      {error ? <AppText variant="caption">{error} Pulsa de nuevo para reintentar.</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({ wrapper: { gap: 6, alignItems: 'flex-start' } });
