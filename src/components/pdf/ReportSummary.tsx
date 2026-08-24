import React from 'react';
import { Box, Typography } from '@mui/material';
import { PdfTheme } from './pdfTheme';

export interface SummaryItem {
  label: string;
  value: string | number;
  type?: 'positive' | 'negative' | 'balance' | 'neutral';
}

interface ReportSummaryProps {
  summary: SummaryItem[];
  pdfTheme: PdfTheme;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ summary, pdfTheme }) => {
  if (!summary || summary.length === 0) return null;

  return (
    <Box sx={{ mb: 3, border: `1px solid ${pdfTheme.border}`, display: 'flex', width: '100%' }}>
      {summary.map((item, index) => {
        let valueColor = pdfTheme.text;
        if (item.type === 'positive') valueColor = pdfTheme.success;
        if (item.type === 'negative') valueColor = pdfTheme.error;

        return (
          <Box 
            key={index}
            sx={{ 
              flex: 1, 
              p: 1,
              borderRight: index < summary.length - 1 ? `1px solid ${pdfTheme.border}` : 'none'
            }}
          >
            <Typography sx={{ color: pdfTheme.text, fontSize: '9px', fontWeight: 'bold', mb: 0.5 }}>
              {item.label}
            </Typography>
            <Typography sx={{ color: valueColor, fontWeight: 'bold', fontSize: '13px' }}>
              ₹ {item.value}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ReportSummary;
