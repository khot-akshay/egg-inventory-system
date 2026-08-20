import React, { useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import moment from 'moment';

import axiosInstance from 'src/services/axios';
import { createPdfTheme } from 'src/components/pdf/pdfTheme';
import { ColumnDef } from 'src/components/pdf/ReportTable';
import { SummaryItem } from 'src/components/pdf/ReportSummary';
import CustomerPDFPreviewModal from './CustomerPDFPreviewModal';

interface CustomerReportAdapterProps {
  searchQuery: string;
  rowsPerPage: number;
  startDate?: string;
  endDate?: string;
  selectedType?: string;
  customerId: string;
}

const CustomerReportAdapter: React.FC<CustomerReportAdapterProps> = ({
  searchQuery,
  rowsPerPage,
  startDate,
  endDate,
  selectedType,
  customerId,
}) => {
  const theme = useTheme();
  const pdfTheme = createPdfTheme(theme);

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Data state for the PDF
  const [pdfData, setPdfData] = useState<any[]>([]);
  const [pdfSummary, setPdfSummary] = useState<SummaryItem[]>([]);
  const [pdfTotalCount, setPdfTotalCount] = useState(0);

  // Fetch all pages
  const fetchAllEntries = async () => {
    let allEntries: any[] = [];
    let page = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(limit),
        customer_id: String(customerId),
      });
      if (searchQuery) params.append('global_search', searchQuery);
      if (startDate) params.append('from', startDate);
      if (endDate) params.append('to', endDate);
      if (selectedType) params.append('type', selectedType);

      const response = await axiosInstance.get(
        `/api/v1/admin/getAllQuickbills?${params.toString()}`
      );

      const entries = response.data.data?.records ?? response.data.data?.data ?? [];
      allEntries = [...allEntries, ...entries];

      const count = response.data.data?.total_count || 0;
      if (allEntries.length >= count || entries.length === 0) {
        hasMore = false;
        setPdfTotalCount(count);
        setPdfSummary([
          { label: 'Total Amount', value: response.data.data?.customer_totals?.total_amount || 0, type: 'positive' },
          { label: 'Paid Amount', value: response.data.data?.customer_totals?.paid_amount || 0, type: 'positive' },
          { label: 'Due Amount', value: response.data.data?.customer_totals?.due_amount || 0, type: 'balance' },
        ]);
      } else {
        page++;
      }
    }
    return allEntries;
  };

  const handleDownloadClick = async () => {
    setIsGenerating(true);
    try {
      const entries = await fetchAllEntries();
      const transformedEntries = entries.map((entry: any, index: number) => ({
        ...entry,
        srNo: index + 1,
      }));
      setPdfData(transformedEntries);

      // Small delay so React re-renders the preview before opening
      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      setPreviewOpen(true);
    } catch (error: any) {
      console.error('Failed to prepare PDF data:', error);
      const msg = error?.response?.data?.message || error?.message || String(error);
      alert(`Failed to load PDF data.\n\nError: ${msg}\n\nCheck the browser console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const columns: ColumnDef[] = [
    { key: 'srNo', label: 'Sr. No.', width: '6%', align: 'center', format: (val, _, i) => val ?? (i + 1) },
    { key: 'note', label: 'Note', width: '12%', format: (_, row) => row.description || 'NA' },
    { 
      key: 'productQuantity', 
      label: 'Product & Quantity', 
      width: '18%', 
      format: (_, row) => {
        const items = row.items || [];
        if (!items.length) return 'NA';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx}>
                {item.category?.name || 'Unknown'} : {Number(item.quantity)}
              </div>
            ))}
          </Box>
        );
      }
    },
    { 
      key: 'productRate', 
      label: 'Product Rate', 
      width: '10%',
      format: (_, row) => {
        const items = row.items || [];
        if (!items.length) return '0';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx}>₹{Number(item.unit_cost || 0).toFixed(2)}</div>
            ))}
          </Box>
        );
      }
    },
    { 
      key: 'productPrice', 
      label: 'Product Price', 
      width: '10%',
      format: (_, row) => {
        const items = row.items || [];
        if (!items.length) return '0';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 1 }}>
            {items.map((item: any, idx: number) => (
              <div key={idx}>₹{Number(item.line_total || 0).toFixed(2)}</div>
            ))}
          </Box>
        );
      }
    },
    {
      key: 'paid',
      label: 'Paid',
      width: '12%',
      format: (_, row) => {
        if (row.type === 'quickbill') {
          const payments = row.meta?.payments || [];
          const nonCreditPayments = payments.filter((p: any) => p.payment_type !== 'credit');
          if (!nonCreditPayments.length) {
            return <div style={{ textTransform: 'capitalize' }}>{row.status || 'NA'}</div>;
          }
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, height: '100%', justifyContent: 'center' }}>
              {nonCreditPayments.map((p: any, i: number) => (
                <div key={i} style={{ textTransform: 'capitalize' }}>
                  {p.payment_type} : ₹{p.amount}
                </div>
              ))}
            </Box>
          );
        }
        return `₹${row.amount || '0'}`;
      }
    },
    {
      key: 'credit',
      label: 'Credit',
      width: '12%',
      format: (_, row) => {
        const payments = row.meta?.payments || [];
        const creditPayments = payments.filter((p: any) => p.payment_type === 'credit');

        if (!creditPayments.length) {
          return '-';
        }

        const balanceDue = row.balance_due ?? '0';

        return (
          <div style={{ textTransform: 'capitalize' }}>
            Credit : ₹{balanceDue}
          </div>
        );
      }
    },
    {
      key: 'totalBill',
      label: 'Total Bill',
      width: '10%',
      format: (_, row) => `₹${row.total || '0'}`
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      width: '10%',
      format: (_, row) => row.created_at ? moment(row.created_at).format('DD MMM YYYY') : 'NA'
    }
  ];

  const shopName = pdfData.length > 0 && pdfData[0].shop?.name ? pdfData[0].shop.name : '-';

  let durationStr = '';
  if (startDate && endDate) {
    durationStr = `${moment(startDate).format('DD MMM YYYY')} - ${moment(endDate).format('DD MMM YYYY')}`;
  } else if (startDate) {
    durationStr = `From ${moment(startDate).format('DD MMM YYYY')}`;
  } else if (endDate) {
    durationStr = `Till ${moment(endDate).format('DD MMM YYYY')}`;
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleDownloadClick}
        disabled={isGenerating}
        startIcon={isGenerating ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
        sx={{ mr: 2 }}
      >
        {isGenerating ? 'Preparing...' : 'Download'}
      </Button>

      <CustomerPDFPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={pdfData}
        summary={pdfSummary}
        totalCount={pdfTotalCount}
        columns={columns}
        pdfTheme={pdfTheme}
        rowsPerPage={rowsPerPage}
        shopName={shopName}
        generatedBy="System Admin"
        generatedOn={moment().format('DD MMM YYYY, hh:mm a')}
        duration={durationStr}
      />
    </>
  );
};

export default CustomerReportAdapter;
