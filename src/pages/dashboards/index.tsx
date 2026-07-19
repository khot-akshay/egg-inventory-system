import { Box, Grid, Tab, Tabs, TextField, Button, Typography, Divider } from '@mui/material'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import axiosInstance from 'src/services/axios'
import CardOneCount from 'src/components/dashboard/CardOneCount'
import CommonSkeleton from 'src/@core/components/common-skeleton/CommonSkeleton'
import DailySalesTrendChart from 'src/components/dashboard/charts/DailySalesTrendChart'
import ProductWiseSalesChart from 'src/components/dashboard/charts/ProductWiseSalesChart'
import PaymentDistributionChart from 'src/components/dashboard/charts/PaymentDistributionChart'
import DisributorDashboard from 'src/components/admin/disributorDashboard/DisributorDashboard'
import { useAuth } from 'src/hooks/useAuth'

function Dashboard() {
  const { user } = useAuth()
  const [mainTab, setMainTab] = useState<'shop' | 'distributor'>('shop')
  const [shops, setShops] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<number | string>('all')
  const [stockData, setStockData] = useState<any>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [startDate, setStartDate] = useState<string>(dayjs().format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'))

  // --- Chart states ---
  const [dailySalesData, setDailySalesData] = useState<{ date: string; amount: number }[]>([])
  const [productSalesData, setProductSalesData] = useState<{ name: string; quantity: number }[]>([])
  const [paymentData, setPaymentData] = useState<{ name: string; value: number }[]>([])
  const [chartsLoading, setChartsLoading] = useState(false)

  const fetchShops = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/getAllShops')
      if (response.data.success) {
        let data = response.data.data?.data || response.data.data
        if (Array.isArray(data)) {
          setShops(data)
        } else if (data && typeof data === 'object') {
          const possibleArray = Object.values(data).find(Array.isArray)
          setShops(Array.isArray(possibleArray) ? possibleArray : [])
        } else {
          setShops([])
        }
      }
    } catch (e) {
      setShops([])
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  useEffect(() => {
    // If the user is a staff/distributor and has a specific shop_id, default to it
    if (user && user.shop_id && user.role !== 'admin' && user.role !== 'Administrator') {
      setActiveTab(user.shop_id)
    } else {
      setActiveTab('all')
    }
  }, [user])

  const buildParams = () => {
    const params = new URLSearchParams()
    if (activeTab !== 'all') params.append('shop_id', String(activeTab))
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    return params.toString()
  }

  const fetchStockData = async () => {
    setStockLoading(true)
    try {
      const qs = buildParams()
      const url = `/api/v1/admin/getInventoryStockForDashboard${qs ? `?${qs}` : ''}`
      const response = await axiosInstance.get(url)
      if (response.data?.success) {
        const data = response.data.data
        setStockData(data)

        // --- Derive chart data from the same API response ---

        // 1. Daily Sales Trend — from daily_sales array if present, else fallback to categories
        if (Array.isArray(data?.daily_sales)) {
          setDailySalesData(
            data.daily_sales.map((d: any) => ({
              date: dayjs(d.date).format('DD MMM'),
              amount: Number(d.total_amount || 0),
            }))
          )
        } else {
          // Fallback: single data point from totals
          setDailySalesData(
            data?.totals?.total_amount > 0
              ? [{ date: `${dayjs(startDate).format('DD MMM')} – ${dayjs(endDate).format('DD MMM')}`, amount: Number(data.totals.total_amount) }]
              : []
          )
        }

        // 2. Product Wise Sales — from categories
        setProductSalesData(
          (data?.categories || []).map((cat: any) => ({
            name: cat.category_name || 'Unknown',
            quantity: Number(cat.sold_count || 0),
          }))
        )

        // 3. Payment Distribution — from payment_amounts
        const payments = data?.totals?.payment_amounts || {}
        const due = data?.totals?.due_amount || 0
        const paymentList = [
          { name: 'Cash', value: Number(payments.cash || 0) },
          { name: 'UPI', value: Number(payments.upi || 0) },
          { name: 'Credit', value: Number(due) },
        ].filter(p => p.value > 0)
        setPaymentData(paymentList)

      } else {
        setStockData(null)
        setDailySalesData([])
        setProductSalesData([])
        setPaymentData([])
      }
    } catch (e) {
      setStockData(null)
    } finally {
      setStockLoading(false)
      setChartsLoading(false)
    }
  }

  useEffect(() => {
    if (mainTab === 'shop') {
      setChartsLoading(true)
      fetchStockData()
    }
  }, [activeTab, startDate, endDate, mainTab])

  return (
    <Box>
      {/* ── Main Parent Tabs ── */}
      <Box sx={{  mb: 4 }}>
        <Tabs
          value={mainTab}
          onChange={(_, newValue) => setMainTab(newValue)}
          aria-label="dashboard parent tabs"
        >
          <Tab label="Shop" value="shop" />
                {(user?.role === 'admin' || user?.role === 'Administrator') && (
            <Tab label="Distributor" value="distributor" />
          )}
        </Tabs>
      </Box>

      {mainTab === 'shop' && (
        <Box>
          {/* ── Header row: Tabs + Date Filter ── */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {(!user?.shop_id || user?.role === 'admin' || user?.role === 'Administrator') && (
                  <Tab label="All Shops" value="all" />
                )}
                {Array.isArray(shops) && shops
                  .filter(shop => 
                    (!user?.shop_id || user?.role === 'admin' || user?.role === 'Administrator') ? true : shop.id === user?.shop_id
                  )
                  .map((shop: any) => (
                    <Tab key={shop.id} label={shop.name} value={shop.id} />
                ))}
              </Tabs>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center">
                <Grid item>
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 160 }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: startDate }}
                    sx={{ minWidth: 160 }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setStartDate(dayjs().startOf('month').format('YYYY-MM-DD'))
                      setEndDate(dayjs().format('YYYY-MM-DD'))
                    }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* ── Summary Cards ── */}
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
                    icon='mdi:warehouse'
                    color='success'
                    // link='/stocks'
                    items={(stockData?.categories || []).map((item: any) => ({
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
                    icon='mdi:warehouse'
                    color='success'
                    // link='/stocks'
                    items={(stockData?.categories || []).map((item: any) => ({
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
                    icon='mdi:warehouse'
                    color='success'
                    // link='/stocks'
                    items={(stockData?.categories || []).map((item: any) => ({
                      id: item.id,
                      label: item.category_name,
                      value: `₹ ${Number(item.total_amount || 0).toFixed(2)}`
                    }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <CardOneCount
                    title="Payment Summary"
                    value={`₹${Number(stockData?.totals?.total_amount || 0).toFixed(2)}`}
                    icon="mdi:cash-multiple"
                    color="success"
                    items={[
                      ...Object.entries(stockData?.totals?.payment_amounts || {})
                        .filter(([key]) => ["cash", "upi", "credit"].includes(key))
                        .map(([key, value]) => ({
                          id: key,
                          label: key.charAt(0).toUpperCase() + key.slice(1),
                          value: `₹${Number(
                            key === "credit"
                              ? stockData?.totals?.credit || 0
                              : value
                          ).toFixed(2)}`
                        })),
                      {
                        id: 'expense',
                        label: 'Expense',
                        value: `₹${Number(stockData?.totals?.expense_total || 0).toFixed(2)}`
                      },
                      {
                        id: 'existing_cash',
                        label: 'Cash in Counter',
                        value: `₹${Number(stockData?.totals?.existing_cash || 0).toFixed(2)}`
                      }
                    ]}
                  />
                </Grid>
                {(user?.role === 'admin' || user?.role === 'Administrator') && (
                  <>
                    <Grid item xs={12} sm={6} md={4}>
                      <CardOneCount
                        title='Total Profit'
                        value={`₹ ${stockData?.totals?.profit_amount || 0}`}
                        icon='mdi:warehouse'
                        color='success'
                        // link='/stocks'
                        items={(stockData?.categories || []).map((item: any) => ({
                          id: item.id,
                          label: item.category_name,
                          value: `₹ ${Number(item.profit_amount || 0).toFixed(2)}`
                        }))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <CardOneCount
                        title='Total Loss'
                        value={`₹ ${stockData?.totals?.loss_amount || 0}`}
                        icon='mdi:warehouse'
                        color='error'
                        // link='/stocks'
                        items={(stockData?.categories || []).map((item: any) => ({
                          id: item.id,
                          label: item.category_name,
                          value: `₹ ${Number(item.loss_amount || 0).toFixed(2)}`
                        }))}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
          </Grid>

          {/* ── Charts & Analytics Section ── */}
          <Box sx={{ mt: 5, mb: 2 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant='h6' fontWeight={700} sx={{ mb: 3 }}>
              Charts & Analytics
            </Typography>

            {/* Daily Sales Trend — Full Width */}
            <Box sx={{ mb: 3 }}>
              <DailySalesTrendChart data={dailySalesData} loading={chartsLoading} />
            </Box>

            {/* Product Wise Sales + Payment Distribution */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <ProductWiseSalesChart data={productSalesData} loading={chartsLoading} />
              </Grid>
              <Grid item xs={12} md={5}>
                <PaymentDistributionChart data={paymentData} loading={chartsLoading} />
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
                {/* {(user?.role === 'admin' || user?.role === 'Administrator') && ( */}

      {mainTab === 'distributor' && user?.role === 'Administrator' || user?.role === 'admin'  &&  (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <DisributorDashboard />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

export default Dashboard
