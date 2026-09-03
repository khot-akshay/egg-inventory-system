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
  // sku: yup.string().required('SKU is required.').trim(),
  name: yup.string().required('Product Name is required.').trim(),
  egg_price_min: yup.number().required('Min Price is required.').min(0, 'Min Price must be positive'),
  egg_price_max: yup.number().required('Max Price is required.').min(yup.ref('egg_price_min'), 'Max Price must be greater than or equal to Min Price'),
  egg_price_6: yup.number().required('Egg Price (6) is required.').min(0, 'Egg Price (6) must be positive'),
  egg_price_12: yup.number().required('Egg Price (12) is required.').min(0, 'Egg Price (12) must be positive'),
  egg_price_30: yup.number().required('Egg Price (30) is required.').min(0, 'Egg Price (30) must be positive'),
})

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: any
  activeShopId?: string | number
}

const AddUpdatePrice = ({ open, handleClose, fetchData, selectedItem, activeShopId }: Props) => {
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
      egg_price_6: 0,
      egg_price_12: 0,
      egg_price_30: 0,
      is_active: true
    }
  })

  useEffect(() => {
    if (selectedItem) {
      reset({
        sku: selectedItem.sku || '',
        name: selectedItem.name || '',
        egg_price_min: Number(selectedItem.egg_price_min || 0),
        egg_price_max: Number(selectedItem.egg_price_max || 0),
        egg_price_6: Number(selectedItem.egg_price_6 || 0),
        egg_price_12: Number(selectedItem.egg_price_12 || 0),
        egg_price_30: Number(selectedItem.egg_price_30 || 0),
        is_active: selectedItem.isActive === true || selectedItem.is_active == 1 ? true : false,
      })
    } else {
      reset({
        sku: '',
        name: '',
        egg_price_min: 0,
        egg_price_max: 0,
        egg_price_6: 0,
        egg_price_12: 0,
        egg_price_30: 0,
        is_active: true
      })
    }
  }, [selectedItem, reset])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      let payload: any = {
        name: data.name,
        egg_price_min: data.egg_price_min,
        egg_price_max: data.egg_price_max,
        egg_price_6: data.egg_price_6,
        egg_price_12: data.egg_price_12,
        egg_price_30: data.egg_price_30,
        is_active: data.is_active ? 1 : 0
      }

      let url = selectedItem
        ? `/api/v1/admin/updateShopEggPrices?id=${selectedItem.id}`
        : `/api/v1/admin/createProduct`

      if (selectedItem && activeShopId === 'all') {
        payload = {
          id: selectedItem.category_id || selectedItem.id,
          egg_price_min: data.egg_price_min,
          egg_price_max: data.egg_price_max,
          egg_price_unit: "piece",
          egg_price_6: data.egg_price_6,
          egg_price_12: data.egg_price_12,
          egg_price_30: data.egg_price_30
        }
        url = `/api/v1/admin/bulkUpdateShopEggPrices`
      }

      const response = await axiosInstance.post(url, payload)
      if (response.data.success || response.status === 200 || response.status === 201) {
        handleClose()
        fetchData()
        toast.success(selectedItem ? 'Shop updated successfully.' : 'Shop added successfully.')
      }
    } catch (e: any) {
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
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', flexGrow: 1, paddingLeft: '10px' }}>
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
            {/* <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='sku' label='SKU' placeholder='SKU' mandatory={false} />
            </Grid> */}
            <Grid item xs={12} sm={12}>
              <RHFInput control={control} name='name' label='Product Name' placeholder='Product Name' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='egg_price_min' label='Min Egg Price' placeholder='Min Price' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='egg_price_max' label='Max Egg Price' placeholder='Max Price' mandatory />
            </Grid>
            <Grid item xs={12} sm={4}>
              <RHFInput control={control} name='egg_price_6' label='Egg Price (6)' placeholder='Price' mandatory />
            </Grid>
            <Grid item xs={12} sm={4}>
              <RHFInput control={control} name='egg_price_12' label='Egg Price (12)' placeholder='Price' mandatory />
            </Grid>
            <Grid item xs={12} sm={4}>
              <RHFInput control={control} name='egg_price_30' label='Egg Price (30)' placeholder='Price' mandatory />
            </Grid>

            {/* <Grid item xs={12}>
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
            </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            variant='outlined'
            onClick={handleClose}
          >
            Cancel
          </Button>
          <SubmitButton label={selectedItem ? 'Update Prices' : 'Add Prices'} isLoading={isLoading} isWidth={false} onSubmit={() => { }} />
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddUpdatePrice
