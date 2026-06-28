import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Box, IconButton, Typography, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import toast, { Toaster } from 'react-hot-toast'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
// const schema = yup.object().shape({
//     // name: yup.string().typeError('Amenities is required.').required('Amenities is required.'),
//     name: yup
//         // .string()
//         // .typeError('Amenities is required.')
//         // .required('Amenities is required.')
//         // .min(3, 'Amenities must be at least 3 characters long.') 
//         // .max(50, 'Amenities must be at most 50 characters.'),
//         .string()
//         .required('Truck Model Name is required.')
//         .matches(/^[a-zA-Z0-9\s]+$/, 'Brand cannot contain special characters.')
//         .matches(/^\S(.*\S)?$/, 'Brand cannot have leading or trailing spaces.')
//         .matches(/^(?!.*\s{2,}).*$/, 'Brand cannot have excessive spaces between words.')
//         .min(3, 'Brand must be at least 3 characters long.')
//         .max(50, 'Brand cannot be more than 50 characters long.')
//         .trim(), // Trims leading and trailing spaces



// })  
const schema = yup.object().shape({
    name: yup
        .string()
        .required('Truck Model Name is required.')
        .matches(/^[a-zA-Z0-9\s]+$/, 'Name cannot contain special characters.')
        .matches(/^\S(.*\S)?$/, 'Name cannot have leading or trailing spaces.')
        .matches(/^(?!.*\s{2,}).*$/, 'Name cannot have excessive spaces between words.')
        .min(3, 'Name must be at least 3 characters long.')
        .max(50, 'Name cannot be more than 50 characters long.'),

    length: yup
        .number()
        .typeError('Length must be a valid number.')
        .required('Length is required.')
        .moreThan(0, 'Length must be greater than 0.'),

    width: yup
        .number()
        .typeError('Width must be a valid number.')
        .required('Width is required.')
        .moreThan(0, 'Width must be greater than 0.'),



    height: yup
        .number()
        .typeError('Height must be a valid number.')
        .required('Height is required.')
        .moreThan(0, 'Height must be greater than 0.'),

 
    capacity: yup
        .number()
        .typeError('Capacity must be a valid number.')  
        .required('Capacity is required.')
        .moreThan(0, 'Capacity must be greater than 0.'),


    body_type: yup
        .mixed()
        .required('Truck Body Type is required.'),

    brand_id: yup.mixed().required('Brand Name is required.'),
})

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: {}
}

