import { yupResolver } from '@hookform/resolvers/yup'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, Divider, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, IconButton, InputLabel, List, ListItem, ListItemIcon, ListItemText, MenuItem, Paper, Radio, RadioGroup, Select, Table, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { GridExpandMoreIcon } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import React, { Fragment, useEffect, useState } from 'react'
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
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import * as yup from 'yup'
// import GalleryUploader from './AddGallery'
// import SpecificationAndPolicy from './SpecificationAndPolicy'
// import AddPricing from './AddPricing'
import { convertFileToBase64 } from 'src/utils/commonFunctions'
import { useSettings } from 'src/@core/hooks/useSettings'
import themeConfig from 'src/configs/themeConfig'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import SelectTurfDropdown from '../turf_management/SelectTurfDropdown'
import RHFRadio from 'src/hook-forms/RHFRadio'
import { baseUrl } from 'src/services/baseUrl'
import DeleteDialogPopup from '../common/DeletePopup/DeleteModalPopup'

const schema = yup.object().shape({
    expenses_name: yup.string().required('Expense name is required'),
    category_id: yup.mixed().required('Category is required'),
    // amount: yup.number().required('Amount is required').positive('Amount must be a positive number'),
    // payment_mode: yup.string().required('Payment mode is required'),
    description: yup.string().required('Description is required'),
    attachment: yup.array().of(yup.mixed().required('File is required')).nullable(),
})
interface Props {
    isUpdate: boolean
}

