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
    .required('Category Name is required.')
    // .matches(/^[a-zA-Z0-9\s]+$/, 'Category name cannot contain special characters.')
    .matches(/^\S(.*\S)?$/, 'Category name cannot have leading or trailing spaces.')
    .matches(/^(?!.*\s{2,}).*$/, 'Category name cannot have excessive spaces between words.')
    // .min(3, 'Category name must be at least 3 characters long.')
    .max(50, 'Category name cannot be more than 50 characters long.')
    .trim(),
  // slug: yup
  //   .string()
  //   .required('Slug is required.')
  //   .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens.')
  //   .min(3, 'Slug must be at least 3 characters long.')
  //   .max(60, 'Slug cannot be more than 60 characters long.')
  //   .trim(),
  // description: yup
  //   .string()
  //       .required('Description is required.')

  //   .max(300, 'Description cannot be more than 300 characters long.')
  //   .transform(value => (value === '' || value === undefined ? null : value))
  //   .nullable(),
  // image_url: yup
  //   .string()
  //   .max(255, 'Image URL cannot be more than 255 characters long.')
  //   .transform(value => (value === '' || value === undefined ? null : value))
  //   .nullable(),
  is_active: yup.boolean().required('Please set the category status.')
})

interface FormData {
  name: string
  // slug: string
  description: string | null
  // image_url: string | null
  is_active: boolean
}

interface SelectedItem {
  id: any;
  name: any;
  // slug?: string;
  description?: string | null;
  // image_url?: string | null;
  is_active?: boolean;
  amenity_type_id?: any;
  amenity_type?: { name: any };
  icon?: any
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
}

const defaultValues: FormData = {
  name: '',
  // slug: '',
  description: '',
  // image_url: '',
  is_active: true
}

const AddCategories = ({ open, handleClose, fetchData, selectedItem }: Props) => {
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
        // slug: data.slug.trim(),
        description: data.description ? data.description.trim() : null,
        // image_url: data.image_url ? data.image_url.trim() : null,
        is_active: data.is_active ? 1 : 0
      }
      let url = ''
      if (selectedItem) {
        url = `/api/v1/admin/categories/updateCategories/${selectedItem.id}`
      } else {
        url = '/api/v1/admin/categories/createCategories'
      }
      const response = await axiosInstance.post(url, payload)
      if (response.data.success) {
        handleCloseModal()
        fetchData()
        toast.success(selectedItem ? 'Category updated successfully.' : 'Category added successfully.')
      }
    } catch (e: any) {
      console.error(e)
      const apiError = e?.response?.data

      if (apiError?.data?.name?.length) {
        setError('name', {
          type: 'server',
          message: apiError.data.name[0] // "The name has already been taken."
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
      // setValue('slug', selectedItem?.slug ?? '')
      setValue('description', selectedItem?.description ?? '')
      // setValue('image_url', selectedItem?.image_url ?? '')
      setValue('is_active', typeof selectedItem?.is_active === 'boolean' ? selectedItem.is_active : true)
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
          {selectedItem ? 'Update' : 'Add'} Category{' '}
        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <RHFInput control={control} name={'name'} label={'Category Name'} placeholder={'Category Name'} mandatory />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'slug'} label={'Slug'} placeholder={'slug-name'} mandatory label_footer='Use lowercase letters, numbers and hyphens only.' />
            </Grid> */}
            <Grid item xs={12}>
              <RHFInput control={control} name={'description'} label={'Description'} placeholder={'Description'} multiline rows={3} mandatory={false} />
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'image_url'} label={'Image URL'} placeholder={'https://example.com/image.png'} />
            </Grid> */}
           { selectedItem &&  <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
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

export default AddCategories