const AddTruckModel = ({ open, handleClose, fetchData, selectedItem }: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    const [optionse, setOptionse] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [searchParams, setSearchParams] = useState('')
    const [totalCount, setTotalCount] = useState(10)
    //   const [fetchingCities, setFetchingCities] = useState(false)
    const [fetchingAmenityType, setfetchingAmenityType] = useState(false)
    const options = [
        { label: 'Open Truck', value: 'open' },
        { label: 'Container Truck', value: 'closed' }
    ]
    const defaultValues = {
        brand_id: null,
        name: "",
        width: '',
        length: '',
        // date: "",
        height: '',
        capacity: '',
        body_type: null,

        // is_active: 0

    }

    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema), defaultValues })
    const value = watch();
    const onSubmit = async data => {
        setIsLoading(true)

        try {
            let payload = {
                name: data.name,
                length: data.length,
                width: data.width,
                height: data.height,
                capacity: data.capacity,
                body_type: data.body_type,
                brand_id: data.brand_id,
            }
            let url = ''
            if (selectedItem) {
                url = `/api/v1/admin/updateTruckModel?id=${selectedItem.id}`
            } else {
                url = '/api/v1/admin/createTruckModel'
            }
            const response = await axiosInstance.post(url, payload)
            if (response.data.success) {
                handleClose()
                fetchData()
                toast.success(selectedItem ? 'Truck Model updated successfully.' : 'Truck Model added successfully.')
            }
        } catch (e) {
            toast.error(
                selectedItem
                    ? e?.response?.data?.message ?? 'Failed to update Truck Model. Please try again.'
                    : e?.response?.data?.message ?? 'Failed to add Truck Model. Please try again.'
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
                const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?brand_id&pageNo=${currentPage}&limit=10${search}`)
                const data = response.data.data?.brands?.map((item: any) => ({ label: item.name, id: item.id, value: item.id }))
                setTotalCount(response.data.brands?.count)
                if (data) {

                    setOptionse((prev) => {
                        const existingIds = new Set(prev.map((item) => item.id));
                        const newOptionse = data.filter((item) => !existingIds.has(item.id));
                        return [...prev, ...newOptionse];
                    });
                }
            } catch (e) {
                } finally {
                setfetchingAmenityType(false)
            }
        }, 1000)
    }

    useEffect(() => {
        fetchLoadMore()
    }, [currentPage, searchParams])

    // useEffect(() => {
    //     if (selectedItem) {

    //         setValue('name', selectedItem?.name)
    //         setValue('body_type', { id: selectedItem?.body_type, label: selectedItem?.body_type?.name, value: selectedItem?.amenity_type_id })
    //         setValue('icon', selectedItem?.icon)
    //     }
    // }, [selectedItem])
    useEffect(() => {
        if (selectedItem) {
            setValue('name', selectedItem?.name)
            setValue('length', selectedItem?.length)
            setValue('width', selectedItem?.width)
            setValue('height', selectedItem?.height)
            setValue('capacity', selectedItem?.capacity)
            // setValue('body_type', {
            //     id: selectedItem.body_type,
            //     label: selectedItem.body_type.charAt(0).toUpperCase() + selectedItem.body_type.slice(1),
            //     value: selectedItem.body_type
            // })
            // // if (selectedItem?.body_type) {
            //     const matched = options.find(opt => opt.id === selectedItem.body_type)

            //     if (matched) {
            //         setValue('body_type', matched)
            //     }
            //                                 // }
            setValue('body_type', selectedItem?.body_type)
            setValue('brand_id', selectedItem?.brand_id)


            // setValue('brand_id', { id: selectedItem?.brand_id, label: selectedItem?.brand_id?.name, value: selectedItem?.brand_id })

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
                <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'Start', flexGrow: 1, paddingLeft: '10px' }}>
                    {selectedItem ? 'Update' : 'Add'} Truck Model{' '}
                </Typography>
                <IconButton onClick={handleClose}>
                    <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} name={'name'} label={'Truck Model Name'} placeholder={'Truck Model Name'} mandatory />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <RHFAutoComplete control={control} options={optionse} placeholder={'Brand Name'} fullWidth name="brand_id" resetApiFunction={undefined} onScrollToEnd={undefined} loading={undefined} labelinput={'Brand Name'} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <RHFAutoComplete control={control} options={options} placeholder={'Truck Body Type'} fullWidth name="body_type" resetApiFunction={undefined} onScrollToEnd={undefined} loading={undefined} labelinput={'Truck Body Type'} />
                        </Grid>



                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} name={'length'} label={'Length (FT)'} placeholder={'Length'} mandatory />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} name={'width'} label={'Width (FT)'} placeholder={'Width'} mandatory />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} name={'height'} label={'Height (FT)'} placeholder={'Height'} mandatory />
                        </Grid>
                        {/* <Grid item xs={12}>
                            <RHFInput control={control} type={'number'} name={'weight'} label={'Weight'} placeholder={'Weight'} mandatory />
                        </Grid> */}
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} name={'capacity'} label={'Capacity (Ton)'} placeholder={'Capacity'} mandatory />
                        </Grid>

                        {/* <Grid item xs={12}>
              <RHFInput control={control} name={'icon'} label={'Amenity Icon'} placeholder={'Amenity Icon'} mandatory />
            </Grid> */}
                        {/* <Grid item xs={12}>
              <Box mb={1.5}>
                <Box display="flex" alignItems="center" mb={-6}>
                  <Typography variant="body2" fontWeight={500} sx={{ color: 'text.primary' }}>
                    Amenity Icon
                    <Typography component="span" color="error" ml={0.5}>*</Typography>
                  </Typography>
               
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
            </Grid> */}



                    </Grid>
                </DialogContent>
                <DialogActions sx={{ mt: 3 }}>
                    <Button
                        variant='outlined'

                        onClick={handleClose}

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

export default AddTruckModel
