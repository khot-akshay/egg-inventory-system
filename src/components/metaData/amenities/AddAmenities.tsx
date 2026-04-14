import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Box, IconButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import AmenityType from '../amenity_type/AmenityType'
import Icon from 'src/@core/components/icon'
import toast, { Toaster } from 'react-hot-toast'
import IconPicker from 'src/components/common/IconPicker'
const schema = yup.object().shape({
  // name: yup.string().typeError('Amenities is required.').required('Amenities is required.'),
  name: yup
  // .string()
  // .typeError('Amenities is required.')
  // .required('Amenities is required.')
  // .min(3, 'Amenities must be at least 3 characters long.') 
  // .max(50, 'Amenities must be at most 50 characters.'),
  .string()
      .required('Amenities is required.')
      .matches(/^[a-zA-Z0-9\s]+$/, 'Amenities cannot contain special characters.')
      .matches(/^\S(.*\S)?$/, 'Amenities cannot have leading or trailing spaces.')
      .matches(/^(?!.*\s{2,}).*$/, 'Amenities cannot have excessive spaces between words.')
      .min(3, 'Amenities must be at least 3 characters long.') 
      .max(50, 'Amenities cannot be more than 50 characters long.')
      .trim(), // Trims leading and trailing spaces


  amenity_type_id: yup.mixed().typeError('AmenityType is required.').required('AmenityType is required.'),
  icon: yup.string().typeError('Amenity Icon is required.').required('Amenity Icon is required.')
})

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: {}
}

const AddAmenities = ({ open, handleClose, fetchData, selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [searchParams, setSearchParams] = useState('')
  const [totalCount, setTotalCount] = useState(10)
  //   const [fetchingCities, setFetchingCities] = useState(false)
  const [fetchingAmenityType, setfetchingAmenityType] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors }
  } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async data => {
    setIsLoading(true)

    try {
      let payload = {
        name: data.name,
        amenity_type_id: data.amenity_type_id.value,
        is_active: true,
        icon: data.icon
      }
      let url = ''
      if (selectedItem) {
        url = `/v1/admin/updateAmenities?id=${selectedItem.id}`
      } else {
        url = '/v1/admin/createAmenities'
      }
      const response = await axiosInstance.post(url, payload)
      if (response.data.success) {
        handleClose()
        fetchData()
        toast.success(selectedItem ? 'Amenities updated successfully.' : 'Amenities added successfully.')
      }
    } catch (e) {
      console.error(e)
      toast.error(
        selectedItem
          ? e?.response?.data?.message ?? 'Failed to update amenities. Please try again.'
          : e?.response?.data?.message ?? 'Failed to add amenities. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLoadMore = async () => {
    setfetchingAmenityType(true)
    let search = ''
    if (searchParams) {
      search = `&name=${searchParams}`
    }
    if (options.length >= totalCount) {
      // If already fetched all available options, stop pagination
      return;
    }
    setTimeout(async () => {

      try {
        const response = await axiosInstance.get(`/v1/admin/getAmenityType?amenity_type&pageNo=${currentPage}&limit=10${search}`)
        const data = response.data.data?.data?.map((item: any) => ({ label: item.name, id: item.id, value: item.id }))
        setTotalCount(response.data.data?.count)
        if (data) {

          setOptions((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newOptions = data.filter((item) => !existingIds.has(item.id));
            return [...prev, ...newOptions];
          });
        }
      } catch (e) {
        console.log(e)
      } finally {
        setfetchingAmenityType(false)
      }
    }, 1000)
  }

  useEffect(() => {
    fetchLoadMore()
  }, [currentPage, searchParams])

  useEffect(() => {
    if (selectedItem) {

      setValue('name', selectedItem?.name)
      setValue('amenity_type_id', { id: selectedItem?.amenity_type_id, label: selectedItem?.amenity_type?.name, value: selectedItem?.amenity_type_id })
      setValue('icon', selectedItem?.icon)
    }
  }, [selectedItem])
  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
          {selectedItem ? 'Update' : 'Add'} Amenities{' '}
        </Typography>
        <IconButton onClick={handleClose}>
          <Icon icon='bx:x' style={{ fontSize: '30px' }} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RHFInput control={control} name={'name'} label={'Amenities'} placeholder={'Amenities'} mandatory />
            </Grid>
            {/* <Grid item xs={12}>
                    <RHFInput control={control} multiline rows={4} name={'description'} label={'Description'} placeholder={'Description'} mandatory />
                </Grid> */}

            <Grid item xs={12}>
              <RHFAutoComplete
                label='Select Amenity Type'
                placeholder='Select Amenity Type'
                mandatory
                control={control}
                name={'amenity_type_id'}
                options={options}
                setCurrentPage={setCurrentPage}
                loadMore={fetchLoadMore}
                setSearchParams={setSearchParams}
                hasMore={options.length <= totalCount}
                isLoading={fetchingAmenityType}

                defaultValue={
                  selectedItem?.amenity_type
                    ? { id: selectedItem?.amenity_type_id, label: selectedItem?.amenity_type?.name, value: selectedItem?.amenity_typeid || null }
                    : null
                }
              />

            </Grid>
            {/* <Grid item xs={12}>
              <RHFInput control={control} name={'icon'} label={'Amenity Icon'} placeholder={'Amenity Icon'} mandatory />
            </Grid> */}
            <Grid item xs={12}>
              <Box mb={1.5}>
                <Box display="flex" alignItems="center" mb={-6}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                    Amenity Icon
                    <Typography component="span" color="error" ml={0.5}>*</Typography>
                  </Typography>
                  {/* <Tooltip
                    title={
                      <div>
                        Visit <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer">Iconify Explorer -
                        <span className="text-blue-400">https://icon-sets.iconify.design</span>
                        </a><br />
                        Copy the icon name (e.g., <code>mdi:home</code>)<br />
                        Paste it into this field.
                      </div>
                    }
                    arrow
                    placement="right"
                  >
                    <IconButton size="small" sx={{ ml: 0.5, mt: '-2px', p: 0 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip> */}  
                  <Tooltip
  title={
    <div style={{ maxWidth: 250 }}>
      <strong>Steps to use an icon:</strong>
      <ol style={{ paddingLeft: 16, marginTop: 8 }}>
        <li>
          Visit <a href="https://icon-sets.iconify.design/" target="_blank" rel="noopener noreferrer" className="text-blue-400">Iconify Explorer</a>
        </li>
        <li>
          Browse and copy the icon name (e.g., <code>mdi:home</code>)
        </li>
        <li>
          Paste the icon name into this field
        </li>
      </ol>
      <div style={{ marginTop: 8 }}>
        <span className="text-blue-400">https://icon-sets.iconify.design</span>
      </div>
    </div>
  }
  arrow
  placement="right"
>
  <IconButton size="small" sx={{ ml: 0.5, mt: '-2px', p: 0 }}>
    <InfoOutlinedIcon fontSize="small" />
  </IconButton>
</Tooltip>

                </Box>

                <RHFInput
                  control={control}
                  name="icon"
                  placeholder="Amenity Icon"
                  mandatory={false}
                />
              </Box>
            </Grid>



          </Grid>
        </DialogContent>
        <DialogActions sx={{ mt: 3 }}>
          <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
        </DialogActions>
      </form>
      {/* <IconPicker/> */}
    </Dialog>
  )
}

export default AddAmenities
