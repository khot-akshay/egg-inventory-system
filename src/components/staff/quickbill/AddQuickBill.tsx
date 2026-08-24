import {
  Card, Typography, Button,
  TextField, ToggleButton, ToggleButtonGroup,
  Box, useTheme, useMediaQuery, CircularProgress,
  Grid, Divider, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Tooltip, Chip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
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
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
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

const AddQuickBillForm = ({ handleClose, fetchData, selectedItem }: AddStocksFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))


  const [minRate, setMinRate] = useState<number | null>(null)
  const [maxRate, setMaxRate] = useState<number | null>(null)
  const [currentProductDetails, setCurrentProductDetails] = useState<any>(null)
  const [paymentType, setPaymentType] = useState('cash')
  const [unit, setUnit] = useState('');
  const [unitValue, setUnitValue] = useState(30);
  const [quantity, setQuantity] = useState<number>(0);
  const [damaged, setDamaged] = useState(0);
  const [isEditingEggPrice, setIsEditingEggPrice] = useState(false);
  const [eggPriceInputValue, setEggPriceInputValue] = useState('');
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
      category_id: { id: 1, name: 'Regular Size Eggs' } as any,
      rate_per_unit: null,
      purchase_date: new Date().toISOString().split('T')[0],
      customer_name: '',
      phone_number: '',
      mixed_cash: null,
      mixed_online: null
    }
  })

  const rate = watch('rate_per_unit')
  const selectedCategory = watch('category_id')
  const selectedCustomer = watch('customer_id')
  const selectedPurchaseDate = watch('purchase_date')

  // Computed per-egg price for display
  const perEggPrice = rate && unit && unit !== 'custom' ? rate / unitValue : rate

  const { user } = useAuth()
  const currentStaffShopId = user?.shop_id || user?.shop?.id;
  const roleName = user?.roles?.[0]?.name || '';


  const resetBillForm = () => {
    reset({
      customer_id: null,
      category_id: { id: 1, name: 'Regular Size Eggs' } as any,
      rate_per_unit: null,
      customer_name: '',
      phone_number: '',
      mixed_cash: null,
      mixed_online: null
    })

    setUnit('')
    setUnitValue(30)
    setQuantity(0)
    setDamaged(0)
    setCart([])
    setPendingAmount(null)
    setIsNewCustomer(false)
    setPaymentType('cash')
    setIsEditingEggPrice(false)
    setEggPriceInputValue('')

    setMinRate(null)
    setMaxRate(null)
    setCurrentProductDetails(null)
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
      setQuantity(Number(selectedItem.quantity))
      setDamaged(selectedItem.damaged_eggs)
    }
  }, [selectedItem, setValue])

  useEffect(() => {
    if (!selectedCustomer && !isNewCustomer && paymentType === 'credit') {
      setPaymentType('cash')
    }
  }, [selectedCustomer, isNewCustomer, paymentType])

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

  const totalEggs = Number(quantity) * unitValue
  const finalEggs = totalEggs - damaged

  const handleUnitChange = (_: any, value: any) => {
    if (!value) return
    setUnit(value)
    let val = 1
    let newUnitValue = 1

    if (value === 'tray') {
      val = 30
      newUnitValue = 30
      // Directly use the fixed tray price from product details
      const price30 = currentProductDetails?.egg_price_30
      if (price30 != null) {
        setValue('rate_per_unit', parseFloat(String(price30)))
      }
    } else if (value === 'dozen') {
      val = 12
      newUnitValue = 12
      // Directly use the fixed dozen price from product details
      const price12 = currentProductDetails?.egg_price_12
      if (price12 != null) {
        setValue('rate_per_unit', parseFloat(String(price12)))
      }
    } else if (value === 'half_dozen') {
      val = 6
      newUnitValue = 6
      // Directly use the fixed half-dozen price from product details
      const price6 = currentProductDetails?.egg_price_6
      if (price6 != null) {
        setValue('rate_per_unit', parseFloat(String(price6)))
      }
    }

    setQuantity(val)
    setUnitValue(newUnitValue)
    setEggPriceInputValue('')
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
              setCurrentProductDetails(product)
              const min = parseFloat(product.egg_price_min)
              const max = parseFloat(product.egg_price_max)

              if (!isNaN(min) && !isNaN(max)) {
                setMinRate(min)
                setMaxRate(max)
              }
            } else {
              setMinRate(null)
              setMaxRate(null)
              setCurrentProductDetails(null)
            }
          }
        } catch (error) {
          setMinRate(null)
          setMaxRate(null)
          setCurrentProductDetails(null)
        }
      }
    };

    fetchProductRates()
  }, [selectedCategory, setValue])

  // Update egg price input value when perEggPrice changes from external calculations
  useEffect(() => {
    if (!isEditingEggPrice && perEggPrice !== null && perEggPrice !== undefined) {
      setEggPriceInputValue(perEggPrice.toFixed(2));
    }
  }, [perEggPrice, isEditingEggPrice]);

  const resetProductFields = () => {
    setValue('category_id', { id: 1, name: 'Regular Size Eggs' } as any)
    setValue('rate_per_unit', null)

    setUnit('')
    setUnitValue(30)

    setQuantity(0)
    setDamaged(0)

    setMinRate(null)
    setMaxRate(null)
    setEggPriceInputValue('')
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
      rate: perEggPrice || 0,
      total: quantity * (perEggPrice || 0)
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
      const lineTotal = quantity * (perEggPrice || 0);
      // Determine the overall total amount based on cart or single item
      const totalAmount = cart.length > 0 ? grandTotal : lineTotal;

      // Create rounded bill total for backend validation
      const roundedBillTotal = Math.round(totalAmount);

      // Validate mixed payment amounts
      if (paymentType === 'mixed') {
        const totalPaid = cashAmount + upiAmount;

        // Never allow overpayment
        if (totalPaid > roundedBillTotal) {
          toast.error('Total payment cannot exceed the bill amount.');
          setLoading(false);
          return;
        }

        // Without customer, full payment is required (skip if creating a new customer)
        if (!selectedCustomer && !isNewCustomer && totalPaid !== roundedBillTotal) {
          toast.error('Please pay the full bill amount or select a customer for the remaining credit amount.');
          setLoading(false);
          return;
        }

        // With customer, partial payment is allowed
      }

      // const paidAmount = paymentType === 'mixed' ? cashAmount + upiAmount : totalAmount;
      const paidAmount =
        paymentType === 'credit'
          ? 0
          : paymentType === 'mixed'
            ? cashAmount + upiAmount
            : roundedBillTotal;
      let payments: { amount: number; payment_type: string }[] = [];
      // Build lines for payload
      let lines: { category_id: any; quantity: number; unit_cost: number; unit_type: string; unit_value: number }[] = [];
      if (cart.length > 0) {
        lines = cart.map(item => ({
          category_id: item.category_id,
          quantity: item.quantity,
          unit_cost: Number(item.rate.toFixed(2)),
          unit_type: item.unit,
          unit_value: item.unit_value
        }));
      } else if (watch('category_id') && quantity > 0 && watch('rate_per_unit')) {
        const cat = watch('category_id');
        const catId = typeof cat === 'object' && cat.id ? cat.id : cat;
        // When bundle toggle is active, rate_per_unit is the total bundle price (e.g. 35 for 6 eggs)
        // Backend expects per-egg cost, so divide by quantity
        const rateValue = Number(watch('rate_per_unit'));
        const costPerUnit = ['tray', 'dozen', 'half_dozen'].includes(unit) ? rateValue / unitValue : rateValue;
        lines = [{
          category_id: catId,
          quantity,
          unit_cost: Number(costPerUnit.toFixed(2)),
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
          amount: roundedBillTotal,
          payment_type: paymentType
        }];
      }

      if (cart.length === 0 && (!quantity || quantity <= 0)) {
        toast.error('Quantity is required');
        setLoading(false);
        return;
      }

      const payload = {
        customer_id: isNewCustomer ? null : extractId(data.customer_id),
        customer_name: isNewCustomer ? data.customer_name : null,
        phone_number: isNewCustomer ? data.phone_number : null,
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

        // Refetch the customer list so that any newly created customer shows up
        try {
          await axiosInstance.get('/api/v1/shop/getAllCustomers');
        } catch (e) {
          console.error('Failed to refetch customer list:', e);
        }

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
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', mb: 2 }}>
            🥚 Quick Bill
          </Typography>
          {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>{roleName}</Typography> */}
        </Grid>
        <Grid
          item
          xs={6}
          md={8}

        >
          {/* {pendingAmount !== null && ( */}
          <Chip
            label={`DUE: ₹${Number(pendingAmount).toFixed(2)}`}
            color={pendingAmount > 0 ? 'error' : 'success'}
            sx={{ fontWeight: 'bold' }}
          />
          {/* )} */}
        </Grid>
        <Grid
          item
          xs={6}
          md={4}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Tooltip title="View Quick Bills List">
            <Button
              variant="contained"
              onClick={() => handleViewUser()}
            >
              Bills List
            </Button>
          </Tooltip>
        </Grid>
      </Grid>



      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Shop Selection */}
          <Grid item xs={8}>
            <RHFAutoComplete
              control={control}
              name="customer_id"
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
              name="category_id"
              placeholder="Select Product"
              labelinput="Product Name"
              apiUrl="/api/v1/admin/getAllCategories"
              extraParams={{ shop_id: currentStaffShopId || '' }}
              dataKey="data.categories"
              labelKey="name"
              valueKey="id"
              returnObject={true}
              required
              multiple={false}
            />
          </Grid>



          {/* Integrated Unit and Quantity Selection */}
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={6}>
                <Typography className="input-label">
                  Unit Type
                </Typography>
                <ToggleButtonGroup
                  value={unit}
                  exclusive
                  onChange={handleUnitChange}
                  fullWidth
                  color="success"
                  sx={{
                    bgcolor: 'background.paper',
                    height: 40,
                    '& .MuiToggleButton-root': {
                      borderRadius: 1,
                      mx: 0.2,
                      border: '1px solid !important',
                      borderColor: 'divider',
                      fontSize: '0.75rem',
                      px: 1
                    }
                  }}
                >
                  <ToggleButton value="tray">30</ToggleButton>
                  <ToggleButton value="dozen">12</ToggleButton>
                  <ToggleButton value="half_dozen">6</ToggleButton>
                </ToggleButtonGroup>
              </Grid>

              {(minRate !== null && maxRate !== null) && (
                <>
                  {/* <Grid item xs={6}>
                <Typography className="input-label">
                  Price Range
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={maxRate !== minRate ? 6 : 12}>
                    <Button
                      fullWidth
                      variant={watch('rate_per_unit') === minRate ? "contained" : "outlined"}
                      onClick={() => setValue('rate_per_unit', minRate)}
                      sx={{ height: 40 }}
                    >
                      {minRate?.toFixed(2)}
                    </Button>
                  </Grid>
                  {maxRate !== minRate && (
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant={watch('rate_per_unit') === maxRate ? "contained" : "outlined"}
                        onClick={() => setValue('rate_per_unit', maxRate)}
                        sx={{ height: 40 }}
                      >
                        {maxRate?.toFixed(2)}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid> */}

                  <Grid item xs={6}>
                    <Typography className="input-label">
                      Egg Price {minRate?.toFixed(2)} to  {maxRate?.toFixed(2)}
                    </Typography>
                    <TextField
                      placeholder="Egg Price"
                      type="number"
                      value={isEditingEggPrice ? eggPriceInputValue : (perEggPrice !== null && perEggPrice !== undefined ? perEggPrice.toFixed(2) : '')}
                      onFocus={() => {
                        setIsEditingEggPrice(true);
                        setEggPriceInputValue(perEggPrice !== null && perEggPrice !== undefined ? perEggPrice.toFixed(2) : '');
                      }}
                      onBlur={() => {
                        setIsEditingEggPrice(false);
                        setEggPriceInputValue('');
                      }}
                      onChange={(e) => {
                        setEggPriceInputValue(e.target.value);
                        const val = parseFloat(e.target.value);
                        // Convert per-egg price back to bundle price
                        const bundlePrice = (unit && unit !== 'custom' && val) ? val * unitValue : val;
                        setValue('rate_per_unit', isNaN(bundlePrice) ? null : bundlePrice);
                      }}
                      inputProps={{ step: "0.01", min: "0" }}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': { height: 40, borderRadius: 1 }
                      }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={6}>
                <Typography className="input-label">
                  Quantity
                </Typography>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={3}>
                    <Button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      fullWidth
                      variant='outlined'
                      sx={{
                        height: 40,
                        minWidth: 0,
                        borderRadius: 1,
                        fontSize: '1.2rem',
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' }
                      }}
                    >
                      −
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        height: 40,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <TextField
                        type="number"
                        value={quantity || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setQuantity(val);
                          // Clear unit selection if manual value doesn't match presets
                          if (val !== 30 && val !== 12 && val !== 6) {
                            setUnit('custom');
                          } else if (val === 30) setUnit('tray');
                          else if (val === 12) setUnit('dozen');
                          else if (val === 6) setUnit('half_dozen');
                        }}
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
                  <Grid item xs={3}>
                    <Button
                      onClick={() => setQuantity(q => q + 1)}
                      fullWidth
                      variant='contained'
                      color='success'
                      sx={{
                        height: 40,
                        minWidth: 0,
                        borderRadius: 1,
                        fontSize: '1.2rem',
                        boxShadow: 'none'
                      }}
                    >
                      +
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mr: 1, fontWeight: 'bold' }}>
                    Total Amount:
                  </Typography>
                  {quantity > 0 && perEggPrice && watch('category_id') ? (
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ₹{(quantity * perEggPrice).toFixed(2)}
                    </Typography>
                  ) : (
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ₹0.00
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Add to List Button */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={handleAddToCart}
              startIcon={<ShoppingCartIcon />}
              sx={{ mt: 1, borderRadius: 2, height: 45, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
            >
              Add to Bill
            </Button>
          </Grid>

          {/* Cart Table */}
          {cart.length > 0 && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Added Products
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: hexToRGBA(theme.palette.success.main, 0.12) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{item.product_name}</TableCell>
                          <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{item.quantity}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem' }}>₹{item.rate.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.8rem', fontWeight: 'bold' }}>₹{item.total.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => removeFromCart(index)}>
                              <DeleteIcon fontSize="inherit" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
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
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    ₹{grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </>
          )}

          {/* Payment Type Selection */}
          <Grid item xs={12}>
            <Typography className="input-label">
              Payment Type
            </Typography>
            <Grid container spacing={2}>
              {[
                { id: 'cash', label: 'Cash', icon: <LocalAtmIcon /> },
                { id: 'upi', label: 'Online', icon: <PhonelinkRingIcon /> },
                { id: 'credit', label: 'Credit', icon: <EventNoteIcon /> },
                { id: 'mixed', label: 'Mixed', icon: <EventNoteIcon /> }
              ].filter(type => type.id !== 'credit' || selectedCustomer || isNewCustomer).map(type => (
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

          {/* Mixed Payment Details */}
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
                    label="UPI Amount"
                    type="number"
                    placeholder="Enter UPI"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Confirm Bill Button */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
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
