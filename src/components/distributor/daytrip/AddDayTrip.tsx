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
  purchase_date: yup.string().nullable(),
  name: yup.string().nullable(),
  egg_vendor_purchase_id: yup.mixed().nullable()
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
      egg_vendor_purchase_id: null,
      name: ''
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

  const [loadedPurchases, setLoadedPurchases] = useState<any[]>([])

  useEffect(() => {
    const fetchDistributorData = async () => {
      try {
        const response = await axiosInstance.get('/api/v1/shop/getCurrentPurchaseEggDataForDistributor')

        // Fetch both loaded and active purchases to display them
        const loaded = response.data?.data?.loaded || []
        const active = response.data?.data?.active || []

        const allPurchases = [...loaded, ...active]
        setLoadedPurchases(allPurchases)

        if (allPurchases.length > 0) {
          const firstPurchase = allPurchases[0]

          setValue('egg_vendor_purchase_id', firstPurchase)

          if (firstPurchase.purchase_date) {
            setValue('purchase_date', firstPurchase.purchase_date.split('T')[0])
          }

          if (firstPurchase.driver?.name) {
            setValue('name', firstPurchase.driver.name)
          }
        }
      } catch (err) {
        console.error('Failed to fetch distributor data', err)
      }
    }

    fetchDistributorData()
  }, [setValue])

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

  const handleStartTrip = async () => {
    setLoading(true);

    try {
      const purchasesToStart = loadedPurchases.filter(p => p.status === 'loaded');

      if (purchasesToStart.length === 0) {
        toast.error("No loaded purchases to start.");
        return;
      }

      // Start all loaded purchases
      for (const purchase of purchasesToStart) {
        await axiosInstance.post(
          `/api/v1/shop/assignEggPurchaseToDistributor?egg_vendor_purchase_id=${purchase.id}`
        );
      }

      toast.success("Day trip started successfully.");

      // Do NOT reset the form to keep Distributor Name visible
      // resetBillForm();

      if (fetchData) fetchData();

      // Update local state to reflect 'active' status instead of removing them
      setLoadedPurchases(prevPurchases =>
        prevPurchases.map(p => ({ ...p, status: 'active' }))
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("quickBillAdded"));
      }

      if (handleClose) handleClose();

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = () => {
    router.push('/quickbillList')
  }

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold' }}>
          🚚 Start Route
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {roleName ? `Role: ${roleName}` : 'Distributor Section'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Section: Form Controls */}
        <Grid item xs={12} md={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <RHFInput
                control={control}
                name='name'
                label='Distributor Name'
                placeholder='Distributor Name'
                mandatory
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <RHFInput
                control={control}
                name="purchase_date"
                label="Date"
                placeholder="Select Date"
                inputType="date"
                mandatory
                disabled
              />
            </Grid>

            {loadedPurchases.map((purchase) => (
              <Grid item xs={12} key={purchase.id}>
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
                      label={(purchase?.status || 'LOADED').toUpperCase()}
                      color={purchase?.status?.toLowerCase() === 'active' ? 'success' : 'warning'}
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
                        {purchase?.id ? `#${purchase.id}` : 'Auto Generated'}
                      </Typography>
                    </Box>

                    {(purchase?.purchase_no) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Purchase No
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {purchase?.purchase_no}
                        </Typography>
                      </Box>
                    )}

                    {purchase?.created_at && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Trip Start Time
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {moment(purchase.created_at).format('hh:mm A')}
                        </Typography>
                      </Box>
                    )}

                    {(purchase?.vehicle?.registration_number || purchase?.vehicle?.name) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Vehicle Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {purchase?.vehicle?.registration_number || purchase?.vehicle?.name}
                        </Typography>
                      </Box>
                    )}

                    {(purchase?.driver?.name) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Driver Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {purchase?.driver?.name}
                        </Typography>
                      </Box>
                    )}

                    {(purchase?.vendor?.name) && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Vendor Name
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                          {purchase?.vendor?.name}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            ))}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleStartTrip}
                disabled={loading || !loadedPurchases.some(p => p.status === 'loaded')}
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
    </Card>
  )
}

export default AddDayTrip
