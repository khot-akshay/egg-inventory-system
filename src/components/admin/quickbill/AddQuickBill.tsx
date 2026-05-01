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
  const [minRate, setMinRate] = useState<number | null>(null)
  const [maxRate, setMaxRate] = useState<number | null>(null)
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
      // Try to get category_id if productId is an object, otherwise use the ID directly
      const id = typeof productId === 'object' ? (productId?.category_id || productId?.id) : productId
      
      if (id) {
        try {
          const response = await axiosInstance.get(`/api/v1/shop/getAllEggpriceAsPerCategoryForThatShop?category_id=${id}`)
          if (response.data.success) {
            // Check if products are in response.data.data.products or response.data.products
            const products = response.data.data?.products || response.data.products
            
            if (products && products.length > 0) {
              const product = products[0]
              const min = parseFloat(product.egg_price_min)
              const max = parseFloat(product.egg_price_max)
              
              if (!isNaN(min) && !isNaN(max)) {
                setMinRate(min)
                setMaxRate(max)
                // Set the default rate to the minimum rate if current rate is invalid or default
                const currentRate = watch('rate_per_unit')
                if (!currentRate || currentRate > max || currentRate < min || currentRate === 150) {
                  setValue('rate_per_unit', min)
                }
              }
            } else {
              setMinRate(null)
              setMaxRate(null)
            }
          }
        } catch (error) {
          console.error('Error fetching product rates:', error)
          setMinRate(null)
          setMaxRate(null)
        }
      }
    };

    fetchProductRates()
  }, [watch('product_id'), setValue])

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
        customer_id: isNewCustomer ? null : extractId(data.shop_id),
        customer_name: isNewCustomer ? data.customer_name : null,
        phone_number: isNewCustomer ? data.phone_number : null,
        product_id: extractId(data.product_id),
        quantity: quantity, // Number of units (e.g., 2 for 2 trays)
        total_eggs: totalEggs, // Total calculated eggs (e.g., 60)
        unit_cost: data.rate_per_unit,
        payment_type: paymentType,
        damaged_eggs: damaged,
        unit_type: unit,
        unit_value: unitValue
      }

      const response = await axiosInstance.post('/api/v1/shop/purchaseEgg', payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Egg purchase recorded successfully')
        reset({
          shop_id: null,
          product_id: null,
          rate_per_unit: minRate || 0,
          customer_name: '',
          phone_number: ''
        })
        setQuantity(1)
        setDamaged(0)
        setIsNewCustomer(false)
        if (fetchData) fetchData()
        if (handleClose) handleClose()
      }
    } catch (error: any) {
      console.error('Error recording purchase:', error)
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