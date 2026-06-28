
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import { Grid } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from "../../services/axios"

import { useForm, } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useRouter } from "next/router"



// ** Icon Imports

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import

// ** Demo Imports
import AuthIllustrationWrapper from 'src/views/pages/auth/AuthIllustrationWrapper'

import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSettings } from 'src/@core/hooks/useSettings'

interface password {

    current_password: string;

}
interface PasswordFormProps {
    onSubmit: (data: password) => void;
}

// const schema = yup.object().shape({
//     old_password: yup.string().required('Old Password required.'),
//     new_password: yup.string().required('New Password required.'),
//     new_password_confirmation: yup.string().required('Confirm New Password required.'),

// });




const schema = yup.object().shape({
    // old_password: yup
    //     .string()
    //     .required('Old Password required.')
    //     .matches(/^\S*$/, 'Password cannot contain spaces')
    //     .min(8, 'Password must be at least 5 characters long.')
    //     .max(20, 'Password cannot be more than 20 characters long.'),

    // new_password: yup
    //     .string()
    //     .required('New Password required.')
    //     .matches(/^\S*$/, 'Password cannot contain spaces')
    //     .min(5, 'Password must be at least 5 characters long.')
    //     .max(20, 'Password cannot be more than 20 characters long.'),

    // new_password_confirmation: yup
    //     .string()
    //     .required('Confirm New Password required.')
    //     .matches(/^\S*$/, 'Password cannot contain spaces') // Ensures no spaces anywhere in the password
    //     .min(5, 'Password must be at least 5 characters long.') // Minimum length constraint
    //     .max(20, 'Password cannot be more than 20 characters long.') // Maximum length constraint

    old_password: yup
        .string()
        .required('Old Password is required.')
        .min(6, 'Old Password must be at least 6 characters.')
        .max(20, 'Old Password cannot exceed 20 characters.'),

    new_password: yup
        .string()
        .required('New Password is required.')
        .min(6, 'New Password must be at least 6 characters.')
        .max(20, 'New Password cannot exceed 20 characters.')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
        ),

    new_password_confirmation: yup
        .string()
        .required('Confirm New Password is required.')
        .oneOf([yup.ref('new_password')], 'Confirm New Password does not match the New Password.')


});





// ** Styled Components
const LinkStyled = styled(Link)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    justifyContent: 'center',
    color: theme.palette.primary.main
}))

