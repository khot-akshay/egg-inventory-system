import {
  Card, Typography, Button,
  Box, useTheme, useMediaQuery, CircularProgress,
  Grid, Divider, Paper, Chip, Stack
} from '@mui/material'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PersonIcon from '@mui/icons-material/Person'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'
import moment from 'moment'

const schema = yup.object().shape({
  customer_id: yup.mixed().test('shop-required', 'Customer is required for 100+ eggs', function (value) {
    const { isNewCustomer = false, totalCartEggs = 0 } = this.options.context || {};
    if (totalCartEggs < 100) return true;
    if (!isNewCustomer && !value) return false;
    return true;
  }),
  customer_name: yup.string().test('name-required', 'Name is required for 100+ eggs', function (value) {
    const { isNewCustomer = false, totalCartEggs = 0 } = this.options.context || {};
    if (totalCartEggs < 100) return true;
    if (isNewCustomer && !value) return false;
    return true;
  }),
  phone_number: yup.string().test('phone-required', 'Phone is required for 100+ eggs', function (value) {
    const { isNewCustomer, totalCartEggs } = this.options.context as any || {};
    if (totalCartEggs < 100) return true;
    if (isNewCustomer && !value) return false;
    return true;
  }),
  category_id: yup.mixed().nullable(),
  rate_per_unit: yup.number().nullable(),
  purchase_date: yup.string().nullable()
})

interface AddStocksFormProps {
  open?: boolean
  handleClose?: () => void
  fetchData?: () => void
  selectedItem?: any
}

