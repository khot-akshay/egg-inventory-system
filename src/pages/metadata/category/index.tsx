import { Box, Card, Button, Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import axiosInstance from 'src/services/axios'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import Icon from 'src/@core/components/icon'
import checkPermission from 'src/configs/CheckPermisstion'
import AddCategory from 'src/components/metaData/category/AddCategory'
import { useRouter } from 'next/router'
import { capitalizeFirstLetter } from 'src/utils/encodeid'

const Category = () => {
    const [rows, setRows] = useState([])
    const [totalRows, setTotalRows] = useState(0)
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(0)
    const [openAdd, setOpenAdd] = useState(false)
    const [selectedItem, setSelectedItem] = useState({})
    const [openEdit, setOpenEdit] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const router = useRouter()

    const fetchCategory = async () => {
        setLoading(true)
        try {
            const response = await axiosInstance.get(`/v1/admin/getAllCategory?category_type=${router.query.slug}&pageNo=${page}&limit=${pageSize}`)
            setRows(response.data.data?.data ?? [])
            setTotalRows(response.data.data?.count ?? 0)
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategory()
    }, [page, pageSize, router.query.slug])

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

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'Sr. No.',
            renderCell: index => {
                const rowIndex = index.api.getRowIndex(index.row.id)
                return page * pageSize + (rowIndex % pageSize) + 1
            },
            hideable: false
        },
        {
            field: 'category_name',
            headerName: 'Category Name',
            minWidth: 250,
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridCellParams) => <p>{params.row?.category_name ? params.row?.category_name : 'NA'}</p>

        },
        {
            field: 'category_type',
            headerName: 'Category Type',
            flex: 1,
            minWidth: 250,
            renderCell: (params: GridCellParams) => <p>{params.row?.category_type ? params.row?.category_type : 'NA'}</p>

        },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 120,
            flex: 1,
            renderCell: (params: GridCellParams) => (
                <>
                    {checkPermission('update-category') && (

                        <Tooltip title='Update Category.' placement='bottom'>
                            <Button sx={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleEditClick(params)}>
                                <Icon icon={'circum:edit'} fontSize={24} />
                            </Button>
                        </Tooltip>
                    )}
                    {checkPermission('delete-category') && (

                        <Tooltip title='Delete Category.' placement='bottom'>
                            <Button style={{ color: '#84919d', margin: '-10px' }}
                                onClick={() => handleDeleteOpen(params)}>
                                <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
                            </Button>
                        </Tooltip>
                    )}
                </>
            )
        }
    ]

    return (
        <>
            <Card sx={{ p: 5 }}>
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                    {/* <GoBack label={`Category ${router.query.slug}`} isBack={false} /> */}
                    <GoBack label={` ${capitalizeFirstLetter(router.query.slug as string)} Category`} isBack={false} />


                    {checkPermission('create-category') && (

                        <Button onClick={() => setOpenAdd(true)} variant='contained'>
                            Add {router.query.slug} Category
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
            {openAdd && < AddCategory open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchCategory} />}
            {openEdit && (
                <AddCategory open={openEdit} handleClose={() => setOpenEdit(false)} fetchData={fetchCategory} selectedItem={selectedItem} />
            )}
            {openDelete && (
                <DeleteDialogPopup
                    show={openDelete}
                    handleclose={() => setOpenDelete(false)}
                    selectedItems={selectedItem.id}
                    fetchData={fetchCategory}
                    label={'Are you sure! You want to delete.'}
                    apiUrl={'v1/admin/deleteCategory?id='}
                />
            )}
        </>
    )
}

export default Category
