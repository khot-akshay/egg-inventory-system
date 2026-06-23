import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Box, IconButton, Typography, Button, FormControlLabel, FormHelperText, Switch } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import toast, { Toaster } from 'react-hot-toast'

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Product Grade Name is required.')
    // .matches(/^[a-zA-Z0-9\s]+$/, 'Product grade name cannot contain special characters.')
    .matches(/^\S(.*\S)?$/, 'Product grade name cannot have leading or trailing spaces.')
    .matches(/^(?!.*\s{2,}).*$/, 'Product grade name cannot have excessive spaces between words.')
    // .min(3, 'Product grade name must be at least 3 characters long.')
    .max(50, 'Product grade name cannot be more than 50 characters long.')
    .trim(),
  // display_order: yup
  //   .number()
  //   .typeError('Display order must be a number.')
  //   .required('Display order is required.')
  //   .integer('Display order must be an integer.')
  //   .min(1, 'Display order must be at least 1.')
  //   .positive('Display order must be a positive number.'),
  is_active: yup.boolean().required('Please set the product grade status.')
})

interface FormData {
  name: string
  // display_order: number
  is_active: boolean
}

interface SelectedItem {
  id: any;
  name: any;
  // display_order?: number;
  is_active?: boolean | number | string;
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
}

const defaultValues: FormData = {
  name: '',
  // display_order: 1,
  is_active: true
}

const AddProductsGrade = ({ open, handleClose, fetchData, selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema), defaultValues })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const payload = {
        name: data.name.trim(),
        // display_order: Number(data.display_order),
        is_active: data.is_active ? 1 : 0
      }
      let url = ''
      if (selectedItem) {
        url = `/api/v1/admin/productGrades/updateProductGrades/${selectedItem.id}`
      } else {
        url = '/api/v1/admin/productGrades/createProductGrades'
      }
      const response = await axiosInstance.post(url, payload)
      if (response.data.success) {
        handleCloseModal()
        fetchData()
        toast.success(selectedItem ? 'Product grade updated successfully.' : 'Product grade added successfully.')
      }
    } catch (e: any) {
      const apiError = e?.response?.data

      if (apiError?.data?.name?.length) {
        setError('name', {
          type: 'server',
          message: apiError.data.name[0] 
        })
        return
      }
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    if (selectedItem) {
      setValue('name', selectedItem?.name ?? '')
      // setValue('display_order', selectedItem?.display_order ?? 1)
      // Convert number (1/0) or string ('1'/'0') to boolean for the switch
      const isActiveValue = selectedItem?.is_active === true || selectedItem?.is_active === 1 || selectedItem?.is_active === '1';
      setValue('is_active', isActiveValue)
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
          {selectedItem ? 'Update' : 'Add'} Product Grade{' '}
        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <RHFInput control={control} name={'name'} label={'Product Grade Name'} placeholder={'Product Grade Name'} mandatory />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'display_order'} label={'Display Order'} placeholder={'1'} mandatory inputType='number' />
            </Grid> */}
            { selectedItem && <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
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

export default AddProductsGrade