const AddDayTrip = ({ handleClose, fetchData, selectedItem }: AddStocksFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))


  const [minRate, setMinRate] = useState<number | null>(null)
  const [maxRate, setMaxRate] = useState<number | null>(null)
  const [paymentType, setPaymentType] = useState('cash')
  const [unit, setUnit] = useState('');
  const [unitValue, setUnitValue] = useState(30);
  const [quantity, setQuantity] = useState<any>(1);
  const [damaged, setDamaged] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const router = useRouter()


  const totalCartEggs = cart.reduce((sum, item) => sum + item.quantity, 0)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    context: { isNewCustomer, totalCartEggs },
    defaultValues: {
      customer_id: null,
      category_id: null,
      rate_per_unit: 150,
      purchase_date: new Date().toISOString().split('T')[0],
      customer_name: '',
      phone_number: '',
      mixed_cash: null,
      mixed_online: null,
      egg_vendor_purchase_id: null
    }
  })

  const rate = watch('rate_per_unit')
  const selectedCategory = watch('category_id') as any
  const selectedCustomer = watch('customer_id') as any
  const selectedDriver = selectedCustomer
  const selectedPurchaseDate = watch('purchase_date')
  const selectedPurchase = watch('egg_vendor_purchase_id') as any

  const { user } = useAuth()
  const currentStaffShopId = user?.shop_id || user?.shop?.id;
  const roleName = user?.roles?.[0]?.name || '';


  const resetBillForm = () => {
    reset({
      customer_id: null,
      category_id: null,
      rate_per_unit: 150,
      customer_name: '',
      phone_number: '',
      mixed_cash: null,
      mixed_online: null
    })

    setUnit('')
    setUnitValue(30)
    setQuantity('')
    setDamaged(0)
    setCart([])
    setPendingAmount(null)
    setIsNewCustomer(false)
    setPaymentType('cash')

    setMinRate(null)
    setMaxRate(null)
  }

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.shop_id) {
        setValue('customer_id', { id: selectedItem.shop_id, name: selectedItem.shop?.name || 'Shop' })
      }
      if (selectedItem.product_id) {
        setValue('category_id', { id: selectedItem.product_id, name: selectedItem.product?.name || 'Product' })
      }
      setValue('rate_per_unit', selectedItem.rate)
      setUnit(selectedItem.unit_type)
      setUnitValue(selectedItem.unit_value)
      setQuantity(selectedItem.quantity)
      setDamaged(selectedItem.damaged_eggs)
    }
  }, [selectedItem, setValue])

  useEffect(() => {
    if (!selectedCustomer && paymentType === 'credit') {
      setPaymentType('cash')
    }
  }, [selectedCustomer, paymentType])

  useEffect(() => {
    const fetchPendingAmount = async () => {
      if (!selectedCustomer || isNewCustomer) {
        setPendingAmount(null)
        return
      }

      // Extract ID from the selected object - handles different autocomplete formats
      const customerId =
        typeof selectedCustomer === 'number' || typeof selectedCustomer === 'string' ? selectedCustomer :
          selectedCustomer?.id ? selectedCustomer.id :
            selectedCustomer?.value ? selectedCustomer.value :
              null

      if (customerId) {
        try {
          const response = await axiosInstance.get(`/api/v1/shop/userPendingAmount?user_id=${customerId}`)
          if (response.data.success) {
            setPendingAmount(response.data.data?.pendingAmount || 0)
          } else {
            setPendingAmount(null)
          }
        } catch (error) {
          setPendingAmount(null)
        }
      } else {
        setPendingAmount(null)
      }
    }

    fetchPendingAmount()
  }, [selectedCustomer, isNewCustomer])

  const totalEggs = quantity * unitValue
  const finalEggs = totalEggs - damaged

  const handleUnitChange = (_: any, value: any) => {
    if (!value) return
    setUnit(value)
    let val = 1
    if (value === 'tray') val = 30
    if (value === 'dozen') val = 12
    if (value === 'half_dozen') val = 6

    // We set quantity directly to the unit value as requested
    setQuantity(val)
    // Keep unitValue as 1 so that totalEggs (quantity * unitValue) remains correct
    setUnitValue(1)
  }

  // Fetch min/max rates when product changes
  useEffect(() => {
    const fetchProductRates = async () => {
      const categoryId = selectedCategory
      const id = typeof categoryId === 'object' ? (categoryId?.category_id || categoryId?.id) : categoryId

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
          setMinRate(null)
          setMaxRate(null)
        }
      }
    };

    fetchProductRates()
  }, [selectedCategory, setValue])


  const resetProductFields = () => {
    setValue('category_id', null)
    setValue('rate_per_unit', 150)

    setUnit('')
    setUnitValue(30)

    setQuantity('')
    setDamaged(0)

    setMinRate(null)
    setMaxRate(null)
  }
  const handleAddToCart = () => {
    const product = watch('category_id')
    const rate_per_unit = watch('rate_per_unit')

    if (!product) {
      toast.error('Please select a product')
      return
    }
    if (!quantity || quantity <= 0) {
      toast.error('Quantity is required');
      return;
    }
    //  if (!unit) {
    //     toast.error('Please select a unit')
    //     return
    //   }

    const productName =
      typeof product === 'object'
        ? (product?.name || product?.category?.name)
        : 'Product'

    const categoryId =
      typeof product === 'object'
        ? product?.id
        : product

    const newItem = {
      category_id: categoryId,
      product_name: productName,
      quantity,
      unit,
      unit_value: unitValue,
      total_eggs: totalEggs,
      damaged_eggs: damaged,
      rate: rate_per_unit,
      total: quantity * rate_per_unit
    }

    setCart(prev => [...prev, newItem])

    resetProductFields()

    toast.success('Added to list')
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0)

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const extractId = (value: any): number | null => {
        if (value === null || value === undefined) return null
        if (typeof value === 'number') return value
        if (typeof value === 'object' && value.id) return Number(value.id)
        return Number(value)
      }


      // If no items in cart and no product details entered, prevent submission
      // if (cart.length === 0 && !(watch('category_id') && quantity > 0 && watch('rate_per_unit'))) {
      //   toast.error('Please add at least one product to the list')
      //   setLoading(false)
      //   return
      // }
      const cashAmount = Number(data.mixed_cash)
      const upiAmount = Number(data.mixed_online)
      const lineTotal = quantity * Number(watch('rate_per_unit') || 0);
      // Determine the overall total amount based on cart or single item
      const totalAmount = cart.length > 0 ? grandTotal : lineTotal;
      // const paidAmount = paymentType === 'mixed' ? cashAmount + upiAmount : totalAmount;
      const paidAmount =
        paymentType === 'credit'
          ? 0
          : paymentType === 'mixed'
            ? cashAmount + upiAmount
            : totalAmount;
      let payments: { amount: number; payment_type: string }[] = [];
      // Build lines for payload
      let lines: { category_id: any; quantity: number; unit_cost: number; unit_type: string; unit_value: number }[] = [];
      if (cart.length > 0) {
        lines = cart.map(item => ({
          category_id: item.category_id,
          quantity: item.quantity,
          unit_cost: item.rate,
          unit_type: item.unit,
          unit_value: item.unit_value
        }));
      } else if (watch('category_id') && quantity > 0 && watch('rate_per_unit')) {
        const cat = watch('category_id');
        const catId = typeof cat === 'object' && cat.id ? cat.id : cat;
        lines = [{
          category_id: catId,
          quantity,
          unit_cost: Number(watch('rate_per_unit')),
          unit_type: unit,
          unit_value: 0
        }];
      }
      //     if (paymentType === 'credit') {
      //   payments = [{
      //     amount: 0,
      //     payment_type: 'credit'
      //   }];
      // } else {
      //   payments = [{
      //     amount: totalAmount,
      //     payment_type: paymentType
      //   }];
      // }

      if (paymentType === 'mixed') {
        if (cashAmount > 0) {
          payments.push({
            amount: cashAmount,
            payment_type: 'cash'
          });
        }

        if (upiAmount > 0) {
          payments.push({
            amount: upiAmount,
            payment_type: 'upi'
          });
        }
      } else if (paymentType === 'credit') {
        payments = [{
          amount: 0,
          payment_type: 'credit'
        }];
      } else {
        payments = [{
          amount: totalAmount,
          payment_type: paymentType
        }];
      }

      if (!quantity || quantity <= 0) {
        toast.error('Quantity is required');
        setLoading(false);
        return;
      }

      const payload = {
        customer_id: isNewCustomer ? null : extractId(data.customer_id),
        customer_name: isNewCustomer ? data.customer_name : null,
        phone_number: isNewCustomer ? data.phone_number : null,
        egg_vendor_purchase_id: extractId(data.egg_vendor_purchase_id),
        paid_amount: paidAmount,
        // payment_type: paymentType,
        lines,
        payments
      }

      const response = await axiosInstance.post('/api/v1/shop/purchaseEgg', payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Bill confirmed successfully')
        // reset({
        //   customer_id: null,
        //   category_id: null,
        //   rate_per_unit: 150,
        //   customer_name: '',
        //   phone_number: '',
        //   mixed_cash: 0,
        //   mixed_online: 0
        // })
        resetBillForm();

        if (fetchData) fetchData()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('quickBillAdded'))
        }
        if (handleClose) handleClose()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = () => {
    router.push('/quickbillList')
  }

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold' }}>
          🚚 Start Day Trip
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {roleName ? `Role: ${roleName}` : 'Distributor Section'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Left Section: Form Controls */}
          <Grid item xs={12} md={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFAutoComplete
                  control={control}
                  name="egg_vendor_purchase_id"
                  placeholder="Select Vehicle"
                  labelinput="Vehicle"
                  apiUrl="/api/v1/shop/getAllEggVendorPurchases"
                  extraParams={{ start_date: selectedPurchaseDate, end_date: selectedPurchaseDate }}
                  labelKey={(opt: any) =>
                    `${opt.vehicle?.registration_number || opt.vehicle?.name || 'N/A'}`
                  }
                  valueKey="id"
                  returnObject={true}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>

             <RHFInput
                control={control}
                name='name'
                label='Distributor Name'
                placeholder='Distributor Name'
                mandatory
              />
              </Grid>
{/* 
              <Grid item xs={12} sm={6}>
                <RHFAutoComplete
                  control={control}
                  name="category_id"
                  placeholder="Select Helper / Staff"
                  labelinput="Helper / Staff"
                  apiUrl="/api/v1/admin/getAllCategories"
                  extraParams={{ shop_id: currentStaffShopId || '' }}
                  dataKey="data.categories"
                  labelKey="name"
                  valueKey="id"
                  returnObject={true}
                  required
                />
              </Grid> */}

              {/* <Grid item xs={12} sm={6}>
                <RHFInput
                  control={control}
                  name="rate_per_unit"
                  label="Opening KM"
                  placeholder="Enter Opening KM"
                  inputType="number"
                  mandatory
                />
              </Grid> */}

              <Grid item xs={12} sm={6}>
                <RHFInput
                  control={control}
                  name="purchase_date"
                  label="Date"
                  placeholder="Select Date"
                  inputType="date"
                  mandatory
                />
              </Grid>
              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      Status
                    </Typography>
                    <Chip
                      label="Active"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Purchase ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                        {selectedPurchase?.id ? `#${selectedPurchase.id}` : 'Auto Generated'}
                      </Typography>
                    </Box>

                    {selectedPurchase?.created_at && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Trip Start Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {moment(selectedPurchase.created_at).format('hh:mm A')}
                        </Typography>
                      </Box>
                    )}

                    {(selectedPurchase?.vehicle?.registration_number || selectedPurchase?.vehicle?.name) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Vehicle Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {selectedPurchase?.vehicle?.registration_number || selectedPurchase?.vehicle?.name}
                        </Typography>
                      </Box>
                    )}

                    {(selectedDriver?.name || selectedPurchase?.driver?.name) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Driver Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {selectedDriver?.name || selectedPurchase?.driver?.name}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  size="large"
                  disabled={loading}
                  sx={{ height: 48 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Start Day Trip'
                  )}
                </Button>
              </Grid>

              
            </Grid>
          </Grid>

         
        </Grid>
      </form>
    </Card>
  )
}

export default AddDayTrip
