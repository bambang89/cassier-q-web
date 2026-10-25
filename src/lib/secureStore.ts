// Pengganti expo-secure-store di web: API async yang sama (getItemAsync,
// setItemAsync, deleteItemAsync) di atas localStorage, supaya lapisan api/
// dan store/ bisa dipakai apa adanya dari aplikasi mobile.
function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export async function getItemAsync(key: string): Promise<string | null> {
  return storage()?.getItem(key) ?? null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  storage()?.setItem(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  storage()?.removeItem(key);
}
