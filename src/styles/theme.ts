export interface CustomTheme {
  primary: {
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    light: string;
    main: string;
    dark: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  divider: string;
  error: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  success: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  warning: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  info: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
}

export const lightTheme: CustomTheme = {
  primary: {
    light: '#60a5fa',
    main: '#3b82f6',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    light: '#94a3b8',
    main: '#64748b',
    dark: '#475569',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
  divider: '#e2e8f0',
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  success: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
};

export const darkTheme: CustomTheme = {
  primary: {
    light: '#60a5fa',
    main: '#3b82f6',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    light: '#94a3b8',
    main: '#64748b',
    dark: '#475569',
    contrastText: '#ffffff',
  },
  background: {
    default: '#0f172a',
    paper: '#1e293b',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    disabled: '#64748b',
  },
  divider: '#334155',
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  success: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    contrastText: '#ffffff',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
}; 