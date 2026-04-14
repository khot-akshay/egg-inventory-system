import { yupResolver } from '@hookform/resolvers/yup';
import {
    Alert,
    AlertTitle,
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
import toast from 'react-hot-toast';
import Icon from 'src/@core/components/icon';
import { useSettings } from 'src/@core/hooks/useSettings';
import SubmitButton from 'src/components/common/button/Button';
import SingleFileUpload from 'src/components/common/fileupload/singleFileUpload';
import RHFInput from 'src/hook-forms/RHFInput';
import axiosInstance from 'src/services/axios';
import * as yup from 'yup';
const schema = yup.object().shape({
    name: yup.string().typeError(' Name is required.').required(' Name is required.').trim(),
    account_id: yup.string().typeError('account id is required.').required('Account ID is required.').trim(),

});

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: {}
}
export default function AddPaymentAccount({ open, handleClose, fetchData, selectedItem }: Props) {

    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) });
    const handleCloseModal = () => {
        handleClose()
        reset()
    }
    const onSubmit = async (data) => {

        setIsLoading(true);
        try {
            let url = ''
            if (selectedItem) {
                url = `v1/admin/updateAccount?id=${selectedItem.id}`
            } else {
                url = 'v1/admin/addAccount'
            }
            const response = await axiosInstance.post(url, data);
            if (response.data.success) {
                handleCloseModal()
                fetchData();
                toast.success(selectedItem ? 'Account updated successfully.' : 'Account added successfully.')
            }
        } catch (e) {
            console.error(e);
            if (e.response?.status === 412 && e.response?.data?.data) {
                for (const key in e.response?.data?.data) {
                    setError(key, { type: 'manual', message: e.response?.data?.data[key].join(',') });
                }
            } else {
                toast.error(e?.response?.data?.message ?? 'Failed to add account. Please try again.')
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(selectedItem){

            setValue('name', selectedItem?.name)
            setValue('account_id', selectedItem?.account_id)
        }
    }, [selectedItem])

    return (
        <Dialog open={open} onClose={handleCloseModal}
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
                <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
                    {selectedItem ? 'Update' : 'Add'} Payment Account   </Typography>
                <IconButton onClick={handleCloseModal}>
                    <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Alert severity='warning'>
                        <AlertTitle>Warning</AlertTitle>
                        Make sure to add the correct account ID. Otherwise, payment processing may fail.
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'name'} label={' Name'} placeholder={' Name'} mandatory />
                        </Grid>
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'account_id'} label={'Account ID'} placeholder={'Account ID'} mandatory />
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
