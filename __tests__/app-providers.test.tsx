import { render, screen } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';

import { AppProviders } from '@/providers/app-providers';

const mockSQLiteProvider = jest.fn(({ children }: PropsWithChildren) => children);

jest.mock('expo-sqlite', () => ({
  SQLiteProvider: (props: PropsWithChildren) => mockSQLiteProvider(props),
}));

jest.mock('expo-network', () => ({
  addNetworkStateListener: () => ({ remove: jest.fn() }),
  getNetworkStateAsync: () => new Promise(() => undefined),
}));

describe('AppProviders', () => {
  beforeEach(() => {
    mockSQLiteProvider.mockClear();
  });

  it('inicializa SQLite sin suspender el árbol de navegación', () => {
    render(
      <AppProviders>
        <Text>Contenido</Text>
      </AppProviders>,
    );

    expect(screen.getByText('Contenido')).toBeOnTheScreen();
    expect(mockSQLiteProvider).toHaveBeenCalledWith(
      expect.not.objectContaining({ useSuspense: true }),
    );
  });
});
