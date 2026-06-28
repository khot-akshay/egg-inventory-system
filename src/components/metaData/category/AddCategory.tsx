import { yupResolver } from '@hookform/resolvers/yup';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Icon from 'src/@core/components/icon';
import { useSettings } from 'src/@core/hooks/useSettings';
import SubmitButton from 'src/components/common/button/Button';
import RHFInput from 'src/hook-forms/RHFInput';
import RHFSelectName from 'src/hook-forms/RHFSelectName';
import axiosInstance from 'src/services/axios';
import { useRouter } from 'next/router'

import * as yup from 'yup';
import toast from 'react-hot-toast';
import { capitalizeFirstLetter } from 'src/utils/encodeid';
const schema = yup.object().shape({
    // name: yup.string().typeError('Amenity Type is required.').required('Amenity Type is required.'),
    category_name: yup
        .string()
        .required('Category Name  is required.')
        .matches(/^[a-zA-Z0-9\s]+$/, 'Category Name cannot contain special characters.')
        .matches(/^\S(.*\S)?$/, 'Category Name cannot have leading or trailing spaces.')
        .matches(/^(?!.*\s{2,}).*$/, 'Category Name cannot have excessive spaces between words.')
        .min(3, 'Category Name must be at least 3 characters long.')
        .max(50, 'Category Name cannot be more than 50 characters long.')
        .trim(),
    // category_type: yup
    //     .string()
    //     .required('Amenity Type is required.')
    // ,

});

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: {}
}

export default function AddCategory({ open, handleClose, fetchData, selectedItem }) {

    const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

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

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            let url = ''
            if (selectedItem) {
                url = `v1/admin/updateCategory?id=${selectedItem.id}`
            } else {
                url = `/v1/admin/createCategory?category_type=${router.query.slug}`
            }
            const response = await axiosInstance.post(url, data);
            if (response.data.success) {
                toast.success(selectedItem ? 'Category updated successfully.' : 'Category added successfully.',{position: 'top-right'})
                handleClose();
                fetchData();
                reset()
            }
        } catch (e) {
            } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setValue('category_name', selectedItem?.category_name)
        setValue('category_type', selectedItem?.category_type)

    }, [selectedItem])

    const handleCloseModal = () => {
        reset()
        handleClose()
    }
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
                    {selectedItem ? 'Update' : 'Add'} {capitalizeFirstLetter(router.query.slug)} Category
         </Typography>
                <IconButton onClick={handleClose}>
                    <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sx={{ gap: 2 }}>
                            <RHFInput control={control} name={'category_name'} label={'Category Name'} placeholder={'Category Name'} mandatory />
                        </Grid>
                        {/* <Grid item xs={12}>
                            <FormControl size='small' fullWidth>
                                <label style={{ marginTop: '12px' }}>
                                    Category Type
                                    <span style={{ color: 'red' }}>*</span>
                                </label>

                                <Select
                                    size='small'
                                    // label='Category Type'
                                    {...register('category_type')}
                                    error={Boolean(errors.type)}
                                    labelId='validation-type'
                                    defaultValue={selectedItem?selectedItem?.category_type:'expense'}
                                    aria-describedby='validation-type'
                                >
                                    <MenuItem value='expenses'>Expense</MenuItem>
                                    <MenuItem value='maintenance'>Maintenance</MenuItem>

                                </Select>

                                {errors.type && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-type'>
                                        {errors.category_type.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid> */}

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ mt: 3 }}>
                    <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                </DialogActions>
            </form>
            {/* <VariablePopup open={variableOpen} handleClose={() => setVariableOpen(false)} type={watch('type')} addStringToEditor={addVariableToEditor} /> */}
        </Dialog>
    );
}

