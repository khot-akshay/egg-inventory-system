import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  TextField,
  Button,
  CircularProgress
} from "@mui/material";
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import RHFNumberInput from 'src/hook-forms/RHFNUmberInput'
import RHFInput from 'src/hook-forms/RHFInput'
import toast from "react-hot-toast";
import axiosInstance from 'src/services/axios';
import LocalAtmIcon from '@mui/icons-material/LocalAtm'
import PhonelinkRingIcon from '@mui/icons-material/PhonelinkRing'

const schema = yup.object().shape({
  paid_amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .min(1, 'Amount must be greater than 0'),
  payment_type: yup
    .string()
    .required('Payment type is required'),
  mixed_cash: yup.number().nullable(),
  mixed_online: yup.number().nullable()
})

interface FormData {
  paid_amount: number | null
  payment_type: string
  mixed_cash?: number | null
  mixed_online?: number | null
}

interface UpdatePriceProps {
  vendorId: string | number;
}

const defaultValues: FormData = {
  paid_amount: 0,
  payment_type: 'cash',
  mixed_cash: null,
  mixed_online: null
}

export default function DeuAmtPaidVendor({ vendorId }: UpdatePriceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentType, setPaymentType] = useState('cash');
  const [prices, setPrices] = useState<{ id: number; category_id: number; price_per_egg: string; name: string }[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues
  })

  const mixedCash = watch('mixed_cash')
  const mixedOnline = watch('mixed_online')

  useEffect(() => {
    if (paymentType === 'mixed') {
      const total = Number(mixedCash || 0) + Number(mixedOnline || 0)
      setValue('paid_amount', total, {
        shouldValidate: true,
        shouldDirty: true
      })
    }
  }, [mixedCash, mixedOnline, paymentType, setValue])

  



  const handlePaymentSubmit = async (data: FormData) => {
    if (!vendorId) return;

    try {
      setIsSaving(true);

      const cashAmount = Number(data.mixed_cash)
      const onlineAmount = Number(data.mixed_online)
      const finalAmount = paymentType === 'mixed'
        ? cashAmount + onlineAmount
        : Number(data.paid_amount)

      if (paymentType === 'mixed' && finalAmount <= 0) {
        toast.error('Please enter cash or online amount')
        setIsSaving(false)
        return
      }

      const payload = {
        paid_amount: finalAmount,
        payment_type: paymentType
      }

      const response = await axiosInstance.post(`/api/v1/admin/settleDeuAmount?vendor_id=${vendorId}`, payload)

      if (response.data.success) {
        toast.success(response.data.message || 'Due amount paid successfully')
        reset(defaultValues)
        setPaymentType('cash')
      } else {
        toast.error(response.data.message || 'Failed to pay due amount')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to pay due amount')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Grid container spacing={2}>
    

      <Grid item xs={12} md={12}>
        <Card sx={{ height: "auto", p: 4, ml: 1, mr: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
            Pay Due Amount
          </Typography>

          <form>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFNumberInput
                  control={control}
                  name='paid_amount'
                  label='Paid Amount'
                  placeholder='Enter Amount'
                  min={0}
                  mandatory
                  disabled={paymentType === 'mixed'}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography className='input-label'>
                  Payment Method
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { id: 'cash', label: 'Cash', icon: <LocalAtmIcon /> },
                    { id: 'online', label: 'Online', icon: <PhonelinkRingIcon /> },
                    { id: 'mixed', label: 'Mixed', icon: <LocalAtmIcon /> }
                  ].map(type => (
                    <Grid item xs={4} sm={3} key={type.id}>
                      <Button
                        fullWidth
                        variant={paymentType === type.id ? 'contained' : 'outlined'}
                        startIcon={type.icon}
                        onClick={() => {
                          setPaymentType(type.id)
                          setValue('payment_type', type.id)

                          if (type.id === 'mixed') {
                            setValue('mixed_cash', null)
                            setValue('mixed_online', null)
                            setValue('paid_amount', null)
                          } else {
                            setValue('mixed_cash', null)
                            setValue('mixed_online', null)
                            setValue('paid_amount', null)
                          }
                        }}
                      >
                        <Typography variant='body2' sx={{ fontWeight: 500, color: 'inherit' }}>
                          {type.label}
                        </Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {paymentType === 'mixed' && (
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <RHFInput
                        control={control}
                        name='mixed_cash'
                        label='Cash Amount'
                        placeholder='Enter Cash'
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <RHFInput
                        control={control}
                        name='mixed_online'
                        label='Online Amount'
                        placeholder='Enter Online'
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                onClick={handleSubmit(handlePaymentSubmit)}
                variant="contained"
                color="primary"
                disabled={isSaving}
              >
                {isSaving ? <CircularProgress size={24} color="inherit" /> : "Pay Due Amount"}
              </Button>
            </Box>
          </form>
        </Card>
      </Grid>
    </Grid>
  );
}
