import { Box, Grid, Tab, Tabs, TextField, Button } from '@mui/material'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import axiosInstance from 'src/services/axios'
import CardOneCount from 'src/components/dashboard/CardOneCount'
import CommonSkeleton from 'src/@core/components/common-skeleton/CommonSkeleton'

function Dashboard() {
  const [shops, setShops] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<number | string>('all')
  const [stockData, setStockData] = useState<any>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [startDate, setStartDate] = useState<string>(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'))

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
      console.error('Error fetching shops:', e)
      setShops([])
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  const fetchStockData = async () => {
    setStockLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') {
        params.append('shop_id', String(activeTab))
      }
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      let url = `/api/v1/admin/getInventoryStockForDashboard`
      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }

      const response = await axiosInstance.get(url)
      if (response.data?.success) {
        setStockData(response.data.data)
      } else {
        setStockData(null)
      }
    } catch (e) {
      console.error('Error fetching stock data:', e)
      setStockData(null)
    } finally {
      setStockLoading(false)
    }
  }

  useEffect(() => {
    fetchStockData()
  }, [activeTab, startDate, endDate])

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Shops" value="all" />
            {Array.isArray(shops) && shops.map((shop: any) => (
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
                link='/stocks'
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
                link='/stocks'
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
                link='/stocks'
                items={(stockData?.categories || []).map((item: any) => ({
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
    </Box>
  )
}

export default Dashboard
