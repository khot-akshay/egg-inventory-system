import { Box, Button, Card, CardActionArea, Grid, IconButton, InputAdornment, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { GridCellParams, GridColDef, GridSearchIcon } from '@mui/x-data-grid'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTheme } from '@mui/material/styles'
import CommonSkeleton from 'src/@core/components/common-skeleton/CommonSkeleton'
import CommonCard from 'src/@core/components/common-card/CommonCard'
import CommonDatagrid from 'src/components/common/DatagridData.tsx/CommonDatagrid'
import CommonExport from 'src/@core/components/common-export/CommonExport'

import GoBack from 'src/components/common/goBack/GoBackButton';
import axiosInstance from 'src/services/axios'
import Icon from 'src/@core/components/icon'
import DeleteDialogPopup from 'src/components/common/DeletePopup/DeleteModalPopup'
import checkPermission from 'src/configs/CheckPermisstion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import DateFormateComponent from 'src/components/common/dateFormat/DateFromatModule';
import SearchInput from 'src/components/common/SearchInput';
import toast from 'react-hot-toast';
import AddProducts from './AddPurchase';
import { useRouter } from 'next/router';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import CardOneCount from 'src/components/dashboard/CardOneCount'




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

const PurchaseDashboard = () => {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageSize, setPageSize] = useState(6)
  const [page, setPage] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [searchQuery, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const theme = useTheme();
  const router = useRouter()
  const { control, watch } = useForm({
    defaultValues: {
      category_id: null,
      shop_id: null
    }
  })
  const selectedCategoryId = watch('category_id') as number | null
  const selectedShopId = watch('shop_id') as number | null



  // const fetchGame = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?pageNo=${page}&limit=${pageSize}`)

  //     setRows(response.data.data.brands ?? [])
  //     setTotalRows(response.data.data?.count ?? 0)
  //   } catch (e) {
  //     //   } finally {
  //     setLoading(false)
  //   }
  // }
  // const fetchGame = async () => {
  //   setLoading(true);
  //   try {




  //     const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?pageNo=${page}&limit=${pageSize}`);

  //     setRows(response.data.data.brands ?? []);
  //     setTotalRows(response.data.data?.count ?? 0);
  //   } catch (e) {
  //     //   } finally {
  //     setLoading(false);
  //   }
  // };
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

      const response = await axiosInstance.get(
        `/api/v1/shop/getAllQuickbills?${params.toString()}`
      )

      setRows(response.data.data?.quickbills ?? [])
      setTotalRows(response.data.data?.count ?? 0)
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
  }, [selectedCategoryId, selectedShopId, searchQuery])

  // Fetch data
  useEffect(() => {
    fetchGame()
  }, [page, pageSize, selectedCategoryId, selectedShopId, searchQuery])







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
    router.push(`products/viewProduct/${(id)}`)
  }
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Sr. No.',
      flex: 0.5,
      minWidth: 80,

      sortable: false,
      renderCell: index => {
        const rowIndex = index.api.getRowIndex(index.row.id)
        return page * pageSize + (rowIndex % pageSize) + 1
      },
      hideable: false
    },

    {
      field: 'customer_name',
      headerName: 'customer name',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.customer.name || 'NA'}
        </div>
      )
    },
    {
      field: 'shop',
      headerName: 'product Name',
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.items?.[0]?.product?.name || 'NA'}
        </div>
      )
    },
    {
      field: 'quantity',
      headerName: 'Total Eggs',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.items?.[0]?.quantity || '0'}
        </div>
      )
    },
    {
      field: 'unit_cost',
      headerName: 'Rate',
      flex: 1,
      minWidth: 80,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          {params.row?.items?.[0]?.unit_cost || '0'}
        </div>
      )
    },
    {
      field: 'total',
      headerName: 'Total Bill',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
          ₹{params.row?.total || '0'}
        </div>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ textTransform: 'capitalize' }}>
          {params.row?.status || 'NA'}
        </div>
      )
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
      minWidth: 150,
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
          <Tooltip title='Update Product.' placement='bottom'>
            <Button sx={{ color: 'text.secondary', margin: '-10px' }} onClick={() => handleEditClick(params)}>
              <Icon icon={'circum:edit'} fontSize={24} />
            </Button>
          </Tooltip>
          {/* )} */}
          {/* {checkPermission('delete_brand') && (  */}

          <Tooltip title='Delete Product.' placement='bottom'>
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
  const handleSearch = (query: string) => {
    setPage(0)
    setQuery(query);
  };

  return (
    <>

      <Card sx={{
        borderRadius: 2,
        boxShadow: 2,
        transition: '0.2s',
        '&:hover': { boxShadow: 6 },
        p: 4
      }}>
        <Grid container spacing={1} >
          {/* <Grid item xs={12} md={4} >
            <GoBack label="Quick Bill List" isBack={false} />
          </Grid>
         

          <Grid item xs={12} md={3}>
            <RHFAutoComplete
              control={control}
              name="category_id"
              apiUrl="/api/v1/admin/categories/getAllCategories"
              extraParams={{ is_active: 1 }}
              placeholder="Select Category"
              labelinput=""
              labelKey="name"
              valueKey="id"
              required={false}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <RHFAutoComplete
              control={control}
              name="category_id"
              apiUrl="/api/v1/admin/categories/getAllCategories"
              extraParams={{ is_active: 1 }}
              placeholder="Select Category"
              labelinput=""
              labelKey="name"
              valueKey="id"
              required={false}
            />
          </Grid>
          <Grid item xs={12} md={2}><Button variant='contained' fullWidth
          >
            Bill list
          </Button></Grid> */}
        </Grid>

      </Card>
      <Grid container spacing={3} marginTop={1}>

        <Grid item xs={12} md={3} >

          <CardOneCount
            title="Total Stock"
            value={'100'}
            icon="bx:package"
            color="primary"
            link='/user/'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CardOneCount
            title="Total Sell"
            value={'1000'}
            // value={millify(dashboardData?.financers?.total || 0)}
            icon="bx:package"
            color="primary"
            link='/user/'
          /></Grid>
        <Grid item xs={12} md={3}>
          <CardOneCount
            title="Total Egg Sell"
            value={'100'}
            icon="bx:package"
            color="primary"
            link='/user/'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CardOneCount
            title="Total Cash"
            value={'300'}
            // value={millify(dashboardData?.financers?.total || 0)}
            icon="bx:package"
            color="primary"
            link='/user/'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CardOneCount
            title="Total Online"
            value={'400'}
            // value={millify(dashboardData?.financers?.total || 0)}
            icon="bx:package"
            color="primary"
            link='/user/'
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <CardOneCount
            title="Total Credit"
            value={'300'}
            icon="bx:package"
            color="primary"
            link='/user/'
          />
        </Grid>
      </Grid>




      {openAdd && <AddProducts open={openAdd} handleClose={() => setOpenAdd(false)} fetchData={fetchGame} />}
      {openDelete && (
        <DeleteDialogPopup show={openDelete} handleclose={() => setOpenDelete(false)} selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={'Are you sure! You want to delete.'} apiUrl={'api/v1/admin/products/deleteProducts/'} />
      )}
      {openEdit && (
        <AddProducts open={openEdit} handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined} />
      )}
    </>
  )
}

export default PurchaseDashboard   
