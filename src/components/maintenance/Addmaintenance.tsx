import { yupResolver } from '@hookform/resolvers/yup'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, IconButton, MenuItem, Paper, Radio, RadioGroup, Select, Table, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { GridExpandMoreIcon } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import SubmitButton from 'src/components/common/button/Button'
import MultiFileUploader from 'src/components/common/fileupload/MultiFileUpload'
import UploadFile from 'src/components/common/fileupload/singleFileUpload'
import RHFAutoComplete2 from 'src/hook-forms/RHFAutoComplete2'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import { Editor } from '@tinymce/tinymce-react';

import * as yup from 'yup'
// import GalleryUploader from './AddGallery'
// import SpecificationAndPolicy from './SpecificationAndPolicy'
// import AddPricing from './AddPricing'
import { convertFileToBase64 } from 'src/utils/commonFunctions'
import { useSettings } from 'src/@core/hooks/useSettings'
import { capitalizeFirstLetter } from 'src/utils/encodeid'
import themeConfig from 'src/configs/themeConfig'
import SelectTurfDropdown from '../turf_management/SelectTurfDropdown'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFRadio from 'src/hook-forms/RHFRadio'
const schema = yup.object().shape({
    // name: yup.string().required('Maintenance Name is required.'),
    // description: yup.string().required('Description is required.'),
    // surface_type: yup.string().required('Surface Type is required.'),
    // status: yup.string().required('Status is required.'),
    // capacity: yup.string().required('Capacity is required.'),
    // min_booking_slots: yup.number().typeError('Min. booking slot is required.').required('Min. booking slot is required.'),
    // terms_condition: yup.string().required('Terms And Condition is required.'),
    // cancellation_policy: yup.string().required('Cancellation policy is required.'),
    // length: yup.number()
    //     .typeError('Length must be a number.')
    //     .positive('Length must be greater than zero.')
    //     .required('Length is required.'),
    // width: yup.number()
    //     .typeError('Width must be a number.')
    //     .positive('Width must be greater than zero.')
    //     .required('Width is required.'),
    // area_sq_ft: yup.number()
    //     .typeError('Area (sq ft) must be a number.')
    //     .positive('Area (sq ft) must be greater than zero.')
    //     .required('Area (sq ft) is required.'),
    // amenity_ids: yup.mixed()
    //     .required('Amenities are required.'),
    // game_ids: yup.mixed()
    //     .required('Games are required.'),
    // account_id
    //     : yup.string()
    //         .required('Payment Account  is required.'),
    // faqs: yup.array().of(
    //     yup.object().shape({
    //         title: yup
    //             .string()
    //             .required('Title is required.')
    //             .min(5, 'Title must be at least 5 characters.'),
    //         content: yup.string().required('Content is required.'),
    //     })
    // ),
    // sameForAllDays: yup.boolean(),
    // venue_id: yup.string().required('Venue is required.'),
    // city_id: yup.string().required('City is required.'),
    // manager_id: yup.string().required('Manager is required.'),
    // caretaker_id: yup.string().required('Caretaker is required.'),


})
interface Props {
    turfData?: any
}
const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
function Addmaintenance({ turfData }: Props) {
    const router = useRouter()
    const editorRef = React.useRef(null);
    const { settings } = useSettings()


    const [isLoading, setIsLoading] = useState(false)
    const [defaultPhoto, setDefaultPhoto] = React.useState<File[]>([])

    const [cityList, setcityTackerList] = useState([])
    const [venueList, setVenueList] = useState([])
    const [options, setOptions] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [searchParams, setSearchParams] = useState('')
    const [totalCount, setTotalCount] = useState(10)
    //   const [fetchingCities, setFetchingCities] = useState(false)
    const [fetchingAmenityType, setfetchingAmenityType] = useState(false)



    // add maintenance
    const [selectedTurf, setSelectedturf] = useState('')
    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        getValues,
        watch,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) })



    const { fields, append, remove } = useFieldArray({
        control,
        name: 'faqs',
    });
    const onSubmit = async (data) => {
        setIsLoading(true);

        const formData = new FormData()

        const { attachment } = data
        // Ensure priority is an object and has a value
        const priorityValue = data.priority?.value || '';

        if (!priorityValue) {
            toast.error('Priority is required.');
            setIsLoading(false);
            return;
        }
        // Append primary image
        if (attachment && attachment.length > 0) {
            attachment.forEach((item, index) => {
                formData.append(`attachment[${index}]`, item);
            });
        }
        formData.append('description', data.description)
        formData.append('category_id', data.category_id.value)
        formData.append('villa_id', selectedTurf)
        formData.append('priority', data.priority.value)
        formData.append('maintenance_name', data.maintenance_name)

        try {
            const response = await axiosInstance.post(`/v1/admin/addMaintenance`, formData)
            toast.success(response?.data?.message ?? 'Maintenance Added Successfully.')
            router.back()
        } catch (e) {
            if (e.response?.status === 412 && e.response?.data?.data) {
                for (const key in e.response?.data?.data) {
                    setError(key, { type: 'manual', message: e.response?.data?.data[key].join(',') });
                }
            } else {
                toast.error(e?.response?.data?.message ?? `Failed to create. Please try again.`)
            }
        } finally {
            setIsLoading(false);
        }
    };
    const showValidationErrors = (errors) => {
        Object.keys(errors).forEach((key) => {
            const error = errors[key];
            if (error?.message) {
                toast.error(error.message, {
                    position: "top-right",
                });
            }
        });
    };
    showValidationErrors(errors);
    const handleImage = (data) => {
        setValue('attachment', data)

    }
    const fetchLoadMore = async () => {
        setfetchingAmenityType(true)
        let search = ''
        if (searchParams) {
            search = `&name=${searchParams}`
        }
        if (options.length >= totalCount) {
            // If already fetched all available options, stop pagination
            return;
        }
        setTimeout(async () => {

            try {
                const response = await axiosInstance.get(`/v1/admin/getAllCategory?category_type=maintenance&pageNo=${currentPage}&limit=10${search}`)
                const data = response.data.data?.data?.map((item: any) => ({ label: item.category_name, id: item.id, value: item.id }))
                setTotalCount(response.data.data?.count)
                if (data) {

                    setOptions((prev) => {
                        const existingIds = new Set(prev.map((item) => item.id));
                        const newOptions = data.filter((item) => !existingIds.has(item.id));
                        return [...prev, ...newOptions];
                    });
                }
            } catch (e) {
                } finally {
                setfetchingAmenityType(false)
            }
        }, 1000)
    }

    useEffect(() => {
        fetchLoadMore()
    }, [currentPage, searchParams])

    return (
        <>
            <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'start', flexGrow: 1 }}>
                {/* {capitalizeFirstLetter(themeConfig.projectFor)}  */}
                Add Maintenance </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>

                            <Grid item xs={12}>

                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<GridExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                                        <Typography variant='h6' fontWeight={700}>Basic Details</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {/* Grid container for form inputs */}
                                        <Grid container spacing={3}>
                                            {/* select villa */}
                                            <Grid item xs={12} md={12}>
                                                <SelectTurfDropdown setTurf={setSelectedturf} multiple={true} />
                                            </Grid>
                                            {/* Name */}
                                            <Grid item xs={12} md={12}>
                                                <RHFInput control={control} name={'maintenance_name'} label={'Maintenance Name'} placeholder={'Title'} mandatory />
                                            </Grid>
                                            {/* catogory */}
                                            <Grid item xs={12} md={6}>

                                                <RHFAutoComplete
                                                    label='Select Category'
                                                    mandatory
                                                    control={control}
                                                    name={'category_id'}
                                                    options={options}
                                                    setCurrentPage={setCurrentPage}
                                                    loadMore={fetchLoadMore}
                                                    setSearchParams={setSearchParams}
                                                    hasMore={options.length <= totalCount}
                                                    isLoading={fetchingAmenityType}
                                                    required={true}
                                                    defaultValue={
                                                        null
                                                    }
                                                />
                                            </Grid>
                                            {/* Priority */}
                                            <Grid item xs={12} md={6}>
                                                <RHFAutoComplete
                                                    label='Select Priority'
                                                    mandatory
                                                    control={control}
                                                    name={'priority'}
                                                    required={true}
                                                    options={[
                                                        { label: 'High', value: 'High' },
                                                        { label: 'Medium', value: 'Medium' },
                                                        { label: 'Low', value: 'Low' }
                                                    ]}
                                                    defaultValue={null}
                                                />
                                            </Grid>

                                            {/* <Grid item xs={12} md={6}>
                                                <RHFInput control={control} name={'amount'} label={'Amount'} placeholder={'00.0'} mandatory />
                                            </Grid> */}
                                            {/* <Grid item xs={12}>

                                                <RHFRadio control={control} name={'payment_mode'} label={'Payment Mode'} radio_label={'Payment Mode'} options={[{ label: 'Cash', value: 'cash' }, { label: 'Online', value: 'online' }]} />
                                            </Grid> */}

                                            <Grid item xs={12}>
                                                <RHFInput control={control} name={'description'} label={'Description'} mandatory multiline rows={3} />

                                            </Grid>
                                            {/* <Grid item xs={12} md={12}>

                                                <Accordion defaultExpanded>
                                                    <AccordionSummary expandIcon={<GridExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                                                        <Typography variant='h6' fontWeight={700}>Attachments</Typography>

                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <MultiFileUploader handleImage={handleImage} label={''} />
                                                    </AccordionDetails>
                                                </Accordion>
                                            </Grid> */}

                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'end' }}>

                                <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grid container spacing={3} flexDirection={{ md: 'column', xs: 'column-reverse' }}>
                            {/* section right */}
                            <Grid item xs={12}>
                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<GridExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                                        <Typography variant='h6' fontWeight={700}>Attachments</Typography>

                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <MultiFileUploader handleImage={handleImage} label={''} />
                                        {/* <UploadFile  handleImage={handleImage} defaultPhoto={defaultPhoto} label={''} mandatory /> */}
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>

            </form>
        </>
    )
}

export default Addmaintenance










{/* <Grid item xs={12}>
                                                <label style={{ marginTop: '12px' }}>
                                                    Notes/Description
                                                    <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                <div style={{ border: errors?.description ? '1px solid red' : '', padding: "5px" }}>
                                                    <Editor
                                                        apiKey='eofzzgqffqqwe407pkpzb3a9koxxseo0feiso5z4hxlwqo33'
                                                        onInit={(evt, editor) => editorRef.current = editor}
                                                        init={{
                                                            height: 300,
                                                            plugins: [
                                                                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                            ],
                                                            toolbar: 'undo redo | blocks | ' +
                                                                'bold italic forecolor | alignleft aligncenter ' +
                                                                'alignright alignjustify | bullist numlist outdent indent | ' +
                                                                'removeformat | help',
                                                            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                            skin: settings.mode == 'dark'
                                                                ? "oxide-dark"
                                                                : "oxide",
                                                            content_css: settings.mode == 'dark'
                                                                ? "dark"
                                                                : "default",
                                                        }}
                                                        initialValue={turfData?.description ?? ''}
                                                        onEditorChange={handleEditorChange}

                                                    />
                                                </div>
                                            </Grid> */}