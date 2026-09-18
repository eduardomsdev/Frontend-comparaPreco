import { TextStyle } from 'react-native';

type TypographyVariant = Pick<TextStyle, 'fontSize' | 'fontWeight' | 'lineHeight'>;

export const typography: Record<
  'displayTitle' | 'title' | 'subtitle' | 'body' | 'bodyStrong' | 'caption' | 'overline',
  TypographyVariant
> = {
  displayTitle: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  title: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  subtitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  overline: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
};
