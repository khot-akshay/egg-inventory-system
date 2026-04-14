import { Box, Button, Card, Grid, Stack, Switch } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton'
import SearchInput from 'src/components/common/SearchInput'
import checkPermission from 'src/configs/CheckPermisstion'
import axiosInstance from 'src/services/axios'

const Cities = () => {
    const [rows, setRows] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [openAdd, setOpenAdd] = useState(false)
    const fetchGame = async (searchQuery?: string) => {
        setLoading(true)
        let params = '';
        if (searchQuery) {
            params = `&search=${searchQuery}`;
        }
        try {
            const response = await axiosInstance.get(`/v1/admin/getAllcities?state_id=4008&pageNo=${page}&limit=${pageSize}${params}`)
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

    const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: GridColDef[]) => {
        const { checked } = event.target;
        try {
            await axiosInstance.post(`/v1/admin/updateIsActive`, { city_id: params.id, type: 'city' })
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
            renderCell: index => {
                const rowIndex = index.api.getRowIndex(index.row.id)
                return page * pageSize + (rowIndex % pageSize) + 1
            },
            flex: 1,
            hideable: false
        },
        {
            field: 'city',
            headerName: 'City',
            flex: 1,
              minWidth: 250,
              sortable: false,
            renderCell: (params: GridCellParams) => <p>{params.row?.name ? params.row?.name : 'NA'}</p>
        },
        {
            field: 'status',
            headerName: 'Default',
            sortable: false,
           
            renderCell: (params: GridCellParams) => (
                <Stack direction='row' alignItems='center' spacing={5}>

                    <p>{params.row.is_active == '1' ? 'Active' : 'In-Active'}</p>
                    {checkPermission('update-cities') && (

                        <Switch checked={params.row.is_active == '1' ? true : false} onChange={(event) => handleSwitchChange(event, params.row)} />
                    )}
                </Stack>
            ),
            flex: 1,
            minWidth: 150

        },

    ]

    return (
        <>
            <Card sx={{ p: 5 }}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={4}>

                            <GoBack label={' Cities'} />
                        </Grid>
                        <Grid item xs={12} md={4} sm={4} sx={{mt:{md:0, xs:2}}}>
                            <SearchInput handleSearch={fetchGame} placeHolder={'Search City...'} />
                        </Grid>
                    </Grid>

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
        </>
    )
}

export default Cities