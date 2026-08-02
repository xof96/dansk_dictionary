import * as Network from 'expo-network';
import { SQLiteProvider } from 'expo-sqlite';
import { PropsWithChildren, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { migrateDatabase } from '@/infrastructure/storage/database';

function QueryEnvironment() {
  useEffect(() => {
    const networkSubscription = Network.addNetworkStateListener((state) => {
      onlineManager.setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    void Network.getNetworkStateAsync().then((state) => {
      onlineManager.setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    const appStateSubscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });

    return () => {
      networkSubscription.remove();
      appStateSubscription.remove();
    };
  }, []);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 24 * 60 * 60 * 1_000,
            gcTime: 7 * 24 * 60 * 60 * 1_000,
            retry: (failureCount, error) =>
              failureCount < 1 && (!(error instanceof Error) || !error.message.includes('formato')),
            networkMode: 'always',
          },
        },
      }),
  );

  return (
    <SQLiteProvider databaseName="dansk-dictionary.db" onInit={migrateDatabase} useSuspense>
      <QueryClientProvider client={queryClient}>
        <QueryEnvironment />
        {children}
      </QueryClientProvider>
    </SQLiteProvider>
  );
}
