import { Box, Button, Card, Grid, Stack, Switch, Tooltip } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import GoBack from 'src/components/common/goBack/GoBackButton'
import SearchInput from 'src/components/common/SearchInput'
import AddPaymentAccount from 'src/components/metaData/paymentAccount/AddPaymentAccount'
import checkPermission from 'src/configs/CheckPermisstion'
import axiosInstance from 'src/services/axios'

const Payments = () => {
    const [rows, setRows] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [openAdd, setOpenAdd] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [openDelete, setOpenDelete] = useState(false)
    const fetchGame = async (searchQuery?: string) => {
        setLoading(true)

        try {
            const response = await axiosInstance.get(`/v1/admin/getAllAccounts?pageNo=${page}&limit=${pageSize}`)
            setRows(response.data.data.data ?? [])
            setTotalRows(response.data.data.count ?? 0)
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
        setPageSize(newPageSize)
    }

    const handleEditClick = (params: GridCellParams) => {
        setSelectedAccount(params.row)
        setOpenAdd(true)
    }
    const handleDeleteOpen = (params: GridCellParams) => {
        setSelectedAccount(params.row)
        setOpenDelete(true)
    }
    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'Sr. No.',
            minWidth: 100,
            sortable: false,
            renderCell: index => {
                const rowIndex = index.api.getRowIndex(index.row.id)
                return page * pageSize + (rowIndex % pageSize) + 1
            },
            flex: 1,
            hideable: false
        },
        {
            field: 'name',
            headerName: 'name',
            minWidth: 250,
            sortable: false,
            flex: 1,
            //   minWidth: 250,
            renderCell: (params: GridCellParams) => <p>{params.row?.name ? params.row?.name : 'NA'}</p>
        },
        {
            field: 'account_id',
            headerName: 'Account id',
            flex: 1,
             minWidth: 250,
             sortable: false,
            renderCell: (params: GridCellParams) => <p>{params.row?.account_id ? params.row?.account_id : 'NA'}</p>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 150,
            sortable: false,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('update-account') && (

                        <Tooltip title='Update Account.' placement='bottom'>
                            <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                                <Icon icon={'circum:edit'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}
                    {checkPermission('delete-account') && (

                        <Tooltip title='Delete Account.' placement='bottom'>
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
            <Card sx={{ p: 5 }}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>

                    <GoBack label={'Payment Accounts'} />

                    {checkPermission('create-account') && (

                        <Button
                            onClick={() =>{setSelectedAccount(null);setOpenAdd(true)}}
                            variant='contained'
                        >
                            Add Account
                        </Button>
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
            </Card>
            {openAdd && (
                <AddPaymentAccount
                    open={openAdd}
                    handleClose={() => setOpenAdd(false)}
                    selectedItem={selectedAccount}
                    fetchData={fetchGame} />
            )}
            {openDelete && (
                <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedAccount?.id} fetchData={fetchGame} label={'Are you sure! You want to delete.'} apiUrl={'v1/admin/deleteAccount?id='} />
            )}
        </>
    )
}

export default Payments
