import React from 'react';
import { Pagination, Select, MenuItem, Box, Typography } from '@mui/material';

interface CommonPaginationProps {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
}

const CommonPagination: React.FC<CommonPaginationProps> = ({
    totalItems,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 25, 50]
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page - 1);
        }
    };

    const handlePageSizeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        onPageSizeChange(event.target.value as number);
    };
    console.log(currentPage, "new", totalItems, pageSize)
    return (
        <Box display="flex" justifyContent="end" alignItems="center" mt={2} mb={2} flexWrap='wrap' gap={3} sx={{ width: '100%' }}>



            <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
            <Select
                value={pageSize}
                size='small'
                onChange={(e) => handlePageSizeChange(e)}
                sx={{ mr: 2, maxWidth: 60 }}
            >
                {pageSizeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option}
                    </MenuItem>
                ))}
            </Select>
            <Typography variant="body2" sx={{ mr: 1 }}>
                {!totalItems
                    ? " 0 of 0 "
                    : `${(currentPage) * pageSize + 1} - ${((currentPage + 1) * pageSize > totalItems ? totalItems : (currentPage + 1) * pageSize)} of ${totalItems}`}
            </Typography>
            <Pagination
                count={totalPages}
                page={currentPage + 1}
                onChange={handlePageChange}
                variant='outlined' shape='rounded' color='primary'
            />
        </Box>
    );
};

export default CommonPagination;
