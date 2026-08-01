import { Box, Chip, Grid, Typography, Tabs, Tab, CircularProgress, Avatar, Button } from '@mui/material'
import React, { useCallback, useEffect, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import CommonSkeleton from 'src/@core/components/common-skeleton/CommonSkeleton'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'
import CardOneCount from 'src/components/dashboard/CardOneCount'

// ─── Types matching the API response ─────────────────────────────────────────

interface LoadedCategory {
  id: number
  category: string
  count: number
  remaining: number
}

interface ShopCategory {
  id: number
  category: string
  count: number
}

interface Shop {
  shop_name: string
  categories: ShopCategory[]
}

interface CustomerSellCategory {
  id: number
  category: string
  count: number
  amount: number
}

interface CustomerSell {
  total_amount: number
  categories: CustomerSellCategory[]
}

interface ProfitLossCategory {
  category_id: number
  category: string
  loaded_eggs: number
  remaining_eggs: number
  sales_eggs: number
  sales_revenue: number
  price_per_egg: number
  purchase_cost: number
  gross_profit: number
  expense_amount: number
  net_profit: number
  status: string
}

interface ProfitLoss {
  egg_vendor_purchase_id: number
  expense_date: string
  sales_revenue: number
  sales_eggs: number
  paid_collected: number
  balance_due: number
  purchase_cost: number
  vendor_purchase_total: number
  expense_amount: number
  gross_profit: number
  net_profit: number
  status: string
  categories: ProfitLossCategory[]
  expense_allocated: boolean
}

interface DashboardData {
  egg_vendor_purchase_id: number
  purchase_no: string
  vendor_name: string
  vehicle: string
  status: string
  total_eggs: number
  remaining_eggs: number
  loaded: LoadedCategory[]
  shops: Shop[]
  customer_sell: CustomerSell
  expense_total: number
  profit_loss?: ProfitLoss
}

// ─── Component ────────────────────────────────────────────────────────────────

const DisributorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [distributors, setDistributors] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [tabIndex, setTabIndex] = useState(0)
  const theme = useTheme()
  const { user } = useAuth()
  const currentStaffShopId = user?.shop_id || user?.shop?.id

  const fetchDashboard = useCallback(async (distributorId?: number) => {
    setLoading(true)
    try {
      const params: any = {}
      if (distributorId) {
        params.user_id = distributorId
      }
      
      const response = await axiosInstance.get('/api/v1/admin/getEggVendorPurchaseDashboard', {
        params
      })
      if (response.data?.success) {
        const purchases = response.data.data?.purchases || []
        setDashboardData(purchases.length > 0 ? purchases[0] : null)
      } else {
        setDashboardData(null)
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
      setDashboardData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDistributors()
  }, [])

  useEffect(() => {
    if (distributors.length > 0 && distributors[tabIndex]) {
      fetchDashboard(distributors[tabIndex].id)
    }
  }, [tabIndex, distributors, fetchDashboard])

  useEffect(() => {
    // debug: log distributors so we can see whether API returned users
    // remove this in production
    // eslint-disable-next-line no-console
    console.log('DisributorDashboard: distributors', distributors)
  }, [distributors])

  const fetchDistributors = async () => {
    setUsersLoading(true)
    try {
      const resp = await axiosInstance.get('/api/v1/admin/getAllUsers', { params: { is_distributor: 1 } })
      const users = resp.data?.data?.users || resp.data?.users || resp.data || []
      setDistributors(users)
    } catch (err) {
      const server = (err as any)?.response?.data
      if (server) {
        const msg = server.message || 'Failed to load distributors'
        toast.error(msg)
      } else {
        toast.error('Failed to load distributors')
      }
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    const handleRefresh = () => fetchDashboard()
    window.addEventListener('quickBillAdded', handleRefresh)
    return () => window.removeEventListener('quickBillAdded', handleRefresh)
  }, [fetchDashboard])

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <CommonSkeleton variant="rectangular" height={96} sx={{ borderRadius: 4 }} />
          </Grid>
        ))}
      </Grid>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!dashboardData) {
    return (
      <>
        {/* Distributor tabs (from API) - visible even when dashboard is empty */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            distributors.length ? (
              <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(Number(v))} variant={distributors.length > 6 ? 'scrollable' : 'standard'} scrollButtons="auto">
                {distributors.map((u, i) => <Tab key={u.id || u.uuid || i} label={u.name || u.email || `User ${i + 1}`} value={i} />)}
              </Tabs>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary">No distributors found.</Typography>
              </Box>
            )
          )}
        </Box>

        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No active day trip found.
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
            Start a route from the left panel to see the dashboard.
          </Typography>
        </Box>
      </>
    )
  }

  const {
    purchase_no = '',
    vendor_name = '',
    vehicle = '',
    expense_total = 0,  
    status,
    total_eggs = 0,
    remaining_eggs = 0,
    loaded,
    shops,
    customer_sell,
    profit_loss
  } = dashboardData || {}

  // Total transferred to all shops combined
  // const totalTransferred = shops.reduce((sum, shop) => {
  //   return sum + shop.categories.reduce((s, c) => s + c.count, 0)
  // }, 0)

  return (
    <>
      {/* ── Distributor tabs (from API) ───────────────────────────────────── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          distributors.length ? (
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(Number(v))} variant={distributors.length > 6 ? 'scrollable' : 'standard'} scrollButtons="auto">
              {distributors.map((u, i) => <Tab key={u.id || u.uuid || i} label={u.name || u.email || `User ${i + 1}`} value={i} />)}
            </Tabs>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography color="text.secondary">No distributors found.</Typography>
              <Button size="small" onClick={fetchDistributors}>Retry</Button>
            </Box>
          )
        )}
      </Box>

      {/* selected distributor info */}
      {distributors[tabIndex] && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Avatar>{(distributors[tabIndex].name || 'U')[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">{distributors[tabIndex].name}</Typography>
            <Typography variant="body2" color="text.secondary">{distributors[tabIndex].email} • {distributors[tabIndex].phone}</Typography>
          </Box>
          {/* <Chip label={distributors[tabIndex].is_active ? 'Active' : 'Inactive'} size="small" color={distributors[tabIndex].is_active ? 'success' : 'default'} /> */}
        </Box>
      )}

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          🚚 {purchase_no}
        </Typography>
        <Chip label={vendor_name} size="small" color="primary" variant="outlined" />
        <Chip label={vehicle} size="small" color="default" variant="outlined" />
        
        <Chip
          label={status?.toUpperCase() || 'UNKNOWN'}
          size="small"
          color={status === 'active' ? 'success' : 'error'}
        />
         <Typography variant="subtitle1" fontWeight="bold">
          Total Expense: {expense_total}
        </Typography>
      </Box>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <Grid container spacing={3}>

        {/* 1. Total Loaded (from vendor) */}
        <Grid item xs={12} md={4}>
          <CardOneCount
            title="Total Loaded"
            value={total_eggs}
            icon="mdi:package-variant-closed"
            color="primary"
            link=""
            items={(loaded || []).map(item => ({
              id: item.id,
              label: item.category,
              value: item.count
            }))}
          />
        </Grid>

        {/* 2. Remaining in Vehicle */}
        <Grid item xs={12} md={4}>
          <CardOneCount
            title="Remaining in Vehicle"
            value={remaining_eggs}
            icon="mdi:truck-outline"
            color="warning"
            link=""
            items={(loaded || []).map(item => ({
              id: item.id,
              label: item.category,
              value: item.remaining
            }))}
          />
        </Grid>

        {/* 3. Transferred to Shops (one card per shop) */}
        {(shops || []).map((shop, idx) => {
          const shopTotal = (shop.categories || []).reduce((s, c) => s + c.count, 0)
          return (
            <Grid item xs={12} md={4} key={idx}>
              <CardOneCount
                title={`Transferred → ${shop.shop_name}`}
                value={shopTotal}
                icon="mdi:store-outline"
                color="info"
                link=""
                items={(shop.categories || []).map(cat => ({
                  id: cat.id,
                  label: cat.category,
                  value: cat.count
                }))}
              />
            </Grid>
          )
        })}

        {/* 4. Customer Sell */}
        <Grid item xs={12} md={4}>
          <CardOneCount
            title="Customer Sales"
            value={`₹ ${Number(customer_sell?.total_amount || 0).toFixed(2)}`}
            icon="mdi:cash-multiple"
            color="success"
            link=""
            items={(customer_sell?.categories || []).map(cat => ({
              id: cat.id,
              label: cat.category,
              value: `${cat.count} pcs — ₹${Number(cat.amount).toFixed(2)}`
            }))}
          />
        </Grid>

        {/* 5. Gross Profit */}
        {profit_loss && (
          <Grid item xs={12} md={4}>
            <CardOneCount
              title="Gross Profit"
              value={`₹ ${Number(profit_loss.gross_profit).toFixed(2)}`}
              icon="mdi:chart-line"
              color={profit_loss.gross_profit >= 0 ? 'success' : 'error'}
              link=""
              items={(profit_loss.categories || []).map(cat => ({
              id: cat.category_id,
              label: cat.category,
              value: `₹${Number(cat.gross_profit).toFixed(2)}`
            }))}
            />
          </Grid>
        )}

         <Grid item xs={12} md={4}>
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

      </Grid>
    </>
  )
}

export default DisributorDashboard
