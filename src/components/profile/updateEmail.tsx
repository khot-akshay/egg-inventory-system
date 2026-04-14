
import { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'

import { yupResolver } from '@hookform/resolvers/yup'
import CircularProgress from '@mui/material/CircularProgress'
import DialogContent from '@mui/material/DialogContent'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'


import { Grid } from '@mui/material'
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useRouter } from "next/router"
import { useForm, } from 'react-hook-form'
import toast from 'react-hot-toast'
import RHFInput from 'src/hook-forms/RHFInput'

const schema = yup.object().shape({

    email: yup
        .string()
        .trim()
        .required('Email ID is required.')
        .email('Invalid email ID address.')
    ,
    otp: yup.string().when('$otpSent', {
        is: true,
        then: yup
            .string()
            .required('OTP is required.')
            .matches(/^\d{4,6}$/, 'Invalid OTP.'),
        otherwise: yup.string().notRequired()
    })


});

export default function EmailUpdatePopup({ show, handleclose, userData, fetchData }) {

    const [loading, setLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const {
        control,
        register,
        setValue,
        handleSubmit,
        setError,
        getValues,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema),  context: { otpSent } })



    const router = useRouter()

    const onSubmit = async (data: any) => {

        setLoading(true)
        try {
            if (otpSent) {
                handleProfile(data)
            } else {
                handleOtp()
            }
        } catch (error) {
            console.log(error)

            setLoading(false)
        }


    }
    const handleProfile = async (data: any) => {
        try {
            const staticPage = await axiosInstance.post(
                `/v1/admin/changeEmail`,
                data
            ).then((response) => {
                setLoading(false)
                const data = response.data
                if (data?.success) {

                    toast.success('Email ID updated successfully.', {
                        position: 'top-right'
                    })

                    handleclose()
                    fetchData()
                } else {
                    toast.error('Failed to update Email ID.', {
                        position: 'top-right'
                    })

                }

            }).catch((error) => {
                console.log(error)
                if (error.response.status == 412 && error.response.data.data) {
                    for (const key in error.response.data.data) {
                        setError(key, { type: "manual", message: error.response.data.data[key].join(',') })
                    }
                } else {
                    toast.error(error?.response?.data?.message ?? 'Failed to update profile. Please try again.')
                }
                setLoading(false)
            });


        }
        catch (error) {
            console.log(error)
            toast.error('Profile Could Not Edited', {
                position: 'top-center',
            })
            setLoading(false)
        }
    }
    const handleOtp = async () => {
        setLoading(true)
        let data = {
            email: getValues('email')
        }
        try {

            const response = await axiosInstance.post(`/v1/admin/updateProfile`, data)
            setOtpSent(true)
        } catch (error) {
            console.log(error)
            if (error.response.status == 412 && error.response.data.data) {
                for (const key in error.response.data.data) {
                    setError(key, { type: "manual", message: error.response.data.data[key].join(',') })
                }
            } else {
                toast.error(error?.response?.data?.message ?? 'Failed to update profile. Please try again.')
            }
        } finally {
            setLoading(false)

        }
    }
    useEffect(() => {
        setValue('email', userData['email'])
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

                    Update Email ID
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
                            <RHFInput disabled={otpSent} control={control} name={'email'} label={'Email ID'} mandatory />
                        </Grid>
                        {otpSent && (

                            <Grid item xs={12}>

                                <RHFInput handleResend={() => handleOtp()} inputType='otp' name={'otp'} control={control} label={'OTP'} mandatory={otpSent} />
                            </Grid>
                        )}

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

