import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

import InformationScreen from '../app/(tabs)/information';

const mockClear = jest.fn();

jest.mock(
  '@expo/vector-icons/Ionicons',
  () =>
    function MockIonicons() {
      return null;
    },
);

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () =>
    jest.requireActual<typeof import('@/constants/theme')>('@/constants/theme').palette.light,
}));

jest.mock('@/features/privacy/use-local-data-controls', () => ({
  useLocalDataControls: () => ({
    activeScope: undefined,
    message: undefined,
    error: undefined,
    clear: mockClear,
  }),
}));

describe('información legal y privacidad', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('hace localizables atribución, licencias y privacidad de Wikimedia', () => {
    render(<InformationScreen />);

    expect(screen.getByText(/revisión concreta/)).toBeOnTheScreen();
    expect(screen.getByText(/código.*no tienen una licencia pública/i)).toBeOnTheScreen();
    expect(screen.getByText(/dirección IP.*agente de usuario/i)).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Licencia CC BY-SA 4.0' }));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://creativecommons.org/licenses/by-sa/4.0/deed.es',
    );

    fireEvent.press(screen.getByRole('button', { name: 'Política de privacidad de Wikimedia' }));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://foundation.wikimedia.org/wiki/Policy:Privacy_policy',
    );

    expect(screen.getByText(/danskdictionary\.support@gmail\.com/i)).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: 'Política de privacidad de Dansk Dictionary' }),
    );
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://xof96.github.io/dansk_dictionary/privacy-policy.html',
    );

    fireEvent.press(screen.getByRole('button', { name: 'Contactar sobre privacidad' }));
    expect(Linking.openURL).toHaveBeenCalledWith('mailto:danskdictionary.support@gmail.com');
  });

  it('confirma antes de borrar todos los datos locales', () => {
    const alert = jest.spyOn(Alert, 'alert');
    render(<InformationScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Borrar todos los datos locales' }));

    expect(alert).toHaveBeenCalledWith(
      '¿Borrar todos los datos locales?',
      expect.stringContaining('historial, los favoritos'),
      expect.any(Array),
    );
    const buttons = alert.mock.calls[0]?.[2];
    const destructive = buttons?.find((button) => button.style === 'destructive');
    destructive?.onPress?.();
    expect(mockClear).toHaveBeenCalledWith('all');
  });
});
