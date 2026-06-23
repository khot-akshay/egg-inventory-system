import {
  Card, Typography, Button,
  TextField,
  Box, useTheme, useMediaQuery, CircularProgress,
  Grid, Divider
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing'
import EventNoteIcon from '@mui/icons-material/EventNote'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { useAuth } from 'src/hooks/useAuth'

const schema = yup.object().shape({
  vendor_id: yup.mixed().required('Vendor is required'),
  vehicle_id: yup.mixed().required('Vehicle is required'),
  driver_id: yup.mixed().nullable(),
  purchase_date: yup.string().nullable(),
  notes: yup.string().nullable(),
  load_immediately: yup.boolean().default(true),
  product_id: yup.mixed().nullable(),
  rate_per_unit: yup.number().nullable(),
  mixed_cash: yup.number().nullable(),
  mixed_online: yup.number().nullable()
})

interface AddStocksFormProps {
  open?: boolean
  handleClose?: () => void
  fetchData?: () => Promise<void>
  selectedItem?: any
}

const AddPurchaseForm = ({ handleClose, fetchData, selectedItem }: AddStocksFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [loading, setLoading] = useState(false)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [paymentType, setPaymentType] = useState('cash')
  const [prices, setPrices] = useState<{
    category_id: number
    price_per_egg: string
    name: string
    quantity: string | number
  }[]>([])

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vendor_id: null,
      vehicle_id: null,
      driver_id: null,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: '',
      load_immediately: true,
      product_id: null,
      rate_per_unit: 150,
      mixed_cash: 0,
      mixed_online: 0
    }
  })

  const { user } = useAuth()
  const currentStaffShopId = user?.shop_id || user?.shop?.id

  // Load existing data if selectedItem is present
  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.vendor_id) {
        setValue('vendor_id', { id: selectedItem.vendor_id, name: selectedItem.vendor?.name || 'Vendor' })
      }
      if (selectedItem.vehicle_id) {
        setValue('vehicle_id', { id: selectedItem.vehicle_id, name: selectedItem.vehicle?.name || selectedItem.vehicle?.registration_number || 'Vehicle' })
      }
      if (selectedItem.driver_id) {
        setValue('driver_id', { id: selectedItem.driver_id, name: selectedItem.driver?.name || 'Driver' })
      }
      if (selectedItem.purchase_date) {
        const dateStr = new Date(selectedItem.purchase_date).toISOString().split('T')[0]
        setValue('purchase_date', dateStr)
      }
      if (selectedItem.notes) {
        setValue('notes', selectedItem.notes)
      }
      if (selectedItem.load_immediately !== undefined) {
        setValue('load_immediately', Boolean(selectedItem.load_immediately))
      }
    }
  }, [selectedItem, setValue])

  // Fetch all categories on mount to populate default list
  useEffect(() => {
    const fetchDefaultCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/shop/getAllCategories')
        if (response.data.success) {
          const categories = response.data.data?.categories || response.data.categories || []
          const initialPrices = categories.map((cat: any) => {
            let existingQty: string | number = ""
            let existingPrice: string = "0.00"

            if (selectedItem && selectedItem.items && Array.isArray(selectedItem.items)) {
              const matchedItem = selectedItem.items.find((item: any) => item.category_id === cat.id)
              if (matchedItem) {
                existingQty = matchedItem.total_eggs || ""
                existingPrice = String(matchedItem.price_per_egg || matchedItem.unit_cost || "0.00")
              }
            }

            return {
              category_id: cat.id,
              price_per_egg: existingPrice,
              name: cat.name || "Unknown Category",
              quantity: existingQty
            }
          })
          setPrices(initialPrices)
        }
      } catch (error) {
        }
    }
    fetchDefaultCategories()
  }, [selectedItem])

  const selectedVendor = watch('vendor_id')

  // Fetch vendor egg prices and merge/update rates in the prices state
  useEffect(() => {
    const fetchVendorPrices = async () => {
      const vendorId = selectedVendor ? (typeof selectedVendor === 'object' ? (selectedVendor as any).id : selectedVendor) : null
      if (!vendorId) {
        // If vendor is cleared, reset rates to 0.00
        setPrices(prev => prev.map(p => ({ ...p, price_per_egg: "0.00" })))
        return
      }

      try {
        const url = `/api/v1/admin/getAllVendorEggPrices?id=${vendorId}`
        const response = await axiosInstance.get(url)
        if (response.data.success) {
          const fetchedPrices = response.data.data?.prices || []
          
          setPrices(prev => prev.map(p => {
            const vendorPriceObj = fetchedPrices.find((fp: any) => fp.category_id === p.category_id)
            let price = vendorPriceObj?.price_per_egg || "0.00"

            // Check if there is an existing selectedItem (when editing)
            let qty = p.quantity
            if (selectedItem && selectedItem.items && Array.isArray(selectedItem.items)) {
              const matchedItem = selectedItem.items.find((item: any) => item.category_id === p.category_id)
              if (matchedItem) {
                qty = matchedItem.total_eggs || ""
                price = matchedItem.price_per_egg || matchedItem.unit_cost || price
              }
            }

            return {
              ...p,
              price_per_egg: String(price),
              quantity: qty
            }
          }))
        }
      } catch (error) {
        }
    }

    fetchVendorPrices()
  }, [selectedVendor, selectedItem])

  const handlePriceChange = (index: number, value: string) => {
    const newPrices = [...prices]
    newPrices[index].price_per_egg = value
    setPrices(newPrices)
  }

  const handleQuantityChange = (index: number, value: string) => {
    const newPrices = [...prices]
    newPrices[index].quantity = value === "" ? "" : Number(value)
    setPrices(newPrices)
  }

  const grandTotal = prices.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0
    const rate = Number(item.price_per_egg) || 0
    return sum + (qty * rate)
  }, 0)

  const totalQuantity = prices.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0)
  }, 0)

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const extractId = (value: any): number | null => {
        if (value === null || value === undefined) return null
        if (typeof value === 'number') return value
        if (typeof value === 'object' && value.id) return Number(value.id)
        return Number(value)
      }

      const activeItems = prices
        .filter(item => (Number(item.quantity) || 0) > 0)
        .map(item => ({
          category_id: item.category_id,
          total_eggs: Number(item.quantity) || 0,
          price_per_egg: Number(item.price_per_egg) || 0
        }))

      if (activeItems.length === 0) {
        toast.error('Please add quantity for at least one product')
        setLoading(false)
        return
      }

      const payload = {
        vendor_id: extractId(data.vendor_id),
        vehicle_id: extractId(data.vehicle_id),
        driver_id: extractId(data.driver_id) || 5,
        purchase_date: data.purchase_date || new Date().toISOString().split('T')[0],
        notes: data.notes?.trim() || 'Purchase Order',
        load_immediately: data.load_immediately !== undefined ? Boolean(data.load_immediately) : true,
        paid_amount: grandTotal,
        payment_type: paymentType === 'mixed' ? 'cash,upi' : paymentType,
        payments: paymentType === 'mixed' ? [
          { amount: Number(data.mixed_cash), payment_type: 'cash' },
          { amount: Number(data.mixed_online), payment_type: 'upi' }
        ] : [
          { amount: grandTotal, payment_type: paymentType }
        ],
        items: activeItems
      }

      const response = await axiosInstance.post('/api/v1/shop/eggPurchaseFromVendor', payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Order confirmed successfully')
        reset({
          vendor_id: null,
          vehicle_id: null,
          driver_id: null,
          purchase_date: new Date().toISOString().split('T')[0],
          notes: '',
          load_immediately: true,
          product_id: null,
          rate_per_unit: 150,
          mixed_cash: 0,
          mixed_online: 0
        })
        const clearedPrices = prices.map(p => ({ ...p, quantity: "" }))
        setPrices(clearedPrices)
        setIsNewCustomer(false)
        // Refresh the purchases list after a successful submit
        if (fetchData) {
          try {
            await fetchData(); // This usually calls getAllEggVendorPurchases in the parent
          } catch (e) {
            }
        }
        // Ensure the latest purchases are fetched directly
        try {
          await axiosInstance.get('/api/v1/shop/getAllEggVendorPurchases');
        } catch (e) {
          }
        // Notify other components to refresh purchase list immediately
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('purchaseAdded'));
        }
        if (handleClose) handleClose();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, height: '100%' }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', mb: 2 }}>
        🥚 Purchase Order
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Shop Selection */}
          <Grid item xs={6}>
            <RHFAutoComplete
              control={control}
              name="vehicle_id"
              placeholder="Vehicle Name"
              labelinput="Vehicle Name"
              apiUrl="/api/v1/shop/getAllVehicles"
              labelKey="name"
              valueKey="id"
              required={!isNewCustomer}
              disabled={isNewCustomer}
            />
          </Grid>
          <Grid item xs={6}>
            <RHFAutoComplete
              control={control}
              name="driver_id"
              placeholder="Driver Name"
              labelinput="Driver Name"
              apiUrl="/api/v1/shop/getAllUsers"
              labelKey="name"
              valueKey="id"
              required={!isNewCustomer}
              disabled={isNewCustomer}
            />
          </Grid>
          <Grid item xs={12}>
            <RHFAutoComplete
              control={control}
              name="vendor_id"
              placeholder="Vendor Name"
              labelinput="Vendor Name"
              apiUrl="/api/v1/shop/getAllVendors"
              labelKey="name"
              valueKey="id"
              required={!isNewCustomer}
              disabled={isNewCustomer}
            />
          </Grid>
          {prices.length > 0 && (
            <Grid item xs={12}>
              {/* <Divider sx={{ my: 1 }} /> */}
              <Typography className="input-label">
                Egg Quantities 
              </Typography>
              <Grid container spacing={2} mt={1}>
                {prices.map((item, index) => (
                  <Grid item xs={6} md={6} key={item.category_id}>
                    <Typography className="input-label">
                      {item.name}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      inputProps={{ min: "0" }}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      placeholder="Total eggs"
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {/* Price and Total Amount Displays */}
          <Grid item xs={12}>
            {/* <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                bgcolor: 'action.hover',
                borderRadius: 2,
                mb: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Price per egg
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                ₹{Number(watch('rate_per_unit') || 0).toFixed(2)}
              </Typography>
            </Box> */}

            <Grid item xs={12} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: hexToRGBA(theme.palette.info.main, 0.12),
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Total Quantity
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {totalQuantity}
                </Typography>
              </Box>
            </Grid>

            {/* <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: hexToRGBA(theme.palette.success.main, 0.12),
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Total Eggs
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  ₹{grandTotal.toFixed(2)}
                </Typography>
              </Box>
            </Grid> */}
          </Grid>

          {/* <Grid item xs={12}>
            <Typography className="input-label">
              Payment Type
            </Typography>
            <Grid container spacing={2}>
              {[
                { id: 'cash', label: 'Cash', icon: <LocalAtmIcon /> },
                { id: 'upi', label: 'Online', icon: <PhonelinkRingIcon /> },
                { id: 'credit', label: 'Credit', icon: <EventNoteIcon /> },
                { id: 'mixed', label: 'Mixed', icon: <EventNoteIcon /> }
              ].map(type => (
                <Grid item xs={3} key={type.id}>
                  <Button
                    fullWidth
                    variant={paymentType === type.id ? 'contained' : 'outlined'}
                    onClick={() => setPaymentType(type.id)}

                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'inherit' }}>
                      {type.label}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {paymentType === 'mixed' && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <RHFInput
                    control={control}
                    name="mixed_cash"
                    label="Cash Amount"
                    type="number"
                    placeholder="Enter Cash"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <RHFInput
                    control={control}
                    name="mixed_online"
                    label="Online Amount"
                    type="number"
                    placeholder="Enter UPI"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
          )} */}

          {/* Confirm Bill Button */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Order'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default AddPurchaseForm