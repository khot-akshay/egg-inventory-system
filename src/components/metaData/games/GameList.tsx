import { Box, Button, Card, Tooltip } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton'
import axiosInstance from 'src/services/axios'
import AddGame from './AddGame'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion'
import toast, { Toaster } from 'react-hot-toast'

function GameList() {
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
            const response = await axiosInstance.get(`/v1/admin/getGame?pageNo=${page}&limit=${pageSize}`)
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
        setPage(newPage)
    }

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
    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'Sr. No.',
            sortable:false,
            minWidth: 100,
            renderCell: (index) => {
                const rowIndex = index.api.getRowIndex(index.row.id);
                return (page * pageSize) + (rowIndex % pageSize) + 1;
            },
            hideable: false,

        },
        {
            field: 'image',
            headerName: 'Game Image',
            minWidth: 200,
            sortable:false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <img src={params.value as string} alt={''} style={{ height: 110, width: 130 }} />
            ),
        },
        {
            field: 'games',
            headerName: 'Game Name',
            sortable:false,
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridCellParams) => (
                <p>{params.row?.name ? (params.row?.name) : 'NA'}</p>
            )
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable:false,
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridCellParams) => (
                <p>{params.row?.description ? (params.row?.description) : 'NA'}</p>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable:false,
            minWidth: 200,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('update-game') && (

                        <Tooltip title='Update Game.' placement='bottom'>
                            <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                                <Icon icon={'circum:edit'} fontSize={24} color='#22c55e'/>
                            </Button>
                        </Tooltip>
                    )}
                    {checkPermission('delete-game') && (

                        <Tooltip title='Delete Game.' placement='bottom'>
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
    return (
        <>
   <Toaster position="top-right" reverseOrder={false} />
            <Card sx={{ p: 5 }}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                    <GoBack label={'Game List'} isBack={false} />
                    {checkPermission('create-game') && (


                        <Button
                            onClick={() => setOpenAdd(true)}
                            variant='contained'
                        >
                            Add Game
                        </Button>

                    )}
                </Box>
                <CommonDatagrid totalRows={totalRows} pageSize={pageSize} currentPage={page} handleChangePage={handlePageChange} handleChangeRowsPerPage={handlePageSizeChange} columns={columns} rows={rows} checkboxSelection={false} loading={loading} />
            </Card>
            {openAdd && (
                <AddGame open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />
            )}
            {openEdit && (
                <AddGame open={openEdit} handleClose={() => setOpenEdit(false)} fetchData={fetchGame} selectedItem={selectedItem} />
            )}
            {openDelete && (
                <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} 
                selectedItems={selectedItem.id} 
                // fetchData={fetchGame} 
                fetchData={() => {
                    fetchGame(); 
                    toast.success('Game Deleted Successfully'); // Show toast
                  }}
                label={'Are you sure! You want to delete.'} apiUrl={'v1/admin/deleteGame?id='} />
            )}
        </>
    )

}

export default GameList