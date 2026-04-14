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
  categories_id: yup
    .mixed()
    .required('Category is required.'),
  // .typeError('Please select a category.')
  // .min(1, 'Please select a category.'),

  name: yup
    .string()
    .required('Product Name is required.')
    .matches(/^[a-zA-Z0-9\s]+$/, 'Product name cannot contain special characters.')
    .matches(/^\S(.*\S)?$/, 'Product name cannot have leading or trailing spaces.')
    .matches(/^(?!.*\s{2,}).*$/, 'Product name cannot have excessive spaces between words.')
    .min(3, 'Product name must be at least 3 characters long.')
    .max(100, 'Product name cannot be more than 100 characters long.')
    .trim(),
  description: yup
    .string()
    // .required('Description is required.')

    .max(500, 'Description cannot be more than 500 characters long.')
    .transform(value => (value === '' || value === undefined ? null : value))
    .nullable(),
  product_grades_id: yup
    .mixed()
    .required('Product Grade is required.')
  // .typeError('Please select a Product Grade.')
  , //.min(1, 'Please select a Product Grade.'),

  default_moisture_content: yup
    .number()
    .min(0, 'Moisture content must be 0 or greater.')
    .max(100, 'Moisture content cannot be more than 100.')
    .transform(value => (isNaN(value) || value === '' || value === undefined ? null : value))
    .nullable(),
  default_foreign_matter: yup
    .number()
    .min(0, 'Foreign matter must be 0 or greater.')
    .max(100, 'Foreign matter cannot be more than 100.')
    .transform(value => (isNaN(value) || value === '' || value === undefined ? null : value))
    .nullable(),
  polish_type_id: yup
    .mixed()
    .required('Polish Type is required.')
  // .typeError('Please select a Polish Type.')
  , //.min(1, 'Please select a Polish Type.'),

  default_packaging_kg: yup
    .number()
    .min(0, 'Packaging weight must be 0 or greater.')
    // .max(10000, 'Packaging weight cannot be more than 10000 kg.')
    .transform(value => (isNaN(value) || value === '' || value === undefined ? null : value))
    .nullable(),
  // image_url: yup
  //   .string()
  //   .url('Please enter a valid URL.')
  //   .max(500, 'Image URL cannot be more than 500 characters long.')
  //   .transform(value => (value === '' || value === undefined ? null : value))
  //   .nullable(),
  is_active: yup.boolean().required('Please set the product status.')
})

interface FormData {
  categories_id: any
  name: string
  // slug: string | null
  code: string
  description: string | null
  product_grades_id: any
  default_moisture_content: number | null
  default_foreign_matter: number | null
  polish_type_id: any
  default_packaging_kg: number | null
  grain_size: number | null
  purity: number | null
  // image_url: string | null
  is_active: boolean
}

interface SelectedItem {
  id: any;
  categories_id?: number | null;
  name?: string;
  // slug?: string | null;
  code?: string;
  description?: string | null;
  default_grade?: string | null;
  product_grades_id?: number | null;
  default_moisture_content?: number | null;
  default_foreign_matter?: number | null;
  default_polish_type?: string | null;
  polish_type_id?: number | null;
  default_packaging_kg?: number | null;
  purity?: number | null;
  grain_size?: number | null;
  // image_url?: string | null;
  is_active?: boolean;
  grade?: { name: string };
  polish_type?: { name: string };
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
}

