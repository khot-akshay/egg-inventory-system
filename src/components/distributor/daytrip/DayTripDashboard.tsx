import { Box, Chip, Grid, Typography } from '@mui/material'
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
}

// ─── Component ────────────────────────────────────────────────────────────────

const DayTripDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  const { user } = useAuth()
  const currentStaffShopId = user?.shop_id || user?.shop?.id

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }, [currentStaffShopId])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

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
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No active day trip found.
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Start a route from the left panel to see the dashboard.
        </Typography>
      </Box>
    )
  }

  const {
    purchase_no,
    vendor_name,
    vehicle,
    status,
    total_eggs,
    remaining_eggs,
    loaded,
    shops,
    customer_sell
  } = dashboardData

  // Total transferred to all shops combined
  const totalTransferred = shops.reduce((sum, shop) => {
    return sum + shop.categories.reduce((s, c) => s + c.count, 0)
  }, 0)

  return (
    <>
      {/* ── Header info ───────────────────────────────────────────────────── */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          🚚 {purchase_no}
        </Typography>
        <Chip label={vendor_name} size="small" color="primary" variant="outlined" />
        <Chip label={vehicle} size="small" color="default" variant="outlined" />
        <Chip
          label={status.toUpperCase()}
          size="small"
          color={status === 'active' ? 'success' : 'error'}
        />
      </Box>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      <Grid container spacing={3}>

        {/* 1. Total Loaded (from vendor) */}
        <Grid item xs={12} sm={6} md={6}>
          <CardOneCount
            title="Total Loaded"
            value={total_eggs}
            icon="mdi:package-variant-closed"
            color="primary"
            link=""
            items={loaded.map(item => ({
              id: item.id,
              label: item.category,
              value: item.count
            }))}
          />
        </Grid>

        {/* 2. Remaining in Vehicle */}
        <Grid item xs={12} sm={6} md={6}>
          <CardOneCount
            title="Remaining in Vehicle"
            value={remaining_eggs}
            icon="mdi:truck-outline"
            color="warning"
            link=""
            items={loaded.map(item => ({
              id: item.id,
              label: item.category,
              value: item.remaining
            }))}
          />
        </Grid>

        {/* 3. Transferred to Shops (one card per shop) */}
        {shops.map((shop, idx) => {
          const shopTotal = shop.categories.reduce((s, c) => s + c.count, 0)
          return (
            <Grid item xs={12} sm={6} md={6} key={idx}>
              <CardOneCount
                title={`Transferred → ${shop.shop_name}`}
                value={shopTotal}
                icon="mdi:store-outline"
                color="info"
                link=""
                items={shop.categories.map(cat => ({
                  id: cat.id,
                  label: cat.category,
                  value: cat.count
                }))}
              />
            </Grid>
          )
        })}

        {/* 4. Customer Sell */}
        <Grid item xs={12} sm={6} md={6}>
          <CardOneCount
            title="Customer Sales"
            value={`₹ ${Number(customer_sell.total_amount).toFixed(2)}`}
            icon="mdi:cash-multiple"
            color="success"
            link=""
            items={customer_sell.categories.map(cat => ({
              id: cat.id,
              label: cat.category,
              value: `${cat.count} pcs — ₹${Number(cat.amount).toFixed(2)}`
            }))}
          />
        </Grid>

      </Grid>
    </>
  )
}

export default DayTripDashboard
