import {
  Card, Typography, Button,
  TextField, ToggleButton, ToggleButtonGroup,
  Box, useTheme, useMediaQuery, CircularProgress,
  Grid, Divider
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axiosInstance from 'src/services/axios'
import toast from 'react-hot-toast'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'

const schema = yup.object().shape({
  shop_id: yup.mixed().required('Shop is required'),
  product_id: yup.mixed().required('Product is required'),
  rate_per_unit: yup.number().required('Rate is required').min(0, 'Rate must be positive'),
})

interface AddStocksFormProps {
  open?: boolean
  handleClose?: () => void
  fetchData?: () => void
  selectedItem?: any
}

const AddStocksForm = ({ handleClose, fetchData, selectedItem }: AddStocksFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [unit, setUnit] = useState('tray')
  const [unitValue, setUnitValue] = useState(30)
  const [quantity, setQuantity] = useState(1)
  const [damaged, setDamaged] = useState(0)
  const [loading, setLoading] = useState(false)

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
      product_id: null,
      rate_per_unit: 150
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
        shop_id: extractId(data.shop_id),
        product_id: extractId(data.product_id),
        unit_type: unit,
        unit_value: unitValue,
        quantity: quantity,
        total_eggs: totalEggs,
        rate_per_unit: data.rate_per_unit,
        damaged_eggs: damaged,
        final_eggs: finalEggs,
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
        🥚 Add Stock
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Shop Selection */}
          <Grid item xs={12}>
            <RHFAutoComplete
              control={control}
              name="shop_id"
              placeholder="Select Shop"
              labelinput="Shop Name"
              apiUrl="/api/v1/admin/getAllShops"
              labelKey="name"
              valueKey="id"
              required
            />
          </Grid>

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

          {/* Unit Selection and Rate */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
              Unit Type
            </Typography>
            <ToggleButtonGroup
              fullWidth
              value={unit}
              exclusive
              onChange={handleUnitChange}
              size={isMobile ? "small" : "medium"}
              color="primary"
            >
              <ToggleButton value="tray">Tray</ToggleButton>
              <ToggleButton value="dozen">Dozen</ToggleButton>
              <ToggleButton value="single">Single</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
              Rate per Unit
            </Typography>
            <Controller
              name="rate_per_unit"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  size={isMobile ? "small" : "medium"}
                  error={!!errors.rate_per_unit}
                  helperText={errors.rate_per_unit?.message as string}
                />
              )}
            />
          </Grid>

          {/* Quantity Selection */}
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
              Quantity
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              {[1, 2, 3, 4].map(q => (
                <Button
                  key={q}
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => setQuantity(q)}
                  sx={{ borderRadius: 1.5 }}
                >
                  {q}
                </Button>
              ))}
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper'
              }}
            >
              <Button 
                size="small" 
                variant="text" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                sx={{ minWidth: 40 }}
              >-</Button>
              <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {quantity} {unit}(s)
              </Typography>
              <Button 
                size="small" 
                variant="text" 
                onClick={() => setQuantity(q => q + 1)}
                sx={{ minWidth: 40 }}
              >+</Button>
            </Box>
          </Grid>

          {/* Total and Damaged */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ 
              p: 1.5, 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Total Eggs</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalEggs}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ 
              p: 1, 
              border: '1px dashed', 
              borderColor: 'error.light', 
              borderRadius: 2,
              bgcolor: 'error.lighter'
            }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', textAlign: 'center', mb: 0.5 }}>
                Damaged
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error"
                  onClick={() => setDamaged(d => Math.max(0, d - 1))}
                  sx={{ minWidth: 30, p: 0, height: 30 }}
                >-</Button>
                <Typography sx={{ minWidth: 20, textAlign: 'center', fontWeight: 'bold' }}>{damaged}</Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error"
                  onClick={() => setDamaged(d => d + 1)}
                  sx={{ minWidth: 30, p: 0, height: 30 }}
                >+</Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
              <Typography variant="body2" color="text.secondary">Final Eggs:</Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>{finalEggs}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ 
                height: isMobile ? 45 : 50, 
                borderRadius: 2, 
                fontWeight: 'bold',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Stock'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  )
}

export default AddStocksForm