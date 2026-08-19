import React from 'react';
import { Box, Typography } from '@mui/material';
import { PdfTheme } from './pdfTheme';

interface ReportHeaderProps {
  title: string;
  shopName: string;
  pdfTheme: PdfTheme;
  logoUrl?: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ title, shopName, pdfTheme, logoUrl }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {logoUrl ? (
        <Box
          component="img"
          src={logoUrl}
          alt="Logo"
          sx={{ height: 30, mr: 1.5 }}
        />
      ) : (
        <Box sx={{ width: 30, height: 30, mr: 1.5, bgcolor: pdfTheme.primary }} />
      )}
      <Box>
        <Typography sx={{ color: pdfTheme.text, fontWeight: 'bold', fontSize: '16px', lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography sx={{ color: pdfTheme.text, fontSize: '10px', lineHeight: 1.2, mt: 0.25 }}>
          Shop: {shopName}
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportHeader;
