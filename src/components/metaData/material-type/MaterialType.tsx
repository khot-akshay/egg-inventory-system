import { Box, Button, Card, Grid, Stack, Switch, Tooltip } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';
import toast from 'react-hot-toast';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { capitalizeFirstLetter } from 'src/utils/encodeid';
import TextViewDialog from 'src/components/common/viewtext/TextViewDialog';
import SearchInput from 'src/components/common/SearchInput';
import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import AddMaterialType from './AddMaterialType';





const MaterialType = () => {
    const [rows, setRows] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [openAdd, setOpenAdd] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [selectedItem, setSelectedItem] = useState({})
    const [openEdit, setOpenEdit] = useState(false)
    const [searchQuery, setQuery] = useState("");

    const fetchGame = async () => {
        setLoading(true)
        let url = `/api/v1/admin/getAllMaterialTypes?pageNo=${page}&limit=${pageSize}`;


        if (searchQuery) {
            url = `${url}&search=${searchQuery}`;
        }
        try {
            const response = await axiosInstance.get(url)
            setRows(response.data.data.material_types ?? [])
            setTotalRows(response.data.data?.count ?? 0)
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGame()
    }, [page, pageSize, searchQuery])

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize)
    }
    const handleEditClick = (params: GridCellParams) => {
        setSelectedItem(params.row)
        setOpenEdit(true)
    }
    const handleDeleteOpen = (params: GridCellParams) => {
        console.log('Delete Clicked:', params.row)
        setSelectedItem(params.row)
        setOpenDelete(true)
        console.log('Selected Item for delete:', selectedItem)


    }
    // const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, row: any) => {
    //     const newStatus = event.target.checked ? 'true' : 'false';
    //     try {
    //         await axiosInstance.post(`/api/v1/admin/updateMaterialType?id=${row.id}`, { is_active: newStatus })
    //         fetchGame()
    //         toast.success('Status updated successfully.')
    //     } catch (e) {
    //         toast.error('Failed to set active')
    //     }
    // }
    const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, row: any) => {
        const newStatus = event.target.checked; // boolean true/false
        try {
            await axiosInstance.post(`/api/v1/admin/updateMaterialType?id=${row.id}`, { is_active: newStatus })
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
            flex: 1,
            minWidth: 100,
            sortable: false,
            renderCell: index => {
                const rowIndex = index.api.getRowIndex(index.row.id)
                return page * pageSize + (rowIndex % pageSize) + 1
            },
            hideable: false
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
                {params.row?.name || 'NA'}
            </div>
        },
        {
            field: 'is_active',
            headerName: 'Status',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) => (
                <Switch
                    checked={Boolean(params.row?.is_active)}
                    onChange={(event) => handleSwitchChange(event, params.row)}
                />

            )
        },
        {
            field: 'created_at',
            headerName: 'Date Time',
            flex: 1,
            minWidth: 200,
            sortable: false,
            renderCell: (params: GridCellParams) => <DateFormateComponent date={params.row?.created_at || 'NA'} />
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 150,
            sortable: false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('update_material_type') && (

                        <Tooltip title='Update Material Type.' placement='bottom'>
                            <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                                <Icon icon={'circum:edit'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}

                    {checkPermission('delete_material_type') && (

                        <Tooltip title='Delete Material Type.' placement='bottom'>
                            <Button
                                style={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleDeleteOpen(params)}
                            >
                                <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
                            </Button>
                        </Tooltip>
                    )}

                </>
            ),
        },
    ]
    const handleSearch = (query) => {
        setQuery(query);
    };
    return (
        <>
            <Card sx={{ p: 5 }} className="bg-gray-50">
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>
                    {/* Left Side: Back Button and Title */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <GoBack label={'Material Type'} isBack={false} />
                    </Box>
                    {/* Right Side: Search and Add Button */}
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <Grid item xs={12} sm="auto">
                            <SearchInput handleSearch={handleSearch} placeHolder="Search..." />

                        </Grid>
                        {checkPermission('add_material_type') && (
                            <Grid item xs={12} sm="auto">
                                <Button onClick={() => setOpenAdd(true)} variant='contained'>
                                    Add Material Type <AddCircleOutlineIcon sx={{ ml: 1 }} />
                                </Button>
                            </Grid>
                        )}
                    </Box>

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
            </Card>
            {openAdd && <AddMaterialType open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
            {openDelete && (
                <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem.id}
                    fetchData={fetchGame}
                    label={'Are you sure! You want to delete.'}
                    apiUrl={'api/v1/admin/deleteMaterialType?&id='} />
            )}
            {openEdit && (
                <AddMaterialType open={openEdit} handleClose={() => setOpenEdit(false)}
                    fetchData={fetchGame}
                    selectedItem={selectedItem} />
            )}
        </>
    )
}

export default MaterialType
