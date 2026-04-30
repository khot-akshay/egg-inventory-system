import {
  Card, Typography, Button,
  TextField, ToggleButton, ToggleButtonGroup,
  Box, useTheme, useMediaQuery, CircularProgress,
  Grid, Divider
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing'
import EventNoteIcon from '@mui/icons-material/EventNote'

const schema = yup.object().shape({
  shop_id: yup.mixed().test('shop-required', 'Shop is required', function (value) {
    const { isNewCustomer } = this.options.context as any || {};
    if (!isNewCustomer && !value) return false;
    return true;
  }),
  customer_name: yup.string().test('name-required', 'Name is required', function (value) {
    const { isNewCustomer } = this.options.context as any || {};
    if (isNewCustomer && !value) return false;
    return true;
  }),
  phone_number: yup.string().test('phone-required', 'Phone is required', function (value) {
    const { isNewCustomer } = this.options.context as any || {};
    if (isNewCustomer && !value) return false;
    return true;
  }),
  product_id: yup.mixed().required('Product is required'),
  rate_per_unit: yup.number().required('Rate is required').min(0, 'Rate must be positive'),
})

interface AddStocksFormProps {
  open?: boolean
  handleClose?: () => void
  fetchData?: () => void
  selectedItem?: any
}

const AddQuickBillForm = ({ handleClose, fetchData, selectedItem }: AddStocksFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [unit, setUnit] = useState('tray')
  const [unitValue, setUnitValue] = useState(30)
  const [quantity, setQuantity] = useState(1)
  const [damaged, setDamaged] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const [minRate, setMinRate] = useState(5)
  const [maxRate, setMaxRate] = useState(6)
  const [paymentType, setPaymentType] = useState('cash')

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    context: { isNewCustomer },
    defaultValues: {
      shop_id: null,
      product_id: null,
      rate_per_unit: 150,
      customer_name: '',
      phone_number: ''
    }
  })

  const rate = watch('rate_per_unit')

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.shop_id) {
        setValue('shop_id', { id: selectedItem.shop_id, name: selectedItem.shop?.name || 'Shop' })
      }
      if (selectedItem.product_id) {
        setValue('product_id', { id: selectedItem.product_id, name: selectedItem.product?.name || 'Product' })
      }
      setValue('rate_per_unit', selectedItem.rate || 150)
      setUnit(selectedItem.unit_type || 'tray')
      setUnitValue(selectedItem.unit_value || 30)
      setQuantity(selectedItem.quantity || 1)
      setDamaged(selectedItem.damaged_eggs || 0)
    }
  }, [selectedItem, setValue])

  const totalEggs = quantity * unitValue
  const finalEggs = totalEggs - damaged

  const handleUnitChange = (_: any, value: any) => {
    if (!value) return
    setUnit(value)
    if (value === 'tray') setUnitValue(30)
    if (value === 'dozen') setUnitValue(12)
    if (value === 'single') setUnitValue(1)
  }

  // Fetch min/max rates when product changes
  useEffect(() => {
    const fetchProductRates = async () => {
      const productId = watch('product_id')
      const id = typeof productId === 'object' ? productId?.id : productId
      
      if (id) {
        try {
          const response = await axiosInstance.get(`/api/v1/admin/products/getProductsById/${id}`)
          if (response.data.success) {
            const data = response.data.data
            // Prioritize min_rate/max_rate from API, fallback to selling_price +/- 0.5
            const min = data.min_rate ?? (data.selling_price ? Number(data.selling_price) - 0.5 : 5)
            const max = data.max_rate ?? (data.selling_price ? Number(data.selling_price) + 0.5 : 6)
            
            setMinRate(Number(min))
            setMaxRate(Number(max))
          }
        } catch (error) {
          console.error('Error fetching product rates:', error)
        }
      }
    }

    fetchProductRates()
  }, [watch('product_id')])

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const extractId = (value: any): number | null => {
        if (value === null || value === undefined) return null
        if (typeof value === 'number') return value
        if (typeof value === 'object' && value.id) return Number(value.id)
        return Number(value)
      }

      const payload = {
        shop_id: isNewCustomer ? null : extractId(data.shop_id),
        customer_name: isNewCustomer ? data.customer_name : null,
        phone_number: isNewCustomer ? data.phone_number : null,
        unit_type: unit,
        unit_value: unitValue,
        quantity: quantity,
        total_eggs: totalEggs,
        rate_per_unit: data.rate_per_unit,
        damaged_eggs: damaged,
        final_eggs: finalEggs,
        payment_type: paymentType,
        status: 1
      }

      let response;
      if (selectedItem) {
        response = await axiosInstance.post(`/api/v1/admin/stocks/updateStock?id=${selectedItem.id}`, payload)
      } else {
        response = await axiosInstance.post('/api/v1/admin/stocks/addStock', payload)
      }

      if (response.data.success) {
        toast.success(response.data.message || 'Stock added successfully')
        reset({
          shop_id: null,
          product_id: null,
          rate_per_unit: 150
        })
        setQuantity(1)
        setDamaged(0)
        if (fetchData) fetchData()
        if (handleClose) handleClose()
      } else {
        toast.error(response.data.message || 'Failed to save stock')
      }
    } catch (error: any) {
      console.error('Error saving stock:', error)
      toast.error(error?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%' }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', mb: 2 }}>
        🥚 Quick Bill
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Shop Selection */}
          <Grid item xs={8}>
            <RHFAutoComplete
              control={control}
              name="shop_id"
              placeholder="Customer Name"
              labelinput="Customer Name"
              apiUrl="/api/v1/shop/getAllCustomers"
              labelKey="name"
              valueKey="id"
              required={!isNewCustomer}
              disabled={isNewCustomer}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant='contained'
              onClick={() => setIsNewCustomer(!isNewCustomer)}
              fullWidth
              sx={{ mt: 6 }}
            >
              {isNewCustomer ? 'Cancel' : '+ New'}
            </Button>
          </Grid>

          {isNewCustomer && (
            <>
              <Grid item xs={6}>
                <RHFInput
                  control={control}
                  name="customer_name"
                  label="Customer Name"
                  placeholder="Enter Name"
                  mandatory
                />
              </Grid>
              <Grid item xs={6}>
                <RHFInput
                  control={control}
                  name="phone_number"
                  label="Phone Number"
                  placeholder="Enter Phone"
                  mandatory
                />
              </Grid>
            </>
          )}
          {/* Product Selection */}
          <Grid item xs={12}>
            <RHFAutoComplete
              control={control}
              name="product_id"
              placeholder="Select Product"
              labelinput="Product Name"
              apiUrl="/api/v1/admin/getAllProducts"
              labelKey="name"
              valueKey="id"
              required
            />
          </Grid>


          <Grid item xs={12}>
            {(minRate !== null && maxRate !== null) && (
              <>
                <Typography className="input-label">
                 Price per Egg
                </Typography>
                <Grid container spacing={1}>
                  {Array.from(
                    { length: Math.max(0, Math.round((maxRate - minRate) / 0.1) + 1) },
                    (_, i) => parseFloat((minRate + i * 0.1).toFixed(2))
                  ).map((r) => (
                    <Grid item xs={2} key={r}>
                      <Button
                        fullWidth
                        variant={watch('rate_per_unit') === r ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setValue('rate_per_unit', r)}
                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                      >
                        {r.toFixed(2)}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

           
          </Grid>

          {/* Quantity Selection */}
          <Grid item xs={12} >
            <Typography className="input-label">
              Quantity
            </Typography>
            <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2}></Grid>

              <Grid item xs={2}>
                <Button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  fullWidth
                  sx={{
                    height: 40,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'white',
                    color: 'text.primary',
                    fontSize: '2rem',
                    fontWeight: 'light',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  −
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Box
                  sx={{
                    height: 40,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'white'
                  }}
                >
                  <TextField
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: 'text.primary',
                        width: '100%',
                        '& input': {
                          textAlign: 'center',
                          p: 0
                        }
                      }
                    }}
                    fullWidth
                  />
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Button
                  onClick={() => setQuantity(q => q + 1)}
                  fullWidth
                  sx={{
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'light',
                    '&:hover': { bgcolor: 'success.dark' }
                  }}
                >
                  +
                </Button>
              </Grid>
                                          <Grid item xs={2}></Grid>

            </Grid>
          </Grid>

          {/* Price and Total Amount Displays */}
          <Grid item xs={12}>
            {/* <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                bgcolor: '#F5F5F5',
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

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                bgcolor: '#E8F5E9',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Total Amount
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                ₹{(quantity * (watch('rate_per_unit') || 0)).toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          {/* Payment Type Selection */}
          <Grid item xs={12}>
            <Typography className="input-label">
              Payment Type
            </Typography>
            <Grid container spacing={2}>
              {[
                { id: 'cash', label: 'Cash', icon: <LocalAtmIcon /> },
                { id: 'online', label: 'Online', icon: <PhonelinkRingIcon /> },
                { id: 'credit', label: 'Credit', icon: <EventNoteIcon /> }
              ].map(type => (
                <Grid item xs={4} key={type.id}>
                  <Button
                    fullWidth
                    variant={paymentType === type.id ? 'contained' : 'outlined'}
                    onClick={() => setPaymentType(type.id)}
                    sx={{
                      height: 40,
                      borderRadius: 3,
                      bgcolor: paymentType === type.id ? 'success.main' : 'white',
                      borderColor: 'divider',
                      color: paymentType === type.id ? 'white' : 'text.secondary',
                      '&:hover': {
                        bgcolor: paymentType === type.id ? 'success.dark' : '#f8f9fa',
                        borderColor: 'divider'
                      },
                      textTransform: 'none'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'inherit' }}>
                      {type.label}
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Confirm Bill Button */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Bill'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default AddQuickBillForm