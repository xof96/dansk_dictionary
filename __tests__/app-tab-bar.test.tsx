import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { AppTabBar } from '@/components/app-tab-bar';

type AppTabBarProps = ComponentProps<typeof AppTabBar>;

jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return function MockIonicons({ name }: { name: string }) {
    return React.createElement(Text, null, name);
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 24, left: 0 }),
}));

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    background: '#F7F9FF',
    navBackground: '#FFFFFF',
    border: '#DFE3EB',
    shadow: '#183153',
    primary: '#171717',
    primaryForeground: '#FFFFFF',
    muted: '#667085',
  }),
}));

const routes = [
  { key: 'index-key', name: 'index' },
  { key: 'favorites-key', name: 'favorites' },
  { key: 'history-key', name: 'history' },
  { key: 'information-key', name: 'information' },
];

function buildProps({
  index = 0,
  prevented = false,
}: { index?: number; prevented?: boolean } = {}) {
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented: prevented })),
    navigate: jest.fn(),
  };
  const props = {
    state: { index, routes },
    descriptors: {
      'index-key': {
        options: {
          title: 'Buscar',
          tabBarAccessibilityLabel: 'Buscar en el diccionario',
        },
      },
      'favorites-key': { options: { title: 'Favoritos' } },
      'history-key': { options: { title: 'Historial' } },
      'information-key': { options: { title: 'Información' } },
    },
    navigation,
    insets: { top: 0, right: 0, bottom: 24, left: 0 },
  } as unknown as AppTabBarProps;

  return { navigation, props };
}

describe('barra de navegación inferior', () => {
  it('muestra las cuatro pestañas con sus nombres accesibles', () => {
    render(<AppTabBar {...buildProps().props} />);

    expect(screen.getByRole('tab', { name: 'Buscar en el diccionario' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Favoritos' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Historial' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Información' })).toBeOnTheScreen();
  });

  it('marca únicamente la ruta activa como seleccionada', () => {
    render(<AppTabBar {...buildProps({ index: 2 }).props} />);

    expect(screen.getByRole('tab', { name: 'Historial' }).props.accessibilityState).toEqual({
      selected: true,
    });
    expect(screen.getByRole('tab', { name: 'Favoritos' }).props.accessibilityState).toEqual({
      selected: false,
    });
    expect(screen.getByTestId('tab-history')).toHaveStyle({ backgroundColor: '#171717' });
  });

  it('navega una sola vez al pulsar una pestaña inactiva', () => {
    const { navigation, props } = buildProps();
    render(<AppTabBar {...props} />);

    fireEvent.press(screen.getByRole('tab', { name: 'Favoritos' }));

    expect(navigation.emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'favorites-key',
      canPreventDefault: true,
    });
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('favorites', undefined);
  });

  it('no navega de nuevo al pulsar la pestaña ya activa', () => {
    const { navigation, props } = buildProps({ index: 1 });
    render(<AppTabBar {...props} />);

    fireEvent.press(screen.getByRole('tab', { name: 'Favoritos' }));

    expect(navigation.emit).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('respeta un evento de navegación cancelado', () => {
    const { navigation, props } = buildProps({ prevented: true });
    render(<AppTabBar {...props} />);

    fireEvent.press(screen.getByRole('tab', { name: 'Historial' }));

    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('emite tabLongPress sin navegar', () => {
    const { navigation, props } = buildProps();
    render(<AppTabBar {...props} />);

    fireEvent(screen.getByRole('tab', { name: 'Información' }), 'longPress');

    expect(navigation.emit).toHaveBeenCalledWith({
      type: 'tabLongPress',
      target: 'information-key',
    });
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('mantiene el área segura, el padding simétrico y la tipografía Inter', () => {
    render(<AppTabBar {...buildProps().props} />);

    expect(screen.getByTestId('tab-bar-area')).toHaveStyle({ paddingBottom: 24 });
    expect(screen.getByTestId('tab-index')).toHaveStyle({
      minHeight: 54,
      paddingVertical: 7,
    });
    expect(screen.getByText('Buscar')).toHaveStyle({ fontFamily: 'Inter_500Medium' });
    expect(screen.getByText('Buscar')).toHaveProp('maxFontSizeMultiplier', 2);
  });
});
