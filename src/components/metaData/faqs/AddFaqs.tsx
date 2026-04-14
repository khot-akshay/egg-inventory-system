import { yupResolver } from '@hookform/resolvers/yup'
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Box, IconButton, Typography, FormHelperText, Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import RHFInput from 'src/hook-forms/RHFInput'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import toast, { Toaster } from 'react-hot-toast'

const schema = yup.object().shape({
    // name: yup.string().typeError('Amenities is required.').required('Amenities is required.'),
    title: yup
        // .string()
        // .typeError('Amenities is required.')
        // .required('Amenities is required.')
        // .min(3, 'Amenities must be at least 3 characters long.') 
        // .max(50, 'Amenities must be at most 50 characters.'),
        .string()
        .required('Question is required.')
        .matches(/^(?!.*<\/?[^>]+>).*$/, `Question should not contain HTML tags.`) // Prevents HTML tags
        .matches(/^(?!.*\s$).*$/, `Question should not end with a space.`) // Prevents trailing spaces
        .matches(/^(?!.*\s{2,}).*$/, 'Question cannot have excessive spaces between words.')
        .min(3, 'Question must be at least 3 characters long.')
        .max(50, 'Question cannot be more than 50 characters long.'),

    description: yup
        .string()
        .required('Answer is required.')
        // .matches(/^(?!.*<\/?[^>]+>).*$/, `Answer should not contain HTML tags.`) // Prevents HTML tags
        .matches(/^(?!.*\s$).*$/, `Answer should not end with a space.`) // Prevents trailing spaces
        .matches(/^(?!.*\s{2,}).*$/, 'Answer cannot have excessive spaces between words.')
        .min(3, 'Answer must be at least 3 characters long.')
        .max(255, 'Answer cannot be more than 255 characters long.'),

    model_type: yup.mixed().required('Panel Type is required.'),




})

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Editor } from '@tinymce/tinymce-react'
import { useSettings } from 'src/@core/hooks/useSettings'
import RHFAutoComplete2 from 'src/hook-forms/RHFAutoComplete2'

interface FormData {
    name: string
}

interface SelectedItem {
    id: any;
    title: any;
    description?: any;



}

interface Props {
    open: boolean
    handleClose: () => void
    fetchData: any
    selectedItem?: SelectedItem
}

