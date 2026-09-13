import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { useFavorites } from '@/features/favorites/use-favorites';
import { useHistory } from '@/features/history/use-history';

const mockDatabase = {};
const mockListFavorites = jest.fn();
const mockRemoveFavorite = jest.fn();
const mockListHistory = jest.fn();
const mockRemoveHistory = jest.fn();
const mockClearHistory = jest.fn();

jest.mock('expo-sqlite', () => ({
  useSQLiteContext: () => mockDatabase,
}));

jest.mock('expo-router/react-navigation', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    useFocusEffect: (callback: () => void | (() => void)) => React.useEffect(callback, [callback]),
  };
});

jest.mock('@/infrastructure/storage/database', () => ({
  listFavorites: (...args: unknown[]) => mockListFavorites(...args),
  removeFavorite: (...args: unknown[]) => mockRemoveFavorite(...args),
  listHistory: (...args: unknown[]) => mockListHistory(...args),
  removeHistory: (...args: unknown[]) => mockRemoveHistory(...args),
  clearHistory: (...args: unknown[]) => mockClearHistory(...args),
}));

function FavoritesHarness() {
  const favorites = useFavorites();
  return (
    <>
      <Text testID="favorites-error">{favorites.error ?? ''}</Text>
      <Text testID="favorites-loading">{String(favorites.loading)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reintentar favoritos"
        onPress={() => void favorites.refresh()}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Eliminar favorito"
        onPress={() => void favorites.remove('hedde')}
      />
    </>
  );
}

function HistoryHarness() {
  const history = useHistory();
  return (
    <>
      <Text testID="history-error">{history.error ?? ''}</Text>
      <Text testID="history-loading">{String(history.loading)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reintentar historial"
        onPress={() => void history.refresh()}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Borrar historial"
        onPress={() => void history.clear()}
      />
    </>
  );
}

describe('errores recuperables de listas guardadas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListFavorites.mockResolvedValue([]);
    mockRemoveFavorite.mockResolvedValue(undefined);
    mockListHistory.mockResolvedValue([]);
    mockRemoveHistory.mockResolvedValue(undefined);
    mockClearHistory.mockResolvedValue(undefined);
  });

  it('expone un error de favoritos y permite reintentar la lectura', async () => {
    mockListFavorites.mockRejectedValueOnce(new Error('No se pudo abrir favoritos.'));
    render(<FavoritesHarness />);

    await waitFor(() =>
      expect(screen.getByTestId('favorites-error')).toHaveTextContent(
        'No se pudo abrir favoritos.',
      ),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Reintentar favoritos' }));
    await waitFor(() => expect(screen.getByTestId('favorites-error')).toHaveTextContent(''));
    expect(screen.getByTestId('favorites-loading')).toHaveTextContent('false');
    expect(mockListFavorites).toHaveBeenCalledTimes(2);
  });

  it('expone un error de historial y permite reintentar la lectura', async () => {
    mockListHistory.mockRejectedValueOnce(new Error('No se pudo abrir el historial.'));
    render(<HistoryHarness />);

    await waitFor(() =>
      expect(screen.getByTestId('history-error')).toHaveTextContent(
        'No se pudo abrir el historial.',
      ),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Reintentar historial' }));
    await waitFor(() => expect(screen.getByTestId('history-error')).toHaveTextContent(''));
    expect(screen.getByTestId('history-loading')).toHaveTextContent('false');
    expect(mockListHistory).toHaveBeenCalledTimes(2);
  });

  it('convierte un fallo de borrado en un estado visible y accionable', async () => {
    mockClearHistory.mockRejectedValueOnce(new Error('No se pudo borrar el historial.'));
    render(<HistoryHarness />);

    await waitFor(() => expect(screen.getByTestId('history-loading')).toHaveTextContent('false'));
    fireEvent.press(screen.getByRole('button', { name: 'Borrar historial' }));
    await waitFor(() =>
      expect(screen.getByTestId('history-error')).toHaveTextContent(
        'No se pudo borrar el historial.',
      ),
    );
  });
});
