import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Box, IconButton, Typography, Button, FormControlLabel, FormHelperText, Switch } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import RHFNumberInput from 'src/hook-forms/RHFNUmberInput'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import toast, { Toaster } from 'react-hot-toast'
import UploadFile from 'src/components/common/fileupload/singleFileUpload'

type OptionItem = { label: string; value: number | string }

const schema = yup.object().shape({
  registration_number: yup
    .string()
    .required('Registration number is required.')
    .trim(),
  name: yup
    .string()
    .required('Vehicle name is required.')
    .matches(/^\S(.*\S)?$/, 'Vehicle name cannot have leading or trailing spaces.')
    .matches(/^(?!.*\s{2,}).*$/, 'Vehicle name cannot have excessive spaces between words.')
    .min(3, 'Vehicle name must be at least 3 characters long.')
    .max(100, 'Vehicle name cannot be more than 100 characters long.')
    .trim(),
  vehicle_type: yup
    .string()
    .required('Vehicle type is required.')
    .trim(),
  capacity_kg: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : Number(value)))
    .nullable()
    .required('Capacity is required.')
    .min(0, 'Capacity must be 0 or greater.')
    .typeError('Capacity must be a valid number'),
  assigned_user_id: yup
    .mixed()
    .required('Assigned user is required.'),
  driver_id: yup
    .mixed()
    .required('Driver is required.'),
  shop_id: yup
    .mixed()
    .required('Shop is required.'),
  notes: yup
    .string()
    .nullable()
    .trim(),
  is_active: yup.boolean().required('Please set the vehicle status.')
})

interface FormData {
  registration_number: string
  name: string
  vehicle_type: string
  capacity_kg: number | null
  assigned_user_id: any
  driver_id: any
  shop_id: any
  notes: string
  is_active: boolean
}

interface SelectedItem {
  id: any;
  registration_number?: string;
  name?: string;
  vehicle_type?: string;
  capacity_kg?: number | null;
  assigned_user_id?: number | null;
  assigned_user?: { name: string };
  driver_id?: number | null;
  driver?: { name: string };
  shop_id?: number | null;
  shop?: { name: string };
  notes?: string;
  is_active?: boolean;
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
}

const defaultValues: Partial<FormData> = {
  registration_number: '',
  name: '',
  vehicle_type: '',
  capacity_kg: null,
  assigned_user_id: null,
  driver_id: null,
  shop_id: null,
  notes: '',
  is_active: true
}

const AddVehicles = ({ open, handleClose, fetchData, selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [defaultPhoto, setDefaultPhoto] = useState([])

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
        registration_number: data.registration_number.trim(),
        name: data.name.trim(),
        vehicle_type: data.vehicle_type.trim(),
        capacity_kg: data.capacity_kg,
        assigned_user_id: extractId(data.assigned_user_id),
        driver_id: extractId(data.driver_id),
        shop_id: extractId(data.shop_id),
        notes: data.notes?.trim() || '',
        is_active: data.is_active
      }
      let url = ''
      if (selectedItem) {
        url = `/api/v1/admin/updateVehicle?id=${selectedItem.id}`
      } else {
        url = '/api/v1/admin/createVehicle'
      }
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
          ? e?.response?.data?.message ?? 'Failed to update vehicle. Please try again.'
          : e?.response?.data?.message ?? 'Failed to add vehicle. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    if (selectedItem) {
      setValue('registration_number', selectedItem?.registration_number ?? '')
      setValue('name', selectedItem?.name ?? '')
      setValue('vehicle_type', selectedItem?.vehicle_type ?? '')
      setValue('capacity_kg', selectedItem?.capacity_kg ?? null)
      setValue('notes', selectedItem?.notes ?? '')

      if (selectedItem?.assigned_user_id) {
        setValue('assigned_user_id', { id: selectedItem?.assigned_user_id, name: selectedItem?.assigned_user?.name || 'User' })
      }

      if (selectedItem?.driver_id) {
        setValue('driver_id', { id: selectedItem?.driver_id, name: selectedItem?.driver?.name || 'Driver' })
      }

      if (selectedItem?.shop_id) {
        setValue('shop_id', { id: selectedItem?.shop_id, name: selectedItem?.shop?.name || 'Shop' })
      }

      setValue('is_active', typeof selectedItem?.is_active === 'boolean' ? selectedItem.is_active : true)
    } else {
      reset(defaultValues)
    }
  }, [selectedItem, reset, setValue])



  const handleCloseModal = () => {
    reset(defaultValues)
    handleClose()
  }

  const handleImage = (value: any) => {
    // value should be an array of File(s)
    /*
    if (value && value.length > 0) {
      setValue('images' as any, value)
    }
    if (selectedItem) {
      setDefaultPhoto([(selectedItem as any).images])
    }
    */
  }
  useEffect(() => {
    if (selectedItem) {
      /*
      setValue('title' as any, (selectedItem as any)?.title)
      setValue('sub_title' as any, (selectedItem as any)?.sub_title)
      setDefaultPhoto([(selectedItem as any).images])
      */
    }
  }, [selectedItem])
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
      {' '}
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
          {selectedItem ? 'Update' : 'Add'} Vehicle{' '}
        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'registration_number'} label={'Registration Number'} placeholder={'e.g. MH12AB1234'} mandatory />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'name'} label={'Vehicle Name'} placeholder={'e.g. Tata Ace'} mandatory />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'vehicle_type'} label={'Vehicle Type'} placeholder={'e.g. Mini Truck'} mandatory />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFNumberInput
                control={control}
                name={'capacity_kg'}
                label={'Capacity (kg)'}
                placeholder={'e.g. 1200'}
                min={0}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name="assigned_user_id"
                placeholder="Select Assigned User"
                labelinput="Select Assigned User"
                apiUrl="/api/v1/admin/getAllUsers"
                labelKey="name"
                valueKey="id"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name="driver_id"
                placeholder="Select Driver"
                labelinput="Select Driver"
                apiUrl="/api/v1/admin/getAllUsers"
                labelKey="name"
                valueKey="id"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            </Grid>
            <Grid item xs={12} md={12}>
              <RHFInput control={control} name={'notes'} label={'Notes'} placeholder={'Enter any notes...'} multiline rows={3} />
            </Grid>
            
          
            {selectedItem && <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
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
            </Grid>}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ mt: 3 }}>
          <Button
            variant='outlined'
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
          <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
        </DialogActions>
      </form>
      {/* <IconPicker/> */}
    </Dialog>
  )
}

export default AddVehicles
