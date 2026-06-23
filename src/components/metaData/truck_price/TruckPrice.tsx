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
import SearchInput from 'src/components/common/SearchInput';
import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import AddTruckPrice from './AddTruckPrice';




const TruckPrice = () => {
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
    const [filterValue, setFilterValue] = useState({
        name: "",
        type: [],
    });
    const fetchGame = async () => {
        setLoading(true)

        try {
            let url = `/api/v1/admin/getAllTruckPricings?pageNo=${page}&limit=${pageSize}`
            if (searchQuery) {
                url = `${url}&search=${searchQuery}`;
            }
            const response = await axiosInstance.get(url)
            if (response?.data?.success) {
                setLoading(false)

                setRows(response.data.data.truck_pricings ?? [])
                setTotalRows(response.data.data.count ?? 0)
            } else {

            }
        } catch (e) {
            setLoading(false)

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
        setSelectedItem(params.row)
        setOpenDelete(true)
        }
    const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: GridColDef[]) => {
        const { checked } = event.target;
        try {
            await axiosInstance.post(`/v1/admin/updateAmenities?id=${params.id}`, { is_active: checked })
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
            field: 'truck_size_in_ft',
            headerName: 'Truck Size (FT)',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) =>
                //  <p>{params.row?.height || 'NA'}</p>
                <p>{params.row?.truck_size_in_ft ? `${params.row.truck_size_in_ft}` : 'NA'}</p>
        },
        {
            field: 'capacity_upto_ton',
            headerName: 'Capacity  (Ton)',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                const raw = params.row?.capacity_upto_ton;
                const value = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
                const threshold = 1.3; // change this to 1.4 if you prefer

                // ensure it's a finite number and meets threshold
                const isValid = Number.isFinite(value) && value >= threshold - 1e-9;

                return <p>{isValid ? (Math.round(value * 10) / 10) : 'NA'}</p>;
            }


        },
        {
            field: 'local_base_fare',
            headerName: 'Local Base Fare Rate (INR)',
            flex: 1,
            minWidth: 230,
            sortable: false,
            renderCell: (params: GridCellParams) =>

                <p>{params.row?.local_base_fare ? `${params.row.local_base_fare}` : 'NA'}</p>
        },
        {
            field: 'outstation_rate_per_km',
            headerName: 'Outstation Rate Per Km (INR)',
            flex: 1,
            minWidth: 230,
            sortable: false,
            renderCell: (params: GridCellParams) =>

                <p>{params.row?.outstation_rate_per_km ? `${params.row.outstation_rate_per_km}` : 'NA'}</p>
        },


        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 150,
            sortable: false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('update_truck_price') && (

                        <Tooltip title='Update Truck Price.' placement='bottom'>
                            <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                                <Icon icon={'circum:edit'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}

                    {checkPermission('delete_truck_price') && (

                        <Tooltip title='Delete Truck Price.' placement='bottom'>
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
            <Card sx={{ p: 5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>
                    {/* Left Side: Back Button and Title */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <GoBack label={' Truck Price'} isBack={false} />
                    </Box>
                    {/* Right Side: Search and Add Button */}
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">

                        <Grid item xs={12} sm="auto">
                            {/* <SearchInput handleSearch={handleSearch} placeHolder="Search..." /> */}

                        </Grid>
                        {checkPermission('add_truck_price') && (
                            <Grid item xs={12} sm="auto">
                                <Button onClick={() => setOpenAdd(true)} variant='contained'>
                                    Add Truck Price
                                    <AddCircleOutlineIcon sx={{ ml: 1 }} />

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
            {openAdd && <AddTruckPrice open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
            {openDelete && (
                <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem.id}
                    fetchData={fetchGame}
                    label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/deleteTruckPricing?id='} />
            )}
            {openEdit && (
                <AddTruckPrice open={openEdit} handleClose={() => setOpenEdit(false)}
                    fetchData={fetchGame}
                    selectedItem={selectedItem} />
            )}
        </>
    )
}

export default TruckPrice
