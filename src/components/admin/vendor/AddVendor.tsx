import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Box, IconButton, Typography, Button, FormControlLabel, FormHelperText, Switch } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import toast, { Toaster } from 'react-hot-toast'

type OptionItem = { label: string; value: number | string }

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Vendor Name is required.')
    .trim(),
  phone: yup
    .string()
    .required('Mobile Number is required.')
    .matches(/^[0-9]{10}$/, 'Mobile Number must be exactly 10 digits.')
    .trim(),
  // email: yup
  //   .string()
  //   .email('Invalid email address')
  //   .required('Email is required.')
  //   .trim(),
  // gstin: yup
  //   .string()
  //   .required('GSTIN is required.')
  //   .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
  //   .trim(),
  address: yup
    .string()
    .required('Address is required.')
    .trim(),
  // shop_id: yup
  //   .mixed()
  //   .required('Shop is required.'),
  is_active: yup.boolean().required('Please set the status.')
})

interface FormData {
  name: string
  phone: string
  email: string
  gstin: string
  address: string
  shop_id: any
  is_active: boolean
}

interface SelectedItem {
  id: any;
  name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  shop_id?: number | null;
  shop?: { name: string };
  is_active?: boolean | number;
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
}

const defaultValues: Partial<FormData> = {
  name: '',
  phone: '',
  email: '',
  gstin: '',
  address: '',
  shop_id: null,
  is_active: true
}

const AddVendor = ({ open, handleClose, fetchData, selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema), defaultValues })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const extractId = (value: any): number | null => {
        if (value === null || value === undefined) return null
        if (typeof value === 'number') return value
        if (typeof value === 'object' && value.id) return Number(value.id)
        return Number(value)
      }
      const payload = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        gstin: data.gstin.trim(),
        address: data.address.trim(),
        // shop_id: extractId(data.shop_id),
        is_active: data.is_active ? 1 : 0
      }
      let url = ''
      if (selectedItem) {
        console.log('selectedItem for update:', selectedItem) // debug - remove after fix
        if (!selectedItem.id) {
          toast.error('Vendor ID is missing. Cannot update.')
          return
        }
        url = `/api/v1/admin/updateVendor?id=${selectedItem.id}`
      } else {
        url = '/api/v1/admin/createVendor'
      }
      console.log('Submitting to URL:', url) // debug - remove after fix
      const response = await axiosInstance.post(url, payload)
      if (response.data.success) {
        handleCloseModal()
        fetchData()
        toast.success(response.data.message)
      }
    } catch (e: any) {
      console.error(e)
      toast.error(
        selectedItem
          ? e?.response?.data?.message ?? 'Failed to update vendor. Please try again.'
          : e?.response?.data?.message ?? 'Failed to add vendor. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedItem) {
      setValue('name', selectedItem?.name ?? '')
      setValue('phone', selectedItem?.phone ?? '')
      setValue('email', selectedItem?.email ?? '')
      setValue('gstin', selectedItem?.gstin ?? '')
      setValue('address', selectedItem?.address ?? '')

      if (selectedItem?.shop_id) {
        setValue('shop_id', { id: selectedItem?.shop_id, name: selectedItem?.shop?.name || 'Shop' })
      }

      const isActive = selectedItem?.is_active === true || selectedItem?.is_active === 1;
      setValue('is_active', isActive)
    } else {
      reset(defaultValues)
    }
  }, [selectedItem, reset, setValue])

  const handleCloseModal = () => {
    reset(defaultValues)
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      aria-labelledby='dialog-title'
      aria-describedby='dialog-description'
      maxWidth={'md'}
      fullWidth
      disableEnforceFocus={true}
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
        id='customized-dialog-title'
      >
        <Toaster position="top-right" reverseOrder={false} />
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'Start', flexGrow: 1, paddingLeft: '10px' }}>
          {selectedItem ? 'Update' : 'Add'} Vendor
        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name="shop_id"
                placeholder="Select Shop"
                labelinput="Select Shop"
                apiUrl="/api/v1/admin/getAllShops"
                labelKey="name"
                valueKey="id"
                required
              />
            </Grid> */}
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'name'} label={'Vendor Name'} placeholder={'Vendor Name'} mandatory />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'phone'} label={'Mobile Number'} placeholder={'Mobile Number'} mandatory />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'email'} label={'Email ID'} placeholder={'Email ID'}  mandatory={false} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'gstin'} label={'GST Number'} placeholder={'GST Number'} mandatory={false} />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'address'} label={'Address'} placeholder={'Address'} mandatory />
            </Grid>
            
            {selectedItem && (
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box>
                  <Controller
                    name='is_active'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={event => field.onChange(event.target.checked)}
                            color='primary'
                          />
                        }
                        label={field.value ? 'Active' : 'Inactive'}
                      />
                    )}
                  />
                  {errors.is_active && (
                    <FormHelperText sx={{ color: 'error.main', ml: 1 }}>
                      {errors.is_active.message}
                    </FormHelperText>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ mt: 3 }}>
          <Button variant='outlined' onClick={handleCloseModal}>
            Cancel
          </Button>
          <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddVendor
