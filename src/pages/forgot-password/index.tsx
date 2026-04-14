// ** React Imports
import { ReactNode } from 'react'
import { useState } from 'react'

// ** Next Import
import Link from 'next/link'
import { useRouter } from "next/router";
import Image from 'next/image'

// ** MUI Components
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box, { BoxProps } from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import axiosInstance from "../../services/axios";


// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'
import toast from 'react-hot-toast'
import RHFInput from 'src/hook-forms/RHFInput';
import { Grid } from '@mui/material';

// Styled Components
const ForgotPasswordIllustration = styled('img')({
  height: 'auto',
  maxWidth: '100%'
})

const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.up('lg')]: {
    maxWidth: 480
  },
  [theme.breakpoints.up('xl')]: {
    maxWidth: 635
  },
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(12)
  }
}))

const LinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  justifyContent: 'center',
  color: theme.palette.primary.main
}))

const schema = yup.object().shape({
  email: yup.string().email('Email ID must be a valid.').required('Email ID is required.'),
  // password: yup.string().min(5).required()
})

const ForgotPassword = () => {
  // ** Hooks
  const theme = useTheme()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))
  const router = useRouter()



  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('')
  const [allField, setAllField] = useState('')
  const [Password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [cPaasword, setCpaasword] = useState('')
  const [showPassword, setshowPassword] = useState(false);
  const [loading, setLoading] = useState(false)


  const {
      control,
      setError,
      handleSubmit,
      formState: { errors }
    } = useForm({
      mode: 'onBlur',
      resolver: yupResolver(schema)
    })

  // ** Var
  const { skin } = settings

  const handleEmail = (event) => {
    const value = event.target.value;
    setEmail(value);

  }
  const handleSendOtp = () => {
    const obj = { email: email }
    if (!email) {
      setEmailError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');

    } else {
      setEmailError('');
      axiosInstance.post(`/admin/v1/auth/sendotp`, obj)
        .then(response => {
          console.log(response.data);
          toast.success(response.data.message)
          setOtpSent(true);
        })
        .catch(error => {
          console.log(error);
          if (error.response.status == 403) {
            for (let key in error.response.data.data) {
              console.log(key, { message: error.response.data.data[key].join(','), })
              toast.error(error.response.data.data[key].join(','), {
                position: 'top-center'
              })
            }

          }
        });
    }

  }
  const handleResetPassword = () => {
    const obj = {
      email: email,
      otp: otp,
      newPassword: Password,
      confirmPassword: cPaasword,
    }
    if (!otp || !cPaasword || !Password) {
      setAllField('This field is required');
    }
    else if (Password !== cPaasword) {
      setPasswordError('Password does not match')
    }
    else {
      setAllField('')
      axiosInstance.post(`/admin/v1/auth/resetpassword`, obj)
        .then(response => {
          console.log(response.data);
          let data = response.data
          if (data?.success) {

            toast.success(response.data.message)
          }

          router.back()
        })
        .catch(error => {
          console.log(error);
          if (error.response.status == 403) {
            for (let key in error.response.data.data) {
              console.log(key, { message: error.response.data.data[key].join(','), })
              toast.error(error.response.data.data[key].join(','), {
                position: 'top-center'
              })
            }

          }

        });
    }

  }
  const handleClickShowPassword = () => {
    setshowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const onSubmit = async (data: any) => {
    const { email, password } = data

    setLoading(true)

    try {
      const response = await axiosInstance.post(`/v1/admin/login`, {
        email,
        password,
        login_type: 'email',
        type: 'password'
      })
      if (response?.data?.success) {
        // logInUser(response?.data?.data)
      }
    } catch (e: any) {
      console.log(e)
      if (e.response?.status == 412 && e.response.data?.data && Object.keys(e.response.data.data).length > 0) {
        for (let key in e.response.data?.data) {
          setError(key, { type: 'manual', message: e.response.data?.data[key].join(',') })
        }
      } else {
        toast.error(e.response?.data?.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className='content-right'>
      {!hidden ? (
        <Box sx={{ p: 12, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ForgotPasswordIllustration
            width={700}
            alt='forgot-password-illustration'
            src={`/images/pages/girl-unlock-password-${theme.palette.mode}.png`}
          />
        </Box>
      ) : null}
      <RightWrapper
        sx={{ ...(skin === 'bordered' && !hidden && { borderLeft: `1px solid ${theme.palette.divider}` }) }}
      >
        <Box sx={{ mx: 'auto', maxWidth: 400 }}>
          <Box sx={{ mb: 8, display: 'flex', alignItems: 'center' }}>
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
            {/* <Image
              src="/images/logos/ecopods.png"
              alt="Picture of the author"
              width={50}
              height={50}
            /> */}
            <Typography
              variant='h5'
              sx={{
                ml: 2,
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: '-0.45px',
                textTransform: 'lowercase',
                fontSize: '1.75rem !important'
              }}
            >
              {/* {themeConfig.templateName} */}
              {/* {themeConfig.templateName.toUpperCase()} */}
              <img
              src={settings.mode == 'dark' ? themeConfig.templateDarkLogo : themeConfig.templateLogo}
              width={200}
              alt={themeConfig.templateName} />
            </Typography>
          </Box>
          <Typography variant='h6' sx={{ mb: 1.5 }}>
            Forgot Password? 🔒
          </Typography>
          <Typography sx={{ mb: 6, color: 'text.secondary' }}>
            Enter your email ID and we&prime;ll send you instructions to reset your password
          </Typography>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
          <Grid item xs={12}>
                <RHFInput control={control} name={'email'} label={'Email ID'} placeholder='Email ID' mandatory />
              </Grid>
              </Grid>

            {otpSent ? (
              <>
                <TextField value={otp} size='small' onChange={(e) => setOtp(e.target.value)} autoFocus type='text' label='Enter Otp' sx={{ display: 'flex', mb: 6 }} required error={Boolean(allField)}
                  helperText={allField} />

                <TextField size='small' value={Password} onChange={(e) => setPassword(e.target.value)} required label='Password' sx={{ display: 'flex', mb: 6 }} type={showPassword ? 'text' : 'password'} error={Boolean(allField)}
                  helperText={allField}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}

                />

                <TextField size='small' value={cPaasword} onChange={(e) => setCpaasword(e.target.value)} required type='text' label='Confirm Password' sx={{ display: 'flex', mb: 6 }} error={Boolean(allField ? allField : passwordError)}
                  helperText={allField ? allField : passwordError} />

                <Button onClick={handleResetPassword} fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4 ,mt:2}}>Reset Password</Button>
              </>
            ) : <Button onClick={handleSendOtp} fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4,mt:2 }}>
              Send otp
            </Button>
            }
            <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LinkStyled href='/login'>
                <Icon icon='bx:chevron-left' />
                <span>Back to login</span>
              </LinkStyled>
            </Typography>
          </form>
        </Box>
      </RightWrapper >
    </Box >
  )
}

ForgotPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

ForgotPassword.guestGuard = true

export default ForgotPassword



// // ** React Imports
// import { ReactNode, useState } from 'react'

// // ** Next Import
// import Link from 'next/link'
// import { useRouter } from 'next/router'
// import Image from 'next/image'

// // ** MUI Components
// import Button from '@mui/material/Button'
// import Box, { BoxProps } from '@mui/material/Box'
// import IconButton from '@mui/material/IconButton'
// import Typography from '@mui/material/Typography'
// import useMediaQuery from '@mui/material/useMediaQuery'
// import { styled, useTheme } from '@mui/material/styles'
// import TextField from '@mui/material/TextField'
// import InputAdornment from '@mui/material/InputAdornment'
// import VisibilityIcon from '@mui/icons-material/Visibility'
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

// // ** Configs
// import themeConfig from 'src/configs/themeConfig'

// // ** Layout Import
// import BlankLayout from 'src/@core/layouts/BlankLayout'

// // ** Hooks
// import { useSettings } from 'src/@core/hooks/useSettings'
// import toast from 'react-hot-toast'

// // ** Third Party Imports
// import * as yup from 'yup'
// import { useForm, Controller } from 'react-hook-form'
// import { yupResolver } from '@hookform/resolvers/yup'

// // ** Custom Component
// import RHFInput from 'src/hook-forms/RHFInput'

// // ** Services
// import axiosInstance from 'src/services/axios'

// // Styled Components
// const ForgotPasswordIllustration = styled('img')({
//   height: 'auto',
//   maxWidth: '100%'
// })

// const RightWrapper = styled(Box)<BoxProps>(({ theme }) => ({
//   width: '100%',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   padding: theme.spacing(6),
//   backgroundColor: theme.palette.background.paper,
//   [theme.breakpoints.up('lg')]: {
//     maxWidth: 480
//   },
//   [theme.breakpoints.up('xl')]: {
//     maxWidth: 635
//   },
//   [theme.breakpoints.up('sm')]: {
//     padding: theme.spacing(12)
//   }
// }))

// const LinkStyled = styled(Link)(({ theme }) => ({
//   display: 'flex',
//   alignItems: 'center',
//   textDecoration: 'none',
//   justifyContent: 'center',
//   color: theme.palette.primary.main
// }))

// // Validation Schema
// const schema = yup.object().shape({
//   email: yup.string().email('Email is invalid').required('Email is required')
// })

// const ForgotPassword = () => {
//   const theme = useTheme()
//   const { settings } = useSettings()
//   const hidden = useMediaQuery(theme.breakpoints.down('lg'))
//   const router = useRouter()

//   const [otpSent, setOtpSent] = useState(false)
//   const [otp, setOtp] = useState('')
//   const [Password, setPassword] = useState('')
//   const [cPaasword, setCpaasword] = useState('')
//   const [allField, setAllField] = useState('')
//   const [passwordError, setPasswordError] = useState('')
//   const [showPassword, setshowPassword] = useState(false)

//   const {
//     control,
//     handleSubmit,
//     getValues,
//     setError,
//     formState: { errors }
//   } = useForm({
//     mode: 'onBlur',
//     resolver: yupResolver(schema)
//   })

//   const handleSendOtp = () => {
//     const { email } = getValues()

//     axiosInstance
//       .post(`/admin/v1/auth/sendotp`, { email })
//       .then(response => {
//         toast.success(response.data.message)
//         setOtpSent(true)
//       })
//       .catch(error => {
//         if (error.response.status === 403) {
//           const errorsData = error.response.data.data
//           for (let key in errorsData) {
//             toast.error(errorsData[key].join(','), {
//               position: 'top-center'
//             })
//           }
//         }
//       })
//   }

//   const handleResetPassword = () => {
//     const { email } = getValues()

//     if (!otp || !Password || !cPaasword) {
//       setAllField('This field is required')
//     } else if (Password !== cPaasword) {
//       setPasswordError('Passwords do not match')
//     } else {
//       setAllField('')
//       setPasswordError('')

//       const payload = {
//         email,
//         otp,
//         newPassword: Password,
//         confirmPassword: cPaasword
//       }

//       axiosInstance
//         .post(`/admin/v1/auth/resetpassword`, payload)
//         .then(response => {
//           if (response.data?.success) {
//             toast.success(response.data.message)
//             router.back()
//           }
//         })
//         .catch(error => {
//           if (error.response.status === 403) {
//             const errorsData = error.response.data.data
//             for (let key in errorsData) {
//               toast.error(errorsData[key].join(','), {
//                 position: 'top-center'
//               })
//             }
//           }
//         })
//     }
//   }

//   const handleClickShowPassword = () => setshowPassword(!showPassword)
//   const handleMouseDownPassword = event => event.preventDefault()

//   return (
//     <Box className='content-right'>
//       {!hidden && (
//         <Box sx={{ p: 12, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <ForgotPasswordIllustration
//             width={700}
//             alt='forgot-password-illustration'
//             src={`/images/pages/girl-unlock-password-${theme.palette.mode}.png`}
//           />
//         </Box>
//       )}
//       <RightWrapper sx={{ ...(settings.skin === 'bordered' && !hidden && { borderLeft: `1px solid ${theme.palette.divider}` }) }}>
//         <Box sx={{ mx: 'auto', maxWidth: 400 }}>
//           <Box sx={{ mb: 8, display: 'flex', alignItems: 'center' }}>
//             <Typography
//               variant='h5'
//               sx={{
//                 ml: 2,
//                 lineHeight: 1,
//                 fontWeight: 700,
//                 letterSpacing: '-0.45px',
//                 textTransform: 'lowercase',
//                 fontSize: '1.75rem !important'
//               }}
//             >
//               <img
//                 src={settings.mode === 'dark' ? themeConfig.templateDarkLogo : themeConfig.templateLogo}
//                 width={200}
//                 alt={themeConfig.templateName}
//               />
//             </Typography>
//           </Box>

//           <Typography variant='h6' sx={{ mb: 1.5 }}>
//             Forgot Password? 🔒
//           </Typography>
//           <Typography sx={{ mb: 6, color: 'text.secondary' }}>
//             Enter your email ID and we′ll send you instructions to reset your password
//           </Typography>

//           <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()}>
//             <RHFInput
//               control={control}
//               name='email'
//               label='Email ID'
//               placeholder='Email ID'
//               mandatory
//               disabled={otpSent}
//             />

//             {otpSent ? (
//               <>
//                 <TextField
//                   value={otp}
//                   size='small'
//                   onChange={e => setOtp(e.target.value)}
//                   label='Enter OTP'
//                   sx={{ display: 'flex', mb: 6 }}
//                   error={Boolean(allField)}
//                   helperText={allField}
//                 />

//                 <TextField
//                   size='small'
//                   value={Password}
//                   onChange={e => setPassword(e.target.value)}
//                   label='Password'
//                   sx={{ display: 'flex', mb: 6 }}
//                   type={showPassword ? 'text' : 'password'}
//                   error={Boolean(allField)}
//                   helperText={allField}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position='end'>
//                         <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
//                           {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
//                         </IconButton>
//                       </InputAdornment>
//                     )
//                   }}
//                 />

//                 <TextField
//                   size='small'
//                   value={cPaasword}
//                   onChange={e => setCpaasword(e.target.value)}
//                   label='Confirm Password'
//                   sx={{ display: 'flex', mb: 6 }}
//                   type='password'
//                   error={Boolean(allField || passwordError)}
//                   helperText={allField || passwordError}
//                 />

//                 <Button onClick={handleResetPassword} fullWidth size='large' variant='contained' sx={{ mb: 4 ,mt:5}}>
//                   Reset Password
//                 </Button>
//               </>
//             ) : (
//               <Button onClick={handleSendOtp} fullWidth size='large' variant='contained' sx={{ mb: 4, mt: 5  }}>
//                 Send OTP
//               </Button>
//             )}

//             <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//               <LinkStyled href='/login'>
//                 <span style={{ marginRight: 4 }}>←</span> Back to login
//               </LinkStyled>
//             </Typography>
//           </form>
//         </Box>
//       </RightWrapper>
//     </Box>
//   )
// }

// ForgotPassword.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>
// ForgotPassword.guestGuard = true

// export default ForgotPassword
