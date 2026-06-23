import { yupResolver } from '@hookform/resolvers/yup'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Box,
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
  expense_date: yup.string().required('Expense date is required'),

  category: yup.string().required('Category is required'),

  amount: yup
    .number()
    .typeError('Amount must be a valid number')
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0'),

  description: yup.string().nullable(),

  shop_id: yup.mixed().required('Shop is required')
})

interface FormData {
  expense_date: string
  category: string
  amount: number
  description: string
  shop_id: any
}

interface SelectedItem {
  id?: number
  expense_date?: string
  category?: string
  amount?: number
  description?: string
  shop_id?: number
  shop?: {
    name?: string
  }
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: () => void
  selectedItem?: SelectedItem
}

const defaultValues: FormData = {
  expense_date: '',
  category: '',
  amount: 0,
  description: '',
  shop_id: null
}

const AddStaffExpense = ({
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
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const payload = {
        expense_date: data.expense_date,
        category: data.category,
        amount: Number(data.amount),
        description: data.description,
        shop_id:
          typeof data.shop_id === 'object'
            ? data.shop_id.id
            : data.shop_id
      }

      let url = ''

      if (selectedItem) {
        url = `/api/v1/shop/updateExpense?id=${selectedItem.id}`
      } else {
        url = '/api/v1/shop/createExpense'
      }

      const response = await axiosInstance.post(url, payload)

      if (response.data.success) {
        toast.success(response.data.message)
        handleCloseModal()
        fetchData()
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          (selectedItem
            ? 'Failed to update expense'
            : 'Failed to add expense')
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedItem) {
      setValue(
        'expense_date',
        selectedItem.expense_date || ''
      )

      setValue('category', selectedItem.category || '')

      setValue('amount', selectedItem.amount || 0)

      setValue(
        'description',
        selectedItem.description || ''
      )

      if (selectedItem.shop_id) {
        setValue('shop_id', {
          id: selectedItem.shop_id,
          name: selectedItem.shop?.name || 'Shop'
        })
      }
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
          {selectedItem ? 'Update' : 'Add'} Expense
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
              <RHFAutoComplete
                control={control}
                name='shop_id'
                placeholder='Select Shop'
                labelinput='Select Shop'
                apiUrl='/api/v1/admin/getAllShops'
                labelKey='name'
                valueKey='id'
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='expense_date'
                label='Expense Date'
                placeholder='Expense Date'
                type='date'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='category'
                label='Category'
                placeholder='Fuel / Salary / Electricity'
                mandatory
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFNumberInput
                control={control}
                name='amount'
                label='Amount'
                placeholder='Amount'
                min={0}
              />
            </Grid>

            <Grid item xs={12}>
              <RHFInput
                control={control}
                name='description'
                label='Description'
                placeholder='Description'
                multiline
                rows={3}
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

export default AddStaffExpense