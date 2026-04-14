import { Box, Button, Card, Stack, Switch, Tooltip } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import AddAmenities from './AddAmenities'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';



const Amenities = () => {
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
      const response = await axiosInstance.get(`/v1/admin/getAmenities?pageNo=${page}&limit=${pageSize}`)
      setRows(response.data.data?.data ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
      console.log(e)
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
      field: 'amenities',
      headerName: 'Amenities',
      flex: 1,
     
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) =>  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
      {params.row?.name || 'NA'}
    </div>
    },
    {
      field: 'amenity_type',
      headerName: 'Amenity Type',
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <p>{params.row?.amenity_type?.name ? (params.row?.amenity_type?.name) : 'NA'}</p>
      )
    },
    { 
      field: 'icon',
      headerName: 'Amenity Icon',
      flex: 1,
      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Icon icon={params?.row?.icon ? params?.row?.icon : 'mdi:home-plus-outline'}/>
      )
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
        <>
          {checkPermission('update-amenities') && (

            <Tooltip title='Update Amenities.' placement='bottom'>
              <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                <Icon icon={'circum:edit'} fontSize={24} />
              </Button>
            </Tooltip>
          )}
          {checkPermission('delete-amenities') && (

            <Tooltip title='Delete Amenities.' placement='bottom'>
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
          {/* <GoBack label={'All Amenities'} /> */}
          <GoBack label={' Amenities'} isBack={false} />
          {checkPermission('create-amenities') && (

            <Button onClick={() => setOpenAdd(true)} variant='contained'>
              Add Amenities
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
      {openAdd && <AddAmenities open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem.id} 
        fetchData={fetchGame} 
        label={'Are you sure! You want to delete.'} apiUrl={'v1/admin/deleteAmenity?id='} />
      )}
      {openEdit && (
        <AddAmenities open={openEdit} handleClose={() => setOpenEdit(false)} 
        fetchData={fetchGame}
        selectedItem={selectedItem} />
      )}
    </>
  )
}

export default Amenities
