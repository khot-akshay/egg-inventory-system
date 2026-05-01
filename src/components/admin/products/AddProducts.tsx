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
  category_id: yup
    .mixed()
    .required('Category is required.'),
  sku: yup
    .string()
    .nullable()
    .trim(),
  name: yup
    .string()
    .required('Product Name is required.')
    .matches(/^\S(.*\S)?$/, 'Product name cannot have leading or trailing spaces.')
    .matches(/^(?!.*\s{2,}).*$/, 'Product name cannot have excessive spaces between words.')
    .min(3, 'Product name must be at least 3 characters long.')
    .max(100, 'Product name cannot be more than 100 characters long.')
    .trim(),
  unit: yup
    .string()
    .nullable(),
  cost_price: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : Number(value)))
    .nullable()
    .required('Cost price is required.')
    .min(0, 'Cost price must be 0 or greater.')
    .typeError('Cost price must be a valid number'),
  selling_price: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : Number(value)))
    .nullable()
    .required('Selling price is required.')
    .min(0, 'Selling price must be 0 or greater.')
    .typeError('Selling price must be a valid number'),
  min_stock_level: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? null : Number(value)))
    .nullable()
    .required('Minimum stock level is required.')
    .min(0, 'Minimum stock level must be 0 or greater.')
    .typeError('Minimum stock level must be a valid number'),
  shop_id: yup
    .mixed()
    .required('Shop is required.'),
  is_active: yup.boolean().required('Please set the product status.')
})

interface FormData {
  category_id: any
  sku: string
  name: string
  unit: string
  cost_price: number | null
  selling_price: number | null
  min_stock_level: number | null
  shop_id: any
  is_active: boolean
}

interface SelectedItem {
  id: any;
  category_id?: number | null;
  categories?: { name: string };
  sku?: string;
  name?: string;
  unit?: string;
  cost_price?: number | null;
  selling_price?: number | null;
  min_stock_level?: number | null;
  shop_id?: number | null;
  shop?: { name: string };
  is_active?: boolean;
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
}

const defaultValues: Partial<FormData> = {
  category_id: null,
  sku: '',
  name: '',
  unit: '',
  cost_price: null,
  selling_price: null,
  min_stock_level: null,
  shop_id: null,
  is_active: true
}

const AddProducts = ({ open, handleClose, fetchData, selectedItem }: Props) => {
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
        category_id: extractId(data.category_id),
        sku: data.sku.trim(),
        name: data.name.trim(),
        unit: data.unit.trim(),
        cost_price: data.cost_price,
        selling_price: data.selling_price,
        min_stock_level: data.min_stock_level,
        shop_id: extractId(data.shop_id),
        is_active: data.is_active ? 1 : 0
      }
      let url = ''
      if (selectedItem) {
        url = `/api/v1/admin/updateProduct?id=${selectedItem.id}`
      } else {
        url = '/api/v1/admin/createProduct'
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
          ? e?.response?.data?.message ?? 'Failed to update product. Please try again.'
          : e?.response?.data?.message ?? 'Failed to add product. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    if (selectedItem) {
      if (selectedItem?.category_id) {
        setValue('category_id', { id: selectedItem?.category_id, name: selectedItem?.categories?.name || 'Category' })
      }

      setValue('sku', selectedItem?.sku ?? '')
      setValue('name', selectedItem?.name ?? '')
      setValue('unit', selectedItem?.unit ?? '')
      setValue('cost_price', selectedItem?.cost_price ?? null)
      setValue('selling_price', selectedItem?.selling_price ?? null)
      setValue('min_stock_level', selectedItem?.min_stock_level ?? null)

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
          {selectedItem ? 'Update' : 'Add'} Product{' '}

        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
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
            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name="category_id"
                placeholder="Select Category"
                labelinput="Select Category"
                apiUrl="/api/v1/admin/getAllCategories"
                labelKey="name"
                valueKey="id"
                required
                extraParams={{ is_active: 1 }}
              />
            </Grid>
            
              <Grid item xs={12} md={6}>
                <RHFInput control={control} name={'name'} label={'Product Name'} placeholder={'Product Name'} mandatory />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFInput control={control} name={'sku'} label={'SKU'} placeholder={'e.g. EGG-001'} mandatory />
              </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'unit'} label={'Egg Unit'} placeholder={'Egg Unit'} mandatory />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <RHFNumberInput
                control={control}
                name={'cost_price'}
                label={'Cost Price'}
                placeholder={'Cost Price'}
                min={0}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFNumberInput
                control={control}
                name={'selling_price'}
                label={'Selling Price'}
                placeholder={'Selling Price'}
                min={0}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFNumberInput
                control={control}
                name={'min_stock_level'}
                label={'Min Stock Level'}
                placeholder={'Min Stock Level'}
                min={0}
              />
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

export default AddProducts