const ChangePassword = () => {

    // ** Hook
    const theme = useTheme()
    const { settings } = useSettings()

    const [loading, setLoading] = useState(false)
    const [showPassword, setshowPassword] = useState(false);
    const [showNewPassword, setshowNewPassword] = useState(false);
    const [showCPassword, setshowCPassword] = useState(false);

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        control,
        setError,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema), })

    const router = useRouter()

    const onSubmit = async (data: any) => {

        setLoading(true)
        try {
            const password = await axiosInstance.post(
                `/api/v1/admin/changePassword`,
                { ...data }
            ).then((response) => {
                setLoading(false)
                let data = response.data
                if (data?.success) {

                    toast.success(data.message, {
                        position: 'top-center'
                    })
                } else {
                    toast.error(data.message)
                }
                router.back()

            }).catch((error) => {
                if (error.response.status == 403) {
                    for (let key in error.response.data.data) {
                        setError(key, { type: "manual", message: error.response.data.data[key].join(',') })
                    }
                }
                setLoading(false)
            });


        }
        catch (error) {
            toast.error('Password Could Not Change', {
                position: 'top-center',
            })
            setLoading(false)
        }

    }
    const handleClickShowPassword = () => {
        setshowPassword(!showPassword);
    };
    const handleClickShowNewPassword = () => {
        setshowNewPassword(!showNewPassword);
    };
    const handleClickShowCPassword = () => {
        setshowCPassword(!showCPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Box className='content-center' sx={{ display: 'flex', justifyContent: 'center' }}>
            <AuthIllustrationWrapper>
                <Card>
                    <CardContent sx={{ p: `${theme.spacing(8, 8, 7)} !important` }}>
                        <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* <svg width={22} height={32} viewBox='0 0 55 81' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path
                                    fill={theme.palette.primary.main}
                                    d='M30.1984 0.0144043C24.8945 0.425781 25.2534 6.16968 26.6435 7.65326C22.693 10.3649 13.1875 16.8867 6.76944 21.2803C1.21531 25.0824 -0.842975 34.6064 1.11159 40.8262C3.00952 46.8658 12.4904 51.3615 17.5337 52.7256C17.5337 52.7256 11.7188 56.0269 6.60358 60.0482C1.48831 64.0695 -0.622615 69.3436 3.06836 75.262C6.75933 81.1805 12.725 80.761 17.5257 78.6229C22.3264 76.4848 32.1683 69.1692 37.9402 65.1633C42.7282 61.5411 43.9669 53.6444 41.7631 46.9643C39.9758 41.5468 30.0969 36.4284 25.1792 34.6064C27.1946 33.1595 32.4935 29.4242 37.129 26.0909C38.7184 30.5636 43.9998 30.212 45.6103 27.8209C47.6216 23.4326 51.8339 13.4663 53.9579 8.55175C54.8862 4.81044 52.5639 2.78457 50.2227 2.35938C46.8672 1.75 38.3222 0.960115 30.1984 0.0144043Z'
                                />
                                <path
                                    fillOpacity='0.2'
                                    fill={theme.palette.common.white}
                                    d='M26.6523 7.65625C24.9492 5.625 25.3239 0.255308 30.2922 0.0105286C33.0074 0.326611 35.7804 0.62685 38.3907 0.909477C43.5904 1.47246 48.1446 1.96556 50.311 2.3748C52.7331 2.83234 54.886 5.06072 53.9543 8.61103C53.2063 10.3418 52.2075 12.6646 51.1482 15.1282C49.1995 19.6601 47.0459 24.6685 45.8717 27.3445C44.7224 29.964 39.111 31.0585 37.1137 26.0951C32.4782 29.4283 27.2884 33.1556 25.273 34.6026C24.931 34.4553 24.3074 34.2381 23.5124 33.9613C20.8691 33.0407 16.331 31.4602 13.9477 29.5966C9.61363 25.5918 11.6259 19.4662 13.1737 16.904C17.8273 13.7183 20.7417 11.7161 23.4984 9.82236C24.5437 9.10427 25.5662 8.40178 26.6523 7.65625Z'
                                />
                                <path
                                    fillOpacity='0.2'
                                    fill={theme.palette.common.white}
                                    d='M17.543 52.7266C21.2241 53.9875 28.5535 57.0509 30.091 59.101C32.0129 61.6635 33.1576 64.34 29.2527 71.2039C28.5954 71.6481 27.9821 72.0633 27.4069 72.4528C22.1953 75.9817 20.1085 77.3946 16.6243 79.0531C13.5855 80.2464 6.61575 81.7103 2.66559 74.5653C-1.11764 67.7222 3.23818 62.7113 6.5963 60.065L12.1695 56.0339L14.8359 54.3477L17.543 52.7266Z'
                                />
                            </svg> */}

                            <img
                                src={settings.mode == 'dark' ? themeConfig.templateDarkLogo : themeConfig.templateLogo}
                                width={200}
                                alt={themeConfig.templateName}
                            />
                        </Box>
                        <Typography variant='h6' sx={{ mb: 1.5 }}>
                            Reset Password
                        </Typography>
                        {/* <Typography sx={{ mb: 6, color: 'text.secondary' }}>
                            for <strong>john.doe@email.com</strong>
                        </Typography> */}
                        <form onSubmit={handleSubmit(onSubmit)} >

                            <Grid container spacing={5} sx={{ mb: 3 }}>
                                <Grid item xs={12}>

                                    <RHFInput control={control} inputType='password' name='old_password' label='Old Password' mandatory />
                                </Grid>
                                <Grid item xs={12}>

                                    <RHFInput control={control} inputType='password' name='new_password' label='New Password' mandatory />
                                </Grid>
                                <Grid item xs={12}>

                                    <RHFInput control={control} inputType='password' name='new_password_confirmation' mandatory label='Confirm New Password' />
                                </Grid>
                            </Grid>
                            <SubmitButton onSubmit={() => { }} isLoading={loading} isWidth={true} label='Submit' />
                        </form>
                    </CardContent>
                </Card>
            </AuthIllustrationWrapper>
        </Box>
    )
}

// ChangePassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default ChangePassword

