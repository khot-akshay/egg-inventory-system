import { useEffect, useState } from 'react'

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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import axios from 'axios'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useForm, } from 'react-hook-form'
import axiosInstance from "../../services/axios";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useRouter } from "next/router";

import DatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { DateType } from 'src/types/forms/reactDatepickerTypes'

import dayjs, { Dayjs } from "dayjs";
import SelectTurfDropdown from '../turf_management/SelectTurfDropdown'
import { capitalizeFirstLetter } from 'src/utils/encodeid'
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
    minimumBuy: string;
    registered_from: Date;
    registered_till: Date;
    start_from: string;
    end_on: string;


}

interface CategoryFormProps {
    onSubmit: (data: Promocode) => void;
}

const schema = yup.object().shape({
    promocode: yup.string().required('Promocode is required.'),
    promocode_for: yup.string().required('Promocode field is required.'),
    promocode_type: yup.string().required('Promocode Type is required.'),
    type: yup.string().required('Type is required.'),
    discount: yup.string().required('Discount is required.'),
    description: yup.string().required('Description is required.'),
    freeItemCount: yup.mixed().when('type', {
        is: 'buyXFreeY',
        then: yup
            .mixed()
            .required('Free Item Count  is required. ')
        ,
        otherwise: yup.mixed(),
    }),
    minimumBuy: yup.mixed().when('type', {
        is: 'buyXFreeY',
        then: yup
            .mixed()
            .required('minimum Buy  is required .')
        ,
        otherwise: yup.mixed(),
    }),
    is_for_registered_between: yup.boolean().required(''),
    max_discount: yup.string().required('Max discount is Required'),
    minimal_cart_total: yup.string().required('Minimal Cart Field Is Required'),
    // registered_from: yup.string(),
    registered_from: yup.date().when('is_for_registered_between', {
        is: 'true',
        then: yup
            .date()

        ,
        otherwise: yup.date(),
    }),
    registered_till: yup.date().when('is_for_registered_between', {
        is: 'true',
        then: yup
            .date()

        ,
        otherwise: yup.date(),
    }),
    // registered_till: yup.date(),
    start_from: yup.string().required('Start from field is required'),
    end_on: yup.string().required('End on field is required'),
    // hide_promo: yup.boolean().required('required')

});

