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
import RHFInput from 'src/hook-forms/RHFInput';
import axiosInstance from 'src/services/axios';
import * as yup from 'yup';
const schema = yup.object().shape({
    // name: yup.string().typeError('Amenity Type is required.').required('Amenity Type is required.'),
    name: yup
    .string()
    .required('Amenity Type is required.')
    .matches(/^[a-zA-Z0-9\s]+$/, 'Amenity Type cannot contain special characters.')
    .matches(/^\S(.*\S)?$/, 'Amenity Type cannot have leading or trailing spaces.')
    .matches(/^(?!.*\s{2,}).*$/, 'Amenity Type cannot have excessive spaces between words.')
    .min(3, 'Amenity Type must be at least 3 characters long.') 
    .max(50, 'Amenity Type cannot be more than 50 characters long.')
    .trim(), // Trims leading and trailing spaces
  
   
});

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: {}
}

export default function AddAmenity_type ({ open, handleClose , fetchData, selectedItem  }) {

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
        setIsLoading(true);
        try {
            let url = ''
            if (selectedItem) {
                url = `v1/admin/updateAmenityType?id=${selectedItem.id}`
            } else {
                url = 'v1/admin/createAmenityType'
            }
         
            const response = await axiosInstance.post(url, data);
            if (response.data.success) {
                handleClose();
                fetchData();
                toast.success(selectedItem ? 'Amenity Type updated successfully.' : 'Amenity Type added successfully.')
            }
        } catch (e) {
            console.error(e);
            toast.error(
                selectedItem 
                  ? e?.response?.data?.message ?? 'Failed to update amenity type. Please try again.' 
                  : e?.response?.data?.message ?? 'Failed to add amenity type. Please try again.'
              )
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setValue('name', selectedItem?.name)
       
    }, [])
        

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
                {selectedItem ? 'Update' : 'Add'}   Amenity Type  </Typography>
                <IconButton onClick={handleClose}>
                    <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ gap: 2 }}>
                            <RHFInput control={control} name={'name'} label={'Amenity Type'} placeholder={'Amenity Type'} mandatory />
                        </Grid>
                        {/* <Grid item xs={12}>
                            <RHFInput control={control} multiline rows={4} name={'description'} label={'Description'} placeholder={'Description'} mandatory />
                        </Grid> */}
                     
                    </Grid>
                </DialogContent>
                <DialogActions sx={{mt:3}}>
                    <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false}  />
                </DialogActions>
            </form>
            {/* <VariablePopup open={variableOpen} handleClose={() => setVariableOpen(false)} type={watch('type')} addStringToEditor={addVariableToEditor} /> */}
        </Dialog>
    );
}

