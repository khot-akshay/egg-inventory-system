import { Box, Button, Card, Stack, Switch, Tooltip } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid';
import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'

import Icon from 'src/@core/components/icon';
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup';
import AddBanner from './AddBanner';
import MultiDeleteDialogPopup from 'src/components/common/DeletePopup/MultiDeletePopup';
import toast, { Toaster } from 'react-hot-toast';

function Banner() {
    const [rows, setRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(true);
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(0);
    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedItem, setSelectedItem] = useState({})
    const fetchGame = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(`/v1/admin/getCarousel?pageNo=${page}&limit=${pageSize}`)
            setRows(response.data.data?.data ?? [])
            setTotalRows(response.data.data?.count ?? 0)
        } catch (e) {
            } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGame()
    }, [page, pageSize])

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
    };
    const handleEditClick = (params: GridCellParams) => {
        setSelectedItem(params.row)
        setOpenEdit(true)
    }
    const handleDeleteOpen = (params: GridCellParams) => {
        setSelectedItem(params.row)
        setOpenDelete(true)
    }

    const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: GridColDef[]) => {
        const { checked } = event.target;
        try {
            await axiosInstance.post(`/v1/admin/updateCarousel?id=${params.id}`, { is_active: checked })
            fetchGame()
            toast.success('Status updated successfully.')
        } catch (e) {
            toast.error('Failed to set active')
        }
    }
    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'Sr. No.',
            minWidth: 100,
            sortable: false,
            renderCell: (index) => {
                const rowIndex = index.api.getRowIndex(index.row.id);
                return (page * pageSize) + (rowIndex % pageSize) + 1;
            },
            hideable: false,

        },
        {
            field: 'images',
            headerName: 'Primary Image',
            flex: 1,
            minWidth: 200,
            sortable: false,
            renderCell: (params: GridCellParams) => (
                <img src={params.value as string} alt={''} style={{ height: 100 }} />
            ),
        },
        {
            field: 'title',
            headerName: 'title',
            flex: 1,
            minWidth: 200,
            sortable: false,
         
        },
        {
            field: 'sub_title',
            headerName: 'Sub title',
            flex: 1,
            minWidth: 200,
            sortable: false,
         
        },
        {
            field: 'status',
            headerName: 'Status',
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) => (
                <Stack direction='row' alignItems='center' spacing={5}>

                    <p>{params.row.is_active == '1' ? 'Active' : 'In-active'}</p>
                    <Switch checked={params.row.is_active == '1' ? true : false} onChange={(event) => handleSwitchChange(event, params.row)} />
                </Stack>
            ),
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 150,
            sortable: false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <><Tooltip title='Update Banner.' placement='bottom'>
                    <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                        <Icon icon={'circum:edit'} fontSize={24} />
                    </Button>
                </Tooltip>
                    <Tooltip title='Delete Banner.' placement='bottom'>
                        <Button
                            style={{ color: '#84919d', margin: '-10px' }}
                            onClick={() => handleDeleteOpen(params)}
                        >
                            <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
                        </Button>
                    </Tooltip>
                </>
            ),
        },


    ]
    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <Card sx={{ p: 5 }}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                    <GoBack label={'Banner'} isBack={false} />

                    <Button onClick={() => setOpenAdd(true)} variant='contained'>Add Banner</Button>

                </Box>

                <CommonDatagrid totalRows={totalRows} pageSize={pageSize} currentPage={page} handleChangePage={handlePageChange} handleChangeRowsPerPage={handlePageSizeChange} columns={columns} rows={rows} checkboxSelection={false} loading={loading} />
            </Card>
            {openAdd && (
                <AddBanner open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />
            )}
            {openEdit && (
                <AddBanner open={openEdit} handleClose={() => setOpenEdit(false)} fetchData={fetchGame} selectedItem={selectedItem} />
            )}
            {openDelete && (
                <MultiDeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={[selectedItem.id]} 
                fetchData={fetchGame} 
                label={'Are you sure! You want to delete.'} 
                apiUrl={'v1/admin/deleteCarousel'} />
            )}
        </>
    )
}

export default Banner;