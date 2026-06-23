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

const schema = yup.object().shape({


    truck_size_in_ft: yup
        .number()
        .typeError('Truck Size must be a valid number.')
        .required('Truck Size is required.')
        .moreThan(0, 'Truck Size must be greater than 0.'),

    capacity_upto_ton: yup
        .number()
        .typeError('Capacity must be a valid number.')
        .required('Capacity is required.')
        .moreThan(0, 'Capacity must be greater than 0.'),



    local_base_fare: yup
        .number()
        .typeError('Local Base Fare must be a valid number.')
        .required('Local Base Fare is required.')
        .moreThan(0, 'Local Base Fare must be greater than 0.'),


    outstation_rate_per_km: yup
        .number()
        .typeError('Outstation Rate must be a valid number.')
        .required('Outstation Rate is required.')
        .moreThan(0, 'Outstation Rate must be greater than 0.'),



})

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: {}
}
interface FormData {
    truck_size_in_ft: number
    capacity_upto_ton: number
    local_base_fare: number
    outstation_rate_per_km: number
}


const AddTruckPrice = ({ open, handleClose, fetchData, selectedItem }: Props) => {
    const [isLoading, setIsLoading] = useState(false)

    const defaultValues = {
        brand_id: null,
        truck_size_in_ft: '',
        capacity_upto_ton: '',
        local_base_fare: '',
        outstation_rate_per_km: '',

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
                truck_size_in_ft: data.truck_size_in_ft,
                capacity_upto_ton: data.capacity_upto_ton,
                local_base_fare: data.local_base_fare,
                outstation_rate_per_km: data.outstation_rate_per_km,
            }
            let url = ''
            if (selectedItem) {
                url = `/api/v1/admin/updateTruckPricing?id=${selectedItem.id}`
            } else {
                url = '/api/v1/admin/addTruckPricing'
            }
            const response = await axiosInstance.post(url, payload)
            if (response.data.success) {
                handleClose()
                fetchData()
                toast.success(selectedItem ? 'Truck Price updated successfully.' : 'Truck Price added successfully.')
            }
        } catch (e) {
            toast.error(
                selectedItem
                    ? e?.response?.data?.message ?? 'Failed to update Truck Price. Please try again.'
                    : e?.response?.data?.message ?? 'Failed to add Truck Price. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (selectedItem) {

            setValue('truck_size_in_ft', selectedItem?.truck_size_in_ft)
            setValue('capacity_upto_ton', selectedItem?.capacity_upto_ton)
            setValue('local_base_fare', selectedItem?.local_base_fare)
            setValue('outstation_rate_per_km', selectedItem?.outstation_rate_per_km)

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
                    {selectedItem ? 'Update' : 'Add'} Truck Price{' '}
                </Typography>
                <IconButton onClick={handleClose}>
                    <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} name={'truck_size_in_ft'} label={'Truck Size (FT)'} placeholder={'Truck Size'} mandatory />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} name={'capacity_upto_ton'} label={'Capacity (Ton)'} placeholder={'Capacity'} mandatory />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} warningText={'Local Base Rate should be at least ₹500.'} name={'local_base_fare'} label={'Local Base Fare Rate (INR)'} placeholder={'Local Base Fare Rate'} mandatory />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} type={'number'} name={'outstation_rate_per_km'} label={'Outstation Rate Per Km (INR)'} placeholder={'Outstation Rate'} />
                        </Grid>

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

export default AddTruckPrice
