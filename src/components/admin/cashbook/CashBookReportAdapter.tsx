import React, { useRef, useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { useTheme } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import moment from 'moment';

import axiosInstance from 'src/services/axios';
import { createPdfTheme } from 'src/components/pdf/pdfTheme';
import CommonReportPDF from 'src/components/pdf/CommonReportPDF';
import { ColumnDef } from 'src/components/pdf/ReportTable';
import { SummaryItem } from 'src/components/pdf/ReportSummary';

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

const CashBookReportAdapter: React.FC<CashBookReportAdapterProps> = ({ searchQuery, rowsPerPage, startDate, endDate, selectedShop, selectedUser, selectedDirection, selectedMethod, selectedPartyType }) => {
  const theme = useTheme();
  const pdfTheme = createPdfTheme(theme);
  const componentRef = useRef<HTMLDivElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  
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
        limit: String(limit)
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
    const params = new URLSearchParams()
    if (startDate) params.append('from', startDate)
    if (endDate) params.append('to', endDate)
    if (selectedShop && selectedShop.id) params.append('shop_id', String(selectedShop.id))
    if (selectedUser && selectedUser.id) params.append('user_id', String(selectedUser.id))
    if (selectedDirection) params.append('direction', selectedDirection)
    if (selectedMethod) params.append('method', selectedMethod)
    if (selectedPartyType) params.append('party_type', selectedPartyType)
    
    const response = await axiosInstance.get(`/api/v1/admin/getCashbookTotalAmount?${params.toString()}`);
    return response.data.data.totalAmount;
  };

  const preparePdfData = async () => {
    setIsGenerating(true);
    try {
      // Fetch both APIs concurrently
      const [entries, totalAmount] = await Promise.all([
        fetchAllEntries(),
        fetchTotalAmounts()
      ]);

      // Transform entries
      const transformedEntries = entries.map((entry: any) => ({
        date: entry.entry_date,
        remark: entry.description,
        entryBy: entry.creator?.name || entry.user?.name || "-",
        party: entry.vendor?.name || "-",
        category: entry.party_type || "-",
        mode: entry.method || "-",
        cashIn: entry.direction === "in" ? Number(entry.amount) : null,
        cashOut: entry.direction === "out" ? Number(entry.amount) : null,
        balance: entry.balance ?? null,
        _shopName: entry.shop?.name || "-",
      }));

      // Transform summary
      const transformedSummary: SummaryItem[] = [
        { label: "Cash", value: totalAmount.cash, type: "positive" },
        { label: "Online", value: totalAmount.online, type: "positive" },
        { label: "Card", value: totalAmount.card, type: "positive" },
        { label: "Total", value: totalAmount.total, type: "balance" },
      ];

      setPdfData(transformedEntries);
      setPdfSummary(transformedSummary);
      
      // Allow state to settle before printing
      return new Promise<void>((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to prepare PDF data:", error);
      alert("Failed to load PDF data. Please try again.");
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `CashBook_Report_${selectedShop?.name ? `${selectedShop.name}_` : ''}${selectedUser?.name ? `${selectedUser.name}_` : ''}${selectedDirection ? `${selectedDirection}_` : ''}${selectedMethod ? `${selectedMethod}_` : ''}${selectedPartyType ? `${selectedPartyType}_` : ''}${startDate && endDate ? `${startDate.replace(/-/g, '')}_to_${endDate.replace(/-/g, '')}` : moment().format('YYYYMMDD')}`,
    onBeforeGetContent: async () => {
      await preparePdfData();
    },
  });

  const columns: ColumnDef[] = [
    { key: "date", label: "Date", width: "10%", format: (value) => moment(value).format("DD/MM/YYYY") },
    { key: "remark", label: "Remark", width: "16%" },
    { key: "entryBy", label: "Entry by", width: "12%" },
    { key: "party", label: "Party", width: "13%" },
    { key: "category", label: "Category", width: "12%" },
    { key: "mode", label: "Mode", width: "11%" },
    { key: "cashIn", label: "Cash in", width: "9%", align: "right", format: (val) => val !== null ? `₹ ${val}` : "-" },
    { key: "cashOut", label: "Cash out", width: "9%", align: "right", format: (val) => val !== null ? `₹ ${val}` : "-" },
    { key: "balance", label: "Balance", width: "8%", align: "right", format: (val) => val !== null ? `₹ ${val}` : "-" },
  ];

  const shopName = pdfData.length > 0 ? (pdfData[0] as any)._shopName : "-";

  let durationStr = "";
  if (startDate && endDate) {
    durationStr = `${moment(startDate).format("DD MMM YYYY")} - ${moment(endDate).format("DD MMM YYYY")}`;
  } else if (startDate) {
    durationStr = `From ${moment(startDate).format("DD MMM YYYY")}`;
  } else if (endDate) {
    durationStr = `Till ${moment(endDate).format("DD MMM YYYY")}`;
  }

  return (
    <>
      <Button 
        variant="outlined" 
        onClick={handlePrint} 
        disabled={isGenerating}
        startIcon={isGenerating ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
        sx={{ mr: 2 }}
      >
        {isGenerating ? "Preparing..." : "Download"}
      </Button>
      
      <Box sx={{ display: 'none' }}>
        <CommonReportPDF 
          ref={componentRef}
          title="Cash Book Report"
          shopName={shopName}
          generatedBy="System Admin"
          generatedOn={moment().format("DD MMM YYYY, hh:mm a")}
          duration={durationStr}
          summary={pdfSummary}
          columns={columns}
          data={pdfData}
          totalCount={pdfTotalCount}
          pdfTheme={pdfTheme}
          rowsPerPage={rowsPerPage}
        />
      </Box>
    </>
  );
};

export default CashBookReportAdapter;
