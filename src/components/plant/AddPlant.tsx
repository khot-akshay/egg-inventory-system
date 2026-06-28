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

type CategoryOption = { label: string; value: number }

const schema = yup.object().shape({
  plant_name: yup
    .string()
    .required('Plant Name is required.')
    .matches(/^[a-zA-Z0-9\s]+$/, 'Plant name cannot contain special characters.')
    .matches(/^\S(.*\S)?$/, 'Plant name cannot have leading or trailing spaces.')
    .matches(/^(?!.*\s{2,}).*$/, 'Plant name cannot have excessive spaces between words.')
    .min(3, 'Plant name must be at least 3 characters long.')
    .max(100, 'Plant name cannot be more than 100 characters long.')
    .trim(),
  address: yup
    .string()
    .required('Address is required.')
    .max(255, 'Address cannot be more than 255 characters long.')
    .trim(),
  state: yup
    .string()
    .required('State is required.')
    .max(100, 'State cannot be more than 100 characters long.')
    .trim(),
  city: yup
    .string()
    .required('City is required.')
    .max(100, 'City cannot be more than 100 characters long.')
    .trim(),
  pincode: yup
    .string()
    .required('Pincode is required.')
    .matches(/^[1-9][0-9]{5}$/, 'Enter valid 6-digit PINcode.'),
  daily_capacity: yup
    .string()
    .typeError(' Capacity  (Ton) must be a number.')
    .required(' Capacity (Ton) is required.')
    .min(0, ' Capacity (Ton)must be 0 or greater.'),
  categories_ids: yup
    .array()
    .nullable()
    .of(yup.mixed())
    .min(1, 'Please select at least one category.')
    .required('Please select at least one category.'),
  // product_type: yup
  //   .string()
  //   .required('Product Type is required.')
  //   .max(100, 'Product Type cannot be more than 100 characters long.')
  //   .trim(),
  organization_name: yup
    .mixed()
    .test('required', 'Organization Name is required.', value => {
      if (!value) return false
      if (typeof value === 'string' && value.trim() === '') return false
      if (typeof value === 'object' && Object.keys(value).length === 0) return false
      return true
    }),
  is_active: yup.boolean().required('Please set the plant status.')
})

interface FormData {
  plant_name: string
  address: string
  state: string
  city: string
  pincode: string
  daily_capacity: string
  categories_ids: number[]
  product_type: string
  organization_name: string
  is_active: boolean
}

interface SelectedItem {
  id: any
  plant_name?: string
  address?: string
  state?: string
  city?: string
  pincode?: string
  daily_capacity?: string
  categories_ids?: number[]
  categories?: { id: number; name: string }[]
  product_type?: string
  organization_name?: string
  is_active?: boolean
  appuser?: { id: number; organization_name: string }
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
}

const defaultValues: Partial<FormData> = {
  plant_name: '',
  address: '',
  state: '',
  city: '',
  pincode: '',
  daily_capacity: '',
  categories_ids: [],
  product_type: '',
  organization_name: '',
  is_active: true
}

const Addplant = ({ open, handleClose, fetchData, selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [orgOptions, setOrgOptions] = useState<OrgOption[]>([])
  const [orgLoading, setOrgLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema), defaultValues })

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await axiosInstance.get('/api/v1/admin/categories/getAllCategories?pageNo=0&limit=1000&is_active=1')
      const categoryOptions = (response.data.data?.data ?? []).map((item: any) => ({
        label: item.name,
        value: item.id
      }))
      setCategories(categoryOptions)
    } catch (e) {
      toast.error('Failed to load categories.')
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchOrganizations = async () => {
    setOrgLoading(true)
    try {
      const response = await axiosInstance.get(
        '/api/v1/admin/users/getAllUsers?pageNo=0&limit=1000'
      )

      const options =
        (response.data.data?.data ?? []).map((item: any) => ({
          label: item.organization_name, // 👈 change if API field differs
          value: item.id
        }))

      setOrgOptions(options)
    } catch (e) {
      toast.error('Failed to load organizations')
    } finally {
      setOrgLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const extractId = (value: any) => {
        if (Array.isArray(value)) {
          return value.map(v => (typeof v === 'object' ? v.id : v));
        }
        if (value && typeof value === 'object') return value.id;
        return value;
      };

      const payload = {
        plant_name: data.plant_name.trim(),
        address: data.address.trim(),
        state: data.state.trim(),
        city: data.city.trim(),
        pincode: data.pincode.trim(),
        daily_capacity: data.daily_capacity,
        categories_ids: extractId(data.categories_ids),
        product_type: data.product_type.trim(),
        appuser_id: extractId(data.organization_name),
        is_active: data.is_active ? 1 : 0
      }
      let url = ''
      if (selectedItem) {
        url = `/api/v1/admin/plant/updatePlant/${selectedItem.id}`
      } else {
        url = '/api/v1/admin/plant/createPlant'
      }
      const response = await axiosInstance.post(url, payload)
      if (response.data.success) {
        handleCloseModal()
        fetchData()
        // toast.success(selectedItem ? 'Product updated successfully.' : 'Product added successfully.')
        toast.success(response.data.message)
      }
    } catch (e: any) {
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
      setValue('plant_name', selectedItem?.plant_name ?? '')
      setValue('address', selectedItem?.address ?? '')
      setValue('state', selectedItem?.state ?? '')
      setValue('city', selectedItem?.city ?? '')
      setValue('pincode', selectedItem?.pincode ?? '')
      setValue('daily_capacity', selectedItem?.daily_capacity ?? '')
      // If backend sends categories as array of objects, map to ids
      if (Array.isArray(selectedItem.categories)) {
        setValue(
          'categories_ids',
          selectedItem.categories
        )
      } else {
        setValue('categories_ids', selectedItem?.categories_ids ?? [])
      }
      setValue('product_type', selectedItem?.product_type ?? '')
      // setValue('organization_name', selectedItem?.appuser_id ?? '')
      if (selectedItem?.appuser) {
        setValue('organization_name', selectedItem.appuser)
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

  useEffect(() => {
    if (open) {
      fetchOrganizations()
    }
  }, [open])

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
          {selectedItem ? 'Update' : 'Add'} Plant{' '}
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
                name="organization_name"
                placeholder="Select Organization"
                labelinput="Select Organization"
                apiUrl="/api/v1/admin/users/getAllUsers"
                extraParams={{ is_active: 1, is_financer: 0 }}
                labelKey="organization_name"
                valueKey="id"
                required
              />


            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='plant_name'
                label='Plant Name'
                placeholder='Plant Name'
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='categories_ids'
                placeholder='Select Categories'
                labelinput='Select Categories'
                apiUrl="/api/v1/admin/categories/getAllCategories"
                extraParams={{ is_active: 1 }}
                labelKey="name"
                valueKey="id"
                required
                multiple={true}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFNumberInput
                control={control}
                name='daily_capacity'
                label=' Capacity (Ton)'
                placeholder='Capacity (Ton)'
                mandatory

              />
            </Grid>


            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name='state'
                label='State'
                placeholder='State'
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name='city'
                label='City'
                placeholder='City'
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name='pincode'
                label='Pincode'
                placeholder='Pincode'
                mandatory
              />
            </Grid>
            <Grid item xs={12}>
              <RHFInput
                control={control}
                name='address'
                label='Address'
                placeholder='Address'
                multiline
                rows={3}
                mandatory
              />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name='product_type'
                label='Product Type'
                placeholder='Grains'
                mandatory
              />
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

export default Addplant
