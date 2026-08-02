export const palette = {
  light: {
    background: '#F7F5EF',
    surface: '#FFFFFF',
    text: '#17211B',
    muted: '#58655D',
    primary: '#1C6750',
    primarySoft: '#DDEDE5',
    border: '#D8DDD9',
    danger: '#A53333',
    warning: '#8A5B00',
  },
  dark: {
    background: '#111713',
    surface: '#1A231D',
    text: '#F2F5F3',
    muted: '#AFB9B2',
    primary: '#76D2AE',
    primarySoft: '#244537',
    border: '#35433A',
    danger: '#FF9999',
    warning: '#F1C36D',
  },
} as const;

export type ThemeColors = (typeof palette)[keyof typeof palette];
