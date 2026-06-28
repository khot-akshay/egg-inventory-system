
import React, { useEffect, useState } from 'react'

import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'

import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DialogContent from '@mui/material/DialogContent'
import axiosInstance from 'src/services/axios'


import Icon from 'src/@core/components/icon'
import { Grid } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, } from 'react-hook-form'
import { useRouter } from "next/router";
import RHFPhoneNumber from 'src/hook-forms/RHFPhoneNumber'
import RHFInput from 'src/hook-forms/RHFInput'
import parsePhoneNumberFromString from 'libphonenumber-js'

const schema = yup.object().shape({
 
    name: yup
        .string()
        .trim()
        .required('Name is required.'),
        

      


    // name: yup.string().required('Name is required.'),
    //     email: yup.string().required('Email is required.'),
});

export default function ProfileUpdatePopup({ show, handleclose, userData, fetchData }) {

    const [loading, setLoading] = useState(false)

    const {
        control,
        register,
        setValue,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema), })



    const router = useRouter()

    const onSubmit = async (data: any) => {

        setLoading(true)
        let payload = {
            name: data.name,
    
        };
        try {
            const staticPage = await axiosInstance.post(
                `/v1/admin/updateProfile`,
                payload
            ).then((response) => {
                setLoading(false)
                const data = response.data
                if (data?.success) {

                  
                    handleclose()
                    fetchData()
                    toast.success('Profile name updated successfully.', {
                        position: 'top-right'
                      })
                      
                } else {
                    toast.error('Failed to update profile name.', {
                        position: 'top-right'
                      })
                      
                }

            }).catch((error) => {
                if (error.response.status == 403) {
                    for (const key in error.response.data.data) {
                        setError(key, { type: "manual", message: error.response.data.data[key].join(',') })
                    }
                }
                setLoading(false)
            });


        }
        catch (error) {
            toast.error('Profile Could Not Edited', {
                position: 'top-center',
            })
            setLoading(false)
        }

    }

    useEffect(() => {
        setValue('name', userData['name'])
    }, []);

    return (
        
        <Dialog
            scroll='body'
            open={show}
            onClose={handleclose}
            maxWidth={'sm'}

            // fullScreen='true'
            aria-labelledby='user-view-plans'
            aria-describedby='user-view-plans-description'
           
        >
            <DialogTitle id='user-view-plans' sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
                <Grid container item xs={12} justifyContent='space-between' alignItems='center'>

                    Update Name
                    <Icon icon='ic:baseline-close' style={{ cursor: 'pointer' }} onClick={handleclose} />
                </Grid>
            </DialogTitle>
            <Divider
                sx={{
                    mt: theme => `${theme.spacing(0.5)} !important`,
                    mb: theme => `${theme.spacing(7.5)} !important`
                }}
            />

            <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                <form style={{ width: '100%' }} onSubmit={handleSubmit(onSubmit)} >
                    <Grid container spacing={5}>
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'name'} label={'Name'} mandatory />
                        </Grid>
                    

                        <Grid item xs={12}>
                            <Button size='large' type='submit' variant='contained' disabled={loading}>
                                {loading ? (
                                    <CircularProgress
                                        sx={{
                                            color: 'common.white',
                                            width: '20px !important',
                                            height: '20px !important',
                                            mr: theme => theme.spacing(2)
                                        }}
                                    />
                                ) : null}
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </form>

            </DialogContent>

        </Dialog>
    )
}

