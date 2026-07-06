import { yupResolver } from '@hookform/resolvers/yup'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  Button
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import RHFNumberInput from 'src/hook-forms/RHFNUmberInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import toast, { Toaster } from 'react-hot-toast'

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Customer name is required')
    .min(3, 'Minimum 3 characters'),

  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Enter valid 10 digit phone number'),

  email: yup
    .string()
    .email('Enter valid email')
    .nullable(),

  credit_limit: yup
    .number()
    .typeError('Credit limit must be a number')
    .required('Credit limit is required')
    .min(0, 'Credit limit cannot be negative')
})

interface FormData {
  name: string
  phone: string
  email: string
  credit_limit: number
}

interface SelectedItem {
  id?: number
  name?: string
  phone?: string
  email?: string
  credit_limit?: number
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: () => void
  selectedItem?: SelectedItem
}

const defaultValues: FormData = {
  name: '',
  phone: '',
  email: '',
  credit_limit: 0
}

const AddCustomer = ({
  open,
  handleClose,
  fetchData,
  selectedItem
}: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        credit_limit: Number(data.credit_limit)
      }

      let url = ''

      if (selectedItem) {
        url = `/api/v1/admin/updateCustomer?id=${selectedItem.id}`
      } else {
        url = '/api/v1/admin/createCustomer'
      }

      const response = await axiosInstance.post(url, payload)

      if (response.data.success) {
        toast.success(response.data.message)
        handleCloseModal()
        fetchData()
      }
    } catch (e: any) {
      if (e?.response?.data?.data) {
        const validationErrors = e.response.data.data
        Object.keys(validationErrors).forEach((key) => {
          setError(key as keyof FormData, {
            type: 'manual',
            message: validationErrors[key][0]
          })
        })
      }

      // toast.error(
      //   e?.response?.data?.message ??
      //     (selectedItem
      //       ? 'Failed to update customer'
      //       : 'Failed to add customer')
      // )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedItem) {
      setValue('name', selectedItem.name || '')
      setValue('phone', selectedItem.phone || '')
      setValue('email', selectedItem.email || '')
      setValue(
        'credit_limit',
        selectedItem.credit_limit || 0
      )
    } else {
      reset(defaultValues)
    }
  }, [selectedItem, setValue, reset])

  const handleCloseModal = () => {
    reset(defaultValues)
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth='md'
      fullWidth
      disableEnforceFocus
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme =>
            theme.palette.action.hover
        }}
      >
        <Toaster
          position='top-right'
          reverseOrder={false}
        />

        <Typography
          sx={{
            fontSize: '25px',
            fontWeight: 'bold',
            flexGrow: 1,
            pl: 1
          }}
        >
          {selectedItem ? 'Update' : 'Add'} Customer
        </Typography>

        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon
            sx={{ color: 'error.main' }}
            fontSize='large'
          />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='name'
                label='Customer Name'
                placeholder='Customer Name'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='phone'
                label='Phone Number'
                placeholder='Phone Number'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='email'
                label='Email'
                placeholder='Email ID'
                mandatory={false}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFNumberInput
                control={control}
                name='credit_limit'
                label='Credit Limit'
                placeholder='Credit Limit'
                min={0}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ mt: 3 }}>
          <Button
            variant='outlined'
            onClick={handleCloseModal}
          >
            Cancel
          </Button>

          <SubmitButton
            label='Submit'
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
            isWidth={false}
          />
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddCustomer