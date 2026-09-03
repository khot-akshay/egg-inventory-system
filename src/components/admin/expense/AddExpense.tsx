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

  category: yup
    .string()
    .trim()
    .required('Category is required')
    .min(3, 'Category must be at least 3 characters')
    .max(255, 'Category must not exceed 255 characters')
    .matches(/^[A-Za-z\s]+$/, 'Category can contain only letters and spaces'),
  amount: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : value))
    .nullable()
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0'),

  description: yup.string().nullable(),

  shop_id: yup
    .mixed()
    .nullable()
    .transform((value) => {
      if (value === null || value === undefined || value === '') return null
      if (typeof value === 'object' && value !== null) return value.id
      return value
    })
})

interface FormData {
  expense_date: string
  category: string
  amount: number | string
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
  expense_date: new Date().toISOString().split('T')[0],
  category: '',
  amount: '',
  description: '',
  shop_id: null
}

const AddExpense = ({
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
          data.shop_id && typeof data.shop_id === 'object'
            ? data.shop_id.id
            : data.shop_id
      }

      console.log('Expense payload:', payload)

      let url = ''

      if (selectedItem) {
        url = `/api/v1/admin/updateExpense?id=${selectedItem.id}`
      } else {
        url = '/api/v1/admin/createExpense'
      }

      console.log('Expense URL:', url)

      const response = await axiosInstance.post(url, payload)

      console.log('Expense response:', response.data)

      if (response.data.success) {
        toast.success(response.data.message)
        handleCloseModal()
        fetchData()
      }
    } catch (e: any) {
      console.error('Expense error:', e)
      console.error('Error response:', e?.response?.data)

      const errorMessage = e?.response?.data?.message ||
        e?.response?.data?.data?.message ||
        (selectedItem ? 'Failed to update expense' : 'Failed to add expense')

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedItem) {
      setValue(
        'expense_date',
        selectedItem.expense_date
          ? selectedItem.expense_date.split('T')[0].split(' ')[0]
          : ''
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
      reset({ ...defaultValues, expense_date: new Date().toISOString().split('T')[0] })
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
                required={false}
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
                mandatory
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
                required={false}
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

export default AddExpense