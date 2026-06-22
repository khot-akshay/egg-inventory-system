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

const schema = yup.object().shape({
  paid_amount: yup
    .number()
    .typeError('Paid amount must be a number')
    .required('Paid amount is required')
    .min(1, 'Paid amount must be greater than 0'),
  payment_type: yup
    .string()
    .required('Payment type is required')
})

interface FormData {
  paid_amount: number
  payment_type: string
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
  paid_amount: 0,
  payment_type: 'cash'
}

const paymentOptions = [
  { label: 'Cash', value: 'cash' },
  { label: 'Online', value: 'online' },
  { label: 'Card', value: 'card' }
]

const PayDueAmountPopup = ({
  open,
  handleClose,
  fetchData,
  selectedItem
}: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const onSubmit = async (data: FormData) => {
    if (!selectedItem?.id) return;
    setIsLoading(true)

    try {
      const payload = {
        paid_amount: Number(data.paid_amount),
        payment_type: data.payment_type
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
      console.error(e)

      toast.error(
        e?.response?.data?.message ?? 'Failed to settle due amount'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    reset(defaultValues)
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
              <RHFNumberInput
                control={control}
                name='paid_amount'
                label='Paid Amount'
                placeholder='Enter Amount'
                min={0}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFInput
                control={control}
                name='payment_type'
                label='Payment Type'
                placeholder='e.g., cash, online'
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

export default PayDueAmountPopup
