import React, { useState, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import ListItemText from '@mui/material/ListItemText';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, } from 'react-hook-form'
import { Checkbox, FormControlLabel } from "@mui/material";
import { useRouter } from "next/router";
import axiosInstance from 'src/services/axios'
import RHFPhoneNumber from 'src/hook-forms/RHFPhoneNumber'
import parsePhoneNumberFromString from 'libphonenumber-js'
import RHFInput from 'src/hook-forms/RHFInput'
interface User {
    id: number;
    family_name: string;
    family_code: string;
    attributes: []
}

interface UserFormProps {
    onSubmit: (data: User) => void;
}

const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email is not valid').typeError('Email is required').required('Email is required'),
    mobile_number: yup.string().required('Mobile No. is required'),
    org_name: yup.string().required('Organization name is required'),
});

export default function AddOrgnaization() {
    const [loading, setLoading] = useState(false)


    const {
        register,
        handleSubmit,
        setError,
        watch,
        control,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema), })

    const router = useRouter()

    const onSubmit = async (data: any) => {

        setLoading(true)

        try {
            const parsedtelegramNumber = parsePhoneNumberFromString(watch().mobile_number ?? '');
            if (parsedtelegramNumber) {
                data.mobile_number = parsedtelegramNumber.nationalNumber;
                data.country_code = (parsedtelegramNumber.countryCallingCode).toString();
            }
            const user = await axiosInstance.post(
                `/admin/v1/auth/create-user`,
                { ...data }
            ).then((response) => {
                setLoading(false)
                let data = response.data
                if (data?.success) {

                    toast.success(data.message, {
                        position: 'top-center'
                    })
                } else {
                    toast.error(data.message, {
                        position: 'top-center'
                    })
                }
                router.back()

            }).catch((error) => {
                console.log(error)
                if (error.response.status == 412) {
                    for (let key in error.response.data.data) {
                        setError(key, { type: "manual", message: error.response.data.data[key].join(',') })
                    }
                }
                setLoading(false)
            });


        }
        catch (error) {
            console.log(error)
            toast.error('Operator Not Added', {
                position: 'top-center',
            })
            setLoading(false)
        }

    }
    return (
        <Card>
            <CardHeader title='' />
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} >
                    <Grid container spacing={5}>
                        <Grid item xs={4}>

                            <RHFInput control={control} name={'name'} label={'Full Name'} placeholder='Full Name' mandatory />
                        </Grid>

                        <Grid item xs={4}>

                            <RHFInput control={control} name={'email'} label={'Email ID'} placeholder='Email ID' mandatory />
                        </Grid>
                        <Grid item xs={4}>
                         
                            <RHFPhoneNumber name={'mobile_number'} control={control} label={'Mobile Number'} mandatory />

                        </Grid>
                       
                        <Grid item xs={4}>
                            <RHFInput control={control} name={'org_name'} label={'Organization Name'} placeholder='Organization Name' mandatory />
                        
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
            </CardContent>
        </Card>
    )
}
