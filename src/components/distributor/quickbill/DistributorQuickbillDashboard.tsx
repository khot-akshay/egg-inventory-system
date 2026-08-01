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
import AddProducts from './AddDistributorQuickBill';
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
    payment_amounts?: {
      cash: number
      upi: number
      online: number
      card: number
      credit: number
      mixed: number
      other: number
    }
    expense_total?: number
    existing_cash?: number
  }
  payment_summary?: {
    cash: number
    online: number
    upi: number
    card: number
    credit: number
    mixed: number
    other: number
    total: number
    expense_amount: number
    total_cash: number
    cash_in_hand: number
  }
}

const DistributorQuickbillDashboard = () => {
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
  const [dashboardData, setDashboardData] = useState<StockData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
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



  const fetchGame = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = {
        pageNo: page,
        limit: pageSize,
        egg_vendor_purchase: true
      }

      if (searchQuery) params['global_search'] = searchQuery
      if (selectedCategoryId) params['category_id'] = selectedCategoryId
      if (selectedShopId) params['shop_id'] = selectedShopId

      const response = await axiosInstance.get('/api/v1/shop/getAllQuickbills', { params })

      setRows(response.data.data?.quickbills ?? [])
      setTotalRows(response.data.data?.count ?? 0)
    } catch (e) {
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

  const fetchDashboard = useCallback(async () => {
    setDashboardLoading(true)
    try {
      // Step 1: get the active purchase ID
      const activeResp = await axiosInstance.get('/api/v1/shop/getCurrentPurchaseEggDataForDistributor', { params: { active: 1 } })
      const active = activeResp.data?.data?.active || []
      const purchaseId = active.length > 0 ? active[0].id : null

      if (purchaseId) {
        // Step 2: fetch dashboard for that purchase
        const response = await axiosInstance.get('/api/v1/shop/getEggVendorPurchaseDashboard', {
          params: { egg_vendor_purchase_id: purchaseId }
        })
        if (response.data?.success) {
          setDashboardData(response.data.data)
        }
      } else {
        setDashboardData(null)
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setDashboardLoading(false)
    }
  }, [currentStaffShopId])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    const handleQuickBillAdded = () => {
      setPage(0)
      fetchGame()
      fetchDashboard()
    }

    window.addEventListener('quickBillAdded', handleQuickBillAdded)
    return () => {
      window.removeEventListener('quickBillAdded', handleQuickBillAdded)
    }
  }, [fetchGame, fetchDashboard])







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
        {dashboardLoading ? (
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
                value={dashboardData?.remaining_eggs || 0}
                percentage={dashboardData?.growth || 0}
                icon='mdi:warehouse'
                color='success'
                link='/stocks'
                items={(dashboardData?.loaded || []).map(item => ({
                  id: item.id,
                  label: item.category,
                  value: item.remaining
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <CardOneCount
                title='Total Egg Sell'
                value={dashboardData?.profit_loss?.sales_eggs || 0}
                percentage={dashboardData?.growth || 0}
                icon='mdi:warehouse'
                color='success'
                link='/stocks'
                items={(dashboardData?.egg_sale_summary || []).map(item => ({
                  id: item.category_id,
                  label: item.category_name,
                  value: item.total_quantity
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <CardOneCount
                title='Total Sell'
                value={dashboardData?.profit_loss?.sales_eggs || 0}
                percentage={dashboardData?.growth || 0}
                icon='mdi:warehouse'
                color='success'
                link='/stocks'
                items={(dashboardData?.egg_sale_summary || []).map(item => ({
                  id: item.category_id,
                  label: item.category_name,
                  value: item.total_amount
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <CardOneCount
                title="Payment Summary"
                value={`₹${Number(dashboardData?.payment_summary?.total || 0).toFixed(2)}`}
                icon="mdi:cash-multiple"
                color="success"
                items={[
                  {
                    id: 'cash',
                    label: 'Cash',
                    value: `₹${Number(dashboardData?.payment_summary?.cash || 0).toFixed(2)}`
                  },
                  {
                    id: 'upi',
                    label: 'UPI',
                    value: `₹${Number(dashboardData?.payment_summary?.upi || 0).toFixed(2)}`
                  },
                  {
                    id: 'credit',
                    label: 'Credit',
                    value: `₹${Number(dashboardData?.payment_summary?.credit || 0).toFixed(2)}`
                  },
                  {
                    id: 'expense',
                    label: 'Expense',
                    value: `₹${Number(dashboardData?.payment_summary?.expense_amount || 0).toFixed(2)}`
                  },
                  {
                    id: 'cash_in_hand',
                    label: 'Cash in Hand',
                    value: `₹${Number(dashboardData?.payment_summary?.cash_in_hand || 0).toFixed(2)}`
                  }
                ]}
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

export default DistributorQuickbillDashboard   
