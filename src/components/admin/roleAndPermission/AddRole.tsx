import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Icon from 'src/@core/components/icon';

import {
    Box,
    Checkbox,
    CircularProgress,
    DialogTitle,
    Divider,
    FormControlLabel,
    FormHelperText,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from 'src/hooks/useAuth';
import axiosInstance from 'src/services/axios';
import RHFInput from 'src/hook-forms/RHFInput';
import DataTreeCheckbox from 'src/components/common/DataTreeSelection';
import SubmitButton from 'src/components/common/button/Button';
interface AddRoleDialogProps {
    openDelete: boolean;
    onClose: () => void;
    fetchData: () => void;
}

const schema = yup.object().shape({
    name: yup.string().typeError('Role Name is required.').required('Role Name is required.').trim().min(3, 'Role Name must be at least 3 characters.').matches(/^[A-Za-z\s]+$/, 'Role Name must only contain alphabets and spaces.').max(255, 'Role Name must not exceed 255 characters.').matches(/^(?!.*\s{2,}).*$/, 'Role Name should not contain excessive whitespace.'),
    // permissions: yup.array().required('Permissions are required.')
});

const AddRolePopupDialog: React.FC<AddRoleDialogProps> = ({ openDelete, onClose, fetchData,  }) => {
    const theme = useTheme();
    const auth = useAuth()
    const [isLoading, setIsLoading] = useState(false);
    const [allPermisstion, setAllPermisstion] = useState<any[]>([]);
    const [selectedCheckbox, setSelectedCheckbox] = useState<number[]>([]);
    const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) });

    const fetchPermisstion = async () => {
        try {
            const response = await axiosInstance.get(`/v1/${auth.user?.role}/getAllPermission?parent=true&sort_by=id&sort_order=asc`);
            setAllPermisstion(response.data.data.permissions);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchPermisstion();
    }, []);

    const handleUpdate = async (data) => {
        setIsLoading(true);
        const permisstion = [...new Set(selectedCheckbox)].sort();
        try {
            const response = await axiosInstance.post(`/v1/${auth.user?.role}/addRole`, {
                ...data,
                permissions: permisstion,
            });
            if (response.data.success) {
                onClose();
                toast.success(response.data.message);
                fetchData();
                
            }
        } catch (e) {
            if (e?.response?.status === 412 && e?.response?.data?.data) {
                for (const key in e?.response?.data?.data) {
                    setError(key, { type: 'manual', message: e?.response?.data?.data[key].join(',') });
                }
            } else {
                toast.error(e?.response?.data?.message)
            }
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleSelectAllCheckbox = () => {
        if (selectedCheckbox.length === allPermisstion.flatMap(item => [item.id, ...(item.children?.map(child => child.id) || [])]).length) {
            setSelectedCheckbox([]);
        } else {
            const allIds = allPermisstion.flatMap(item => [item.id, ...(item.children?.map(child => child.id) || [])]);
            setSelectedCheckbox(allIds);
        }
        // setIsIndeterminateCheckbox(false);
    };
    useEffect(() => {
        console.log(selectedCheckbox)
        const allId = selectedCheckbox?.length > 0 && selectedCheckbox?.length !== allPermisstion.flatMap(item => [item.id, ...(item.children?.map(child => child.id) || [])])?.length
        console.log(allId)
        setIsIndeterminateCheckbox(allId)
    }, [selectedCheckbox])
    const togglePermission = (id: string) => {
        const isChecked = selectedCheckbox.includes(id);
        let newSelectedCheckbox = isChecked
            ? selectedCheckbox.filter(checkboxId => checkboxId !== id)
            : [...selectedCheckbox, id];

        const permission = allPermisstion.find(item => item.id === id);

        if (permission) {
            const childIds = permission.children?.map(child => child.id) || [];

            if (isChecked) {
                newSelectedCheckbox = newSelectedCheckbox.filter(checkboxId => !childIds.includes(checkboxId));
            } else {
                newSelectedCheckbox = [...newSelectedCheckbox, ...childIds];
            }
        }
        const parent = allPermisstion.find(item => item.children?.some(child => child.id === id));

        if (parent) {
            const childIds = parent.children?.map(child => child.id) || [];

            if (isChecked) {
                newSelectedCheckbox = newSelectedCheckbox.filter(checkboxId => checkboxId !== id);
            } else {
                newSelectedCheckbox = [...newSelectedCheckbox, id];
                const allChildrenSelected = childIds.map(childId => newSelectedCheckbox.includes(childId));

                if (allChildrenSelected && !newSelectedCheckbox.includes(parent.id)) {
                    newSelectedCheckbox.push(parent.id);
                }
            }
        }


        setSelectedCheckbox(newSelectedCheckbox);

        const allIds = allPermisstion.flatMap(item => [item.id, ...(item.children?.map(child => child.id) || [])]);
        setIsIndeterminateCheckbox(newSelectedCheckbox.length > 0 && newSelectedCheckbox.length < allIds.length);
    };

    return (
        <Grid container spacing={2}>
            {/* <Grid item xs={12} md={12}> */}
            <React.Fragment>
                <Dialog
                    open={openDelete}
                    onClose={onClose}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                    fullWidth
                    maxWidth={'md'}
                    sx={{ borderRadius: '20px', padding: '30px' }}
                >
                    <DialogTitle
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

                        <Typography sx={{ fontSize: '25px', color: '#3e66f3', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
                            Add Role  </Typography>
                        <IconButton onClick={onClose}>
                            <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        {/* <Grid container justifyContent={'center'}> */}
                        <Grid item xs={12} md={6}>
                            <RHFInput name='name' label='Role Name' control={control} placeholder='Role Name' mandatory />
                        </Grid>
                        {/* </Grid> */}

                        <Grid xs={12} md={12} sx={{ mt: 3 }}>
                            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        fontSize: '0.875rem',
                                        whiteSpace: 'nowrap',
                                        alignItems: 'center',
                                        textTransform: 'capitalize',
                                        '& svg': { ml: 1, cursor: 'pointer' }
                                    }}
                                >
                                    Administrator Access<span style={{ color: 'red' }}>*</span>
                                    <Tooltip placement='top' title='If you select all, it allows a full access to the system.'>
                                        <Box sx={{ mr: 2, display: 'flex', color: 'text.secondary' }}>
                                            <Icon icon='bx:info-circle' fontSize='1rem' />
                                        </Box>
                                    </Tooltip>
                                </Box>
                                <Box>
                                    <FormControlLabel
                                        label='Select All'
                                        sx={{ '& .MuiTypography-root': { textTransform: 'capitalize' } }}
                                        control={
                                            <Checkbox
                                                onChange={handleSelectAllCheckbox}
                                                indeterminate={isIndeterminateCheckbox}
                                                checked={selectedCheckbox.length === allPermisstion.flatMap(item => [item.id, ...(item.children?.map(child => child.id) || [])]).length}
                                            />
                                        }
                                    />
                                    {errors.permissions && (
                                        <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-permissions'>
                                            {errors.permissions.message}
                                        </FormHelperText>
                                    )}
                                </Box>
                            </Box>
                        </Grid>
                        <Box marginTop={4}>
                        <Divider />
                        </Box>


                        <Grid container>

                            {allPermisstion.length > 0 && <DataTreeCheckbox data={allPermisstion} selectedCategories={selectedCheckbox} onCategorySelect={(e: any) => {
                                console.log(e)
                                // setValue('categories', e)
                                setSelectedCheckbox(e)
                            }} />}
                        </Grid>

                        <Box sx={{ marginTop: 5, display: 'flex', gap: 5, justifyContent: 'end', width: '100%', alignItems: 'center' }}>
                            <SubmitButton onSubmit={handleSubmit(handleUpdate)} isLoading={isLoading} label={'Submit'} isWidth={false} />
                            {/* <Button variant='outlined' onClick={onClose} sx={{ width: 150, height: 40, }}>
                                Cancel
                            </Button> */}
                        </Box>
                    </DialogContent>
                </Dialog>
            </React.Fragment>
            {/* </Grid> */}
        </Grid>
    );
};

export default AddRolePopupDialog;
