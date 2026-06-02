import {
  Card, Typography, Button,
  TextField,
  Box, useTheme, useMediaQuery, CircularProgress,
  Grid
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { useAuth } from 'src/hooks/useAuth'
import moment from 'moment'

const schema = yup.object().shape({
  shop_id: yup.mixed().required('Shop is required'),
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

const AddStocksForm = ({ handleClose, fetchData, selectedItem }: AddStocksFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [loading, setLoading] = useState(false)
  const [isNewCustomer, setIsNewCustomer] = useState(false)
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
      shop_id: null,
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
  const selectedPurchaseDate = watch('purchase_date')

  // Load existing data if selectedItem is present
  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.shop_id) {
        setValue('shop_id', { id: selectedItem.shop_id, name: selectedItem.shop?.name || 'Shop' })
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
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchDefaultCategories()
  }, [selectedItem])

  const handleQuantityChange = (index: number, value: string) => {
    const newPrices = [...prices]
    newPrices[index].quantity = value === "" ? "" : Number(value)
    setPrices(newPrices)
  }

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
          eggs: Number(item.quantity) || 0,
          category_id: item.category_id
        }))

      if (activeItems.length === 0) {
        toast.error('Please add quantity for at least one product')
        setLoading(false)
        return
      }

      const shopId = extractId(data.shop_id)
      if (!shopId) {
        toast.error('Please select a shop')
        setLoading(false)
        return
      }

      const eggVendorPurchaseId = extractId(data.egg_vendor_purchase_id)

      const payload = {
        shop_id: shopId,
        egg_vendor_purchase_id: eggVendorPurchaseId,
        notes: data.notes?.trim() || '',
        items: activeItems
      }

      const response = await axiosInstance.post('/api/v1/shop/addToShopStock', payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Stock added successfully')
        reset({
          shop_id: null,
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
        if (fetchData) {
          await fetchData()
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('stockAdded'))
        }
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
    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, height: '100%' }}>
      <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', mb: 2 }}>
        🥚 Add Stock
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>

          <Grid item xs={12}>
            <RHFAutoComplete
              control={control}
              name="shop_id"
              placeholder="Shop Name"
              labelinput="Shop Name"
              apiUrl="/api/v1/admin/getAllShops"
              labelKey="name"
              valueKey="id"
              required={!isNewCustomer}
              disabled={isNewCustomer}
            />
          </Grid>
          <Grid item xs={12}>
            <RHFAutoComplete
              control={control}
              name="egg_vendor_purchase_id"
              placeholder="Vehicle Details"
              labelinput="Vehicle Details"
              apiUrl="/api/v1/shop/getAllEggVendorPurchases"
              extraParams={{ start_date: selectedPurchaseDate, end_date: selectedPurchaseDate }}
              labelKey={(opt: any) => `${opt.driver?.name || 'N/A'} - ${opt.vehicle?.registration_number || 'N/A'} Date ${opt.purchase_date ? moment(opt.created_at).format('DD/MM/YYYY hh:mm A') : 'N/A'}`}
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
                {prices.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
              </Typography>
            </Box>
          </Grid>

          {/* Confirm Bill Button */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Stock'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default AddStocksForm
