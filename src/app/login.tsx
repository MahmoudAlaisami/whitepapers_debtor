import { Redirect } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/debtorClient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { isAuthenticated, isLoading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async () => {
    setError(null);
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      console.log(err);
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.formWrap}>
          <ThemedText type="subtitle" style={styles.title}>
            Debtor sign in
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            Your account is created by your creditor. Sign in with the username and password they
            provided.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.fieldGroup}>
            <ThemedText type="smallBold">Username</ThemedText>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!submitting}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              value={username}
            />
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.fieldGroup}>
            <ThemedText type="smallBold">Password</ThemedText>
            <TextInput
              editable={!submitting}
              onChangeText={setPassword}
              placeholder="password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              value={password}
            />
          </ThemedView>

          {error ? (
            <ThemedText style={styles.error} type="small">
              {error}
            </ThemedText>
          ) : null}

          <Pressable
            disabled={submitting}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              (pressed || submitting) && styles.buttonPressed,
            ]}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText} type="smallBold">
                Sign in
              </ThemedText>
            )}
          </Pressable>
        </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrap: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  fieldGroup: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#ffffff',
  },
});
