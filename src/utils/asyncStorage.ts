import AsyncStorage from "@react-native-async-storage/async-storage";

type FallbackValue<T> = T | (() => T);

interface JsonStorageOptions<T> {
  fallback: FallbackValue<T>;
  label?: string;
}

const resolveFallback = <T>(fallback: FallbackValue<T>): T => {
  return typeof fallback === "function" ? (fallback as () => T)() : fallback;
};

export const readJsonItem = async <T>(
  key: string,
  options: JsonStorageOptions<T>
): Promise<T> => {
  const { fallback, label } = options;
  const defaultValue = resolveFallback(fallback);

  try {
    const rawValue = await AsyncStorage.getItem(key);

    if (!rawValue) {
      return defaultValue;
    }

    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(
      `[storage] ${label ?? key} 불러오기 오류:`,
      error
    );
    return defaultValue;
  }
};

export const writeJsonItem = async <T>(
  key: string,
  value: T,
  label?: string
): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storage] ${label ?? key} 저장 오류:`, error);
  }
};

export const updateJsonItem = async <T>(
  key: string,
  updater: (currentValue: T) => T,
  options: JsonStorageOptions<T>
): Promise<T> => {
  const currentValue = await readJsonItem<T>(key, options);
  const updatedValue = updater(currentValue);

  await writeJsonItem(key, updatedValue, options.label);

  return updatedValue;
};
