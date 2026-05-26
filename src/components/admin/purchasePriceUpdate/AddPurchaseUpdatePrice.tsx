import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Box, IconButton, Typography, Switch, FormControlLabel, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import Icon from 'src/@core/components/icon'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import toast, { Toaster } from 'react-hot-toast'

const schema = yup.object().shape({
  sku: yup.string().required('SKU is required.').trim(),
  name: yup.string().required('Product Name is required.').trim(),
  egg_price_min: yup.number().required('Min Price is required.').min(0, 'Min Price must be positive'),
  egg_price_max: yup.number().required('Max Price is required.').min(yup.ref('egg_price_min'), 'Max Price must be greater than or equal to Min Price'),
})

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: any
}

const AddPurchaseUpdatePrice = ({ open, handleClose, fetchData, selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({ 
    resolver: yupResolver(schema),
    defaultValues: {
      sku: '',
      name: '',
      egg_price_min: 0,
      egg_price_max: 0,
      is_active: true
    }
  })

  useEffect(() => {
    if (selectedItem) {
      reset({
        sku: selectedItem.sku || '',
        name: selectedItem.name || '',
        egg_price_min: selectedItem.egg_price_min || 0,
        egg_price_max: selectedItem.egg_price_max || 0,
        is_active: selectedItem.isActive === true || selectedItem.is_active == 1 ? true : false,
      })
    } else {
      reset({
        sku: '',
        name: '',
        egg_price_min: 0,
        egg_price_max: 0,
        is_active: true
      })
    }
  }, [selectedItem, reset])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      let payload = {
        sku: data.sku,
        name: data.name,
        egg_price_min: data.egg_price_min,
        egg_price_max: data.egg_price_max,
        is_active: data.is_active ? 1 : 0
      }

      let url = selectedItem 
        ? `/api/v1/admin/updateShopEggPrices?id=${selectedItem.id}` 
        : `/api/v1/admin/createProduct`

      const response = await axiosInstance.post(url, payload)
      if (response.data.success || response.status === 200 || response.status === 201) {
        handleClose()
        fetchData()
        toast.success(selectedItem ? 'Shop updated successfully.' : 'Shop added successfully.')
      }
    } catch (e: any) {
      console.error(e)
      toast.error(
        selectedItem
          ? e?.response?.data?.message ?? 'Failed to update shop. Please try again.'
          : e?.response?.data?.message ?? 'Failed to add shop. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={'md'}
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#3A4E7C0F'
        }}
      >
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', flexGrow: 1,paddingLeft: '10px' }}>
          {selectedItem ? 'Update' : 'Add'} Egg Prices
        </Typography>
         <IconButton onClick={handleClose}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
         
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Toaster position="top-right" reverseOrder={false} />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='sku' label='SKU' placeholder='SKU' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='name' label='Product Name' placeholder='Product Name' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='egg_price_min' label='Min Egg Price' type='number' placeholder='Min Price' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='egg_price_max' label='Max Egg Price' type='number' placeholder='Max Price' mandatory />
            </Grid>
            <Grid item xs={12}>
               <Box sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={watch("is_active")}
                      onChange={(e) => setValue("is_active", e.target.checked)}
                    />
                  }
                  label={watch("is_active") ? "Active" : "Inactive"}
                />
               </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button
            variant='outlined'
            onClick={handleClose}
          >
            Cancel
          </Button>
          <SubmitButton label={selectedItem ? 'Update Prices' : 'Add Prices'} isLoading={isLoading} isWidth={false} />
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddPurchaseUpdatePrice
