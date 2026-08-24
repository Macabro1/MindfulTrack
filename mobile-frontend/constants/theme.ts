// constants/theme.ts
export const theme = {
  colors: {
    primitive: {
      blue: {
        100: '#E3F2FD',
        500: '#2196F3',
        700: '#1976D2',
      },
      green: {
        500: '#4CAF50',
      },
      red: {
        500: '#F44336',
      },
      yellow: {
        500: '#FFC107',
      },
      gray: {
        50: '#FAFAFA',
        100: '#F5F5F5',
        300: '#E0E0E0',
        500: '#9E9E9E',
        700: '#616161',
        900: '#212121',
      },
      white: '#FFFFFF',
    },
    semantic: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
      },
      text: {
        primary: '#212121',
        secondary: '#616161',
        hint: '#9E9E9E',
      },
      primary: {
        main: '#2196F3',
        dark: '#1976D2',
        light: '#E3F2FD',
      },
      success: '#4CAF50',
      error: '#F44336',
      warning: '#FFC107',
      border: '#E0E0E0',
    },
  },
  spacing: {
    primitive: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
    },
  },
  radius: {
    primitive: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      full: 9999,
    },
  },
} as const;

export type Theme = typeof theme;