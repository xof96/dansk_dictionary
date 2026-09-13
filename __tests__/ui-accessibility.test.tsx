import { fireEvent, render, screen } from '@testing-library/react-native';

import { ActionButton, AppText, ErrorState, SuggestionButton } from '@/components/ui';
import { palette } from '@/constants/theme';

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () =>
    jest.requireActual<typeof import('@/constants/theme')>('@/constants/theme').palette.light,
}));

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4),
    );

  if (!channels || channels.length !== 3) throw new Error(`Color hexadecimal inválido: ${hex}`);
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('componentes accesibles compartidos', () => {
  it('mantiene los botones, incluso compactos, en al menos 48 px y expone su estado', () => {
    render(<ActionButton label="Guardar" compact disabled onPress={jest.fn()} />);

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toHaveStyle({ minHeight: 48 });
    expect(button.props.accessibilityState).toEqual({ disabled: true });
  });

  it('mantiene las sugerencias en al menos 48 px', () => {
    render(<SuggestionButton label="hedder" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Buscar hedder' })).toHaveStyle({ minHeight: 48 });
  });

  it('expone títulos como encabezados y permite escalado tipográfico sin límite propio', () => {
    render(<AppText variant="heading">Pronunciación</AppText>);

    const heading = screen.getByRole('header', { name: 'Pronunciación' });
    expect(heading.props.maxFontSizeMultiplier).toBeUndefined();
  });

  it('anuncia los errores y conserva una acción de recuperación', () => {
    const retry = jest.fn();
    render(<ErrorState title="No se pudo cargar" message="Comprueba los datos." onRetry={retry} />);

    expect(screen.getByRole('alert', { name: 'No se pudo cargar' })).toHaveProp(
      'accessibilityLiveRegion',
      'assertive',
    );
    fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});

describe('contraste de texto del tema', () => {
  it.each([
    ['light text/background', palette.light.text, palette.light.background],
    ['light text/surface', palette.light.text, palette.light.surface],
    ['light muted/surface', palette.light.muted, palette.light.surface],
    ['light muted/accentSoft', palette.light.muted, palette.light.accentSoft],
    ['light primary', palette.light.primaryForeground, palette.light.primary],
    ['light accent/surface', palette.light.accent, palette.light.surface],
    ['light accent/primarySoft', palette.light.accent, palette.light.primarySoft],
    ['light danger/surface', palette.light.danger, palette.light.surface],
    ['dark text/background', palette.dark.text, palette.dark.background],
    ['dark text/surface', palette.dark.text, palette.dark.surface],
    ['dark muted/surface', palette.dark.muted, palette.dark.surface],
    ['dark muted/accentSoft', palette.dark.muted, palette.dark.accentSoft],
    ['dark primary', palette.dark.primaryForeground, palette.dark.primary],
    ['dark accent/surface', palette.dark.accent, palette.dark.surface],
    ['dark accent/primarySoft', palette.dark.accent, palette.dark.primarySoft],
    ['dark danger/surface', palette.dark.danger, palette.dark.surface],
  ])('%s alcanza WCAG AA para texto normal', (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
