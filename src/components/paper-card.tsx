import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { ActivePaper } from '@/types';

function creditorLabel(paper: ActivePaper) {
  const { creditor } = paper;
  if (creditor.businessName) return creditor.businessName;
  const name = [creditor.firstName, creditor.lastName].filter(Boolean).join(' ');
  return name || creditor.email || 'Creditor';
}

function formatAmount(value: number, currency: string) {
  return `${value.toLocaleString()} ${currency}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

export function PaperCard({ paper }: { paper: ActivePaper }) {
  const balance = paper.transactions.reduce((sum, tx) => {
    if (tx.type === 'payment') return sum - tx.value;
    return sum + tx.value;
  }, 0);
  const currency = paper.transactions[0]?.currency ?? '';

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{creditorLabel(paper)}</ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        Balance: {formatAmount(balance, currency)}
      </ThemedText>

      {paper.transactions.length === 0 ? (
        <ThemedText themeColor="textSecondary" type="small" style={styles.emptyTx}>
          No transactions yet.
        </ThemedText>
      ) : (
        <View style={styles.transactions}>
          {paper.transactions.map((tx) => (
            <View key={tx._id} style={styles.transactionRow}>
              <View style={styles.transactionMain}>
                <ThemedText type="small">{tx.text || tx.type}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  {formatDate(tx.createdAt)}
                </ThemedText>
              </View>
              <ThemedText
                type="smallBold"
                style={tx.type === 'payment' ? styles.payment : styles.debt}>
                {tx.type === 'payment' ? '-' : '+'}
                {formatAmount(tx.value, tx.currency)}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  emptyTx: {
    marginTop: Spacing.one,
  },
  transactions: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  transactionMain: {
    flex: 1,
    gap: 2,
  },
  debt: {
    color: '#c62828',
  },
  payment: {
    color: '#2e7d32',
  },
});
