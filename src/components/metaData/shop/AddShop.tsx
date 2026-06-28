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
  code: yup.string().required('Shop Code is required.').trim(),
  name: yup.string().required('Shop Name is required.').trim(),
  address_line1: yup.string().required('Address is required.').trim(),
  city: yup.string().required('City is required.').trim(),
  phone: yup
    .string()
    .required('Phone Number is required.')
    .matches(/^\d{10}$/, 'Phone Number must be exactly 10 digits.')
    .trim()
})

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: any
}

const AddShop = ({ open, handleClose, fetchData, selectedItem }: Props) => {
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
      code: '',
      name: '',
      address_line1: '',
      city: '',
      phone: '',
      is_active: true
    }
  })

  useEffect(() => {
    if (selectedItem) {
      reset({
        code: selectedItem.code || '',
        name: selectedItem.name || '',
        address_line1: selectedItem.address_line1 || '',
        city: selectedItem.city || '',
        phone: selectedItem.phone || '',
        is_active: selectedItem.isActive === true || selectedItem.is_active == 1 ? true : false,
      })
    } else {
      reset({
        code: '',
        name: '',
        address_line1: '',
        city: '',
        phone: '',
        is_active: true
      })
    }
  }, [selectedItem, reset])

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      let payload = {
        code: data.code,
        name: data.name,
        address_line1: data.address_line1,
        city: data.city,
        phone: data.phone,
        is_active: data.is_active ? 1 : 0
      }

      let url = selectedItem 
        ? `/api/v1/admin/updateShop?id=${selectedItem.id}` 
        : `/api/v1/admin/createShop`

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
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', flexGrow: 1,paddingLeft: '10px' }}>
          {selectedItem ? 'Update' : 'Add'} Shop
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
              <RHFInput control={control} name='code' label='Shop Code' placeholder='Shop Code' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='name' label='Shop Name' placeholder='Shop Name' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='phone' label='Phone Number' placeholder='Phone Number' mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name='city' label='City' placeholder='City' mandatory />
            </Grid>
            <Grid item xs={6}>
              <RHFInput control={control} name='address_line1' label='Address Line 1' placeholder='Address Line 1' mandatory />
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
          <SubmitButton label={selectedItem ? 'Update Shop' : 'Add Shop'} isLoading={isLoading} isWidth={false} />
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddShop
