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
import Icon from 'src/@core/components/icon';
import { useTheme } from '@mui/material/styles';
import data from 'src/@fake-db/components/data';
import { useAuth } from 'src/hooks/useAuth';
import axiosInstance from 'src/services/axios';
import SubmitButton from 'src/components/common/button/Button';
import DataTreeCheckbox from 'src/components/common/DataTreeSelection';
import RHFInput from 'src/hook-forms/RHFInput';

interface UpdateRoleDialogProps {
    openDelete: boolean;
    onClose: () => void;
    fetchData: () => void;
    selectedItem: any;
}

const schema = yup.object().shape({
    name: yup.string().typeError('Role Name is required.').required(' Role Name is required.').trim().matches(/^(?!.*\s{2,}).*$/, 'Role Name should not contain excessive whitespace.'),
});

const UpdateRolePopupDialog: React.FC<UpdateRoleDialogProps> = ({ openDelete, onClose, fetchData, selectedItem }) => {
    const theme = useTheme();
    const auth = useAuth()
    const [isLoading, setIsLoading] = useState(false);
    const [allPermisstion, setAllPermisstion] = useState<any[]>([]);
    const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>(
        selectedItem?.permissions ?? []
    );

    const {
        control,
        handleSubmit,
        setValue,
        setError,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) });

    // Computes selected child slugs + parent IDs for all parents where all children are selected
    const computeFullSelection = (savedSlugs: string[], allPerms: any[]): string[] => {
        const parentIds: string[] = [];
        allPerms.forEach((parent: any) => {
            const childSlugs = parent.children?.map((c: any) => c.id) ?? [];
            if (childSlugs.length > 0 && childSlugs.every((slug: string) => savedSlugs.includes(slug))) {
                parentIds.push(parent.id); // module:xxx
            }
        });
        return [...savedSlugs, ...parentIds];
    };

    useEffect(() => {
        let isMounted = true;
        
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                setValue('name', selectedItem?.name);

                // Start both fetches in parallel with cache-busting timestamps
                const ts = new Date().getTime();
                const permsPromise = axiosInstance.get(`/api/v1/admin/getAllPermissions?t=${ts}`);
                const rolesPromise = selectedItem?.id ? axiosInstance.get(`/api/v1/getAllRoles?t=${ts}`) : Promise.resolve(null);
                
                const [permsRes, rolesRes] = await Promise.all([permsPromise, rolesPromise]);
                
                // Process tree
                const modules = permsRes.data.data.permission_modules || permsRes.data.data.modules || [];
                const perms = modules.map((mod: any) => ({
                    id: `module:${mod.module || mod.name}`,
                    name: mod.label || mod.name,
                    display_name: mod.label || mod.name,
                    children: (mod.permissions || []).map((perm: any) => ({
                        id: perm.slug || String(perm.id),
                        numericId: perm.id,
                        name: perm.name,
                        display_name: perm.name,
                        slug: perm.slug,
                        children: []
                    }))
                }));
                
                if (isMounted) setAllPermisstion(perms);

                // Determine role permissions
                let slugs: string[] = [];
                const freshRole = rolesRes?.data?.data?.roles?.find((r: any) => r.id === selectedItem?.id);
                const sourceData = freshRole?.permissions || selectedItem?.permissions;
                
                if (Array.isArray(sourceData)) {
                    if (typeof sourceData[0] === 'string') {
                        slugs = sourceData;
                    } else {
                        slugs = sourceData.map((p: any) => p.slug || String(p.id));
                    }
                }
                
                if (isMounted) {
                    setSelectedCheckbox(computeFullSelection(slugs, perms));
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        if (openDelete) {
            loadInitialData();
        }
        
        return () => { isMounted = false; };
    }, [openDelete, selectedItem?.id]);

    const handleUpdate = async (data) => {
        setIsLoading(true);
        // Map selected slugs back to integer IDs for the API
        const allChildren = allPermisstion.flatMap((p: any) => p.children || []);
        const permisstion = [...new Set(selectedCheckbox)]
            .filter(id => !String(id).startsWith('module:'))
            .map(slug => {
                const found = allChildren.find((c: any) => c.id === slug);
                // If the API provided an integer ID, use it. Otherwise, fallback to sending the slug string.
                if (found?.numericId) {
                    return Number(found.numericId);
                }
                return slug;
            })
            .filter(val => val !== null && val !== undefined);
        try {
            const response = await axiosInstance.post(`/api/v1/admin/assignPermissionsToRole`, {
                role_id: Number(selectedItem.id),
                permission_ids: permisstion,
            });
            if (response.data.success) {
                fetchData();
                onClose();
                toast.success(response.data.message);
            }
        } catch (e:any) {
            console.error("API Error Response:", e?.response?.data);
            if ((e?.response?.status === 422 || e?.response?.status === 412) && e?.response?.data?.data) {
                for (const key in e?.response?.data?.data) {
                    setError(key as any, { type: 'manual', message: e?.response?.data?.data[key].join(', ') });
                    toast.error(`${key}: ${e?.response?.data?.data[key].join(', ')}`);
                }
            } else {
                toast.error(e?.response?.data?.message || "An error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAllCheckbox = () => {
        const allIds = allPermisstion.flatMap(item => [item.id, ...(item.children?.map(child => child.id) || [])]);
        if (selectedCheckbox.length === allIds.length && allIds.length > 0) {
            setSelectedCheckbox([]);
        } else {
            setSelectedCheckbox(allIds);
        }
    };
    
    const totalLength = allPermisstion.flatMap(item => [item.id, ...(item.children?.map(child => child.id) || [])]).length;
    const isIndeterminateCheckbox = selectedCheckbox.length > 0 && selectedCheckbox.length < totalLength;
    const isAllSelected = totalLength > 0 && selectedCheckbox.length === totalLength;
    const togglePermission = (id: string) => {
        const isChecked = selectedCheckbox.includes(id);
        let newSelectedCheckbox = isChecked
            ? selectedCheckbox.filter(checkboxId => checkboxId !== id)
            : [...selectedCheckbox, id];

        const permission = allPermisstion.find(item => item.id === id );
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
    // Checkboxes are now initialized entirely in the loadInitialData useEffect
    return (
        <Grid container spacing={2}>
            {/* <Grid item xs={12}> */}
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
                            sx={{ m: 0, p: 2, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', backgroundColor: '#3A4E7C0F' }}
                            id='customized-dialog-title'
                        >
                            <Typography sx={{ fontSize: '25px', color: '#3e66f3', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
                                Edit Role  </Typography>
                            <IconButton onClick={onClose}>
                                <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            {/* <Grid container justifyContent={'center'}> */}
                                <Grid item xs={12} md={6}>
                                    <RHFInput name='name' label='Role Name' control={control} placeholder='Role Name' mandatory disabled />
                                </Grid>
                            {/* </Grid> */}
                            <Grid xs={12} sx={{ mt: 3 }}>
                            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} gap={{ xs: 2, sm: 0 }}>

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
                                    <Tooltip placement='top' title='Allows a full access to the Administrator.'>
                                        <Box sx={{ ml: 1, display: 'flex', color: 'text.secondary' }}>
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
                                                checked={isAllSelected}
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
                        <Divider />


                        <Grid container>
                            {/* {allPermisstion.filter(i => !i.parent_id).map((item) => (
                                <React.Fragment key={item.id}>
                                    <Grid item xs={6} md={4}>
                                        <FormControlLabel
                                            label={<Typography sx={{
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                color: `${theme.palette.text.primary} !important`
                                            }}>{item.display_name}</Typography>}
                                            sx={{ my: -1 }}
                                            control={
                                                <Checkbox
                                                    id={item.id}
                                                    onChange={() => togglePermission(item.id)}
                                                    checked={selectedCheckbox.includes(item.id)}
                                                />
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={8}>
                                        <Grid container spacing={5}>

                                            {item.children?.map((subItem) => (
                                                <Grid item xs={6} md={6}>
                                                    <FormControlLabel
                                                        key={subItem.id}
                                                        label={subItem?.display_name ?? ''}
                                                        sx={{ my: -1 }}
                                                        control={
                                                            <Checkbox
                                                                id={subItem.id}
                                                                onChange={() => togglePermission(subItem.id)}
                                                                checked={selectedCheckbox.includes(subItem.id)}
                                                            />
                                                        }
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                </React.Fragment>
                            ))} */}
                             {allPermisstion.length > 0 && <DataTreeCheckbox data={allPermisstion} selectedCategories={selectedCheckbox} onCategorySelect={(e: any) => {
                                // setValue('categories', e)
                                setSelectedCheckbox(e)
                                
                            }} />}
                        </Grid>
                            <Box sx={{ marginTop: 5, display: 'flex', spacing: 5, justifyContent: 'end', width: '100%', alignItems: 'center' }}>
                                <SubmitButton onSubmit={handleSubmit(handleUpdate)} isLoading={isLoading} label={'Update'} isWidth={false} />
                                {/* <Button variant='outlined' onClick={onClose} sx={{ width: 150, height: 40, mt: 3 }}>
                                    No, Cancel
                                </Button> */}
                            </Box>
                        </DialogContent>
                    </Dialog>
                </React.Fragment>
            {/* </Grid> */}
        </Grid>
    );
};

export default UpdateRolePopupDialog;
