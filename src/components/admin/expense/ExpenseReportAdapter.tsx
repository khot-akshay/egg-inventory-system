import React, { useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import moment from 'moment';

import axiosInstance from 'src/services/axios';
import { createPdfTheme } from 'src/components/pdf/pdfTheme';
import { ColumnDef } from 'src/components/pdf/ReportTable';
import { SummaryItem } from 'src/components/pdf/ReportSummary';
import ExpensePDFPreviewModal from './ExpensePDFPreviewModal';

interface ExpenseReportAdapterProps {
    searchQuery?: string;
    rowsPerPage: number;
    startDate?: string;
    endDate?: string;
    selectedCategoryId?: number | null;
    selectedShopId?: number | null;
    apiUrl?: string;
}

const ExpenseReportAdapter: React.FC<ExpenseReportAdapterProps> = ({
    searchQuery,
    rowsPerPage,
    startDate,
    endDate,
    selectedCategoryId,
    selectedShopId,
    apiUrl = '/api/v1/admin/getAllExpenses',
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
                limit: String(limit)
            });
            if (searchQuery) params.append('global_search', searchQuery);
            if (selectedCategoryId) params.append('category_id', String(selectedCategoryId));
            if (selectedShopId) params.append('shop_id', String(selectedShopId));
            if (startDate) params.append('from_date', startDate);
            if (endDate) params.append('to_date', endDate);

            const response = await axiosInstance.get(
                `${apiUrl}?${params.toString()}`
            );

            const entries = response.data.data?.expenses ?? [];
            allEntries = [...allEntries, ...entries];

            const count = response.data.data?.count ?? 0;
            if (allEntries.length >= count || entries.length === 0) {
                hasMore = false;
                setPdfTotalCount(count);
                // compute total amount for summary
                const totalAmount = allEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                setPdfSummary([
                    { label: 'Total Expense Amount', value: totalAmount, type: 'positive' }
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
        { key: 'srNo', label: 'Sr. No.', width: '8%', align: 'center', format: (val, _, i) => val ?? (i + 1) },
        { key: 'shopName', label: 'Shop', width: '20%', format: (_, row) => row.shop?.name || 'NA' },
        { key: 'createdBy', label: 'Created By', width: '15%', format: (_, row) => row.user?.name || 'NA' },
        { key: 'category', label: 'Expense Category', width: '17%', format: (_, row) => row.category || 'NA' },
        { key: 'amount', label: 'Amount', width: '10%', format: (_, row) => `₹${Math.floor(Number(row.amount || 0))}` },
        { key: 'description', label: 'Description', width: '15%', format: (_, row) => row.description || 'NA' },
        { key: 'expenseDate', label: 'Expense Date', width: '15%', format: (_, row) => row.expense_date ? moment(row.expense_date).format('DD MMM YYYY') : 'NA' },
    ];

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

            <ExpensePDFPreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                data={pdfData}
                summary={pdfSummary}
                totalCount={pdfTotalCount}
                columns={columns}
                pdfTheme={pdfTheme}
                rowsPerPage={rowsPerPage}
                shopName="All Shops"
                generatedBy="System Admin"
                generatedOn={moment().format('DD MMM YYYY, hh:mm a')}
                duration={durationStr}
            />
        </>
    );
};

export default ExpenseReportAdapter;
