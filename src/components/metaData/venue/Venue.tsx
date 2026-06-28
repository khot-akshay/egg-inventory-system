import { Box, Button, Card, Tooltip } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import GoBack from 'src/components/common/goBack/GoBackButton'
import axiosInstance from 'src/services/axios'
import AddVenue from './AddVenue'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion'
import toast, { Toaster } from 'react-hot-toast'

function Venue() {
  const [rows, setRows] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState({})
  const [openEdit, setOpenEdit] = useState(false)

  const fetchGame = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/v1/admin/getVenue?pageNo=${page}&limit=${pageSize}`)
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
      minWidth: 100,
      sortable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
      hideable: false
    },
    {
      field: 'image',
      headerName: 'Image',
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <img src={params.value as string} alt={'image'} style={{ height: 110, width: 130 }} />
      )
    },
    {
      field: 'names',
      headerName: 'Names',
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
          {params.row?.name || 'NA'}
        </div>
      )
    },
    // {
    //   field: 'user_name',
    //   headerName: 'Manager Name',
    //   flex: 1,
    //   minWidth: 250,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => <p>{params.row?.user?.name ? params.row?.user?.name : 'NA'}</p>
    // },
    {
      field: 'city_name',
      headerName: 'City Name',
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => <p>{params.row?.city?.name ? params.row?.city?.name : 'NA'}</p>
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <>
          {checkPermission('update-venue') && (

            <Tooltip title='Update Venue.' placement='bottom'>
              <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                <Icon icon={'circum:edit'} fontSize={24} />
              </Button>
            </Tooltip>
          )}
          {checkPermission('delete-venue') && (

            <Tooltip title='Delete Venue.' placement='bottom'>
              <Button style={{ color: '#84919d', margin: '-10px' }} onClick={() => handleDeleteOpen(params)}>
                <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
              </Button>
            </Tooltip>
          )}
        </>
      )
    }
  ]
  return (
    <>  <Toaster position="top-right" reverseOrder={false} />
      <Card sx={{ p: 5 }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <GoBack label={'Venue'} isBack={false}/>
          {checkPermission('create-venue') && (

            <Button onClick={() => setOpenAdd(true)} variant='contained'>
              Add Venue
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
      {openAdd && <AddVenue open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}

      {openDelete && (
        <DeleteDialogPopup
          show={openDelete}
          handleclose={() => setOpenDelete(false)}
          selectedItems={selectedItem.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'}
          apiUrl={'v1/admin/deleteVenue?id='}
        />
      )}

      {openEdit && (
        <AddVenue
          open={openEdit}
          handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem}
        />
      )}
    </>
  )
}

export default Venue
