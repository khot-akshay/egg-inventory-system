import { Box, Button, CircularProgress, Divider, Drawer, Grid, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React, { forwardRef, useEffect, useState } from 'react'
import Icon from 'src/@core/components/icon'
import { useSettings } from 'src/@core/hooks/useSettings'
import CountCard from 'src/components/dashboard/CountCard'
import PaymentBooking from 'src/components/dashboard/PaymentBooking'
import SlotRatio from 'src/components/dashboard/SlotRatio'
import CreateBooking from 'src/components/turf_management/booking/CreateBooking'
import CreateVillaBooking from 'src/components/villa/booking/CreateBooking'
import SelectTurfDropdown from 'src/components/turf_management/SelectTurfDropdown'
import checkPermission from 'src/configs/CheckPermisstion'
import themeConfig from 'src/configs/themeConfig'
import { useAuth } from 'src/hooks/useAuth'
import axiosInstance from 'src/services/axios'
import MaintenanceRatio from 'src/components/dashboard/Maintenance'
import OccupencyRateBooking from 'src/components/dashboard/OccupencyRateBooking'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import format from 'date-fns/format';
import { DateType } from 'src/types/forms/reactDatepickerTypes'
import { get } from 'src/services/apiCall'
import CardOneCount from 'src/components/dashboard/CardOneCount'
import millify from 'millify'

interface PickerProps {
  label?: string
  end: Date | number
  start: Date | number

}
function Shop() {
  const auth = useAuth()
  const { settings } = useSettings()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [startDateRange, setStartDateRange] = useState<DateType>(null)
  const [endDateRange, setEndDateRange] = useState<DateType>(null)
  const [selectedTurf, setSelectedturf] = useState('')
  const [value, setValue] = useState({
    startDate: null,
    endDate: null
  })
  const [dashboardData, setDashboardData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [shops, setShops] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<number | string>('all')

  const fetchShops = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/getAllShops')
      if (response.data.success) {
        let data = response.data.data?.data || response.data.data
        if (Array.isArray(data)) {
          setShops(data)
        } else if (data && typeof data === 'object') {
          // If data is an object, try to find an array property (like 'shops' or similar)
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

  const fetchDashboardData = async () => {
    setLoading(true)
    let url = `/api/v1/admin/getDashboardCount`
    if (activeTab !== 'all') {
      url += `?shop_id=${activeTab}`
    }
    try {
      const response = await get(url);
      console.log(response, "response");

      if (response.success) {
        setLoading(false)

        setDashboardData(response.data)
      }
      else {
        setDashboardData({})
        setLoading(false)

      }
    } catch (e) {
      console.log(e)
      setLoading(false)

    } finally {
      setLoading(false)
    }
  }
  console.log(dashboardData, "dashboardData")
  useEffect(() => {
    fetchDashboardData()
  }, [selectedTurf, startDateRange, endDateRange, activeTab])

  // if (loading) {
  //   return <FallbackSpinner />
  // }
  const CustomInput = forwardRef((props: PickerProps, ref) => {
    if (props.end || props.start) {

      const startDate = format(props.start, 'dd/MM/yyyy')
      const endDate = props.end !== null ? ` - ${format(props.end, 'dd/MM/yyyy')}` : null

      const value = `${startDate}${endDate !== null ? endDate : ''}`

      return <TextField fullWidth size='small' inputRef={ref} label={props.label || ''} {...props} value={value} />
    } else {
      return <TextField size='small' fullWidth inputRef={ref} label={props.label || ''} {...props} value={''} />
    }


  })
  const handleOnChangeRange = (dates: any) => {
    const [start, end] = dates
    setStartDateRange(start)
    setEndDateRange(end)
  }
  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All Shops" value="all" />
        {Array.isArray(shops) && shops.map((shop: any) => (
          <Tab key={shop.id} label={shop.name} value={shop.id} />
        ))}
      </Tabs>

      <Grid container spacing={3} justifyContent='end' alignItems='end' sx={{ mb: 5 }}>


        {/* <Grid item xs={12} md={3} >
          <SelectTurfDropdown setTurf={setSelectedturf} multiple />
        </Grid> */}
        <Grid item xs={12} md={3} >
          {/* <Datepicker
            value={value}
            onChange={(newValue) => setValue(newValue)}
            inputClassName={`w-full px-4 py-2 border rounded-md ${settings.mode === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300"
              }`}
            popoverClassName={`shadow-lg border transition ${settings.mode === "dark" ? "bg-gray-900 text-white border-gray-700" : "bg-white text-black border-gray-200"
              }`}

          /> */}
          {/* <DatePickerWrapper>

            <DatePicker
              selectsRange
              monthsShown={1}
              endDate={endDateRange}
              selected={startDateRange}
              startDate={startDateRange}
              shouldCloseOnSelect={true}
              showPreviousMonths={true}
              isClearable
              id='date-range-picker-months'
              showPopperArrow={false}
              onChange={handleOnChangeRange}
              // popperPlacement={popperPlacement}

              customInput={
                <CustomInput
                  label='Select date range'
                  end={endDateRange as Date | number}
                  start={startDateRange as Date | number}
                />
              }
            />
          </DatePickerWrapper> */}
        </Grid>
        <Grid item display={'flex'} justifyContent={'flex-end'}>
          {/* <Tooltip title='Add new Create Booking'> */}
          {checkPermission('add-manual-bookings') && (

            <Button onClick={() => setOpenDrawer(true)} variant='contained' startIcon={<Icon icon='ic:baseline-add' />}>
              Add Booking
            </Button>
          )}

          {/* </Tooltip> */}
        </Grid>
      </Grid>
      <Grid container spacing={5}>
        <Grid item xs={6} md={4}>
          <CountCard
            title=' Traders'
            icon='bx:group'
            color='primary'
            data={{
              buyer: dashboardData?.traders?.buyer?.active || 0,
              seller: dashboardData?.traders?.seller?.active || 0,
              // rejected: dashboardData?.inactive || 0,
              total: dashboardData?.traders?.total || 0
            }}
            link='/user/'
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <CountCard
            title=' Manufacturers'
            icon='bx:group'
            color='primary'
            data={{
              buyer: dashboardData?.manufacturers?.buyer?.active || 0,
              seller: dashboardData?.manufacturers?.seller?.active || 0,
              // rejected: dashboardData?.inactive || 0,
              total: dashboardData?.manufacturers?.total || 0
            }}
            link='/user/'
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <CountCard
            title=' Orders'
            icon='mdi:clipboard-text-outline'
            color='primary'
            data={{
              traders: dashboardData?.orders?.trader || 0,
              manufacturers: dashboardData?.orders?.manufacturer || 0,
              // rejected: dashboardData?.inactive || 0,
              total: dashboardData?.orders?.total || 0
            }}
            link='/orders/'
          />
        </Grid>
        {/* <Grid item xs={6} md={4}>
          <CountCard
            title='Total Product'
            icon='bx:package'
            color='primary'
            data={{
              active: dashboardData?.products?.active || 0,
              inactive: dashboardData?.products?.inactive || 0,
              rejected: dashboardData?.inactive || 0,
              total: dashboardData?.products?.total || 0
            }}
            link='/products/'
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <CountCard
            title='Total Plants'
            icon='bx:buildings'
            color='primary'
            data={{
 manufacturer: dashboardData?.plants?.seller_manufacturer || 0,  
             trader: dashboardData?.plants?.buyer_trader || 0,
              rejected: dashboardData?.rejected_trucks || 0,
              total: dashboardData?.plants?.total || 0
            }}
            link='/truck/'
          />
        </Grid>

        <Grid item xs={6} md={4}>
          <CountCard
            title='Total Users'
            icon='bx:group' // or use 'mdi:steering' if it better fits your theme
            color='primary'
            data={{
              pending: dashboardData?.pending_drivers || 0,
              approved: dashboardData?.approved_drivers || 0,
              rejected: dashboardData?.rejected_drivers || 0,
              total: dashboardData?.total_drivers || 0
            }}
            link='/driver/'
          />
        </Grid> */}
        <Grid item xs={6} md={3}>
          <CardOneCount
            title="Total Financers"
            value={millify(dashboardData?.financers?.total || 0)}
            icon="bx:package"
            color="primary"
            link='/user/'
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <CardOneCount
            title="Total Plants"
            value={millify(dashboardData?.plants?.total || 0)}
            icon="bx:buildings"
            color="primary"
            link='/plants/'
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <CardOneCount
            title="Total Products"
            value={millify(dashboardData?.products?.total || 0)}
            icon="bx:package"
            color="primary"
            link='/products/'
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <CardOneCount
            title="Total Commission"
            value={millify(dashboardData?.commissions?.paid_amount || 0)}
            icon="mdi:cash-multiple"
            color="primary"
            link='/commission/'
          />
        </Grid>


        {/* <Grid item xs={6} md={4}>
  <CountCard
    title='Total Customer'
    icon='mdi:account-group-outline'
    color='primary'
    isshow={false}
    data={{
      pending: 12111,
      approved: 3411,
      rejected: 511,
      total: dashboardData?.total_customers || 0
    }}
    link='/customer/'
  />
</Grid> */}

        {/* {themeConfig.projectFor == 'villa' && (
          <>
            <Grid item xs={6} md={4} lg={3}>
              <CountCard
                count={+dashboardData.totalExpenses ?? 0}
                icon={'arcticons:expense'}
                title={'Total Expense'}
                color={'error'}
                link={'/expenses'}

              />
            </Grid>
            <Grid item xs={6} md={4} lg={3}>
              <CountCard
                count={dashboardData?.maintenanceStatusCount?.maintenance_count ?? 0}
                icon={'carbon:license-maintenance'}
                title={'Total Maintenance'}
                color={'info'}
                link={'/maintenance'}
              />
            </Grid>
          </>
        )} */}
        {/* <Grid item xs={6} md={4} lg={3}>
          <CountCard
            count={dashboardData.totalVilla ?? 0}
            icon={'material-symbols:holiday-village-outline'}
            title={'Total Villas Listed'}
            color={'error'}
            link={`/${themeConfig.projectFor}_management/${themeConfig.projectFor}`}
          />
        </Grid> */}
      </Grid>
      {/* <Grid container spacing={5} sx={{ mt: 5 }}>
        <Grid item xs={12} md={6}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >

              <CircularProgress disableShrink sx={{ mt: 6 }} />
            </Box>
          ) : (

            <PaymentBooking total={parseFloat(dashboardData.totalBookings) ?? 0} partailCount={parseFloat(dashboardData?.partiallyPaidBookings) ?? 0} fullCount={parseFloat(dashboardData?.fullPaidBookings) ?? 0} />
          )}

        </Grid>
        <Grid item xs={12} md={6}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >

              <CircularProgress disableShrink sx={{ mt: 6 }} />
            </Box>
          ) : (

            <MaintenanceRatio total={parseFloat(dashboardData?.maintenanceStatusCount?.maintenance_count) ?? 0} openCount={parseFloat(dashboardData?.maintenanceStatusCount?.open) ?? 0} closedCount={parseFloat(dashboardData?.maintenanceStatusCount?.closed) ?? 0} rejectedCount={parseFloat(dashboardData?.maintenanceStatusCount?.rejected) ?? 0} approvedCount={parseFloat(dashboardData?.maintenanceStatusCount?.acknowledged)} />
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >

              <CircularProgress disableShrink sx={{ mt: 6 }} />
            </Box>
          ) : (

            <OccupencyRateBooking total={parseFloat(dashboardData.totalRevenue) ?? 0} expenseCount={parseFloat(dashboardData?.totalExpenses) ?? 0} earningsCount={parseFloat(dashboardData?.totalEarnings) ?? 0} dueCount={parseFloat(dashboardData?.dueAmount)??0} />
          )}

        </Grid>
      </Grid> */}

      {/* {openDrawer && (
        <Drawer open={openDrawer} anchor='right' onClose={() => setOpenDrawer(false)}>
          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} sx={{ m: 5 }}>
            <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Add Booking</Typography>
            <Button onClick={() => setOpenDrawer(false)}>
              <Icon icon='bx:x' style={{ fontSize: '30px', color: 'text-dark' }} />
            </Button>
          </Box>
          <Divider />
          <div style={{ width: 370 }}>
            {themeConfig.projectFor == 'villa' ? (

              <CreateVillaBooking />
            ) : (
              <CreateBooking />
            )}
          </div>
        </Drawer>
      )} */}
    </Box>
  )
}

export default Shop
