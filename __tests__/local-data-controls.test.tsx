import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { LocalDataScope, useLocalDataControls } from '@/features/privacy/use-local-data-controls';

const mockDatabase = {};
const mockRemoveQueries = jest.fn();
const mockClearAllLocalData = jest.fn();
const mockClearEntryCache = jest.fn();
const mockClearFavorites = jest.fn();
const mockClearHistory = jest.fn();

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockDatabase,
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ removeQueries: mockRemoveQueries }),
}));

jest.mock('@/infrastructure/storage/database', () => ({
  clearAllLocalData: (...args: unknown[]) => mockClearAllLocalData(...args),
  clearEntryCache: (...args: unknown[]) => mockClearEntryCache(...args),
  clearFavorites: (...args: unknown[]) => mockClearFavorites(...args),
  clearHistory: (...args: unknown[]) => mockClearHistory(...args),
}));

function Harness() {
  const controls = useLocalDataControls();
  const scopes: LocalDataScope[] = ['history', 'favorites', 'cache', 'all'];
  return (
    <>
      <Text testID="message">{controls.message ?? ''}</Text>
      <Text testID="error">{controls.error ?? ''}</Text>
      <Text testID="active-scope">{controls.activeScope ?? ''}</Text>
      {scopes.map((scope) => (
        <Pressable
          key={scope}
          accessibilityRole="button"
          accessibilityLabel={`Borrar ${scope}`}
          onPress={() => void controls.clear(scope)}
        />
      ))}
    </>
  );
}

describe('controles de datos locales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearAllLocalData.mockResolvedValue(undefined);
    mockClearEntryCache.mockResolvedValue(undefined);
    mockClearFavorites.mockResolvedValue(undefined);
    mockClearHistory.mockResolvedValue(undefined);
  });

  it.each([
    ['history', mockClearHistory, 'Se borró todo el historial.'],
    ['favorites', mockClearFavorites, 'Se borraron todos los favoritos.'],
    ['cache', mockClearEntryCache, 'Se borró toda la caché de entradas.'],
    ['all', mockClearAllLocalData, 'Se borraron el historial, los favoritos y la caché.'],
  ] as const)('borra %s y anuncia el resultado', async (scope, operation, message) => {
    render(<Harness />);

    fireEvent.press(screen.getByRole('button', { name: `Borrar ${scope}` }));

    await waitFor(() => expect(operation).toHaveBeenCalledWith(mockDatabase));
    await waitFor(() => expect(screen.getByTestId('message')).toHaveTextContent(message));
    expect(screen.getByTestId('active-scope')).toHaveTextContent('');
    if (scope === 'cache' || scope === 'all') {
      expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['dictionary-entry'] });
    } else {
      expect(mockRemoveQueries).not.toHaveBeenCalled();
    }
  });

  it('expone un fallo de borrado sin anunciar éxito', async () => {
    mockClearAllLocalData.mockRejectedValueOnce(new Error('La base está bloqueada.'));
    render(<Harness />);

    fireEvent.press(screen.getByRole('button', { name: 'Borrar all' }));

    await waitFor(() =>
      expect(screen.getByTestId('error')).toHaveTextContent('La base está bloqueada.'),
    );
    expect(screen.getByTestId('message')).toHaveTextContent('');
    expect(mockRemoveQueries).not.toHaveBeenCalled();
  });
});
