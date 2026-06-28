import { yupResolver } from '@hookform/resolvers/yup';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import Icon from 'src/@core/components/icon';
import { useSettings } from 'src/@core/hooks/useSettings';
import SubmitButton from 'src/components/common/button/Button';
import SingleFileUpload from 'src/components/common/fileupload/singleFileUpload';
import RHFInput from 'src/hook-forms/RHFInput';
import axiosInstance from 'src/services/axios';
import * as yup from 'yup';
const schema = yup.object().shape({
    name: yup.string().typeError('Game Name is required.').required('Game Name is required.').trim(),
    description: yup.string().typeError('Description is required.').required('Description is required.').trim(),
    image: yup.mixed().typeError('Image is required.').required('Game Image is required.'),
 

});

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: {}
}
export default function AddGame({ open, handleClose, fetchData, selectedItem }: Props) {

    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data) => {
        const formData = new FormData()

        if (data.image && data.image[0]) {
            formData.append('image', data.image[0])
          }
    
          formData.append('name', data.name)
          formData.append('description', data.description)
    
        setIsLoading(true);
        try {
            let url = ''
            if (selectedItem) {
                url = `v1/admin/updateGame?id=${selectedItem.id}`
            } else {
                url = 'v1/admin/createGame'
            }
            const response = await axiosInstance.post(url, formData);
            if (response.data.success) {
                handleClose();
                fetchData();
                toast.success(selectedItem ? 'Game updated successfully.' : 'Game added successfully.')
            }
        } catch (e) {
            if (e.response?.status === 412 && e.response?.data?.data) {
                for (const key in e.response?.data?.data) {
                  setError(key, { type: 'manual', message: e.response?.data?.data[key].join(',') });
                }
              } else {
                // toast.error(e?.response?.data?.message ?? 'Failed to add Game. Please try again.')
                toast.error(
                    selectedItem 
                      ? e?.response?.data?.message ?? 'Failed to update Game. Please try again.' 
                      : e?.response?.data?.message ?? 'Failed to add Game. Please try again.'
                  )
              }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setValue('name', selectedItem?.name)
        setValue('description', selectedItem?.description)
        if (selectedItem?.image) {
            setValue('image', [selectedItem.image]); // Set existing image in an array
        }
    }, [selectedItem, setValue])
    const handleFeatureImage = async (content) => {
        if (content.length > 0) {

            setValue('image', content)
        }
    }
    return (
        <Dialog open={open} onClose={handleClose}
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            maxWidth={'md'}
            fullWidth
            disableEnforceFocus={true}
        >        <DialogTitle
            sx={{
                m: 0,
                p: 2,
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#3A4E7C0F',
            }}
            id="customized-dialog-title"
        >
               <Toaster position="top-right" reverseOrder={false} />
                <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
                    {selectedItem ? 'Update' : 'Add'}  Game  </Typography>
                <IconButton onClick={handleClose}>
                    <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'name'} label={'Game Name'} placeholder={'Game Name'} mandatory />
                        </Grid>
                        <Grid item xs={12}>
                            <RHFInput control={control} multiline rows={4} name={'description'} label={'Description'} placeholder={'Description'} mandatory />
                        </Grid>
                        <Grid item xs={6}>
                            <SingleFileUpload handleImage={handleFeatureImage}   defaultPhoto={selectedItem?.image ?? ''} label={'Game Image'} mandatory />
                            {errors.image && <Typography color="error">{errors.image.message}</Typography>}
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ mt: 3 }}>
                    <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                </DialogActions>
            </form>
        </Dialog>
    );
}
