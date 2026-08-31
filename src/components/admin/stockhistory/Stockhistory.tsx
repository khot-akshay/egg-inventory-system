import { Box, Button, Card, Grid, InputAdornment, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef, GridSearchIcon } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import SearchInput from 'src/components/common/SearchInput';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import RHFFilterAutocomplete from 'src/hook-forms/RHFFilterAutocomplete';




interface CategoryRow {
  id: number
  name: string
  slug?: string
  description?: string | null
  image_url?: string | null
  is_active?: boolean
  created_at?: string | null
  [key: string]: any
}

type SelectOption = {
  label: string
  value: number | string
}

const Stockhistory = () => {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [shops, setShops] = useState<any[]>([])
  const [selectedShop, setSelectedShop] = useState<any | null>(null)
  const [shopsLoading, setShopsLoading] = useState(false)
  const router = useRouter()
  const { control, watch } = useForm({
    defaultValues: {
      category_id: null,
      shop_id: null
    }
  })
  const selectedCategoryId = watch('category_id') as number | null
  const selectedShopId = selectedShop?.id as number | null | undefined
  const selectedUserId = selectedUser?.id as number | null | undefined



 
  const fetchGame = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        pageNo: String(page),
        limit: String(pageSize)
      })

      if (searchQuery) params.append('global_search', searchQuery)
      if (selectedCategoryId) params.append('category_id', String(selectedCategoryId))
      if (selectedShopId) params.append('shop_id', String(selectedShopId))
      if (selectedUserId) params.append('user_id', String(selectedUserId))

      const response = await axiosInstance.get(
        `/api/v1/admin/getStockMovements?${params.toString()}`
      )

      setRows(response.data.data?.stock_movements ?? [])
      setTotalRows(response.data.data.total ?? 0)
      } catch (e) {
      } finally {
      setLoading(false)
    }
  }


  // useEffect(() => {
  //   fetchGame();
  // }, [fetchGame]);

  // useEffect(() => {
  //   setPage(0)
  // }, [selectedCategoryId, selectedGradeId, selectedPolishTypeId])

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [selectedCategoryId, selectedShopId, searchQuery, selectedUserId, selectedShop])

  // Fetch data
  useEffect(() => {
    fetchGame()
  }, [page, pageSize, selectedCategoryId, selectedShopId, searchQuery, selectedUserId, selectedShop])

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true)
      try {
        const response = await axiosInstance.get('/api/v1/admin/getAllUsers')
        setUsers(response.data.data?.users ?? [])
      } catch (e) {
        console.error('Failed to fetch users:', e)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      setShopsLoading(true)
      try {
        const response = await axiosInstance.get('/api/v1/admin/getAllShops')
        setShops(response.data.data?.shops ?? [])
      } catch (e) {
        console.error('Failed to fetch shops:', e)
      } finally {
        setShopsLoading(false)
      }
    }
    fetchShops()
  }, [])







  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
  }
  const handleEditClick = (params: GridCellParams) => {
    setSelectedItem(params.row as CategoryRow)
    setOpenEdit(true)
  }
  const handleDeleteOpen = (params: GridCellParams) => {
    setSelectedItem(params.row as CategoryRow)
    setOpenDelete(true)
    }

  const handleSwitchChange = async (event: React.ChangeEvent<HTMLInputElement>, params: any) => {
    const { checked } = event.target;
    try {
      await axiosInstance.post(`/api/v1/admin/updateProduct?id=${params.id}`, { is_active: checked ? 1 : 0 })
      fetchGame()
      toast.success('Status updated successfully.')
    } catch (e) {
      toast.error('Failed to set active')
    }
  }
  const handleViewUser = (id: number) => {
    router.push(`stockhistory/viewStockhistory/${(id)}`)
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
      field: 'shop.name',
      headerName: ' Shop Name',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.shop?.name || 'NA'}
      </div>
    },
 
    {
      field: 'name',
      headerName: 'movement type',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) =>
      <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5, textTransform: 'capitalize' }}>
          {params.row?.movement_type?.replace(/_/g, ' ') || 'NA'}
        </div>
    },
    {
      field: 'categories.name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.categories?.name || params.row?.category?.name || 'NA'}
      </div>
    },
    {
      field: 'creator.name',
      headerName: 'Creator Name',
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        {params.row?.creator?.name ||'NA'}
      </div>
    },
  
   

    // {
    //   field: 'status',
    //   headerName: 'Status',
    //   minWidth: 150,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => {
    //     const isActive = params.row.is_active === true || params.row.is_active === 1 || params.row.is_active === '1';
    //     return (
    //       <Stack direction='row' alignItems='center' spacing={5}>
    //         <p>{isActive ? 'Active' : 'Inactive'}</p>
    //         <Switch checked={isActive} onChange={(event) => handleSwitchChange(event, params.row)} />
    //       </Stack>
    //     );
    //   },
    //   flex: 1,
    // },
    {
      field: 'created_at',
      headerName: 'Created Date',
      flex: 1,
      minWidth: 180,
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
          {/* {checkPermission('update_brand') && ( */}
          <Button
            sx={{ color: 'text.secondary', margin: '-10px' }}
            onClick={() => handleViewUser(params.row.id)}>
            <Icon icon={'ph:eye'} fontSize={24} />
          </Button>
          {/* <Tooltip title='Update Product.' placement='bottom'>
            <Button sx={{ color: 'text.secondary', margin: '-10px' }} onClick={() => handleEditClick(params)}>
              <Icon icon={'circum:edit'} fontSize={24} />
            </Button>
          </Tooltip> */}
          {/* )} */}
          {/* {checkPermission('delete_brand') && (  */}

          {/* <Tooltip title='Delete Product.' placement='bottom'>
            <Button
              sx={{ color: 'text.secondary', margin: '-10px' }}
              onClick={() => handleDeleteOpen(params)}
            >
              <Icon icon={'ic:outline-delete'} fontSize={24} sx={{ color: 'error.main' }} />
            </Button>
          </Tooltip> */}
          {/* )} */}
        </>
      ),
    },
  ]
  const handleSearch = (query: string) => {
    setPage(0)
    setQuery(query);
  };

  return (
    <>

      <Card sx={{ p: 5 }}>
      
        <Grid container spacing={2}>
 
          <Grid item xs={12} md={6}>
                        <GoBack label="Stock History" isBack={false} />

          </Grid>
          <Grid item xs={12} md={2}>
              <SearchInput handleSearch={handleSearch} placeHolder="Search..." />

            </Grid>
          {/* <Grid item xs={12} md={2} >
            <RHFAutoComplete
              control={control}
              name="category_id"
              apiUrl="/api/v1/admin/categories/getAllCategories"
              // extraParams={{ is_active: 1 }}
              placeholder="Select Category"
              labelinput="Select Category"
              labelKey="name"
              valueKey="id"
              required={false}
            />
          </Grid> */}
          <Grid item xs={12} sm="auto">
              <RHFFilterAutocomplete
                options={users}
                value={selectedUser}
                onChange={(newValue) => setSelectedUser(newValue)}
                loading={usersLoading}
                label="Creator Name"
                placeholder="Select Creator"
                minWidth={200}
              />
            </Grid>
          <Grid item xs={12} sm="auto">
            <RHFFilterAutocomplete
              options={shops}
              value={selectedShop}
              onChange={(newValue) => setSelectedShop(newValue)}
              loading={shopsLoading}
              label="Shop Name"
              placeholder="Select Shop"
              minWidth={200}
            />
          </Grid>
        </Grid>
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
          onCellClick={(params) => {
            if (params.field !== 'actions') {
              handleViewUser(params.row.id)
            }
          }}
        />
      </Card>
      {/* {openAdd && <AddProducts open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/deleteProductById?id='} />
      )}
      {openEdit && (
        <AddProducts open={openEdit} handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined} />
      )} */}
    </>
  )
}

export default Stockhistory
