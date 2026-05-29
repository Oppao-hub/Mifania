import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  APPEARANCE_STORAGE_KEY,
  AppLanguage,
  ThemeMode,
} from '../constants/appearance';

type AppearanceState = {
  themeMode: ThemeMode;
  language: AppLanguage;
};

type AppearanceContextValue = AppearanceState & {
  isReady: boolean;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
};

const defaultState: AppearanceState = {
  themeMode: 'light',
  language: 'en-US',
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [state, setState] = useState<AppearanceState>(defaultState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppearanceState>;
          setState({
            themeMode: parsed.themeMode ?? defaultState.themeMode,
            language: parsed.language ?? defaultState.language,
          });
        }
      } catch {
        // Keep defaults
      } finally {
        setIsReady(true);
      }
    };

    load();
  }, []);

  const persist = useCallback(async (patch: Partial<AppearanceState>) => {
    setState((previous) => {
      const next = { ...previous, ...patch };
      AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setThemeMode = useCallback(
    async (themeMode: ThemeMode) => {
      await persist({ themeMode });
    },
    [persist],
  );

  const setLanguage = useCallback(
    async (language: AppLanguage) => {
      await persist({ language });
    },
    [persist],
  );

  const isDarkMode = useMemo(() => {
    if (state.themeMode === 'dark') return true;
    if (state.themeMode === 'light') return false;
    return systemScheme === 'dark';
  }, [state.themeMode, systemScheme]);

  const value = useMemo(
    () => ({
      ...state,
      isReady,
      isDarkMode,
      setThemeMode,
      setLanguage,
    }),
    [state, isReady, isDarkMode, setThemeMode, setLanguage],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
};

export const useAppearance = (): AppearanceContextValue => {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return context;
};
