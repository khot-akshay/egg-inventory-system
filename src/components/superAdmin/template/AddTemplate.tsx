import { yupResolver } from '@hookform/resolvers/yup';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
import { Editor } from '@tinymce/tinymce-react';
import dayjs, { Dayjs } from "dayjs";
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Icon from 'src/@core/components/icon';
import { useSettings } from 'src/@core/hooks/useSettings';
import axiosInstance from 'src/services/axios';
import * as yup from 'yup';
import SubmitButton from 'src/components/common/button/Button';
import RHFInput from 'src/hook-forms/RHFInput';
const schema = yup.object().shape({
    template_name: yup.string().typeError('Template Name is required.').required('Template Name is required.'),
    type: yup.string().typeError('Template Type is required.').required('Template Type is required.'),
    subject: yup.string().typeError('Subject Name is required.').required('Subject Name is required.'),
    date: yup.string().typeError('Date is required.').required('Date is required.'),
    body: yup.string().required('Body description is required.')
});

export default function AddTemplate({ open, handleClose, fetchData }) {
    const { settings } = useSettings()

    const [isLoading, setIsLoading] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [startFrom, setStartFrom] = useState<Dayjs | null>(dayjs());
    const [allVariables, setAllVariables] = useState([]);
    const [variableOpen, setVariableOpen] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        setError,
        setValue,
        watch,
        formState: { errors }
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = async (data) => {
        setIsLoading(true);
        const content = editorRef.current.getContent();
        const missingVariables = allVariables?.filter(variable => !content.includes(variable?.name));
        if (missingVariables.length > 0) {
            const missingNames = missingVariables.map(variable => variable.name);
            // toast.error(`Missing variables: ${missingNames.join(', ')}`);
            setError('body', { type: 'manual', message: `Add missing variables: ${missingNames.join(', ')}` });

            setIsLoading(false);
            return;
        }
        try {
            const formattedData = {
                ...data,
                date: data.date ? moment(data.date).format('YYYY-MM-DD') : null,
                body: content,
                template_for: 'admin'
            };
            const response = await axiosInstance.post('/admin/v1/template/createTemplate', formattedData);
            if (response.data.success) {
                handleClose();
                fetchData();
            }
        } catch (e) {
            } finally {
            setIsLoading(false);
        }
    };

    const fetchVariable = async () => {
        try {
            const response = await axiosInstance.get(`v1/admin/getAllVariables?type=otp`);
            if (response.data.success) {
                setAllVariables(response.data.data.data);
            }
        } catch (e) {
            if (e?.response?.status === 412 && e?.response?.data?.data) {
                for (const key in e.response.data.data) {
                    setError(key, { type: 'manual', message: e.response.data.data[key].join(',') });
                }
            } else {
                toast.error(e?.response?.data?.message);
            }
        }
    };

    useEffect(() => {
        fetchVariable();
    }, []);

    const editorRef = React.useRef(null);

    const handleEditorChange = (content) => {
        setValue('body', content);
    };

    const addVariableToEditor = (variable) => {
        if (editorRef.current) {
            editorRef.current.insertContent(variable);
        }
    };

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.focus();
                }
            }, 100);
        }
    }, [open]);
    useEffect(() => {
        if (open && editorRef.current) {
            editorRef.current.execCommand('mceRepaint');
        }
    }, [open]);
    return (
        <Dialog open={open} onClose={handleClose}
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            maxWidth={'md'}
            fullWidth
            disableEnforceFocus={true}
        >        <DialogTitle
            sx={{
                m: 0,
                p: 2,
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#3A4E7C0F',
            }}
            id="customized-dialog-title"
        >
                <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'center', flexGrow: 1 }}>
                    Add Template  </Typography>
                <IconButton onClick={handleClose}>
                    <Icon icon="bx:x" style={{ fontSize: '30px', color: 'text-dark' }} />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'template_name'} label={'Template Name'} placeholder={'Template Name'} mandatory />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography fontSize={'16px'} style={{ marginTop: '12px', fontWeight: '600', }}>Select Template Type</Typography>
                            <FormControl fullWidth size='small'>
                                {/* <InputLabel id="Select Template Type">Select Template  Type</InputLabel> */}
                                <Select
                                    fullWidth
                                    defaultValue={'otp'}
                                    labelId="demo-simple-select-standard-label"
                                    id="demo-simple-select-standard"
                                    // label="Select Template Type"
                                    {...register('type')}
                                    MenuProps={{
                                        anchorOrigin: {
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        },
                                        transformOrigin: {
                                            vertical: 'top',
                                            horizontal: 'left',
                                        },
                                        getContentAnchorEl: null, // Ensures that the dropdown is aligned with the Select input
                                    }}
                                >
                                    <MenuItem value={'otp'}>OTP</MenuItem>
                                    <MenuItem value={'profile'}>Profile</MenuItem>
                                    <MenuItem value={'signup'}>Signup</MenuItem>
                                    <MenuItem value={'password'}>Password</MenuItem>
                                    <MenuItem value={'login'}>Login</MenuItem>
                                    <MenuItem value={'reset_password'}>Reset password</MenuItem>
                                    <MenuItem value={'iQTest'}>IQTest</MenuItem>
                                    <MenuItem value={'updateIQTest'}>Update IQTest</MenuItem>
                                    <MenuItem value={'deleteIQTest'}>Delete IQTest</MenuItem>
                                    <MenuItem value={'addOrg'}>Add Org</MenuItem>
                                    <MenuItem value={'updateProfile'}>Update Profile</MenuItem>
                                    <MenuItem value={'updatePassword'}>Update Password</MenuItem>
                                    <MenuItem value={'testAllocate'}>Test Allocate</MenuItem>
                                    <MenuItem value={'purchase'}>Purchase</MenuItem>
                                    <MenuItem value={'certificate'}>certificate</MenuItem>
                                </Select>
                            </FormControl>
                            {errors.type && (
                                <FormHelperText sx={{ color: 'error.main' }} id='validation-async-type'>
                                    {errors.type.message}
                                </FormHelperText>
                            )}
                        </Grid>
                        {/* <Grid item xs={12}>
                            <RHFDatePicker control={control} name={'date'} label={'Date'} mandatory />
                        </Grid> */}
                        <Grid item xs={12}>
                            <RHFInput control={control} name={'subject'} label={'Subject'} placeholder={'Subject'} mandatory />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel style={{ marginTop: '12px', fontWeight: '600', color: 'text-dark' }}
                                control={
                                    <Checkbox
                                        checked={watch('is_default')}
                                        color="primary"
                                        {...register('is_default')}
                                    />
                                }
                                label={
                                    <Typography sx={{ fontWeight: 600, marginTop: '2px', textTransform: 'capitalize' }}>
                                        Set Default Template for {watch('type')}
                                    </Typography>
                                }
                            />
                            {errors.is_default && (
                                <FormHelperText sx={{ color: 'error.main' }} id='validation-basic-is_answer'>
                                    {errors.is_default.message}
                                </FormHelperText>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            {/* <Typography sx={{ mb: 3 }}>Template Body</Typography> */}
                            <Typography fontSize={'16px'} style={{ marginTop: '2px', fontWeight: '600', }}>Template Body<span style={{ color: 'red' }}>*</span></Typography>
                            <FormControl fullWidth>
                                <div style={{ border: errors?.body ? '1px solid red' : '', padding: "5px" }}>
                                    <Editor
                                        apiKey='eofzzgqffqqwe407pkpzb3a9koxxseo0feiso5z4hxlwqo33'
                                        onInit={(evt, editor) => editorRef.current = editor}
                                        init={{
                                            height: 500,
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
                                        onEditorChange={handleEditorChange}

                                    />
                                </div>
                                {errors.body && (
                                    <FormHelperText sx={{ color: 'error.main' }} id='validation-async-body'>
                                        {errors.body.message}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={() => setVariableOpen(true)}>
                                Add Variable
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
                </DialogActions>
            </form>
            {/* <VariablePopup open={variableOpen} handleClose={() => setVariableOpen(false)} type={watch('type')} addStringToEditor={addVariableToEditor} /> */}
        </Dialog>
    );
}