const AddFaqs = ({ open, handleClose, fetchData, selectedItem }: Props) => {
    const [isLoading, setIsLoading] = useState(false)
    // const [options, setOptions] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [searchParams, setSearchParams] = useState('')
    const [totalCount, setTotalCount] = useState(10)
    const options = [
        { label: 'All', value: 'all' },
        { label: 'Trader Buyer', value: 'trader_buyer' },
        { label: 'Trader Seller', value: 'trader_seller' },
        { label: 'Trader Financer', value: 'trader_financer' },
        { label: 'Manufacturer Buyer', value: 'manufacturer_buyer' },
        { label: 'Manufacturer Seller', value: 'manufacturer_seller' },
    ]
    const defaultValues = {
        model_type: null,
        title: "",
        description: '',


    }
    const editorRef = React.useRef(null);
    const { settings } = useSettings()
    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema), defaultValues })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)

        try {
            let payload = {
                title: data.title,
                description: data.description,
                model_type: data?.model_type,// "driver", "customer", or "vendor"

                type: 'faq',


            }
            let url = ''
            if (selectedItem) {
                url = `/api/v1/admin/updateFaq?id=${selectedItem.id}`
            } else {
                url = '/api/v1/admin/addFaq'
            }
            const response = await axiosInstance.post(url, payload)
            if (response.data.success) {
                handleClose()
                fetchData()
                toast.success(selectedItem ? 'FAQs updated successfully.' : 'FAQs added successfully.')
            }
        } catch (e: any) {
            console.error(e)
            toast.error(
                selectedItem
                    ? e?.response?.data?.message ?? 'Failed to update FAQs. Please try again.'
                    : e?.response?.data?.message ?? 'Failed to add FAQs. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }






    useEffect(() => {
        if (selectedItem) {

            setValue('title', selectedItem?.title)

            setValue('description', selectedItem?.description)
            setValue('model_type', selectedItem?.model_type || null)


        }
    }, [selectedItem])
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby='dialog-title'
            aria-describedby='dialog-description'
            maxWidth={'md'}
            fullWidth
            disableEnforceFocus={true}
        >
            {' '}
            <DialogTitle
                sx={{
                    m: 0,
                    p: 2,
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#3A4E7C0F'
                }}
                id='customized-dialog-title'
            >
                <Toaster position="top-right" reverseOrder={false} />
                <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'Start', flexGrow: 1, paddingLeft: '10px' }}>
                    {selectedItem ? 'Update' : 'Add'} FAQs{' '}
                </Typography>
                <IconButton onClick={handleClose}>
                    <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <RHFInput control={control} name={'title'} label={'Question'} placeholder={'Question'} mandatory={true} />
                        </Grid>
                        {/* <Grid item xs={12} md={6}>
                            <RHFInput control={control} name={'description'} label={'Answer'} placeholder={'Answer'} mandatory={true} />
                        </Grid> */}

                        {/* <Grid item xs={12} md={6} >
                            <RHFAutoComplete control={control} options={options} placeholder={'Panel Type'} fullWidth name="model_type" resetApiFunction={undefined} onScrollToEnd={undefined} loading={undefined} labelinput={'Panel Type'} />
                        </Grid> */}
                        <Grid item xs={12} md={6}>
                            <RHFAutoComplete2
                                control={control}
                                name="model_type"
                                options={options}
                                placeholder="Select Panel Type"
                                label="Select Panel Type"
                                loading={false}
                                resetApiFunction={undefined}
                                onScrollToEnd={undefined}
                                onChange={undefined}
                                mandatory={true}
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <label style={{ marginTop: '12px', display: 'block', marginBottom: '6px' }}>
                                Answer <span style={{ color: 'red' }}>*</span>
                            </label>

                            {/* <Controller
                                name="description"
                                control={control}
                                rules={{ required: 'Answer is required' }}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <>
                                        <div style={{ border: error ? '1px solid red' : '', borderRadius: 4 }}>
                                            <Editor
                                                apiKey="eofzzgqffqqwe407pkpzb3a9koxxseo0feiso5z4hxlwqo33"
                                                onInit={(evt, editor) => (editorRef.current = editor)}
                                                value={value}
                                                // onEditorChange={onChange}
                                                onEditorChange={(content) => {
                                                    // optional: strip <p> only if needed
                                                    const cleaned = content.replace(/^<p>|<\/p>$/g, '')
                                                    onChange(cleaned)
                                                }}

                                                init={{
                                                    height: 300,
                                                    forced_root_block: false,
                                                     valid_elements: '*[*]',
                                                    plugins: [
                                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                    ],
                                                    toolbar:
                                                        'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
                                                        'alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                    skin: settings.mode === 'dark' ? 'oxide-dark' : 'oxide',
                                                    content_css: settings.mode === 'dark' ? 'dark' : 'default'
                                                }}
                                            />
                                        </div>
                                        {error && (
                                            <FormHelperText sx={{ color: 'error.main' }}>
                                                {error.message}
                                            </FormHelperText>
                                        )}
                                    </>
                                )}
                            /> */}
                            <Controller
                                name="description"
                                control={control}
                                rules={{ required: 'Answer is required.' }}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <>
                                        <div style={{ border: error ? '1px solid red' : '', borderRadius: 4 }}>
                                            <Editor
                                                apiKey='u1sdlu5whzcvyn568o8mc294yt33p2dkui5wpaux7c4wif8j'
                                                onInit={(evt, editor) => (editorRef.current = editor)}
                                                value={value}
                                                onEditorChange={(content) => {
                                                    // optional: strip <p> only if needed
                                                    // const cleaned = content.replace(/^<p>|<\/p>$/g, '')
                                                    // onChange(cleaned)
                                                    const cleaned = content.replace(/<[^>]+>/g, '') // new line
                                                    onChange(cleaned)
                                                }}

                                                init={{
                                                    height: 300,
                                                    // forced_root_block: false,
                                                    valid_elements: '*[*]',
                                                    plugins: [
                                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                    ],
                                                    toolbar:
                                                        'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
                                                        'alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                                                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                                                    skin: settings.mode === 'dark' ? 'oxide-dark' : 'oxide',
                                                    content_css: settings.mode === 'dark' ? 'dark' : 'default'
                                                }}
                                            />
                                        </div>
                                        {error && (
                                            <FormHelperText sx={{ color: 'error.main' }}>
                                                {error.message}
                                            </FormHelperText>
                                        )}
                                    </>
                                )}
                            />

                        </Grid>





                    </Grid>
                </DialogContent>
                <DialogActions sx={{ mt: 3 }}>
                    <Button variant='outlined' onClick={handleClose}>
                        Cancel
                    </Button>
                    <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                </DialogActions>
            </form>

        </Dialog>
    )
}

export default AddFaqs
