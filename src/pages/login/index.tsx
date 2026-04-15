// ** React Imports
import { ReactNode, useState } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Components
import Box, { BoxProps } from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Icon Imports

// ** Third Party Imports
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

// ** Hooks
import { useRouter } from 'next/router'
import useBgColor, { UseBgColorType } from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/hooks/useAuth'
import useDeviceInfo from 'src/hooks/useDeviceInfo'
// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import { post } from 'src/services/apiCall'
import RoleSelector from 'src/components/loginRole/RoleSelector'

// ** Styled Components
const LoginIllustration = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover'
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
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const schema = yup.object().shape({
  email: yup.string().email('Email ID must be a valid.').required('Email ID is required.'),
  password: yup.string()
    .required('Password is required.')
    .min(5, 'Password must be at least 5 characters.')


  // password: yup.string().min(5).required('Password is required.')
})

interface FormData {
  email: string
  password: string
}

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('admin')
  // ** Hooks
  const auth = useAuth()
  const theme = useTheme()
  const router = useRouter()
  const { deviceDetails, ip } = useDeviceInfo()
  const { settings } = useSettings()
  const bgColors: UseBgColorType = useBgColor()
  const hidden = useMediaQuery(theme.breakpoints.down('lg'))

  // ** Var
  const { skin } = settings
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })
  function logInUser(data: any) {
    console.log(data,"data")
    // const  = JSON.stringify(deviceInfo);
    const returnUrl = router.query.returnUrl
    const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

    try {
      auth.handleSignIn(
        { ...data['userData'], permission: data['permission'], ...data['is_super_admin'] },
        data['token'],
        redirectURL as string,
        rememberMe,
        data['role']
      )
    } catch (error) {
      console.error('Error in handleSignIn:', error)
    }
  }
  const onSubmit = async (data: any) => {
    const { email, password } = data

    setLoading(true)

    try {
    
      const response = await post('/api/v1/admin/userLogin', {
        email,
        password,
        role: selectedRole
      })
      console.log(response,"response")
      if (response?.success) {
        logInUser(response?.data)
      }
    } catch (e: any) {
      console.log(e,"event")
      if (e?.response?.status == 412 && e?.response.data && Object.keys(e?.response.data.data).length > 0) {
        for (let key in e.response.data?.data) {
          setError(key, { type: 'manual', message: e.response.data?.data[key].join(',') })
        }
      } else {
        toast.error(e?.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className='content-right' sx={{ height: '100vh', overflow: 'hidden' }}>
      {!hidden ? (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <LoginIllustration
            width={700}
            alt='login-illustration'
            src={`/images/pages/login.png`}
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
            {/* <img
              src={settings.mode == 'dark' ? themeConfig.templateDarkLogo : themeConfig.templateLogo}
              width={200}
              alt={themeConfig.templateName} /> */}
          </Box>
          <Typography variant='h6' sx={{ mb: 1.5 }}>
            Welcome to {themeConfig.templateName}!
          </Typography>
          <Typography sx={{ mb: 6, color: 'text.secondary' }}>
            {/* Please sign-in to your account */}
            Please sign in to your account.
          </Typography>

          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* <FormControl fullWidth sx={{ mb: 4 }}>
              <Controller
                name='email'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextField
                    autoFocus
                    label='Email'
                    value={value}
                    onBlur={onBlur}
                    onChange={onChange}
                    error={Boolean(errors.email)}
                    placeholder='jhon@gmail.com'
                  />
                )}
              />
              {errors.email && <FormHelperText sx={{ color: 'error.main' }}>{errors.email.message}</FormHelperText>}
            </FormControl> */}
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <RHFInput control={control} name={'email'} label={'Email ID'} placeholder='Email ID' mandatory />
              </Grid>
              <Grid item xs={12}>
                <RHFInput
                  control={control}
                  name={'password'}
                  label={'Password'}
                  placeholder='Password'
                  inputType='password'
                  mandatory
                />
              </Grid>
            </Grid>
            {/* <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor='auth-login-v2-password' error={Boolean(errors.password)}>
                Password
              </InputLabel>
              <Controller
                name='password'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <OutlinedInput
                    value={value}
                    onBlur={onBlur}
                    label='Password'
                    onChange={onChange}
                    id='auth-login-v2-password'
                    error={Boolean(errors.password)}
                    type={showPassword ? 'text' : 'password'}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Icon fontSize={20} icon={showPassword ? 'bx:show' : 'bx:hide'} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                )}
              />
              {errors.password && (
                <FormHelperText sx={{ color: 'error.main' }} id=''>
                  {errors.password.message}
                </FormHelperText>
              )}
            </FormControl> */}
            <Box
              sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <FormControlLabel
                label='Remember Me'
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem', color: 'text.secondary' } }}
                control={<Checkbox checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />}
              />
              <LinkStyled href='/forgot-password'>Forgot Password?</LinkStyled>
            </Box>
            {/* <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 4 }}>
              Sign in
            </Button> */}
            <SubmitButton onSubmit={() => { }} isLoading={loading} label='Login' isWidth={true} />
            {/* <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Typography variant='body2' sx={{ mr: 2 }}>
                New on our platform?
              </Typography>
              <Typography>
                <LinkStyled href='/register'>Create an account</LinkStyled>
              </Typography>
            </Box> */}
            {/* <Divider sx={{ my: `${theme.spacing(6)} !important` }}>or</Divider> */}
            {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconButton
                href='/'
                component={Link}
                sx={{ color: '#497ce2' }}
                onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
              >
                <Icon icon='bxl:facebook-circle' />
              </IconButton>
              <IconButton
                href='/'
                component={Link}
                sx={{ color: '#1da1f2' }}
                onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
              >
                <Icon icon='bxl:twitter' />
              </IconButton>
              <IconButton
                href='/'
                component={Link}
                onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
                sx={{ color: theme.palette.mode === 'light' ? '#272727' : 'grey.300' }}
              >
                <Icon icon='bxl:github' />
              </IconButton>
              <IconButton
                href='/'
                component={Link}
                sx={{ color: '#db4437' }}
                onClick={(e: MouseEvent<HTMLElement>) => e.preventDefault()}
              >
                <Icon icon='bxl:google' />
              </IconButton>
            </Box> */}
          </form>
        </Box>
      </RightWrapper>
    </Box>
  )
}

LoginPage.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

LoginPage.guestGuard = true

export default LoginPage
