import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridCellParams, GridColDef } from '@mui/x-data-grid';
import axiosInstance from "../../services/axios";
import { Box, Card, Grid, Stack, Switch, Tooltip, Typography } from "@mui/material";
import Button from '@mui/material/Button';
import Icon from 'src/@core/components/icon';

import DeletePromocodeDialog from './PromocodeDeletePopup';
import PromocodeViewPopup from './PromocodeViewPopup';
import PromocodeEditPopup from './PromocodeEditForm';
import CommonDatagrid from '../common/DatagridData.tsx/CommonDatagrid';
import PageHeader from 'src/@core/components/page-header';
import Link from 'next/link';
import GoBack from '../common/goBack/GoBackButton';
import checkPermission from 'src/configs/CheckPermisstion'
import toast from 'react-hot-toast';
import DateFormateComponent from '../common/dateFormat/DateFromatModule';

const PromocodeList: React.FC = () => {
    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [openDelete, setOpenDelete] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedPromocode, setSelectedPromocode] = useState<any>({});
    const [selectedPromocodeForDelete, setSelectedPromocodeForDelete] = useState<any>({});

    const fetchData = useCallback(() => {
        setLoading(true);
        axiosInstance
            .get(`/v1/admin/getAllPromocodes?pageNo=${page}&limit=${pageSize}`)
            .then((response) => {
                const data = response.data.data || {};
                setRows(data.data || []);
                setTotalRows(data.count || 0);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setRows([]);
                setLoading(false);
            });
    }, [page, pageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
    };

    const handleViewClick = (params: GridCellParams) => {
        setSelectedPromocode(params.row);
        setOpenView(true);
    };

    const handleEditClick = (params: GridCellParams) => {
        setSelectedPromocode(params.row);
        setOpenEdit(true);
    };

    const handleDeleteClick = (params: GridCellParams) => {
        setSelectedPromocodeForDelete(params.row.id);
        setOpenDelete(true);
    };
    
    const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: GridColDef[]) => {
        const { checked } = event.target;
        try {
            await axiosInstance.post(`/v1/admin/updatePromocode?id=${params.id}`, { is_landing: checked })
            fetchData()
            toast.success('Status updated successfully.')
        } catch (e) {
            toast.error('Failed to set active')
        }
    }
    const columns: GridColDef[] = [
        {
            field: 'sr.no',
            headerName: 'Sr. No.',
            minWidth: 100,
            flex: 1,
            sortable: false,
            renderCell: (index) => index.api.getRowIndex(index.row.id) + 1,
        },
        {
            field: 'promocode',
            headerName: 'Promocode Name',
            minWidth: 200,
            flex: 1,
            sortable: false,
        },
        {
            field: 'type',
            headerName: 'Type',
            minWidth: 200,
            flex: 1,
            sortable: false,
        },
        {
            field: 'discount',
            headerName: 'Discount',
            minWidth: 200,
            flex: 1,
            sortable: false,
        },
         {
              field: 'status',
              headerName: 'on landing',
              minWidth: 150,
              sortable: false,
              renderCell: (params: GridCellParams) => (
                  <Stack direction='row' alignItems='center' spacing={5}>
        
                      <Switch checked={params.row.is_landing == '1' ? true : false} onChange={(event) => handleSwitchChange(event, params.row)} />
                      <p>{params.row.is_landing == '1' ? 'Active' : 'In-active'}</p>
                  </Stack>
              ),
              flex: 1,
          },
        {
            field: 'start_from',
            headerName: 'Start From',
            minWidth: 200,
            flex: 1,
            sortable: false,
              renderCell: (params: GridCellParams) =>
            
                            <DateFormateComponent date={params.row.start_from ?? ''} />
                    
        },
        {
            field: 'end_on',
            headerName: 'End On',
            minWidth: 200,
            flex: 1,
            sortable: false,
            renderCell: (params: GridCellParams) =>
            
                <DateFormateComponent date={params.row.end_on ?? ''} />
            
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 200,
            sortable: false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('view-promocode') && (

                        <Tooltip title='View Promocode.' placement='bottom'>
                            <Button
                                style={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleViewClick(params)}
                            >
                                <Icon icon={'hugeicons:view'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}
                    {checkPermission('update-promocode') && (

                        <Tooltip title='Update Promocode.' placement='bottom'>
                            <Button
                                style={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleEditClick(params)}
                            >
                            <Icon icon={'circum:edit'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}
                    {checkPermission('delete-promocode') && (

                        <Tooltip title='Delete Promocode.' placement='bottom'>

                            <Button
                                style={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleDeleteClick(params)}
                            >
                                <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
                            </Button>
                        </Tooltip>
                    )}
                </>
            ),
        },
    ];

    return (
        <Card sx={{ p: 5 }}>

            <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                <GoBack label={'Promocode'} isBack={false} />
                {checkPermission('add-promocode') && (

                    <Link href='/offers/promocode/create' passHref style={{ textDecoration: 'none' }}>

                        <Button type='submit' variant='contained' style={{ marginBottom: '20px' }} >
                            Add Promocode
                        </Button>

                    </Link>
                )}
            </Box>
            <CommonDatagrid
                totalRows={totalRows}
                pageSize={pageSize}
                currentPage={page}
                handleChangePage={handlePageChange}
                handleChangeRowsPerPage={handlePageSizeChange}
                columns={columns}
                rows={rows}
                checkboxSelection={false}
                loading={loading}
            />

            {openDelete && (
                <DeletePromocodeDialog
                    selctedPromocodeForDelete={selectedPromocodeForDelete}
                    show={openDelete}
                    handleclose={() => {
                        setOpenDelete(false);
                        fetchData();
                    }}
                />
            )}

            {openView && (
                <PromocodeViewPopup
                    selectedPromocode={selectedPromocode}
                    show={openView}
                    handleclose={() => setOpenView(false)}
                />
            )}

            {openEdit && (
                <PromocodeEditPopup
                    selectedPromocode={selectedPromocode}
                    show={openEdit}
                    handleclose={() => {
                        setOpenEdit(false);
                        fetchData();
                    }}
                />
            )}
        </Card>
    );
};

export default PromocodeList;
