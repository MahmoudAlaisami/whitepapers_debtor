import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, updateProfile } from '@/api/debtorClient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import type { DebtorGender } from '@/types';

function Field({
  label,
  value,
  onChangeText,
  editable = true,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.fieldGroup}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        autoCapitalize={autoCapitalize}
        editable={editable}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        value={value}
      />
    </ThemedView>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [birthDate, setBirthDate] = useState(
    user?.birthDate ? user.birthDate.slice(0, 10) : '',
  );
  const [gender, setGender] = useState<DebtorGender | ''>(user?.gender ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const updated = await updateProfile({
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        birthDate: birthDate.trim() ? birthDate.trim() : null,
        gender: gender || undefined,
        address: address.trim() || undefined,
      });
      await updateUser(updated);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <ThemedText type="subtitle" style={styles.title}>
              Profile
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              View and update your personal details.
            </ThemedText>

            <Field label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            <Field label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field
              label="Birth date (YYYY-MM-DD)"
              value={birthDate}
              onChangeText={setBirthDate}
              autoCapitalize="none"
            />

            <ThemedView type="backgroundElement" style={styles.fieldGroup}>
              <ThemedText type="smallBold">Gender</ThemedText>
              <ThemedView style={styles.genderRow}>
                {(['male', 'female'] as DebtorGender[]).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setGender(option)}
                    style={[
                      styles.genderButton,
                      gender === option && styles.genderButtonActive,
                    ]}>
                    <ThemedText type="small">{option}</ThemedText>
                  </Pressable>
                ))}
              </ThemedView>
            </ThemedView>

            <Field label="Address" value={address} onChangeText={setAddress} />

            {error ? (
              <ThemedText style={styles.error} type="small">
                {error}
              </ThemedText>
            ) : null}
            {success ? (
              <ThemedText style={styles.success} type="small">
                {success}
              </ThemedText>
            ) : null}

            <Pressable
              disabled={saving}
              onPress={handleSave}
              style={({ pressed }) => [styles.primaryButton, (pressed || saving) && styles.pressed]}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.primaryButtonText} type="smallBold">
                  Save changes
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              disabled={loggingOut}
              onPress={handleLogout}
              style={({ pressed }) => [styles.secondaryButton, (pressed || loggingOut) && styles.pressed]}>
              {loggingOut ? (
                <ActivityIndicator color={theme.text} />
              ) : (
                <ThemedText type="smallBold">Sign out</ThemedText>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    marginTop: Platform.OS === 'web' ? Spacing.five : Spacing.two,
  },
  subtitle: {
    marginBottom: Spacing.one,
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
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  genderButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    borderColor: '#208AEF',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  success: {
    color: '#2e7d32',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  secondaryButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
