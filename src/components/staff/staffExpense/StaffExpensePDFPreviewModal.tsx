import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import moment from 'moment';

import CommonReportPDF from 'src/components/pdf/CommonReportPDF';
import { ColumnDef } from 'src/components/pdf/ReportTable';
import { SummaryItem } from 'src/components/pdf/ReportSummary';
import { PdfTheme } from 'src/components/pdf/pdfTheme';

interface StaffExpensePDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  summary: SummaryItem[];
  totalCount: number;
  columns: ColumnDef[];
  pdfTheme: PdfTheme;
  rowsPerPage: number;
  shopName: string;
  generatedOn: string;
  generatedBy: string;
  duration: string;
}

const StaffExpensePDFPreviewModal: React.FC<StaffExpensePDFPreviewModalProps> = ({
  open,
  onClose,
  data,
  summary,
  totalCount,
  columns,
  pdfTheme,
  rowsPerPage,
  shopName,
  generatedOn,
  generatedBy,
  duration,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const generateFilename = () =>
    `StaffExpenses_${moment().format('YYYY-MM-DD_hh-mm-ss')}.pdf`;

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);

    try {
      // Dynamically import to avoid SSR issues with Next.js
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;

      // At scale:2, each CSS pixel = 2 canvas pixels.
      // 96dpi → 1px = 0.2646mm
      const canvasWidthMm = (canvas.width / 2) * 0.2646;
      const canvasHeightMm = (canvas.height / 2) * 0.2646;

      const scale = pdfWidth / canvasWidthMm;
      const scaledHeightMm = canvasHeightMm * scale;

      const totalPages = Math.ceil(scaledHeightMm / pdfHeight);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        const yOffsetMm = page * pdfHeight;
        const yOffsetPx = (yOffsetMm / scale / 0.2646) * 2;
        const sliceHeightPx = Math.min(
          (pdfHeight / scale / 0.2646) * 2,
          canvas.height - yOffsetPx
        );

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) continue;

        ctx.drawImage(
          canvas,
          0, yOffsetPx,
          canvas.width, sliceHeightPx,
          0, 0,
          canvas.width, sliceHeightPx
        );

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(sliceData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(generateFilename());
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="primary" fontSize="small" />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            Staff Expense PDF Preview
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="close preview">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Body — scrollable dark PDF viewer */}
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#3a3a3a',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 3,
            px: 2,
          }}
        >
          <Box
            ref={previewRef}
            sx={{
              background: '#fff',
              width: '210mm',
              maxWidth: '100%',
              boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              borderRadius: 1,
            }}
          >
            <CommonReportPDF
              title="Staff Expense Report"
              shopName={shopName}
              generatedBy={generatedBy}
              generatedOn={generatedOn}
              duration={duration}
              summary={summary}
              columns={columns}
              data={data}
              totalCount={totalCount}
              pdfTheme={pdfTheme}
              rowsPerPage={rowsPerPage}
            />
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          gap: 1,
        }}
      >
        <Button variant="outlined" onClick={onClose} disabled={isDownloading}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={isDownloading}
          startIcon={
            isDownloading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
        >
          {isDownloading ? 'Generating PDF…' : 'Download PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StaffExpensePDFPreviewModal;
