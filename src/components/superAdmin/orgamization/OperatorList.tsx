import React, { useState, useEffect } from 'react';
import { DataGrid, GridCellParams, GridColDef, GridToolbarContainer, GridToolbarExport, } from '@mui/x-data-grid';
import { Card, CardHeader, Grid } from "@mui/material";
import { Box } from "@mui/system";
import Button from '@mui/material/Button'
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router';
import Link from 'next/link';
import EmailModule from 'src/components/common/Links/EmailLink';
import axiosInstance from 'src/services/axios';
import MobileNumberModule from 'src/components/common/Links/MobileNumberModule';
import { decodeParams } from 'src/utils/encodeid';

const OperatorList = () => {
    const router = useRouter()
    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);


    useEffect(() => {
        fetchData();
    }, [page, pageSize]);
    const fetchData = () => {
        const id = decodeParams(router.query.id)
        setLoading(true);
        axiosInstance.get(`/admin/v1/auth/organization/getOperator/${id}?pageNo=${page}&limit=${pageSize}`)
            .then((response) => {
                setRows(response.data.data.rows || []);
                setTotalRows(response.data.data.count);
                setLoading(false);
            })
            .catch((error) => {
                setRows([]);
                setLoading(false);
            });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
    };
    const columns: GridColDef[] = [

        {
            field: 'id',
            headerName: 'Sr. No.',
            renderCell: (index) => {
                const rowIndex = index.api.getRowIndex(index.row.id);
                return (page * pageSize) + (rowIndex % pageSize) + 1;
            },
            hideable: false,

        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
        },
        {
            field: 'email',
            headerName: 'Email ID',
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <EmailModule email={params.row?.email} />
            )
        },
        {
            field: 'whatsapp_number',
            headerName: 'WhatsApp Number',
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <MobileNumberModule mobileNo={params.row?.whatsapp_number} countryCode={params.row?.country_code} />
            )
        },
        {
            field: 'telegram_number',
            headerName: 'Telegram Number',
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <MobileNumberModule mobileNo={params.row?.telegram_number} countryCode={params.row?.telegram_country} />
            )
        },

        // {
        //     field: 'actions',
        //     headerName: 'Actions',
        //     flex: 1,
        //     renderCell: (params: GridCellParams) => (
        //         <>
        //             <Link href={`/operator/viewEmpolyee/${params.row?.id}`}>
        //                 <Button
        //                     style={{ color: '#84919d', margin: '-10px' }}
        //                 // onClick={() => handleViewLogs(params.row)}
        //                 >
        //                     <Icon icon='bx-show' />
        //                 </Button>
        //             </Link>
        //         </>
        //     ),
        // },
    ];


    return (
        <Card sx={{ mt: 3 }}>
            <CardHeader title='Operators' />
            <Box sx={{ height: '70vh', width: "100%" }}>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    getRowId={(row) => row.id}
                    pagination
                    pageSize={pageSize}
                    rowCount={totalRows}
                    page={page}
                    paginationMode="server"
                    onPageChange={handlePageChange}
                    loading={loading}
                    rowsPerPageOptions={[5, 10, 20]}
                    onPageSizeChange={handlePageSizeChange}
                    checkboxSelection
                // components={{ Toolbar: CustomToolbar }}
                // componentsProps={{
                //   baseButton: {
                //     variant: 'outlined'
                //   },

                // }}
                />
            </Box>

        </Card>
    );
};

export default OperatorList;
