import { Box, Button, Card, Stack, Switch, Tooltip, Tab, Tabs } from '@mui/material'
import { GridCellParams, GridColDef } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState } from 'react'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import AddShop from './AddUpdatePrice'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';
import toast from 'react-hot-toast';

const Price = () => {
  const [rows, setRows] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState({})
  const [openEdit, setOpenEdit] = useState(false)
  const [shops, setShops] = useState<any[]>([])
  const [activeShopId, setActiveShopId] = useState<number | string>('')

  const fetchShopsList = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/getAllShops')
      let data = response.data.data?.data || response.data.data
      if (Array.isArray(data)) {
        setShops(data)
        if (data.length > 0) {
          setActiveShopId(data[0].id)
        }
      } else if (data && typeof data === 'object') {
        const possibleArray = Object.values(data).find(Array.isArray)
        if (Array.isArray(possibleArray)) {
          setShops(possibleArray)
          if (possibleArray.length > 0) {
            setActiveShopId(possibleArray[0].id)
          }
        } else {
          setShops([])
        }
      } else {
        setShops([])
      }
    } catch (e) {
      console.error('Failed to fetch shops', e)
      setShops([])
    }
  }

  const fetchPrices = useCallback(async (signal?: AbortSignal) => {
    if (!activeShopId) return; // Wait for activeShopId to be set

    setLoading(true)
    try {
      let url = `/api/v1/admin/getShopEggPrices?pageNo=${page}&limit=${pageSize}&shop_id=${activeShopId}`
      const response = await axiosInstance.get(url, { signal })
      let data = response.data.data?.products || response.data.data?.data || response.data.data || []
      setRows(data)
      setTotalRows(response.data.data?.count || data.length || 0)
    } catch (e: any) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        console.log(e)
      }
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, activeShopId])

  useEffect(() => {
    fetchShopsList()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchPrices(controller.signal)
    return () => controller.abort()
  }, [fetchPrices])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number | string) => {
    setActiveShopId(newValue)
    setPage(0)
  }

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
      await axiosInstance.post(`/api/v1/admin/updateShopEggPrices?id=${params.id}`, { is_active: checked ? 1 : 0 })
          fetchPrices()
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
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.name || 'NA'}
        </div>
      )
    },
    {
      field: 'shop_name',
      headerName: 'Shop Name',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.shop?.name || 'NA'}
        </div>
      )
    },
    {
      field: 'category_name',
      headerName: 'Category',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.category?.name || 'NA'}
        </div>
      )
    },
    {
      field: 'egg_price_min',
      headerName: 'Min Price',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <p>₹{params.row?.egg_price_min || '0.00'}</p>
      )
    },
    {
      field: 'egg_price_max',
      headerName: 'Max Price',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <p>₹{params.row?.egg_price_max || '0.00'}</p>
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

    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 150,
      sortable: false,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <>
          {/* {checkPermission('update-shop') && ( */}
            <Tooltip title='Update Prices' placement='bottom'>
              <Button sx={{ color: 'text.secondary', margin: '-10px' }} onClick={() => handleEditClick(params)}>
                <Icon icon={'circum:edit'} fontSize={24} />
              </Button>
            </Tooltip>
          {/* )} */}
          {/* {checkPermission('delete-shop') && ( */}
            <Tooltip title='Delete Shop.' placement='bottom'>
              <Button
                sx={{ color: 'text.secondary', margin: '-10px' }}
                onClick={() => handleDeleteOpen(params)}
              >
                <Icon icon={'ic:outline-delete'} fontSize={24} sx={{ color: 'error.main' }} />
              </Button>
            </Tooltip>
          {/* )} */}
        </>
      ),
    },
  ]

  return (
    <>   
      <Card sx={{ p: 5 }}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} sx={{ mb: 4 }}>
          <GoBack label={' Price'} isBack={false} />
        </Box>

        <Tabs
          value={activeShopId}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}
        >
          {Array.isArray(shops) && shops.map((shop) => (
            <Tab key={shop.id} label={shop.name} value={shop.id} />
          ))}
        </Tabs>
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
      {openAdd && <AddShop open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchPrices} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem.id} 
        fetchData={fetchPrices} 
        label={'Are you sure! You want to delete this shop?'} apiUrl={'/api/v1/admin/deleteShop?id='} />
      )}
      {openEdit && (
        <AddShop open={openEdit} handleClose={() => setOpenEdit(false)} 
        fetchData={fetchPrices}
        selectedItem={selectedItem} />
      )}
    </>
  )
}

export default Price
