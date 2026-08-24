import { Theme } from '@mui/material/styles';

export const createPdfTheme = (theme: Theme) => ({
  primary: theme.palette.primary.main,
  text: theme.palette.text.primary,
  secondaryText: theme.palette.text.secondary,
  background: theme.palette.background.paper,
  border: theme.palette.divider,
  success: theme.palette.success.main,
  error: theme.palette.error.main,
});

export type PdfTheme = ReturnType<typeof createPdfTheme>;
