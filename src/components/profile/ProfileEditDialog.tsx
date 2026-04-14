// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   Grid
// } from '@mui/material';
// import { useForm, Controller } from 'react-hook-form';
// import * as yup from 'yup';
// import { yupResolver } from '@hookform/resolvers/yup';
// import axios from 'axios';

// const schema = yup.object().shape({
//   name: yup.string().required('Name is required'),
//   email: yup.string().email('Invalid email').required('Email is required'),
//   mobile: yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit mobile')
// });

// const ProfileEditDialog = ({ open, handleClose, userData, fetchData }) => {
//   const { control, handleSubmit, reset } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       name: userData?.name || '',
//       email: userData?.email || '',
//       mobile: userData?.mobile || ''
//     }
//   });

//   React.useEffect(() => {
//     reset({
//       name: userData?.name || '',
//       email: userData?.email || '',
//       mobile: userData?.mobile || ''
//     });
//   }, [userData, reset]);

//   const onSubmit = async (values) => {
//     try {
//       await axios.post('/api/profile/update', values);
//       fetchData();        
//       handleClose();     
//     } catch (error) {
//       console.error(error);
//       alert('Failed to update profile');
//     }
//   };

//   return (
//     <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
//       <DialogTitle>Edit Profile</DialogTitle>
//       <DialogContent>
//         <form id="profile-edit-form" onSubmit={handleSubmit(onSubmit)}>
//           <Grid container spacing={2} mt={1}>
//             <Grid item xs={12}>
//               <Controller
//                 name="name"
//                 control={control}
//                 render={({ field, fieldState: { error } }) => (
//                   <TextField fullWidth label="Name" {...field} error={!!error} helperText={error?.message} />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name="email"
//                 control={control}
//                 render={({ field, fieldState: { error } }) => (
//                   <TextField fullWidth label="Email" {...field} error={!!error} helperText={error?.message} />
//                 )}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <Controller
//                 name="mobile"
//                 control={control}
//                 render={({ field, fieldState: { error } }) => (
//                   <TextField fullWidth label="Mobile Number" {...field} error={!!error} helperText={error?.message} />
//                 )}
//               />
//             </Grid>
//           </Grid>
//         </form>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleClose}>Cancel</Button>
//         <Button form="profile-edit-form" type="submit" variant="contained">Save</Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ProfileEditDialog;  
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
    Grid,
    Typography,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    FormControl,
    FormHelperText
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import axios from 'axios';

import RHFInput from 'src/hook-forms/RHFInput';
import RHFPhoneNumber from 'src/hook-forms/RHFPhoneNumber';
import parsePhoneNumberFromString, { isValidPhoneNumber } from 'libphonenumber-js';

const schema = yup.object().shape({
    profile_image: yup.string().required('Profile image is required'),
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    mobile_number: yup.string().matches(/^[0-9]{10}$/, 'Enter valid 10-digit mobile')
});

const ProfileEditDialog = ({ open, handleClose, userData, fetchData }) => {


    const formatMobile = (number) => {
        if (!number) return '';
        return number.startsWith('+91') ? number : `+91${number}`;
    };

    const { control, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            profile_image: userData?.profile_image || '',
            name: userData?.name || '',
            email: userData?.email || '',
            mobile_number: formatMobile(userData?.mobile || '')
        }
    });

    // const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    const watchValues = watch();


    useEffect(() => {
        reset({
            profile_image: userData?.profile_image || '',
            name: userData?.name || '',
            email: userData?.email || '',
            mobile_number: formatMobile(userData?.mobile || '')
        });
    }, [userData, reset]);

    const onSubmit = async (values) => {
        try {
            await axios.post('/api/profile/update', values);
            fetchData();
            handleClose();
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
        }
    };

    return (

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" scroll="body">
            <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    Update Profile
                    <IconButton onClick={handleClose} sx={{ position: 'absolute', right: '1rem', top: '1rem' }}>
                        <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
                    </IconButton>
                </Grid>
            </DialogTitle>

            <Divider sx={{ mt: 2 }} />

            <DialogContent>
                <form id="profile-edit-form" onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                    <Grid container spacing={3}>


                        {/* Full Name */}
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'name'} label={'Full Name'} placeholder={'Full Name'} mandatory={true} />
                        </Grid>

                        {/* Email */}
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'email'} label={'Email ID'} placeholder={'Email ID'} mandatory={true} />
                        </Grid>

                        {/* Mobile Number */}
                        <Grid item xs={12}>
                            <RHFPhoneNumber name={'mobile_number'} control={control} label={'Mobile Number'} mandatory />
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                size="large"
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                sx={{ textTransform: 'none' }}
                            >
                                {loading && (
                                    <CircularProgress sx={{ color: 'common.white', width: 20, height: 20, mr: 2 }} />
                                )}
                                Update Profile
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>

    );
};

export default ProfileEditDialog;

