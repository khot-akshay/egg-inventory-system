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
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import toast, { Toaster } from 'react-hot-toast'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing'
import { useAuth } from 'src/hooks/useAuth'

const schema = yup.object().shape({
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0'),
  method: yup
    .string()
    .required('Payment method is required'),
  mixed_cash: yup.number().nullable(),
  mixed_online: yup.number().nullable(),
  party_type: yup
    .string()
    .required('Party type is required'),
  vendor_id: yup
    .mixed()
    .nullable(),
  description: yup
    .string()
    .required('Description is required'),
  entry_date: yup
    .string()
    .required('Entry date is required')
})

interface FormData {
  amount: number
  method: string
  mixed_cash?: number | null
  mixed_online?: number | null
  party_type: string
  vendor_id?: any
  description: string
  entry_date: string
}

interface SelectedItem {
  id?: number
  amount?: number
  method?: string
  party_type?: string
  vendor_id?: any
  description?: string
  entry_date?: string
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: () => void
  selectedItem?: SelectedItem
}

const defaultValues: FormData = {
  amount: null,
  method: 'cash',
  mixed_cash: null,
  mixed_online: null,
  party_type: 'vendor',
  vendor_id: null,
  description: '',
  entry_date: new Date().toISOString().split('T')[0]
}

const AddManulyEntry = ({
  open,
  handleClose,
  fetchData,
  selectedItem
}: Props) => {
  const { user } = useAuth()
  const shopId = user?.shop_id || user?.shop?.id
  const [isLoading, setIsLoading] = useState(false)
  const [paymentType, setPaymentType] = useState('cash')

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const mixedCash = watch('mixed_cash')
  const mixedOnline = watch('mixed_online')

  useEffect(() => {
    if (paymentType === 'mixed') {
      const total = Number(mixedCash || 0) + Number(mixedOnline || 0)
      setValue('amount', total, {
        shouldValidate: true,
        shouldDirty: true
      })
    }
  }, [mixedCash, mixedOnline, paymentType, setValue])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const cashAmount = Number(data.mixed_cash)
      const onlineAmount = Number(data.mixed_online)
      const finalAmount = paymentType === 'mixed'
        ? cashAmount + onlineAmount
        : Number(data.amount)

      if (paymentType === 'mixed' && finalAmount <= 0) {
        toast.error('Please enter cash or online amount')
        setIsLoading(false)
        return
      }

      const payload = {
        direction: 'out',
        method: paymentType,
        amount: finalAmount,
        party_type: data.party_type,
        vendor_id: data.vendor_id ? (typeof data.vendor_id === 'object' ? data.vendor_id.id : data.vendor_id) : null,
        shop_id: shopId,
        entry_date: data.entry_date,
        description: data.description
      }

      const response = await axiosInstance.post('/api/v1/admin/createCashbookEntry', payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Cashbook entry created successfully')
        handleCloseModal()
        fetchData()
      } else {
        toast.error(response.data.message || 'Failed to create cashbook entry')
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
      } else {
        toast.error(e?.response?.data?.message || 'Failed to create cashbook entry')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedItem) {
      setValue('amount', selectedItem.amount || 0)
      setValue('method', selectedItem.method || 'cash')
      setValue('party_type', selectedItem.party_type || 'vendor')
      setValue('vendor_id', selectedItem.vendor_id || null)
      setValue('description', selectedItem.description || '')
      setValue('entry_date', selectedItem.entry_date || new Date().toISOString().split('T')[0])
      setPaymentType(selectedItem.method || 'cash')
    } else {
      reset(defaultValues)
      setPaymentType('cash')
    }
  }, [selectedItem, setValue, reset])

  const handleCloseModal = () => {
    reset(defaultValues)
    setPaymentType('cash')
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
          {selectedItem ? 'Update' : 'Add'} Cashbook Entry
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
              <RHFNumberInput
                control={control}
                name='amount'
                label='Amount'
                placeholder='Enter Amount'
                min={0}
                mandatory
                disabled={paymentType === 'mixed'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='entry_date'
                label='Entry Date'
                placeholder='Select Date'
                mandatory
              />
            </Grid>

            <Grid item xs={12}>
              <Typography className='input-label'>
                Payment Method
              </Typography>
              <Grid container spacing={2}>
                {[
                  { id: 'cash', label: 'Cash', icon: <LocalAtmIcon /> },
                  { id: 'online', label: 'Online', icon: <PhonelinkRingIcon /> },
                  { id: 'mixed', label: 'Mixed', icon: <LocalAtmIcon /> }
                ].map(type => (
                  <Grid item xs={3} key={type.id}>
                    <Button
                      fullWidth
                      variant={paymentType === type.id ? 'contained' : 'outlined'}
                      startIcon={type.icon}
                      onClick={() => {
                        setPaymentType(type.id)
                        setValue('method', type.id)

                        if (type.id === 'mixed') {
                          setValue('mixed_cash', null)
                          setValue('mixed_online', null)
                          setValue('amount', null)
                        } else {
                          setValue('mixed_cash', null)
                          setValue('mixed_online', null)
                          setValue('amount', null)
                        }
                      }}
                    >
                      <Typography variant='body2' sx={{ fontWeight: 500, color: 'inherit' }}>
                        {type.label}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {paymentType === 'mixed' && (
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <RHFInput
                      control={control}
                      name='mixed_cash'
                      label='Cash Amount'
                      type='number'
                      placeholder='Enter Cash'
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <RHFInput
                      control={control}
                      name='mixed_online'
                      label='Online Amount'
                      type='number'
                      placeholder='Enter Online'
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='party_type'
                label='Party Type'
                placeholder='Party Type'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='vendor_id'
                placeholder='Select Vendor'
                labelinput='Vendor'
                apiUrl='/api/v1/admin/getAllVendors'
                dataKey='data.vendors'
                labelKey='name'
                valueKey='id'
                returnObject={true}
                multiple={false}
                addbtn={false}
                handlebtnclick={() => {}}
                required={false}
              />
            </Grid>

            <Grid item xs={12}>
              <RHFInput
                control={control}
                name='description'
                label='Description'
                placeholder='Enter description'
                mandatory
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

export default AddManulyEntry