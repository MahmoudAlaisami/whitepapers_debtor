import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Debtor } from '@/types';

const ACCESS_TOKEN_KEY = 'debtor-access-token';
const USER_KEY = 'debtor-user';

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getStoredUser(): Promise<Debtor | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Debtor;
  } catch {
    return null;
  }
}

export async function persistDebtorSession(user: Debtor & { token?: string }) {
  const { token, ...rest } = user;
  if (token) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(rest));
}

export async function updateStoredUser(partial: Partial<Debtor>) {
  const prev = await getStoredUser();
  const next = { ...(prev ?? {}), ...partial };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
}

export async function clearDebtorSession() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}
