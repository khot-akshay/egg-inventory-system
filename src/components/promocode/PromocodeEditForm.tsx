
import React, { useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'

import DialogContent from '@mui/material/DialogContent'

import { useState } from 'react'
import Icon from 'src/@core/components/icon'

// ** MUI Imports
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import { yupResolver } from '@hookform/resolvers/yup'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import * as yup from 'yup'


// ** Third Party Imports
import { Checkbox, FormControlLabel } from "@mui/material"
import dayjs, { Dayjs } from "dayjs"
import { useRouter } from "next/router"
import { useForm, } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosInstance from "../../services/axios"
import { capitalizeFirstLetter } from 'src/utils/encodeid'
import SelectTurfDropdown from '../turf_management/SelectTurfDropdown'
import themeConfig from 'src/configs/themeConfig'

interface Promocode {
    id: number;
    promocode: string;
    promocode_for: string;
    type: string;
    discount: string
    freeItemCount: number;
    is_for_new_user: boolean;
    is_for_only_app: boolean;
    is_for_paymentapp: boolean;
    is_for_registered_between: boolean;
    is_for_specific_number: boolean
    is_for_specific_pincode: boolean
    max_discount: number;
    minimal_cart_total: number;
    minimumBuy: number;
    registered_from: string;
    registered_till: string;
    start_from: string;
    end_on: string;


}

interface CategoryFormProps {
    onSubmit: (data: Promocode) => void;
}

const schema = yup.object().shape({
    promocode: yup.string().required('Promocode is required'),
    promocode_for: yup.string().required('This field is required'),
    type: yup.string().required('Type is required'),
    discount: yup.string().required('Discount is required'),
    description: yup.string(),
    // registered_from: yup.mixed().when('is_for_registered_between', {
    //     is: true,
    //     then: yup
    //         .mixed()
    //         .required('registered_from  is required ')
    //     ,
    //     otherwise: yup.mixed(),
    // }),
    // registered_till: yup.mixed().when('is_for_registered_between', {
    //     is: true,
    //     then: yup
    //         .mixed()
    //         .required('registered till  is required ')
    //     ,
    //     otherwise: yup.mixed(),
    // }),
    start_from: yup.string().required('This field is required'),
    end_on: yup.string().required('This field is required')

});

export default function PromocodeEditPopup({ show, handleclose, selectedPromocode }) {

    const [loading, setLoading] = useState(false)



    const {
        register,
        watch,
        handleSubmit,
        setValue,
        setError,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema), })

    const watchAllFields = watch();


    const router = useRouter()
    const [IsForRegisteredBetween, setIsForRegisteredBetween] = useState(selectedPromocode.is_for_registered_between == '1')
    const [isActive, setIsActive] = useState(selectedPromocode.is_active)
    const [isForPaymentapp, setisForPaymentapp] = useState(selectedPromocode.is_for_paymentapp)
    const [isFoSpecificPincode, setIsFoSpecificPincode] = useState(selectedPromocode.is_for_specific_pincode)
    const [isForSpecificNumber, setIsForSpecificNumber] = useState(selectedPromocode.is_for_specific_number)
    const [isForOnlyApp, setIsForOnlyApp] = useState(selectedPromocode.is_for_only_app)
    const [hideOnCustomerSide, setHideOnCustomerSide] = useState(selectedPromocode.hide_promo)

    const [isForNewUser, setIsForNewUser] = useState(selectedPromocode.is_for_new_user)
    const [startFrom, setStartFrom] = useState(dayjs(selectedPromocode.start_from))
    const [endOn, setEndOn] = useState(dayjs(selectedPromocode.end_on))
    const [type, setType] = useState()
    const [isLanding, setisLanding] = useState(selectedPromocode.is_landing)

    const [registeredFrom, setRegisteredFrom] = useState(dayjs(selectedPromocode.registered_from))
    const [registeredTill, setRegisteredTill] = useState(dayjs(selectedPromocode.registered_till))
    const [selectedTurf, setSelectedTurf] = useState([])

    useEffect(() => {
        setValue('promocode', selectedPromocode['promocode'])
        setValue('discount', selectedPromocode['discount'])
        setValue('max_discount', selectedPromocode['max_discount'])
        if (type == 'buyXFreeY') {
            setValue('minimumBuy', selectedPromocode['minimumBuy'])
            setValue('freeItemCount', selectedPromocode['freeItemCount'])
        }
        setValue('minimumBuy', null)
        setValue('freeItemCount', null)

        setValue('description', selectedPromocode['description'])
        setValue('minimal_cart_total', selectedPromocode['minimal_cart_total'])
        setValue('promocode_for', selectedPromocode['promocode_for'])
        setValue('type', selectedPromocode['type'])
        setValue('usage_limit', selectedPromocode['usage_limit'])
        setValue('promocode_type', selectedPromocode['promocode_type']) 
        setValue('start_from', dayjs(startFrom).format('YYYY-MM-DD'))
        setValue('end_on', dayjs(endOn).format('YYYY-MM-DD'))
        if (IsForRegisteredBetween) {
            setValue('registered_from', dayjs(registeredFrom).format('YYYY-MM-DD'))
            setValue('registered_till', dayjs(registeredTill).format('YYYY-MM-DD'))
        } else {

            setValue('registered_from', null)
            setValue('registered_till', null)
        }
        setStartFrom(dayjs(selectedPromocode.start_from))
        // )
    }, [])
    const handleIsForRegisteredBetween = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsForRegisteredBetween(event.target.checked);
    };
    // const handleisForSpecificPincode = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setIsFoSpecificPincode(event.target.checked);
    // };
    const handleIsForPaymentapp = (event: React.ChangeEvent<HTMLInputElement>) => {
        setisForPaymentapp(event.target.checked);
    };
    const handleIsForSpecificNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsForSpecificNumber(event.target.checked);
    };
    const handleIsForNewUser = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsForNewUser(event.target.checked);
    };
    const handleIsForOnlyApp = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsForOnlyApp(event.target.checked);
    };
    const handleHidePromo = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHideOnCustomerSide(event.target.checked);
    };
    const handleLandingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setisLanding(event.target.checked);
    };

    const handleIActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsActive(event.target.checked);
    };

    const onSubmit = async (data: any) => {
        const id = selectedPromocode.id
        setLoading(true)
        if (data.type !== 'buyXFreeY') {
            delete data.minimumBuy;
            delete data.freeItemCount;
        }
        if (!data.is_for_registered_between) {
            delete data.registered_from
            delete data.registered_till
        }
        if (data?.promocode_for == 'villa_name') {
            data.villa_ids = selectedTurf
        }
        try {
            const addCatagory = await axiosInstance.post(
                `/v1/admin/updatePromocode?id=${id}`,
                {...data, 
                    'is_for_new_user':false,
                    
                }
            ).then((response) => {
                setLoading(false)
                let data = response.data
                if (data?.success) {
                    handleclose()
                    toast.success(data.message, {
                        position: 'top-center'
                    })
                } else {
                    toast.error(data.message, {
                        position: 'top-center'
                    })
                }
                // router.back()

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
            toast.error('Promocode Could Not Edited', {
                position: 'top-center',
            })
            setLoading(false)
        }

    }
    return (
        <Dialog
            scroll='body'
            open={show}
            onClose={handleclose}
            aria-labelledby='user-view-plans'
            aria-describedby='user-view-plans-description'
            sx={{
                '& .MuiPaper-root': { width: '100%', maxWidth: '90%', },
                '& .MuiDialogTitle-root ~ .MuiDialogContent-root': { pt: theme => `${theme.spacing(2)} !important` }
            }}
        >
            <DialogTitle id='user-view-plans' sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
                <Grid container item xs={12} justifyContent='space-between' alignItems='center'>

                   Update Promocode
                    <Icon icon='ic:baseline-close' style={{ cursor: 'pointer' }} onClick={handleclose} />
                </Grid>
            </DialogTitle>
            <Divider
                sx={{
                    mt: theme => `${theme.spacing(0.5)} !important`,
                    mb: theme => `${theme.spacing(7.5)} !important`
                }}
            />

            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)} >
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>

                                <TextField

                                    label='Promocode Name'
                                    {...register('promocode')}

                                    size='small'
                                    placeholder='wlcm'
                                    error={Boolean(errors.promocode)}
                                    aria-describedby='validation-async-promocode'
                                />

                                {errors.promocode && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-promocode'>
                                        {errors.promocode.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} >

                            <FormControl fullWidth>

                                <TextField

                                    label='Discount'
                                    type='number'
                                    {...register('discount')}

                                    size='small'
                                    placeholder='10'
                                    error={Boolean(errors.discount)}
                                    aria-describedby='validation-async-discount'
                                />

                                {errors.discount && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-discount'>
                                        {errors.discount.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>

                            <FormControl fullWidth>

                                <TextField

                                    label='Description'
                                    {...register('description')}

                                    size='small'
                                    placeholder='10'
                                    error={Boolean(errors.description)}
                                    aria-describedby='validation-async-description'
                                />

                                {errors.description && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-description'>
                                        {errors.description.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} >
                            <FormControl fullWidth size='small'>
                                <InputLabel
                                    id='validation-basic-type'
                                    error={Boolean(errors.type)}
                                    htmlFor='validation-basic-type'
                                >
                                    Discount Type
                                </InputLabel>

                                <Select

                                    label='Discount Type'
                                    {...register('type')}
                                    error={Boolean(errors.type)}
                                    labelId='validation-type'
                                    aria-describedby='validation-type'
                                    defaultValue={selectedPromocode.type}
                                >
                                    <MenuItem value='flat'>Flat</MenuItem>
                                    <MenuItem value='percentage'>Percentage</MenuItem>
                                </Select>

                                {errors.type && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-type'>
                                        {errors.type.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

                        </Grid>
                        <Grid item xs={12} md={4}>

                            <FormControl fullWidth>

                                <TextField

                                    label={`${capitalizeFirstLetter(watch('type') ?? '')} Discount`}
                                    type='number'
                                    {...register('discount')}

                                    size='small'
                                    placeholder='10'
                                    error={Boolean(errors.discount)}
                                    aria-describedby='validation-async-discount'
                                />

                                {errors.discount && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-discount'>
                                        {errors.discount.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} >
                            <FormControl fullWidth size='small'>
                                <InputLabel
                                    id='validation-basic-type'
                                    error={Boolean(errors.type)}
                                    htmlFor='validation-basic-type'
                                >
                                    Promocode Type
                                </InputLabel>

                                <Select

                                    label='Promocode Type'
                                    {...register('promocode_type')}
                                    error={Boolean(errors.type)}
                                    labelId='validation-type'
                                    aria-describedby='validation-type'
                                    defaultValue={selectedPromocode?.promocode_type}
                                >
                                    <MenuItem value='one_time_use'>One Time Use</MenuItem>
                                    <MenuItem value='limit'>Usage Limit</MenuItem>
                                    <MenuItem value='card_discount'>Card Discount</MenuItem>
                                </Select>

                                {errors.promocode_type && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-type'>
                                        {errors.promocode_type.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

                        </Grid>

                        {watch('promocode_type') == 'limit' && (
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>

                                    <TextField

                                        label={'Usage Limit'}
                                        type='number'
                                        {...register('usage_limit')}

                                        size='small'
                                        placeholder='10'
                                        error={Boolean(errors.usage_limit)}
                                        defaultValue={selectedPromocode?.usage_limit}
                                        aria-describedby='validation-async-usage_limit'
                                    />

                                    {errors.usage_limit && (
                                        <FormHelperText sx={{ color: 'error.main' }} id='validation-async-usage_limit'>
                                            {errors.usage_limit.message}
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth size='small'>
                                <InputLabel
                                    id='validation-basic-promocode_for'
                                    error={Boolean(errors.promocode_for)}
                                    htmlFor='validation-basic-promocode_for'
                                >
                                    Promocode for
                                </InputLabel>

                                <Select

                                    label='promocode For'
                                    {...register('promocode_for')}
                                    error={Boolean(errors.promocode_for)}
                                    labelId='validation-promocode_for'
                                    aria-describedby='validation-promocode_for'
                                    defaultValue={selectedPromocode?.promocode_for}
                                >
                                    <MenuItem value='all'>All</MenuItem>
                                    <MenuItem value={themeConfig.projectFor}>Selected {capitalizeFirstLetter(themeConfig.projectFor)}</MenuItem>
                                </Select>

                                {errors.promocode_for && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-promocode_for'>
                                        {errors.promocode_for.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

                        </Grid>
                        {watch('promocode_for') === themeConfig.projectFor && (
                            <Grid item xs={12} md={4}>

                                <SelectTurfDropdown setTurf={setSelectedTurf} multiple defaultValue={selectedPromocode?.[`${themeConfig.projectFor}s`] ? selectedPromocode?.[`${themeConfig.projectFor}s`]?.map(item=>({
                                    label: item?.name, id: item?.id, value: item?.id 
                                })) : null} />

                            </Grid>
                        )}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>

                                    <DesktopDatePicker
                                        label="Start From"
                                        inputFormat="YYYY-MM-DD"
                                        onChange={(e: Dayjs | null) => {
                                            setStartFrom(e)
                                            setValue('start_from', dayjs(e).format('YYYY-MM-DD'))
                                        }}
                                        value={startFrom}
                                        renderInput={(params) => <TextField size="small" {...params} />}
                                    />
                                </LocalizationProvider>
                                {errors.start_from && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-start_from'>
                                        This field is required
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>

                                    <DesktopDatePicker
                                        label="End On"
                                        inputFormat="YYYY-MM-DD"
                                        onChange={(e: Dayjs | null) => {
                                            setEndOn(e)
                                            setValue('end_on', dayjs(e).format('YYYY-MM-DD'))
                                        }}
                                        value={endOn}
                                        renderInput={(params) => <TextField size="small" {...params} />}
                                    />
                                </LocalizationProvider>
                                {errors.end_on && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-end_on'>
                                        {errors.end_on.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                    
                        {watchAllFields.type == 'buyXFreeY' &&
                            <>
                                <Grid item xs={12} md={4}>

                                    <FormControl fullWidth>

                                        <TextField

                                            label='Minimum Buy'
                                            {...register('minimumBuy')}

                                            size='small'
                                            placeholder='10'
                                            error={Boolean(errors.minimumBuy)}
                                            aria-describedby='validation-async-minimumBuy'
                                        />

                                        {errors.minimumBuy && (
                                            <FormHelperText sx={{ color: 'error.main' }} id='validation-async-minimumBuy'>
                                                {errors.minimumBuy.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>

                                    <FormControl fullWidth>

                                        <TextField

                                            label='FreeItem Count'
                                            {...register('freeItemCount')}

                                            size='small'
                                            placeholder='10'
                                            error={Boolean(errors.freeItemCount)}
                                            aria-describedby='validation-async-freeItemCount'
                                        />

                                        {errors.freeItemCount && (
                                            <FormHelperText sx={{ color: 'error.main' }} id='validation-async-freeItemCount'>
                                                {errors.freeItemCount.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </>
                        }




                        <Grid item xs={12} md={4}>

                            <FormControl fullWidth>

                                <TextField
                                    type='number'
                                    label='Max Discount'
                                    {...register('max_discount')}

                                    size='small'
                                    placeholder='10'
                                    error={Boolean(errors.max_discount)}
                                    aria-describedby='validation-async-max_discount'
                                />

                                {errors.max_discount && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-discount'>
                                        {errors.max_discount.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>

                            <FormControl fullWidth>

                                <TextField
                                    type='number'
                                    label='Minimal Total'
                                    {...register('minimal_cart_total')}

                                    size='small'
                                    placeholder='10'
                                    error={Boolean(errors.max_discount)}
                                    aria-describedby='validation-async-minimal_cart_total'
                                />

                                {errors.minimal_cart_total && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-minimal_cart_total'>
                                        {errors.minimal_cart_total.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                   
                        {IsForRegisteredBetween &&
                            <>

                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>

                                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                                            <DesktopDatePicker
                                                label="Registered from"
                                                inputFormat="YYYY-MM-DD"
                                                onChange={(e: Dayjs | null) => {
                                                    setRegisteredFrom(e)
                                                    setValue('registered_from', dayjs(e).format('YYYY-MM-DD'))
                                                }}
                                                value={registeredFrom || selectedPromocode.registered_from}
                                                renderInput={(params) => <TextField size="small" {...params} />}
                                            />
                                        </LocalizationProvider>
                                        {errors.registered_from && (
                                            <FormHelperText sx={{ color: 'error.main' }} id='validation-async-registered_from'>
                                                {errors.registered_from.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>

                                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                                            <DesktopDatePicker
                                                label="Registered Till"
                                                inputFormat="YYYY-MM-DD"
                                                onChange={(e: Dayjs | null) => {
                                                    setRegisteredTill(e)
                                                    setValue('registered_till', dayjs(e).format('YYYY-MM-DD'))
                                                }}
                                                value={registeredTill}
                                                renderInput={(params) => <TextField size="small" {...params} />}
                                            />
                                        </LocalizationProvider>
                                        {errors.registered_till && (
                                            <FormHelperText sx={{ color: 'error.main' }} id='validation-async-registered_till'>
                                                {errors.registered_till.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>
                            </>
                        }

                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size='small'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...register('is_active')}
                                            checked={isActive}
                                            color="primary"
                                            name={'is_active'}
                                            onChange={handleIActiveChange}
                                        />
                                    }
                                    label="Is Active"
                                />
                                {errors.is_active && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic- is_active'>
                                        {errors.is_active.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

                        </Grid>
                   
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size='small'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...register('hide_promo')}
                                            checked={hideOnCustomerSide}
                                            color="primary"
                                            name={'hide_promo'}
                                            onChange={handleHidePromo}
                                        />
                                    }
                                    label="Hide On Customer side"
                                />
                                {errors.is_for_only_app && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic- hide_promo'>
                                        {errors.hide_promo.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size='small'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...register('is_landing')}
                                            checked={isLanding}
                                            color="primary"
                                            name={'is_landing'}
                                            onChange={handleLandingChange}
                                        />
                                    }
                                    label="Show on Landing Page"
                                />
                                {errors.is_landing && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-is_landing'>
                                        {errors.is_landing.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

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