const defaultValues: Partial<FormData> = {
  categories_id: undefined as any,
  name: '',
  // slug: null,
  code: '',
  description: null,
  product_grades_id: undefined as any,
  default_moisture_content: null,
  default_foreign_matter: null,
  polish_type_id: undefined as any,
  default_packaging_kg: null,
  purity: null,
  grain_size: null,
  // image_url: null,
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
        categories_id: extractId(data.categories_id),
        name: data.name.trim(),
        // slug: data.slug ? data.slug.trim() : null,
        code: data.code.trim(),
        description: data.description ? data.description.trim() : null,
        product_grades_id: extractId(data.product_grades_id),
        default_grade: data.product_grades_id?.name,
        default_moisture_content: data.default_moisture_content ?? null,
        default_foreign_matter: data.default_foreign_matter ?? null,
        polish_type_id: extractId(data.polish_type_id),
        default_polish_type: data.polish_type_id?.name,
        default_packaging_kg: data.default_packaging_kg ?? null,
        purity: data.purity ?? null,
        grain_size: data.grain_size ?? null,
        // image_url: data.image_url ? data.image_url.trim() : null,
        is_active: data.is_active ? 1 : 0
      }
      let url = ''
      if (selectedItem) {
        url = `/api/v1/admin/products/updateProducts/${selectedItem.id}`
      } else {
        url = '/api/v1/admin/products/createProduct'
      }
      const response = await axiosInstance.post(url, payload)
      if (response.data.success) {
        handleCloseModal()
        fetchData()
        // toast.success(selectedItem ? 'Product updated successfully.' : 'Product added successfully.')
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
      if (selectedItem?.categories_id) {
        setValue('categories_id', { id: selectedItem?.categories_id, name: (selectedItem as any)?.categories?.name || 'Category' })
      }

      setValue('name', selectedItem?.name ?? '')
      // setValue('slug', selectedItem?.slug ?? null)
      setValue('code', selectedItem?.code ?? '')
      setValue('description', selectedItem?.description ?? null)

      if (selectedItem?.product_grades_id) {
        setValue('product_grades_id', { id: selectedItem?.product_grades_id, name: selectedItem?.grade?.name || selectedItem?.default_grade })
      }

      setValue('default_moisture_content', selectedItem?.default_moisture_content ?? null)
      setValue('default_foreign_matter', selectedItem?.default_foreign_matter ?? null)

      if (selectedItem?.polish_type_id) {
        setValue('polish_type_id', { id: selectedItem?.polish_type_id, name: selectedItem?.polish_type?.name || selectedItem?.default_polish_type })
      }
      setValue('default_packaging_kg', selectedItem?.default_packaging_kg ?? null)
      setValue('purity', selectedItem?.purity ?? null)
      setValue('grain_size', selectedItem?.grain_size ?? null)
      // setValue('image_url', selectedItem?.image_url ?? null)
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
                name="categories_id"
                // options={categories}
                placeholder="Select Category"
                labelinput="Select Category"
                // loading={loadingCategories}
                apiUrl="/api/v1/admin/categories/getAllCategories"
                labelKey="name"
                valueKey="id"
                required
                extraParams={{ is_active: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'name'} label={'Product Name'} placeholder={'Product Name'} mandatory />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'code'} label={'Product Code'} placeholder={'PW-002'} mandatory label_footer='Use uppercase letters, numbers and hyphens only.' />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'slug'} label={'Slug'} placeholder={'premium-wheat'} label_footer='Use lowercase letters, numbers and hyphens only.' />
            </Grid> */}

            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='product_grades_id'
                apiUrl='/api/v1/admin/productGrades/getAllProductGrades'
                placeholder='Select Product Grade'
                labelinput='Select Product Grade'
                // loading={loadingGrades}
                labelKey="name"
                valueKey="id" required
                extraParams={{ is_active: 1 }}

              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='polish_type_id'
                apiUrl='/api/v1/admin/polishTypes/getAllPolishTypes'
                placeholder='Select Polish Type'
                labelinput='Select Polish Type'
                // loading={loadingPolishTypes}
                labelKey="name"
                valueKey="id"
                required
                extraParams={{ is_active: 1 }}

              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFNumberInput
                control={control}
                name={'default_moisture_content'}
                label={' Moisture Level (%)'}
                placeholder={'Moisture Level (%)'}
                min={0}
                max={100}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFNumberInput
                control={control}
                name={'purity'}
                label={' Purity (%)'}
                placeholder={'Purity (%)'}
                min={0}
                max={100}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFNumberInput
                control={control}
                name={'default_foreign_matter'}
                label={' Foreign Matter (%)'}
                placeholder={'Foreign Matter (%)'}
                min={0}
                max={100}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFNumberInput
                control={control}
                name={'default_packaging_kg'}
                label={' Packaging (kg)'}
                placeholder={'Packaging (kg)'}
                min={0}
                max={10000}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFNumberInput
                control={control}
                name={'grain_size'}
                label={' Grain Size (MM) '}
                placeholder={'Grain Size (MM)'}
                min={0}
                max={10000}
                decimalScale={2}
              />
            </Grid>
            <Grid item xs={12}>
              <RHFInput control={control} name={'description'} label={' Description'} placeholder={'Description'} multiline rows={3} mandatory={false} />
            </Grid>
            {/* <Grid item xs={12} md={6}>
                                             <UploadFile handleImage={handleImage} defaultPhoto={defaultPhoto} label={'Image'} mandatory />
             
            </Grid> */}
            {/* <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'image_url'} label={'Image URL'} placeholder={'https://example.com/image.png'} />
            </Grid> */}
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
