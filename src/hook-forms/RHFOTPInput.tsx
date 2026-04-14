import React, { useState, useEffect } from 'react';
// useForm
import { useController, Controller } from 'react-hook-form';
// react-otp-input
import OTPInput from 'react-otp-input'
// @mui
import { useMediaQuery, Button, Box, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles'

// -------------------------------------------------------------------------

interface RHFOTPInputProps {
    name: string;
    control: any;
    handleResetOTP: () => void;
    resendCount: any;
    label:string;
    mandatory:boolean;
}

const RHFOTPInput : React.FC<RHFOTPInputProps> = ({ control, name, handleResetOTP, resendCount,label,mandatory }) => {
    const {
        field: { value, onChange },
        fieldState: { invalid, error },
    } = useController({
        name,
        control,
        defaultValue: '',
    });

    const calculateTimeLeft = () => {
        const difference = expiryTime - new Date().getTime();
        if (difference <= 0) {
            return { minutes: 0, seconds: 0 };
        }
        return {
            minutes: Math.floor((difference / 1000) / 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    };
    const [expiryTime, setExpiryTime] = useState(new Date().getTime() + 2 * 60 * 1000);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        setExpiryTime(new Date().getTime() + 2 * 60 * 1000);
    },[resendCount])
    return (
        <>
         <label>
        {label} {mandatory && <span style={{ color: 'red' }}>*</span>}
      </label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <OTPInput
                        value={field.value}
                        onChange={field.onChange}
                        numInputs={6}
                        renderSeparator={<span> - </span>}
                        renderInput={(props) => <input {...props} />}
                        inputStyle={{ fontSize: '20px', height: hidden ? '40px' : '50px', width: hidden ? '40px': '50px', borderRadius: '8px', border: '1px solid #919EAB', padding: '16px, 14px, 16px, 14px', fontWeight: 200, }}
                        containerStyle={{ width : '100%' }}
                        shouldAutoFocus={false}
                    />
                )}
            />
            {invalid && (
                <span style={{ fontSize: '0.75rem', color: '#d32f2f', marginRight: '14px', marginLeft: '14px', fontWeight: 400, marginTop: '2px' }}>
                    {error?.message || 'Invalid OTP'}
                </span>
            )}
            {(timeLeft.minutes === 0 && timeLeft.seconds === 0) ? (
                <Box sx={{ display: 'flex', justifyContent: 'center'}}>
                    <Button variant='text' size='small' sx={{ mt: 1, mb: 0.5, color: '#EA580C' }} onClick={handleResetOTP}>
                        Resend OTP
                    </Button>
                </Box>
            ) :
            <Box sx={{ display: 'flex', justifyContent: 'center'}}>
            <Typography variant='caption' sx={{ mt: 1, mb: 0.5, padding: '5px 10px', borderRadius: '8px' }}>
                Resend OTP in {timeLeft.minutes}:{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
            </Typography>
        </Box>
        }
        </>
    )
}

export default RHFOTPInput