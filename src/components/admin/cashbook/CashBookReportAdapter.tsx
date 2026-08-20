import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import moment from 'moment';

import axiosInstance from 'src/services/axios';
import { createPdfTheme } from 'src/components/pdf/pdfTheme';
import { ColumnDef } from 'src/components/pdf/ReportTable';
import { SummaryItem } from 'src/components/pdf/ReportSummary';
import CashBookPDFPreviewModal from './CashBookPDFPreviewModal';

interface CashBookReportAdapterProps {
  searchQuery: string;
  rowsPerPage: number;
  startDate?: string;
  endDate?: string;
  selectedShop?: any;
  selectedUser?: any;
  selectedDirection?: string;
  selectedMethod?: string;
  selectedPartyType?: string;
}

const CashBookReportAdapter: React.FC<CashBookReportAdapterProps> = ({
  searchQuery,
  rowsPerPage,
  startDate,
  endDate,
  selectedShop,
  selectedUser,
  selectedDirection,
  selectedMethod,
  selectedPartyType,
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
      });
      if (searchQuery) params.append('global_search', searchQuery);
      if (startDate) params.append('from', startDate);
      if (endDate) params.append('to', endDate);
      if (selectedShop && selectedShop.id) params.append('shop_id', String(selectedShop.id));
      if (selectedUser && selectedUser.id) params.append('user_id', String(selectedUser.id));
      if (selectedDirection) params.append('direction', selectedDirection);
      if (selectedMethod) params.append('method', selectedMethod);
      if (selectedPartyType) params.append('party_type', selectedPartyType);

      const response = await axiosInstance.get(
        `/api/v1/admin/getCashbookEntries?${params.toString()}`
      );

      const entries = response.data.data?.entries || [];
      allEntries = [...allEntries, ...entries];

      const count = response.data.data?.count || 0;
      if (allEntries.length >= count || entries.length === 0) {
        hasMore = false;
        setPdfTotalCount(count);
      } else {
        page++;
      }
    }
    return allEntries;
  };

  const fetchTotalAmounts = async () => {
    // const params = new URLSearchParams();
    // if (startDate) params.append('from', startDate);
    // if (endDate) params.append('to', endDate);
    // if (selectedShop && selectedShop.id) params.append('shop_id', String(selectedShop.id));
    // if (selectedUser && selectedUser.id) params.append('user_id', String(selectedUser.id));
    // if (selectedDirection) params.append('direction', selectedDirection);
    // if (selectedMethod) params.append('method', selectedMethod);
    // if (selectedPartyType) params.append('party_type', selectedPartyType);

    const response = await axiosInstance.get(
      `/api/v1/admin/getCashbookTotalAmount`
    );
    return response.data.data.totalAmount;
  };

  const handleDownloadClick = async () => {
    setIsGenerating(true);
    try {
      const [entries, totalAmount] = await Promise.all([
        fetchAllEntries(),
        fetchTotalAmounts(),
      ]);

      // Transform entries — columns match the DataGrid table exactly
      const transformedEntries = entries.map((entry: any, index: number) => ({
        srNo: index + 1,
        shopName: entry.shop?.name || 'NA',
        userName: entry.user?.name || entry.creator?.name || 'NA',
        partyType: entry.party_type || 'NA',
        note: entry.description || 'NA',
        method: entry.method || 'NA',
        amountIn: entry.direction?.toUpperCase() === 'IN' ? Math.floor(Number(entry.amount || 0)) : null,
        amountOut: entry.direction?.toUpperCase() === 'OUT' ? Math.floor(Number(entry.amount || 0)) : null,
        balance: entry.balence ?? entry.balance ?? null,
        createdAt: entry.created_at,
        _shopName: entry.shop?.name || '-',
      }));

      // Transform summary — guard against undefined totalAmount properties
      const transformedSummary: SummaryItem[] = [
        { label: 'Cash', value: totalAmount?.cash ?? 0, type: 'positive' },
        { label: 'Online', value: totalAmount?.online ?? 0, type: 'positive' },
        { label: 'Card', value: totalAmount?.card ?? 0, type: 'positive' },
        { label: 'Total', value: totalAmount?.total ?? 0, type: 'balance' },
      ];

      setPdfData(transformedEntries);
      setPdfSummary(transformedSummary);

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
    { key: 'srNo',      label: 'Sr. No.',      width: '6%',  align: 'center' },
    { key: 'shopName',  label: 'Shop Name',    width: '12%' },
    { key: 'userName',  label: 'User Name',    width: '12%' },
    { key: 'partyType', label: 'Party Type',   width: '10%' },
    { key: 'note',      label: 'Note',         width: '18%' },
    { key: 'method',    label: 'Method',       width: '8%' },
    {
      key: 'amountIn',
      label: 'Amount In',
      width: '10%',
      align: 'right',
      format: (val) => (val !== null ? `₹ ${val}` : '-'),
    },
    {
      key: 'amountOut',
      label: 'Amount Out',
      width: '10%',
      align: 'right',
      format: (val) => (val !== null ? `₹ ${val}` : '-'),
    },
    {
      key: 'balance',
      label: 'Balance',
      width: '8%',
      align: 'right',
      format: (val) => (val !== null ? `₹ ${val}` : 'NA'),
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      width: '11%',
      format: (value) => value ? moment(value).format('DD/MM/YYYY') : 'NA',
    },
  ];

  const shopName = pdfData.length > 0 ? (pdfData[0] as any)._shopName : '-';

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

      <CashBookPDFPreviewModal
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

export default CashBookReportAdapter;
