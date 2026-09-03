import React, { useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import moment from 'moment';

import axiosInstance from 'src/services/axios';
import { createPdfTheme } from 'src/components/pdf/pdfTheme';
import { ColumnDef } from 'src/components/pdf/ReportTable';
import { SummaryItem } from 'src/components/pdf/ReportSummary';
import VendorPDFPreviewModal from './VendorPDFPreviewModal';

interface VendorReportAdapterProps {
  searchQuery?: string;
  rowsPerPage: number;
  startDate?: string;
  endDate?: string;
  selectedType?: string;
  vendorId?: string;
  selectedCategoryId?: number | null;
}

const VendorReportAdapter: React.FC<VendorReportAdapterProps> = ({
  searchQuery,
  rowsPerPage,
  startDate,
  endDate,
  selectedType,
  vendorId,
  selectedCategoryId,
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
      const params: any = {
        pageNo: String(page),
        limit: String(limit),
      };
      if (searchQuery) params.global_search = searchQuery;
      if (selectedCategoryId) params.category_id = String(selectedCategoryId);
      if (startDate) params.from = startDate;
      if (endDate) params.to = endDate;
      if (selectedType) params.type = selectedType;
      if (vendorId) params.vendor_id = String(vendorId);

      const response = await axiosInstance.get(
        '/api/v1/admin/getVendorPurchaseHistory',
        { params }
      );

      const entries =
        response.data.data?.records ??
        response.data.data?.egg_vendor_purchase ??
        response.data.data?.data ??
        response.data?.records ??
        [];
      allEntries = [...allEntries, ...entries];

      const count =
        response.data.data?.total_count ??
        response.data.data?.count ??
        response.data?.count ??
        entries.length;
      const vTotals =
        response.data.data?.vendor_totals ??
        response.data?.vendor_totals ??
        {};

      if (allEntries.length >= count || entries.length === 0) {
        hasMore = false;
        setPdfTotalCount(count);
        setPdfSummary([
          {
            label: 'Total Amount',
            value: vTotals.total_amount || 0,
            type: 'positive',
          },
          {
            label: 'Paid Amount',
            value: vTotals.paid_amount || 0,
            type: 'positive',
          },
          {
            label: 'Due Amount',
            value: vTotals.due_amount || 0,
            type: 'balance',
          },
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
      const msg =
        error?.response?.data?.message || error?.message || String(error);
      alert(`Failed to load PDF data.\n\nError: ${msg}\n\nCheck the browser console for details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const columns: ColumnDef[] = [
    {
      key: 'srNo',
      label: 'Sr. No.',
      width: '6%',
      align: 'center',
      format: (val, _, i) => val ?? i + 1,
    },
    {
      key: 'note',
      label: 'Note',
      width: '10%',
      format: (_, row) =>
        row.direction === 'out'
          ? row.description || 'NA'
          : row.notes || row.purchase_no || 'NA',
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      width: '9%',
      format: (_, row) =>
        row.vehicle?.registration_number || row.vehicle?.name || 'NA',
    },
    {
      key: 'driverName',
      label: 'Driver Name',
      width: '9%',
      format: (_, row) => row.driver?.name || 'NA',
    },
    {
      key: 'productQuantity',
      label: 'Product & Quantity',
      width: '14%',
      format: (_, row) => {
        const items = row.items || [];
        if (!items.length) return 'NA';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
            {items.map((item: any, idx: number) => (
              <div key={item.id || idx}>
                {item.category?.name || 'Unknown'} :{' '}
                {Number(item.total_eggs || item.quantity || 0)}
              </div>
            ))}
          </Box>
        );
      },
    },
    {
      key: 'productRate',
      label: 'Product Rate',
      width: '9%',
      format: (_, row) => {
        const items = row.items || [];
        if (!items.length) return '0';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
            {items.map((item: any, idx: number) => (
              <div key={item.id || idx}>
                ₹{Number(item.price_per_egg || item.unit_cost || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        );
      },
    },
    {
      key: 'productPrice',
      label: 'Product Price',
      width: '9%',
      format: (_, row) => {
        const items = row.items || [];
        if (!items.length) return '0';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
            {items.map((item: any, idx: number) => (
              <div key={item.id || idx}>
                ₹{Number(item.line_amount || item.line_total || 0).toFixed(2)}
              </div>
            ))}
          </Box>
        );
      },
    },
    {
      key: 'paid',
      label: 'Paid',
      width: '8%',
      format: (_, row) => {
        const paid =
          row.direction === 'out' ? row.amount : row.amount || 0;
        return `₹${Number(paid || 0).toFixed(2)}`;
      },
    },
    {
      key: 'totalBill',
      label: 'Total Bill',
      width: '8%',
      format: (_, row) => `₹${Number(row.total_amount || 0).toFixed(2)}`,
    },
    {
      key: 'balance_due',
      label: 'Balance',
      width: '10%',
      format: (_, row) => `₹${Number(row.balance || 0).toFixed(2)}`,
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      width: '8%',
      format: (_, row) =>
        row.created_at || row.purchase_date
          ? moment(row.created_at || row.purchase_date).format('DD MMM YYYY')
          : 'NA',
    },
  ];

  const shopName =
    pdfData.length > 0 && pdfData[0].shop?.name
      ? pdfData[0].shop.name
      : pdfData[0]?.vendor?.name
        ? pdfData[0].vendor.name
        : '-';

  let durationStr = '';
  if (startDate && endDate) {
    durationStr = `${moment(startDate).format('DD MMM YYYY')} - ${moment(
      endDate
    ).format('DD MMM YYYY')}`;
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
        startIcon={
          isGenerating ? <CircularProgress size={20} /> : <PictureAsPdfIcon />
        }
        sx={{ mr: 0 }}
      >
        {isGenerating ? 'Preparing...' : 'Download'}
      </Button>

      <VendorPDFPreviewModal
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

export default VendorReportAdapter;
