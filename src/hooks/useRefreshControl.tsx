import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { queryClient } from '@/api/client/query/queryClient';

export function useRefreshControl() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#485aff" colors={['#485aff']} />
  );

  return { refreshing, onRefresh, refreshControl };
}
