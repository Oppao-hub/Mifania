export type ThemeMode = 'light' | 'dark' | 'system';

export type AppLanguage = 'en-US' | 'en-GB' | 'fil-PH';

export const APPEARANCE_STORAGE_KEY = '@mifania/appearance';

export const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System' },
];

export const LANGUAGE_OPTIONS: { id: AppLanguage; label: string }[] = [
  { id: 'en-US', label: 'English (US)' },
  { id: 'en-GB', label: 'English (UK)' },
  { id: 'fil-PH', label: 'Filipino' },
];

export const getThemeLabel = (mode: ThemeMode): string =>
  THEME_OPTIONS.find((option) => option.id === mode)?.label ?? 'Light';

export const getLanguageLabel = (language: AppLanguage): string =>
  LANGUAGE_OPTIONS.find((option) => option.id === language)?.label ?? 'English (US)';
