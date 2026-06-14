import { Box, Button, Card, Stack, Switch, Tooltip } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import AddShop from './AddShop'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';
import toast from 'react-hot-toast';

const Shop = () => {
  const [rows, setRows] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState({})
  const [openEdit, setOpenEdit] = useState(false)
  
  const fetchShops = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`/api/v1/admin/getAllShops?pageNo=${page}&limit=${pageSize}`)
      let data = response.data.data?.shops || response.data.data || []
      setRows(data)
      setTotalRows(response.data.data?.count || data.length || 0)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
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
          await axiosInstance.post(`/api/v1/admin/updateShop?id=${params.id}`, { is_active: checked ? 1 : 0 })
          fetchShops()
          toast.success('Status updated successfully.')
      } catch (e) {
          toast.error('Failed to set active status')
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
      field: 'code',
      headerName: 'Shop Code',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) =>  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
      {params.row?.code || 'NA'}
    </div>
    },
    {
      field: 'name',
      headerName: 'Shop Name',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) =>  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
      {params.row?.name || 'NA'}
    </div>
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <p>{params.row?.phone || 'NA'}</p>
      )
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <p>{params.row?.city || 'NA'}</p>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
          <Stack direction='row' alignItems='center' spacing={5}>
              <p>{params.row.is_active == '1' || params.row.is_active === true ? 'Active' : 'In-active'}</p>
              <Switch checked={params.row.is_active == '1' || params.row.is_active === true} onChange={(event) => handleSwitchChange(event, params.row)} />
          </Stack>
      ),
      flex: 1,
  },

    // {
    //   field: 'actions',
    //   headerName: 'Actions',
    //   minWidth: 150,
    //   sortable: false,
    //   flex: 1,
    //   renderCell: (params: GridCellParams) => (
    //     <>
    //       {/* {checkPermission('update-shop') && ( */}
    //         <Tooltip title='Update Shop.' placement='bottom'>
    //           <Button sx={{ color: '#84919d', margin: '-10px' }} onClick={() => handleEditClick(params)}>
    //             <Icon icon={'circum:edit'} fontSize={24} />
    //           </Button>
    //         </Tooltip>
    //       {/* )} */}
    //       {/* {checkPermission('delete-shop') && ( */}
    //         <Tooltip title='Delete Shop.' placement='bottom'>
    //           <Button
    //             style={{ color: '#84919d', margin: '-10px' }}
    //             onClick={() => handleDeleteOpen(params)}
    //           >
    //             <Icon icon={'ic:outline-delete'} fontSize={24} color='#FC4E4E' />
    //           </Button>
    //         </Tooltip>
    //       {/* )} */}
    //     </>
    //   ),
    // },
  ]

  return (
    <>   
      <Card sx={{ p: 5 }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <GoBack label={' Shops'} isBack={false} />
          {/* {checkPermission('create-shop') && ( */}
            <Button onClick={() => setOpenAdd(true)} variant='contained'>
              Add Shop
            </Button>
          {/* )} */}
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
      {openAdd && <AddShop open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchShops} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem.id} 
        fetchData={fetchShops} 
        label={'Are you sure! You want to delete this shop?'} apiUrl={'/api/v1/admin/deleteShop?id='} />
      )}
      {openEdit && (
        <AddShop open={openEdit} handleClose={() => setOpenEdit(false)} 
        fetchData={fetchShops}
        selectedItem={selectedItem} />
      )}
    </>
  )
}

export default Shop
