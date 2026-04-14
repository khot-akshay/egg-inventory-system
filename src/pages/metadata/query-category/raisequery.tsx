import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Box, IconButton, Typography, FormHelperText, Button } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import Icon from 'src/@core/components/icon'
import toast, { Toaster } from 'react-hot-toast'
import IconPicker from 'src/components/common/IconPicker'
import { Editor } from '@tinymce/tinymce-react';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
const schema = yup.object().shape({
    // name: yup.string().typeError('Amenities is required.').required('Amenities is required.'),
    name: yup

        .string()
        .required('Name is required.')
        .matches(/^[a-zA-Z0-9\s]+$/, 'Name cannot contain special characters.')
        .matches(/^\S(.*\S)?$/, 'Name cannot have leading or trailing spaces.')
        // .matches(/^(?!.*\s{2,}).*$/, 'Name cannot have excessive spaces between words.')
        .matches(
            /^(?!\s)(?!.*\s{2,})(?!.*\s$).+$/,
            'Name cannot start/end with space or have multiple spaces between words.'
        )
        .min(3, 'Name must be at least 3 characters long.')
        .max(50, 'Name cannot be more than 50 characters long.'),



    user_type: yup.string().required('Panel Type is required.')
        .nullable(),
})

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useSettings } from 'src/@core/hooks/useSettings'
import RHFAutoComplete2 from 'src/hook-forms/RHFAutoComplete2'

interface FormData {
    name: string
}
interface SelectedItem {
    id: any;
    name: any;
    // description?: any;



}

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: SelectedItem
}

const AddQuery = ({ open, handleClose, fetchData, selectedItem }: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    // const [options, setOptions] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [searchParams, setSearchParams] = useState('')
    const [totalCount, setTotalCount] = useState(10)

    // const options = [

    //     { id: 'customer', label: 'Customer', value: 'customer' },
    //     { id: 'vendor', label: 'Vendor', value: 'vendor' },
    // ]
    const options = [
        { label: 'All', value: 'all' },
        { label: 'Buyer', value: 'buyer' },
        { label: 'Seller', value: 'seller' },
        { label: 'Financer', value: 'financer ' },
    ]
    const defaultValues = {
        user_type: null,
        name: "",
    }

    const editorRef = useRef(null)
    const { settings } = useSettings()

    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema), defaultValues })
    console.log(errors, 'errors')

    const onSubmit = async (data) => {
        console.log(data, "data")
        setIsLoading(true)

        try {
            let payload = {
                name: data.name,
                // description: data.description,
                user_type: data?.user_type,// "driver", "customer", or "vendor"
            }
            let url = ''
            if (selectedItem) {
                url = `/api/v1/admin/query/updateQueryCategory/${selectedItem.id}`
            } else {
                url = '/api/v1/admin/query/createQueryCategory'
            }
            const response = await axiosInstance.post(url, payload)
            if (response.data.success) {
                handleClose()
                fetchData()
                toast.success(response.data.message)
            }
        } catch (e: any) {
            console.error(e)
            if (e?.response?.data?.data) {
                const serverErrors = e.response.data.data
                Object.keys(serverErrors).forEach(field => {
                    setError(field as any, {
                        type: 'server',
                        message: serverErrors[field][0]
                    })
                })
            }
           
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        console.log(selectedItem)
        if (selectedItem) {

            setValue('name', selectedItem?.name)

            setValue('user_type', selectedItem?.user_type || null)


        }
    }, [selectedItem])
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby='dialog-name'
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
                id='customized-dialog-name'
            >
                <Toaster position="top-right" reverseOrder={false} />
                <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'Start', flexGrow: 1, paddingLeft: '10px' }}>
                    {selectedItem ? 'Update' : 'Add'} Query Category {' '}
                </Typography>
                <IconButton onClick={handleClose}>

                    <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} >
                            <RHFInput control={control} name={'name'} label={'Name'} placeholder={'Name'} mandatory={true} />
                        </Grid>
                        {/* <Grid item xs={12} md={6} >
                            <RHFAutoComplete control={control} options={options} placeholder={'Panel Type'} fullWidth name="user_type" resetApiFunction={undefined} onScrollToEnd={undefined} loading={undefined} labelinput={'Panel Type'} />
                        </Grid> */}
                        <Grid item xs={12} md={6}>
                            <RHFAutoComplete2
                                control={control}
                                name="user_type"
                                options={options}
                                placeholder="Select Panel Type"
                                label="Select Panel Type"
                                loading={false}
                                resetApiFunction={undefined}
                                onScrollToEnd={undefined}
                                onChange={undefined}
                                mandatory={true}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ mt: 3 }}>
                    <Button variant='outlined' onClick={handleClose}>
                        Cancel
                    </Button>
                    <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                </DialogActions>
            </form>

        </Dialog>
    )
}

export default AddQuery
