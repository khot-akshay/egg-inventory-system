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
import AddTruckModel from './AddTruckModel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchInput from 'src/components/common/SearchInput';
import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';




const TruckModel = () => {
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
            let url = `/api/v1/admin/getAllTruckModels?pageNo=${page}&limit=${pageSize}`
            if (searchQuery) {
                url = `${url}&search=${searchQuery}`;
            }
            const response = await axiosInstance.get(url)
            if (response?.data?.success) {
                setLoading(false)

                setRows(response.data.data.truck_models ?? [])
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
            field: 'name',
            headerName: 'Truck Model Name',
            flex: 1,

            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
                {params.row?.name || 'NA'}
            </div>
        },
        {
            field: 'body_type',
            headerName: 'Truck Body Type',
            flex: 1,
            minWidth: 250,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                const value = params.row?.body_type?.toLowerCase()
                const label = value === 'open' ? 'Open Truck' : value === 'closed' ? 'Container Truck' : 'NA'
                return <p>{label}</p>
            }
        }
        ,
        {
            field: 'height',
            headerName: 'Height (FT)',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) =>
                //  <p>{params.row?.height || 'NA'}</p>
                <p>{params.row?.height ? `${params.row.height}` : 'NA'}</p>
        },
        {
            field: 'length',
            headerName: 'Length (FT)',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) => {
                const raw = params.row?.length;
                const value = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
                const threshold = 1.3; // change this to 1.4 if you prefer

                // ensure it's a finite number and meets threshold
                const isValid = Number.isFinite(value) && value >= threshold - 1e-9;

                return <p>{isValid ? (Math.round(value * 10) / 10) : 'NA'}</p>;
            }


        },
        {
            field: 'width',
            headerName: 'Width (FT)',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) =>
                // <p>{params.row?.width || 'NA'}</p>
                <p>{params.row?.width ? `${params.row.width}` : 'NA'}</p>
        },
        {
            field: 'capacity',
            headerName: 'Capacity (Ton)',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) =>
                //  <p>{params.row?.capacity || 'NA'}</p>
                <p>{params.row?.capacity ? `${params.row.capacity}` : 'NA'}</p>
        },
        // {
        //     field: 'capacity',
        //     headerName: 'Capacity',
        //     flex: 1,
        //     minWidth: 150,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => <p>{params.row?.capacity || 'NA'}</p>
        // },
        // {
        //     field: 'fuel_type',
        //     headerName: 'Fuel Type',
        //     flex: 1,
        //     minWidth: 150,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => <p>{params.row?.fuel_type || 'NA'}</p>
        // },
        // {
        //     field: 'truck_type',
        //     headerName: 'Truck Type',
        //     flex: 1,
        //     minWidth: 150,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => <p>{params.row?.truck_type || 'NA'}</p>
        // },

        //   {
        //     field: 'amenity_type',
        //     headerName: 'Amenity Type',
        //     flex: 1,
        //     minWidth: 250,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => (
        //       <p>{params.row?.amenity_type?.name ? (params.row?.amenity_type?.name) : 'NA'}</p>
        //     )
        //   },
        //   { 
        //     field: 'icon',
        //     headerName: 'Amenity Icon',
        //     flex: 1,
        //     minWidth: 250,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => (
        //       <Icon icon={params?.row?.icon ? params?.row?.icon : 'mdi:home-plus-outline'}/>
        //     )
        //   },
        //   {
        //     field: 'status',
        //     headerName: 'Status',
        //     minWidth: 150,
        //     sortable: false,
        //     renderCell: (params: GridCellParams) => (
        //         <Stack direction='row' alignItems='center' spacing={5}>

        //             <p>{params.row.is_active == '1' ? 'Active' : 'In-active'}</p>
        //             <Switch checked={params.row.is_active == '1' ? true : false} onChange={(event) => handleSwitchChange(event, params.row)} />
        //         </Stack>
        //     ),
        //     flex: 1,
        // },
        {
            field: 'created_at',
            headerName: 'Created Date',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridCellParams) => (
                <DateFormateComponent date={params.row?.created_at ?? ''} />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 150,
            sortable: false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('update_truck_model') && (

                        <Tooltip title='Update Truck Model.' placement='bottom'>
                            <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                                <Icon icon={'circum:edit'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}

                    {checkPermission('delete_truck_model') && (

                        <Tooltip title='Delete Truck Model.' placement='bottom'>
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
                        <GoBack label={' Truck Model'} isBack={false} />
                    </Box>
                    {/* Right Side: Search and Add Button */}
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">

                        <Grid item xs={12} sm="auto">
                            <SearchInput handleSearch={handleSearch} placeHolder="Search..." />

                        </Grid>
                        {checkPermission('add_truck_model') && (
                            <Grid item xs={12} sm="auto">
                                <Button onClick={() => setOpenAdd(true)} variant='contained'>
                                    Add Truck Model
                                    {/* <Icon icon='mdi:plus' style={{ marginLeft: '5px' }} /> */}
                                    {/* <Icon icon='ei:plus' style={{ marginLeft: '5px' }} /> */}
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
            {openAdd && <AddTruckModel open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
            {openDelete && (
                <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem.id}
                    fetchData={fetchGame}
                    label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/deleteTruckModel?id='} />
            )}
            {openEdit && (
                <AddTruckModel open={openEdit} handleClose={() => setOpenEdit(false)}
                    fetchData={fetchGame}
                    selectedItem={selectedItem} />
            )}
        </>
    )
}

export default TruckModel
