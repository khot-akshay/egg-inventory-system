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
import toast from 'react-hot-toast'
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing'
import EventNoteIcon from '@mui/icons-material/EventNote'

const schema = yup.object().shape({
  paid_amount: yup
    .number()
    .typeError('Paid amount must be a number')
    .required('Paid amount is required')
    .min(1, 'Paid amount must be greater than 0'),
  payment_type: yup
    .string()
    .nullable(),
  mixed_cash: yup.number().nullable(),
  mixed_online: yup.number().nullable()
})

interface FormData {
  paid_amount: number
  payment_type?: string | null
  mixed_cash?: number | null
  mixed_online?: number | null
}

interface SelectedItem {
  id?: number
  name?: string
  [key: string]: any
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: () => void
  selectedItem?: SelectedItem
}

const defaultValues: FormData = {
  paid_amount: null,
  payment_type: 'cash',
  mixed_cash: null,
  mixed_online: null
}

const PayDueAmountPopup = ({
  open,
  handleClose,
  fetchData,
  selectedItem
}: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentType, setPaymentType] = useState('cash')

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const mixedCash = watch('mixed_cash')
  const mixedOnline = watch('mixed_online')

  useEffect(() => {
    if (paymentType === 'mixed') {
      const total =
        Number(mixedCash || 0) + Number(mixedOnline || 0)

      setValue('paid_amount', total, {
        shouldValidate: true,
        shouldDirty: true
      })
    }
  }, [mixedCash, mixedOnline, paymentType, setValue])

  const onSubmit = async (data: FormData) => {
    if (!selectedItem?.id) return;
    setIsLoading(true)

    try {
      const cashAmount = Number(data.mixed_cash)
      const upiAmount = Number(data.mixed_online)
      const paidAmount = paymentType === 'mixed'
        ? cashAmount + upiAmount
        : Number(data.paid_amount)

      if (paymentType === 'mixed' && paidAmount <= 0) {
        toast.error('Please enter cash or UPI amount')
        setIsLoading(false)
        return
      }

      const payments = paymentType === 'mixed'
        ? [
          ...(cashAmount > 0 ? [{ amount: cashAmount, payment_type: 'cash' }] : []),
          ...(upiAmount > 0 ? [{ amount: upiAmount, payment_type: 'upi' }] : [])
        ]
        : [{ amount: paidAmount, payment_type: paymentType }]

      const payload = {
        paid_amount: paidAmount,
        // payment_type: paymentType,
        payments
      }

      const url = `/api/v1/shop/settleDeuAmount?customer_id=${selectedItem.id}`

      const response = await axiosInstance.post(url, payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Amount settled successfully')
        handleCloseModal()
        fetchData()
      } else {
        toast.success('Amount settled successfully')
        handleCloseModal()
        fetchData()
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ?? 'Failed to settle due amount'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    reset(defaultValues)
    setPaymentType('cash')
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth='sm'
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
        <Typography
          sx={{
            fontSize: '25px',
            fontWeight: 'bold',
            flexGrow: 1,
            pl: 1
          }}
        >
          Pay Due Amount
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                Total Due Amount: ₹{Math.floor(Number(selectedItem?.deu_amount || 0))}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <RHFNumberInput
                control={control}
                name='paid_amount'
                label='Paid Amount'
                placeholder='Enter Amount'
                min={0}
                disabled={paymentType === 'mixed'}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography className='input-label'>
                Payment Type
              </Typography>
              <Grid container spacing={2}>
                {[
                  { id: 'cash', label: 'Cash', icon: <LocalAtmIcon /> },
                  { id: 'upi', label: 'Online', icon: <PhonelinkRingIcon /> },
                  // { id: 'credit', label: 'Credit', icon: <EventNoteIcon /> },
                  { id: 'mixed', label: 'Mixed', icon: <EventNoteIcon /> }
                ].map(type => (
                  <Grid item xs={3} key={type.id}>
                    <Button
                      fullWidth
                      variant={paymentType === type.id ? 'contained' : 'outlined'}
                      startIcon={type.icon}
                      onClick={() => {
                        setPaymentType(type.id)
                        setValue('payment_type', type.id)

                        if (type.id === 'mixed') {
                          setValue('mixed_cash', null)
                          setValue('mixed_online', null)
                          setValue('paid_amount', null)
                        } else {
                          setValue('mixed_cash', null)
                          setValue('mixed_online', null)
                          setValue('paid_amount', null)
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
                      label='UPI Amount'
                      type='number'
                      placeholder='Enter UPI'
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
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

export default PayDueAmountPopup
