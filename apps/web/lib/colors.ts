export const colors = {
  // Backgrounds
  bgBase: '#FAF8F5',
  bgSubtle: '#F5F2ED',
  bgElevated: '#FFFFFF',

  // Surfaces
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F5F2ED',
  surfaceTertiary: '#EBE7E0',
  surfaceTranslucent: 'rgba(250, 248, 245, 0.8)',

  // Text
  textPrimary: '#2D2520',
  textSecondary: '#5C534D',
  textTertiary: '#8A827C',
  textDisabled: '#C4BDB7',
  textInverse: '#FFFFFF',

  // Primary (Coral)
  primary: {
    50: '#FEF3F1',
    100: '#FDE5E0',
    200: '#FBC9BC',
    300: '#F5A894',
    400: '#EE8F76',
    500: '#E8846B',
    600: '#D66A51',
    700: '#B95440',
    800: '#9A4234',
    900: '#7D352B',
  },

  // Warm Neutrals
  warm: {
    50: '#FAF8F5',
    100: '#F5F2ED',
    200: '#EBE7E0',
    300: '#D4CDC4',
    400: '#C4BDB7',
    500: '#A69C94',
    600: '#8A827C',
    700: '#5C534D',
    800: '#3D3632',
    900: '#2D2520',
  },

  // Status: Idea (Mustard)
  statusIdea: {
    50: '#FDF9F0',
    100: '#FAF1DC',
    200: '#F4E0B3',
    300: '#E8CC85',
    400: '#DCB85E',
    500: '#D4A853',
    600: '#B88F45',
    700: '#967538',
    800: '#735A2B',
    900: '#523F1F',
  },

  // Status: Success (Sage)
  statusSuccess: {
    50: '#F3F7F2',
    100: '#E4EDE2',
    200: '#C5D8C1',
    300: '#A0BD9B',
    400: '#8AAA84',
    500: '#7BA676',
    600: '#668B61',
    700: '#51704E',
    800: '#3D543B',
    900: '#2A3928',
  },

  // Status: Warning (Terracotta)
  statusWarning: {
    50: '#FEF5F3',
    100: '#FCE9E5',
    200: '#F6CEC5',
    300: '#EBAB9D',
    400: '#DD9179',
    500: '#C97B63',
    600: '#AC6350',
    700: '#8D4E40',
    800: '#6D3C31',
    900: '#4F2B23',
  },

  // Status: Progress (Lavender)
  statusProgress: {
    50: '#F7F5F9',
    100: '#EDE8F2',
    200: '#D6CBDF',
    300: '#B9A7C7',
    400: '#A08DB4',
    500: '#8A78A3',
    600: '#70628A',
    700: '#594E6E',
    800: '#433B53',
    900: '#2F2A3A',
  },

  // Borders
  borderSubtle: '#E8E3DC',
  borderMedium: '#D4CDC4',
  borderStrong: '#B8AFA4',
  borderFocus: '#E8846B',

  // Overlays
  overlayLight: 'rgba(45, 37, 32, 0.08)',
  overlayMedium: 'rgba(45, 37, 32, 0.16)',
  overlayStrong: 'rgba(45, 37, 32, 0.48)',
} as const;

export type ColorKey = keyof typeof colors;

/**
 * Maps gift status to appropriate status color palette
 * Used for consistent visual feedback across status indicators
 */
export const getStatusColor = (
  status: 'idea' | 'shortlisted' | 'buying' | 'ordered' | 'purchased' | 'delivered' | 'gifted' | 'urgent'
) => {
  const statusMap = {
    idea: colors.statusIdea,
    shortlisted: colors.statusIdea,
    buying: colors.statusProgress,
    ordered: colors.statusProgress,
    purchased: colors.statusSuccess,
    delivered: colors.statusSuccess,
    gifted: colors.statusSuccess,
    urgent: colors.statusWarning,
  };
  return statusMap[status];
};
