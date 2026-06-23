import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import { useSettings } from 'src/@core/hooks/useSettings'
import SubmitButton from 'src/components/common/button/Button'
import MultiFileUploader from 'src/components/common/fileupload/MultiFileUpload'
import UploadFile from 'src/components/common/fileupload/singleFileUpload'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
// const schema = yup.object().shape({
//     images: yup.array().typeError('Images is required.').required('Images is required.')
// })
const schema = yup.object().shape({
    // images: yup.array().min(1, 'Images is required').required('Images are required'),
    title: yup.string().required('Title is required'),
    sub_title: yup.string().required('Sub Title is required')
});

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: {}
}
export default function AddBanner({ open, handleClose, fetchData, selectedItem }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [defaultPhoto, setDefaultPhoto] = useState([])
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

        const { images } = data
        // Append primary image
        // if (images && images.length > 0 && !selectedItem) {
        //     images.forEach((item, index) => {
        //         formData.append(`images[${index}]`, item);
        //     });
        // }
        // if (images && images.length > 0) {
        //     formData.append('image', images[0])
        // }
        if (images && images.length > 0) {
            formData.append('images', images[0])
        }
        formData.append('title', data.title)
        formData.append('sub_title', data.sub_title)
        try {
            let url = ''
            if (selectedItem) {
                url = `v1/admin/updateCarousel?id=${selectedItem.id}`
            } else {
                url = 'v1/admin/createCarousel'
            }
            const response = await axiosInstance.post(url, formData)
            if (response.data.success) {
                handleClose()
                fetchData()
                toast.success(selectedItem ? 'Banner updated successfully.' : 'Banner added successfully.')
            }
        } catch (e) {
            toast.error(
                selectedItem
                    ? e?.response?.data?.message ?? 'Failed to update banner. Please try again.'
                    : e?.response?.data?.message ?? 'Failed to add banner. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleImage = (value) => {
        // setValue('images', value)
        // value should be an array of File(s)
        if (value && value.length > 0) {
            setValue('images', value)
        }
        if (selectedItem) {
            setDefaultPhoto([selectedItem.images])
        }
    }
    useEffect(() => {
        if (selectedItem) {
            setValue('title', selectedItem?.title)
            setValue('sub_title', selectedItem?.sub_title)
            setDefaultPhoto([selectedItem.images])
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
            > <Toaster position="top-right" reverseOrder={false} />
                <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
                    {selectedItem ? 'Update' : 'Add'} Banner{' '}
                </Typography>
                <IconButton onClick={handleClose}>
                    <Icon icon='bx:x' style={{ fontSize: '30px', color: 'text-dark' }} />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'title'} label={'Title'} placeholder={'Title'} />
                        </Grid>
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'sub_title'} label={'Sub Title'} placeholder={'Sub Title'} />
                        </Grid>
                        <Grid item xs={12}>
                            {/* <TextField

                                type='file'
                                size='small'
                                label='Banner Image'
                                {...register("images")}
                                error={Boolean(errors.images)}
                                aria-describedby='validation-async-images'
                                InputLabelProps={{ shrink: true }} inputProps={{ accept: 'image/*' }}

                            /> */}

                            {selectedItem ? (

                                <UploadFile handleImage={handleImage} defaultPhoto={defaultPhoto} label={'Update Banner'} mandatory />
                            ) : (
                                <UploadFile handleImage={handleImage} defaultPhoto={''} label={'Add banners'} mandatory />

                            )}

                            {errors.images && <Typography color="error" fontSize="0.75rem" mt={1}>{errors.images.message}</Typography>}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ mt: 3 }}>
                    <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                </DialogActions>
            </form>
        </Dialog>
    )
}
