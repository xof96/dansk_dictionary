import { useColorScheme } from 'react-native';

import { palette } from '@/constants/theme';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? palette.dark : palette.light;
}
