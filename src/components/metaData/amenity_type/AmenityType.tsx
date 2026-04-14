import { Box, Card, Button, Tooltip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import axiosInstance from 'src/services/axios'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import AddAmenity_type from './AddAmenity_type'
import Icon from 'src/@core/components/icon'
import checkPermission from 'src/configs/CheckPermisstion'
import toast, { Toaster } from 'react-hot-toast'

const AmenityType = () => {
  const [rows, setRows] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [selectedItem, setSelectedItem] = useState({})
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)

  const fetchAmenity = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/v1/admin/getAmenityType?pageNo=${page}&limit=${pageSize}`)
      setRows(response.data.data?.data ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAmenity()
  }, [page, pageSize])

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
      flex: 1,
      sortable:false,
      minWidth: 100,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
      hideable: false
    },
    {
      field: 'name',
      headerName: 'Amenity Type',
      flex: 1,
      sortable:false,
      minWidth: 250,
      renderCell: (params: GridCellParams) => <p>{params.row?.name ? params.row?.name : 'NA'}</p>

    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable:false,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <>
          {checkPermission('update-amenity-type') && (

            <Tooltip title='Update Amenity Type.' placement='bottom'>
              <Button sx={{ color: '#84919d', margin: '-10px' }}
                onClick={() => handleEditClick(params)}>
                <Icon icon={'circum:edit'} fontSize={24} />
              </Button>
            </Tooltip>
          )}
          {checkPermission('delete-amenity-type') && (

            <Tooltip title='Delete Amenity Type.' placement='bottom'>
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
    <>    <Toaster position="top-right" reverseOrder={false} />
      <Card sx={{ p: 5 }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <GoBack label={'Amenity Type'} isBack={false}/>
          {checkPermission('create-amenity-type') && (

            <Button onClick={() => setOpenAdd(true)} variant='contained'>
              Add Amenity Type
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
      {/* {openAdd && < AddAmenity_type open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />} */}
      {openAdd && <AddAmenity_type open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchAmenity} />}
      {openEdit && (
        <AddAmenity_type
          open={openEdit}
          handleClose={() => setOpenEdit(false)}
          fetchData={fetchAmenity}
          selectedItem={selectedItem}
        />
      )}
      {openDelete && (
        <DeleteDialogPopup
          show={openDelete}
          handleclose={() => setOpenDelete(false)}
          selectedItems={selectedItem.id}
          // fetchData={fetchAmenity}
          fetchData={fetchAmenity}
           label={'Are you sure! You want to delete.'}
          apiUrl={'v1/admin/deleteAmenityType?id='}
        />
      )}
    </>
  )
}

export default AmenityType
