import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Icon from 'src/@core/components/icon'
import { useSettings } from 'src/@core/hooks/useSettings'
import SubmitButton from 'src/components/common/button/Button'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import SingleFileUpload from 'src/components/common/fileupload/singleFileUpload'
import toast, { Toaster } from 'react-hot-toast'
import { convertFileToBase64 } from 'src/utils/commonFunctions'
const schema = yup.object().shape({
  // name: yup.string().typeError('Venue Name is required.').required('Venue Name is required.'),
   name: yup
      .string()
      .required('Venue Name is required.')
      .matches(/^[a-zA-Z0-9\s]+$/, 'Venue Name cannot contain special characters.')
      .matches(/^\S(.*\S)?$/, 'Venue Name cannot have leading or trailing spaces.')
      .matches(/^(?!.*\s{2,}).*$/, 'Venue Name cannot have excessive spaces between words.')
      .min(3, 'Venue Name must be at least 3 characters long.') 
      .max(50, 'Venue Name cannot be more than 50 characters long.')
      .trim(), // Trims leading and trailing spaces

  city_id: yup.mixed().typeError('City  is required.').required('City  is required.'),
  // user_id: yup.mixed().typeError('Manager Name is required.').required('Manager Name is required.'),
  image: yup.mixed().typeError('Venue Image is required.').required('Venue Image is required.')
})

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: {}
}
export default function AddVenue({ open, handleClose, fetchData, selectedItem }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [searchParams, setSearchParams] = useState('')
  const [totalCount, setTotalCount] = useState(10)
  const [fetchingCities, setFetchingCities] = useState(false)
  const [fetchingMember, setFetchingMember] = useState(false)
  // const [managers, setManagers] = useState([])
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

    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('city_id', data.city_id.value)
    formData.append('is_active', '1')
    // formData.append('user_id', '1')
    // formData.append('user_id', data.user_id?.value)
    const { image } = data

    if (data.image) {
      formData.append('image', image)
    }

    let url = ''
    if (selectedItem) {
      url = `/v1/admin/updateVenue?id=${selectedItem.id}`
    } else {
      url = '/v1/admin/createVenue'
    }
    try {
      const response = await axiosInstance.post(url, formData)
      if (response.data.success) {
        handleClose()
        fetchData()
        toast.success(selectedItem ? 'Venue updated successfully.' : 'Venue added successfully.')
      }
    } catch (e) {
      toast.error(
        selectedItem 
          ? e?.response?.data?.message ?? 'Failed to update Venue. Please try again.' 
          : e?.response?.data?.message ?? 'Failed to add Venue. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }



  // const fetchLoadMember = async () => {
  //   setFetchingMember(true)
  //   let search = ''
  //   if (searchParams) {
  //     search = `&name=${searchParams}`
  //   }
  //   if (options.length >= totalCount) {
  //     // If already fetched all available options, stop pagination
  //     //     return
  //   }
  //   setTimeout(async () => {
  //     try {
  //       const response = await axiosInstance.get(
  //         `/v1/admin/getAllManager`
  //       )
  //       const data = response.data.data?.data?.map((item: any) => ({ label: item.name, id: item.id, value: item.id }))
  //       setTotalCount(response.data.data?.count)
  //       if (data) {
  //         setManagers(prev => {
  //           const existingIds = new Set(prev.map(item => item.id))
  //           const newOptions = data.filter(item => !existingIds.has(item.id))
  //           return [...prev, ...newOptions]
  //         })
         
        
  //       }
       
  //     } catch (e) {
  //       //       toast.error(e?.response?.data?.message ?? 'Failed to add Manager. Please try again.')
       
  //     } finally {
  //       setFetchingMember(false)
  //     }
  //   }, 1000)
  // }
  const fetchLoadMore = async () => {
    setFetchingCities(true)
    let search = ''
    if (searchParams) {
      search = `&name=${searchParams}`
    }
    if (options.length >= totalCount) {
      // If already fetched all available options, stop pagination
      return
    }
    setTimeout(async () => {
      try {
        const response = await axiosInstance.get(
          `/v1/admin/getAllcities?state_id=4008&is_active=1`
        )
        const data = response.data.data?.data?.map((item: any) => ({ label: item.name, id: item.id, value: item.id }))
        setTotalCount(response.data.data?.count)
        if (data) {
          setOptions(prev => {
            const existingIds = new Set(prev.map(item => item.id))
            const newOptions = data.filter(item => !existingIds.has(item.id))
            return [...prev, ...newOptions]
          })
        }
      } catch (e) {
        } finally {
        setFetchingCities(false)
      }
    }, 1000)
  }

  useEffect(() => {
    fetchLoadMore()
    // fetchLoadMember()
  }, [currentPage, searchParams])
  useEffect(() => {
    if (searchParams) {
      setOptions([])
      // setManagers([])
      // setCurrentPage(0);
      // setTotalRows(0);
    }
  }, [searchParams])
  useEffect(() => {
    if (selectedItem) {
      setValue('name', selectedItem?.name)
      
      setValue('city_id', { id: selectedItem.city_id, label: selectedItem.city.name, value: selectedItem.city_id })
      if (selectedItem?.image) {
        setValue('image', selectedItem.image); // Set existing image in an array
    }
    }
  }, [selectedItem])
  
  const handleFeatureImage = async content => {
    if (content.length > 0) {
      const image = await convertFileToBase64(content[0])
      setValue('image', image)
      }
  }
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
      >  <Toaster position="top-right" reverseOrder={false} />
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
          {selectedItem ? 'Update' : 'Add'} Venue{' '}
        </Typography>
        <IconButton onClick={handleClose}>
          <Icon icon='bx:x' style={{ fontSize: '30px', color: 'text-dark' }} />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RHFInput control={control} name={'name'} label={'Venue Name'} placeholder={'Venue Name'} mandatory />
            </Grid>
            {/* <Grid item xs={12}>
                            <RHFInput control={control} name={'city_name'} label={'City Name'} placeholder={'City Name'} mandatory />
                        </Grid> */}

            <Grid item xs={12}>
              <RHFAutoComplete
                label='Select City'
                placeholder='Select City'
                mandatory
                control={control}
                name={'city_id'}
                options={options}
                setCurrentPage={setCurrentPage}
                loadMore={fetchLoadMore}
                setSearchParams={setSearchParams}
                hasMore={options.length <= totalCount}
                isLoading={fetchingCities}
                defaultValue={
                  selectedItem
                    ? { id: selectedItem.city_id, label: selectedItem.city.name, value: selectedItem.city_id }
                    : null
                }
              />
            </Grid>

        
            <Grid item xs={6}>
              <SingleFileUpload
                handleImage={handleFeatureImage}
                defaultPhoto={selectedItem?.image || ''}
                label={'Venue Image'}
                mandatory
              />
               {errors.image && <Typography color="error" fontSize="0.75rem" mt={1}>{errors.image.message}</Typography>}
               
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
        </DialogActions>
      </form>
    </Dialog>
  )
}
