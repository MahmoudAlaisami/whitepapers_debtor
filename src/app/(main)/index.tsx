import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, fetchActivePapers } from '@/api/debtorClient';
import { PaperCard } from '@/components/paper-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import type { ActivePaper } from '@/types';

export default function PapersScreen() {
  const [papers, setPapers] = useState<ActivePaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPapers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchActivePapers();
      setPapers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your papers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.title}>
          Active papers
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.subtitle}>
          Debts and payments recorded by your creditors.
        </ThemedText>

        {error ? (
          <ThemedText style={styles.error} type="small">
            {error}
          </ThemedText>
        ) : null}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={papers}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText themeColor="textSecondary" type="small">
                No active papers yet.
              </ThemedText>
            </ThemedView>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadPapers(true)} />
          }
          renderItem={({ item }) => <PaperCard paper={item} />}
          style={styles.list}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: Platform.OS === 'web' ? Spacing.five : Spacing.two,
    marginBottom: Spacing.one,
  },
  subtitle: {
    marginBottom: Spacing.three,
  },
  error: {
    color: '#d32f2f',
    marginBottom: Spacing.two,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  empty: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});
