import React from 'react';
import { Box } from '@mui/material';
import { PdfTheme } from './pdfTheme';

export interface ColumnDef {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  format?: (value: any, row: any) => React.ReactNode;
}

interface ReportTableProps {
  columns: ColumnDef[];
  data: any[];
  pdfTheme: PdfTheme;
  title: string;
  shopName: string;
  showCompactHeader?: boolean;
}

const ReportTable: React.FC<ReportTableProps> = ({ columns, data, pdfTheme, title, shopName, showCompactHeader }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <table 
        style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '9px' 
        }}
      >
        <thead style={{ display: 'table-header-group' }}>
          {showCompactHeader && (
            <tr>
              <td 
                colSpan={columns.length} 
                style={{
                  textAlign: 'left',
                  padding: '4px 0',
                  border: 'none',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  color: pdfTheme.text,
                }}
              >
                <div style={{ borderBottom: `1px solid ${pdfTheme.border}`, paddingBottom: '2px', marginBottom: '4px' }}>
                  {title} | Shop: {shopName}
                </div>
              </td>
            </tr>
          )}
          <tr style={{ backgroundColor: pdfTheme.background }}>
            {columns.map((col, index) => (
              <th 
                key={index} 
                style={{
                  width: col.width || 'auto',
                  textAlign: col.align || 'left',
                  border: `1px solid ${pdfTheme.border}`,
                  padding: '4px 6px',
                  fontWeight: 'bold',
                  color: pdfTheme.text,
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                style={{ 
                  textAlign: 'center', 
                  padding: '8px', 
                  border: `1px solid ${pdfTheme.border}` 
                }}
              >
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                style={{ 
                  pageBreakInside: 'avoid', 
                  breakInside: 'avoid'
                }}
              >
                {columns.map((col, colIndex) => {
                  const value = row[col.key];
                  return (
                    <td 
                      key={colIndex} 
                      style={{
                        textAlign: col.align || 'left',
                        border: `1px solid ${pdfTheme.border}`,
                        padding: '3px 4px',
                        color: pdfTheme.text,
                        wordBreak: 'break-word'
                      }}
                    >
                      {col.format ? col.format(value, row) : (value ?? '-')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Box>
  );
};

export default ReportTable;
