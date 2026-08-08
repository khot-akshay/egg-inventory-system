import * as React from 'react'
import { TextField, InputAdornment, IconButton, Button, Typography, Badge } from '@mui/material'
import { useController } from 'react-hook-form'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { styled } from '@mui/material/styles'
interface RHFInputProps {
  control: any // You should replace 'any' with the actual type of 'control' if possible
  name: string
  inputType?: string
  disabled?: boolean
  handleResend?: () => void
  handleReferralCode?: () => void
  handlebtnclick?: () => void
  resendValue?: number
  placeholder?: string
  rows?: number
  multiline?: boolean
  label: string
  mandatory?: boolean
  addbtn?: boolean
  forgotpassword?: boolean
  label_footer?: string
  label_header?: string
  button_label?: string
  warningText?: string // 👈 add this
  handleForgotPass?: () => void
}

const LinkStyled = styled('a')(({ theme }) => ({
  textDecoration: 'none',
  color: '#2C5FE2',
  fontWeight: 'bold',
  float: 'right',
  cursor: 'pointer'
}))

const RHFInput: React.FC<RHFInputProps> = ({
  control,
  rows,
  name,
  label,
  warningText = '',
  button_label,
  inputType = 'text',
 
  mandatory = true,
  disabled,
  label_footer,
  addbtn = false,
  label_header,
  handleResend,
  handleReferralCode,
  resendValue = 0,
  placeholder,
  handlebtnclick,
  forgotpassword = false,
  multiline,
  handleForgotPass,

  ...rest
}) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [expiryTime, setExpiryTime] = React.useState(new Date().getTime() + 2 * 60 * 1000) // Initial expiry time: 2 minutes

  const calculateTimeLeft = () => {
    const difference = expiryTime - new Date().getTime()
    if (difference <= 0) {
      return { minutes: 0, seconds: 0 }
    }

    return {
      minutes: Math.floor(difference / 1000 / 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleClickShowPassword = () => setShowPassword(show => !show)
  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const {
    field: { value, onChange },
    fieldState: { invalid, error }
  } = useController({
    name,
    control,
    defaultValue: ''
  })

  const handleSendButton = () => {
    if (handleResend) {
      handleResend()
      setExpiryTime(new Date().getTime() + 2 * 60 * 1000)

    }
  }

  React.useEffect(() => {
  }, [handleResend])

  return (
    <>
      <div>
        <label style={{ marginTop: '12px' }}>
          {label}
          {mandatory && <span style={{ color: 'red' }}>*</span>}
          {warningText && (
            <Badge color='warning' sx={{ ml: 1, fontSize: '0.65rem', color: '#FFA726' }}>
              <WarningAmberIcon fontSize='small' sx={{ fontSize: '0.65rem', mr: 1 }} />
              {warningText || ''}
            </Badge>
          )}

        </label>
        <br />
        <label style={{ marginLeft: '2px', paddingTop: '6px', fontWeight: 100, color: 'grey', fontSize: '14px' }}>
          {label_header}
        </label>
        <TextField
          rows={rows}
          multiline={multiline}
          fullWidth
          size='small'
          value={value}
          type={showPassword ? 'text' : inputType}
          onChange={onChange}
          error={invalid}
          autoComplete='off'
          defaultValue=''
          placeholder={placeholder || label}
          disabled={disabled}
          helperText={
            error ? (
              <Typography variant='caption' color='error' padding={0}>
                {error.message}
              </Typography>
            ) : null
          }
          {...rest}
          inputProps={{ autoComplete: 'off' }}
          InputProps={{
            sx: {
              borderRadius: inputType === 'newsletter' ? '40px' : '8px',
              border: '1px solid rgba(230, 234, 239, 0.1)'
            },
            endAdornment: (() => {
              switch (inputType) {
                case 'password':
                  return (
                    <InputAdornment position='start'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                case 'otp':
                  return (
                    <InputAdornment position='start'>
                      {timeLeft.minutes === 0 && timeLeft.seconds === 0 ? (
                        <Button variant='text' onClick={handleSendButton} sx={{ fontSize: '14px' }}>
                          Resend OTP
                        </Button>
                      ) : (
                        <>
                          <Typography variant='body1' sx={{ color: '#657488', fontSize: '14px' }}>
                            Resend OTP in {timeLeft.minutes}:
                            {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
                          </Typography>
                        </>
                      )}
                    </InputAdornment>
                  )
                case 'refferal':
                  return (
                    <InputAdornment position='start'>
                      <Button onClick={handleReferralCode} sx={{ color: '#2B6FF2', fontSize: '14px' }}>
                        Apply
                      </Button>
                    </InputAdornment>
                  )
                case 'newsletter':
                  return (
                    <InputAdornment position='start'>
                      <Button
                        variant='contained'
                        type='submit'
                        sx={{
                          borderRadius: '40px!important',
                          textTransform: 'inherit',
                          boxShadow: 'none',
                          padding: { sm: '5px 20px 5px 20px', md: '10px 38px' },
                          backgroundColor: '#2B6FF2'
                        }}
                      >
                        Submit
                      </Button>
                    </InputAdornment>
                  )
                default:
                  return null
              }
            })(),
            startAdornment:
              inputType === 'newsletter' ? (
                <InputAdornment position='start'>
                  <EmailOutlinedIcon />
                </InputAdornment>
              ) : null
          }}
        />
        {/* {forgotpassword && (
          <Typography
            onClick={handleForgotPass}
            style={{ textAlign: 'end' }}
            sx={{ color: '#2C5FE2', fontWeight: 'bold', pl: 2, cursor: 'pointer' }}
          >
            Forgot Password?
          </Typography>
        )} */}
        <label style={{ marginLeft: '2px', paddingTop: '6px', fontWeight: 100, color: 'grey', fontSize: '14px' }}>
          {label_footer}
        </label>
        {addbtn && (
          <Button onClick={handlebtnclick} sx={{ textTransform: 'none !important', pl: 0 }}>
            <ControlPointIcon style={{ marginRight: '3px' }} />
            {button_label}
          </Button>
        )}
      </div>
    </>
  )
}

export default RHFInput