function Viewmaintenance({ isUpdate }: Props) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [cityList, setcityTackerList] = useState([])
    const [venueList, setVenueList] = useState([])
    const [expenseData, setExpenseData] = useState(null)
    const [selectedTurf, setSelectedTurf] = useState('')
    const [options, setOptions] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [searchParams, setSearchParams] = useState('')
    const [totalCount, setTotalCount] = useState(10)
    const [openDeleteImage, setOpenDeleteImage] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    //   const [fetchingCities, setFetchingCities] = useState(false)
    const [fetchingAmenityType, setfetchingAmenityType] = useState(false)
    const [moreImages, setMoreImages] = useState([])
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

    const fetchData = async () => {
        try {

            const response = await axiosInstance.get(`v1/admin/getMaintenance?id=${router.query.id}`)
            setExpenseData(response.data.data)
            // } catch (e) {
            }
    }

    const handleUploadImage = async () => {
        const formData = new FormData()
        if (moreImages && moreImages.length > 0) {
            moreImages.forEach((item, index) => {
                formData.append(`attachment[${index}]`, item);
            });
        }
        formData.append('maintenance_id', router.query.id)
        try {
            const response = await axiosInstance.post(`v1/admin/addAttachment`, formData)
        } catch (e) {
            }
    }
    const onSubmit = async (data) => {
        setIsLoading(true);
        handleUploadImage()
        const formData = new FormData()

        const { attachment } = data
        if (attachment && attachment.length > 0) {
            attachment.forEach((item, index) => {
                formData.append(`attachment[${index}]`, item);
            });
        }
        formData.append('description', data.description)
        formData.append('category_id', data.category_id?.value ?? data.category_id)
        formData.append('villa_id', selectedTurf ?? data.villa_id)
        // formData.append('amount', data.amount)
        formData.append('expenses_name', data.expenses_name)
        // formData.append('payment_mode', data.payment_mode)
        try {
            const response = await axiosInstance.post(`/v1/admin/updateMaintenance?id=${router.query.id}`, formData)
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

    const handleImage = (data) => {
        setValue('attachment', data)
        setMoreImages(data)

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
    useEffect(() => {
        fetchData()
    }, [router.query.id])
    useEffect(() => {
        if (expenseData) {
            setValue('expenses_name', expenseData?.maintenance_name)
            setValue('description', expenseData?.description)
            setValue('villa_id', expenseData?.villa_id ?? '')
            setValue('category_id', expenseData?.category_id ?? '')
            setValue('priority', expenseData?.priority)
            // setValue('payment_mode', expenseData?.payment_mode)
            // setValue('attachment', expenseData?.attachment)
            setValue('attachment', expenseData?.attachment || []);
            // }
    }, [expenseData])
    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();

        switch (ext) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <ImageIcon />; // Replace with an actual image if needed
            case 'pdf':
                return <img src='/images/icons/file-icons/pdf.png' width='24' height='24' />;
            case 'xls':
                return <img src='/images/icons/file-icons/xls.png' width='24' height='24' />;

            default:
                return <InsertDriveFileIcon />;
        }
    };
    return (
        <>
            <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'start', flexGrow: 1 }}>
                {/* Maintenance  */}
                {isUpdate ? 'Edit Maintenance' : ' Maintenance Details'}
            </Typography>
            {/* {themeConfig.projectFor} */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={5}>

                            <Grid item xs={12}>

                                <Accordion defaultExpanded>
                                    <AccordionSummary expandIcon={<GridExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                                        <Typography variant='h6' fontWeight={700}>Basic Details</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {/* Grid container for form inputs */}
                                        <Grid container spacing={3}>
                                            {/* Name */}

                                            <Grid item xs={12}>
                                                <SelectTurfDropdown setTurf={setSelectedTurf} defaultValue={expenseData?.villas ? { label: expenseData?.villas.name, id: expenseData?.villas.id, value: expenseData?.villas.id } : null} />
                                            </Grid>
                                            <Grid item xs={12} md={12}>
                                                <RHFInput disabled={!isUpdate} control={control} name={'expenses_name'} label={'Maintenance Name'} placeholder={'Title'} mandatory />
                                            </Grid>
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

                                                    defaultValue={
                                                        expenseData?.category_id
                                                            ? { id: expenseData?.category_id, label: expenseData?.category_type?.category_name, value: expenseData?.category_id || null }
                                                            : null
                                                    }
                                                />
                                            </Grid>
                                            {/* Priority */}
                                            <Grid item xs={12} md={6}>
                                                {/* <RHFAutoComplete
                                                    label='Select Priority'
                                                    mandatory
                                                    control={control}
                                                    name={'priority'}
                                                    options={[
                                                        { label: 'High', value: 'High' },
                                                        { label: 'Medium', value: 'Medium' },
                                                        { label: 'Low', value: 'Low' }
                                                    ]}
                                                    defaultValue={expenseData?.priority ? { id: expenseData?.priority, label: expenseData?.priority, value: expenseData?.priority || null } : null}
                                                /> */}
                                                <label style={{ marginTop: '12px' }}>
                                                    Priority  <span style={{ color: 'red' }}>*</span>
                                                </label>
                                                <FormControl fullWidth size='small'>


                                                    <Select

                                                        {...register('priority')}
                                                        error={Boolean(errors.priority)}
                                                        labelId='validation-priority'
                                                        aria-describedby='validation-priority'
                                                        defaultValue={expenseData?.priority}
                                                    >
                                                        <MenuItem value='High'>High</MenuItem>
                                                        <MenuItem value='Mediun'>Mediun</MenuItem>
                                                        <MenuItem value='Low'>Low</MenuItem>

                                                    </Select>

                                                    {errors.priority && (
                                                        <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-priority'>
                                                            {errors.priority.message}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                            {/* <Grid item xs={12} md={6}>
                                                <RHFInput disabled={!isUpdate} control={control} name={'amount'} label={'Amount'} placeholder={'00.0'} mandatory />
                                            </Grid> */}
                                            {/* <Grid item xs={12}>

                                                <RHFRadio disabled={!isUpdate} control={control} name={'payment_mode'} label={'Payment Mode'} radio_label={'Payment Mode'} options={[{ label: 'Cash', value: 'cash' }, { label: 'Online', value: 'online' }]} />
                                            </Grid> */}
                                            <Grid item xs={12}>
                                                <RHFInput disabled={!isUpdate} control={control} name={'description'} label={'Description'} mandatory multiline rows={3} />

                                            </Grid>

                                            {/* <div className=" shadow-md p-4 border rounded-md mb-6 mt-6">
                                                <h2 className="text-lg font-bold mb-2">{capitalizeFirstLetter(themeConfig.projectFor)} Description</h2>
                                                <hr />

                                                <p>
                                                    { }
                                                    {<div dangerouslySetInnerHTML={{ __html: turfData?.description }} /> || 'No description available'}</p>
                                            </div> */}

                                        </Grid>
                                        {isUpdate && (

                                            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>

                                                <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                                            </Grid>
                                        )}


                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Grid container spacing={3} flexDirection={{ md: 'column', xs: 'column-reverse' }}>
                            {/* section right */}
                            {isUpdate && (

                                <Grid item xs={12}
                                    sx={{
                                        '@media (min-width: 900px)': {  // Applies only for md (900px) and larger screens
                                            height: '200px', // Fixed height for medium devices
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between' // Adjusts spacing inside if needed
                                        }
                                    }}
                                >

                                    <Accordion defaultExpanded>
                                        <AccordionSummary expandIcon={<GridExpandMoreIcon />} aria-controls='panel1-content' id='panel1-header'>
                                            <Typography variant='h6' fontWeight={700}>Attachments</Typography>

                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <MultiFileUploader handleImage={handleImage} label={''} />
                                        </AccordionDetails>
                                    </Accordion>

                                </Grid>
                            )}
                            <Grid item xs={12}>

                                {expenseData?.attachment?.length > 0 ? (
                                    <Fragment>
                                        <Box sx={{ mt: 5 }}>
                                            <Typography variant='body2'>Attachments</Typography>
                                            <List >
                                                {expenseData?.attachment?.map((item) => {
                                                    return (
                                                        <ListItem sx={{ cursor: 'pointer', border: '1px solid gray', borderRadius: 1, p: 3, mb: 2 }} disableGutters key={item.fileName} >

                                                            <ListItemIcon>{getFileIcon(item.attachment)}</ListItemIcon>

                                                            {/* <Typography variant='caption'>{item.attachment}</Typography> */}
                                                            {/* <ListItemText
                                                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}${item.attachment}`, '_blank')}
                                                                primary={item.attachment}
                                                            // secondary={`${(file.size / 1024).toFixed(2)} KB`} 
                                                            /> */}
                                                            <ListItemText
                                                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}${item.attachment}`, '_blank')}
                                                                primary={item.attachment.split('/').pop()} // Extracts only the file name
                                                            />

                                                            <ListItemIcon>
                                                                {isUpdate && (

                                                                    <IconButton onClick={() => { setSelectedImage(item.id); setOpenDeleteImage(true) }}>
                                                                        <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                                                                    </IconButton>
                                                                )}
                                                            </ListItemIcon>

                                                        </ListItem>
                                                    )
                                                })}
                                            </List>
                                        </Box>
                                    </Fragment>
                                ) : null}
                            </Grid>


                        </Grid>
                    </Grid>



                </Grid>

            </form>
            {openDeleteImage && (
                <DeleteDialogPopup show={openDeleteImage} handleclose={() => setOpenDeleteImage(false)} selectedItems={undefined} fetchData={fetchData} label={'Are you sure you want to delete file.'} apiUrl={'v1/admin/deleteAttachment?id'} />
            )}
        </>
    )
}

export default Viewmaintenance


