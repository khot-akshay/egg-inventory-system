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
import AddProducts from './AddQuickBill';
import { useRouter } from 'next/router';
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete';
import CardOneCount from 'src/components/dashboard/CardOneCount'
import { useAuth } from 'src/hooks/useAuth'
import CategoryStockCard from 'src/components/dashboard/CategoryStockCard'




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

interface StockCategory {
  id: number
  category_id: number
  category_name: string
  remaining_count: number
  sale_count: number
  sold_count: number
  total_amount: number
}

interface StockData {
  shop_id: number
  count: number
  categories: StockCategory[]
  totals: {
    remaining_count: number
    sale_count: number
    sold_count: number
    total_amount: number
  }
}

const QuickBillDashboard = () => {
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
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const theme = useTheme();
  const router = useRouter()
  const { user } = useAuth()
  const currentStaffShopId = user?.shop_id || user?.shop?.id
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
  //     console.log(e)
  //   } finally {
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
  //     console.log(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchGame = useCallback(async () => {
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
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchQuery, selectedCategoryId, selectedShopId])


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
  }, [fetchGame])

  const fetchInventoryStock = useCallback(async () => {
    if (!currentStaffShopId) return

    setStockLoading(true)
    try {
      const response = await axiosInstance.get(`/api/v1/shop/getInventoryStock?shop_id=${currentStaffShopId}`)
      if (response.data?.success) {
        setStockData(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch inventory stock:', error)
      toast.error('Failed to load stock data')
    } finally {
      setStockLoading(false)
    }
  }, [currentStaffShopId])

  useEffect(() => {
    fetchInventoryStock()
  }, [fetchInventoryStock])

  useEffect(() => {
    const handleQuickBillAdded = () => {
      setPage(0)
      fetchGame()
      fetchInventoryStock()
    }

    window.addEventListener('quickBillAdded', handleQuickBillAdded)
    return () => {
      window.removeEventListener('quickBillAdded', handleQuickBillAdded)
    }
  }, [fetchGame, fetchInventoryStock])







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
    console.log('Delete Clicked:', params.row)
    setSelectedItem(params.row as CategoryRow)
    setOpenDelete(true)
    console.log('Selected Item for delete:', selectedItem)
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

  const handleSearch = (query: string) => {
    setPage(0)
    setQuery(query);
  };

  return (
    <>

      {/* <Card sx={{
        borderRadius: 2,
        boxShadow: 2,
        transition: '0.2s',
        '&:hover': { boxShadow: 6 },
        p:4
      }}>
        <Grid container spacing={1} >
          <Grid item xs={12} md={4} >
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
          </Button></Grid>
        </Grid>

      </Card> */}
      <Grid container spacing={3}>
        {stockLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <CommonSkeleton variant="rectangular" height={96} sx={{ borderRadius: 4 }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <CardOneCount
                title='Total Stock'
                value={stockData?.totals?.remaining_count || 0}
                percentage={stockData?.growth || 0}
                icon='mdi:warehouse'
                color='success'
                link='/stocks'
                items={(stockData?.categories || []).map(item => ({
                  id: item.id,
                  label: item.category_name,
                  value: item.remaining_count
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <CardOneCount
                title='Total Egg Sell'
                value={stockData?.totals?.sold_count || 0}
                percentage={stockData?.growth || 0}
                icon='mdi:warehouse'
                color='success'
                link='/stocks'
                items={(stockData?.categories || []).map(item => ({
                  id: item.id,
                  label: item.category_name,
                  value: item.sold_count
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <CardOneCount
                title='Total Sell'
                value={`₹ ${stockData?.totals?.total_amount || 0}`}
                percentage={stockData?.growth || 0}
                icon='mdi:warehouse'
                color='success'
                link='/stocks'
                items={(stockData?.categories || []).map(item => ({
                  id: item.id,
                  label: item.category_name,
                  value: `₹ ${Number(item.total_amount).toFixed(2) || 0}`
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <CardOneCount
                title="Payment Summary"
                value={`₹${Number(stockData?.totals?.total_amount || 0).toFixed(2)}`}
                icon="mdi:cash-multiple"
                color="success"
                items={Object.entries(stockData?.totals?.payment_amounts || {})
                  .filter(([key]) => ["cash", "upi", "credit"].includes(key))
                  .map(([key, value]) => ({
                    id: key,
                    label: key.charAt(0).toUpperCase() + key.slice(1),
                    value: `₹${Number(
                      key === "credit"
                        ? stockData?.totals?.due_amount || 0
                        : value
                    ).toFixed(2)}`
                  }))}
              />
            </Grid>

          </>
        )}
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

export default QuickBillDashboard   
