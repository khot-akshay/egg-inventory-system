import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Box, IconButton, Typography, FormHelperText, Button } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import toast, { Toaster } from 'react-hot-toast'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';


const schema = yup.object().shape({
    name: yup

        .string()
        .required('Name is required.')
        .matches(/^[a-zA-Z0-9\s]+$/, 'Name cannot contain special characters.')
        .matches(/^\S(.*\S)?$/, 'Name cannot have leading or trailing spaces.')
        // .matches(/^(?!.*\s{2,}).*$/, 'Title cannot have excessive spaces between words.')
        .matches(
            /^(?!\s)(?!.*\s{2,})(?!.*\s$).+$/,
            'Name cannot start/end with space or have multiple spaces between words.'
        )
        .min(3, 'Name must be at least 3 characters long.')
        .max(50, 'Name cannot be more than 50 characters long.'),

})



interface FormData {
    name: string
}

interface SelectedItem {
    id: any;
    name: any;
}

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: SelectedItem
}

const AddMaterialType = ({ open, handleClose, fetchData, selectedItem }: Props) => {
    const [isLoading, setIsLoading] = useState(false)

    const [currentPage, setCurrentPage] = useState(0)
    const [searchParams, setSearchParams] = useState('')
    const [totalCount, setTotalCount] = useState(10)
    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)

        try {
            let payload = {
                name: data.name,
            }
            let url = ''
            if (selectedItem) {
                url = `/api/v1/admin/updateMaterialType?id=${selectedItem.id}`
            } else {
                url = '/api/v1/admin/createMaterialType'
            }
            const response = await axiosInstance.post(url, payload)
            if (response.data.success) {
                handleClose()
                fetchData()
                toast.success(selectedItem ? 'Material Type updated successfully.' : 'Material Type  added successfully.')
            }
        } catch (e: any) {
            console.error(e)
            toast.error(
                selectedItem
                    ? e?.response?.data?.message ?? 'Failed to update Material Type . Please try again.'
                    : e?.response?.data?.message ?? 'Failed to add  Material Type. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }






    useEffect(() => {
        if (selectedItem) {

            setValue('name', selectedItem?.name)

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
                    {selectedItem ? 'Update' : 'Add'} Material Type {' '}
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

export default AddMaterialType