export default function PromocodeForm() {
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
    const selectedPromocodeFor = watch('promocode_for');


    const router = useRouter()
    const [IsForRegisteredBetween, setIsForRegisteredBetween] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [isLanding, setisLanding] = useState(false)
    const [hideOnCustomerSide, setHideOnCustomerSide] = useState(false)
    const [date, setDate] = useState<DateType>(new Date())

    const [startFrom, setStartFrom] = useState(null)
    const [endOn, setEndOn] = useState(null)

    const [registeredFrom, setRegisteredFrom] = useState(null)
    const [registeredTill, setRegisteredTill] = useState(null)
    const [selectedTurf, setSelectedTurf] = useState([])

    const handleIsForRegisteredBetween = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsForRegisteredBetween(event.target.checked);
    };
    const handleIActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsActive(event.target.checked);
    };
    const handleLandingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setisLanding(event.target.checked);
    };

    const handleHidePromo = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHideOnCustomerSide(event.target.checked);
    };

    const onSubmit = async (data: any) => {

        setLoading(true)
        if (data.type !== 'buyXFreeY') {
            delete data.minimumBuy;
            delete data.freeItemCount;
        }
        if (!data.is_for_registered_between) {
            delete data.registered_from
            delete data.registered_till
        }
        if (data?.promocode_for == themeConfig.projectFor) {
            data[`${themeConfig.projectFor}_ids`] = selectedTurf
        }
        try {
            const addCatagory = await axiosInstance.post(
                `/v1/admin/addPromocode`,
                {
                    ...data,
                    'is_for_specific_pincode': false,
                    'is_for_new_user': false,
                    'is_for_specific_number': false,
                    'is_for_paymentapp': false,
                    'is_for_only_app': false,
                    'is_landing':isLanding
                }
            ).then((response) => {
                setLoading(false)
                let data = response.data
                console.log(data)
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
            toast.error('Promocode Could Not Added', {
                position: 'top-center',
            })
            setLoading(false)
        }

    }

    return (
        <Card>
            <CardHeader title='Add Promocode' />
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} >
                    <Grid container spacing={5}>
                        <Grid item xs={12} md={6} sm={6}>
                            <FormControl fullWidth>

                                <TextField

                                    label='Promocode Name'
                                    {...register('promocode')}

                                    size='small'
                                    placeholder='Prmocode Name'
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
                        <Grid item xs={12} md={6} sm={6}>

                            <FormControl fullWidth>

                                <TextField

                                    label='Description'
                                    {...register('description')}

                                    size='small'
                                    placeholder='Description'
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
                        <Grid item xs={12} md={6} sm={6} >
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
                        <Grid item xs={12} md={6} sm={6}>

                            <FormControl fullWidth>

                                <TextField

                                    label={`${capitalizeFirstLetter(watch('type') ?? '')} Discount`}
                                    type='number'
                                    {...register('discount')}

                                    size='small'
                                    placeholder={watch('type') === 'flat' ? '₹10' : watch('type') === 'percentage' ? '10%' : '10'}
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
                        <Grid item xs={12} md={6} sm={6} >
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
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>

                                    <TextField

                                        label={'Usage Limit'}
                                        type='number'
                                        {...register('usage_limit')}

                                        size='small'
                                        placeholder='10'
                                        error={Boolean(errors.usage_limit)}
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
                        <Grid item xs={12} md={6} sm={6}>
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
                        {selectedPromocodeFor === themeConfig.projectFor && (
                            <Grid item xs={6}>

                                <SelectTurfDropdown setTurf={setSelectedTurf} multiple />

                            </Grid>
                        )}


                        <Grid item xs={12} md={6} sm={6}>
                            <FormControl fullWidth>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>

                                    <DesktopDatePicker
                                        label="Start From"
                                        inputFormat="YYYY-MM-DD"
                                        onChange={(e: Dayjs | null) => {
                                            setStartFrom(e)
                                            console.log()
                                            setValue('start_from', dayjs(e).format('YYYY-MM-DD'))
                                        }}
                                        value={startFrom}
                                        renderInput={(params) => <TextField size="small" {...params} />}
                                    />
                                </LocalizationProvider>
                                {errors.start_from && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-start_from'>
                                        {errors.start_from.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6} sm={6}>
                            <FormControl fullWidth>

                                <LocalizationProvider dateAdapter={AdapterDayjs}>

                                    <DesktopDatePicker
                                        label="End On"
                                        inputFormat="YYYY-MM-DD"
                                        onChange={(e: Dayjs | null) => {
                                            setEndOn(e)
                                            console.log()
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



                        <Grid item xs={12} md={6} sm={6}>

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
                        <Grid item xs={12} md={6} sm={6}>

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
                        {watchAllFields.type == 'buyXFreeY' &&
                            <>
                                <Grid item xs={4}>

                                    <FormControl fullWidth>

                                        <TextField
                                            type='number'
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
                                <Grid item xs={4}>

                                    <FormControl fullWidth>

                                        <TextField
                                            type='number'
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

                        <Grid item xs={12} md={12} sm={12}>
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
                        <Grid item xs={12} md={12} sm={12}>
                            <FormControl fullWidth size='small'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            // {...register('is_landing')}
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
                        <Grid item xs={12} md={12} sm={12}>
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
                                {errors.hide_promo && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-basic- hide_promo'>
                                        {errors?.hide_promo?.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

                        </Grid>
                        <Grid item xs={12} md={12} sm={12}>
                            <FormControl fullWidth size='small'>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...register('is_for_registered_between')}
                                            checked={IsForRegisteredBetween}
                                            color="primary"
                                            name={'is_for_registered_between'}
                                            onChange={handleIsForRegisteredBetween}
                                        />
                                    }
                                    label="Is For Registered Between"
                                /><Grid item xs={12} md={4} sm={4}>
                                    {errors.is_for_registered_between && (
                                        <FormHelperText sx={{ color: 'error.main' }} id='validation-basic- is_for_registered_between'>
                                            {errors.is_for_registered_between.message}
                                        </FormHelperText>
                                    )}
                                </Grid>
                            </FormControl>

                        </Grid>


                        {IsForRegisteredBetween &&
                            <>

                                <Grid item xs={12} md={6} sm={6}>
                                    <FormControl fullWidth>

                                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                                            <DesktopDatePicker
                                                label="Registered From"
                                                inputFormat="YYYY-MM-DD"
                                                onChange={(e: Dayjs | null) => {
                                                    setRegisteredFrom(e)
                                                    console.log()
                                                    setValue('registered_from', dayjs(e).format('YYYY-MM-DD'))
                                                }}
                                                value={registeredFrom}
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
                                <Grid item xs={12} md={6} sm={6}>
                                    <FormControl fullWidth>

                                        <LocalizationProvider dateAdapter={AdapterDayjs}>

                                            <DesktopDatePicker
                                                label="Registered Till"
                                                inputFormat="YYYY-MM-DD"
                                                onChange={(e: Dayjs | null) => {
                                                    setRegisteredTill(e)
                                                    console.log()
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
