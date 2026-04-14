import { Box, Button, Grid, IconButton } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import Icon from 'src/@core/components/icon'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'
interface FileProp {
    name: string
    type: string
    size: number
}
interface Props {
    handleImage: any
    defaultPhoto: any
    label: string
    mandatory?: boolean
}

const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(4)
    }
}))
export default function UploadFile({ handleImage, defaultPhoto, label, mandatory }: Props) {
    const [files, setFiles] = useState<File[]>([])
    const theme = useTheme()
    const { t } = useTranslation()
    const { getRootProps, getInputProps } = useDropzone({
        multiple: false,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', ]
        },
        onDrop: (acceptedFiles: File[]) => {
            setFiles(acceptedFiles.map((file: File) => Object.assign(file)))
        },
        onDropRejected: () => {
            toast.error('You can only upload one image', {
                duration: 2000
            })
        }
    })
    const Img = styled('img')(({ theme }) => ({
        width: 200,
        [theme.breakpoints.up('md')]: {
            marginRight: theme.spacing(15.75)
        },
        [theme.breakpoints.down('md')]: {
            width: 250,
            marginBottom: theme.spacing(4)
        },
        [theme.breakpoints.down('sm')]: {
            width: 200
        }
    }))
    useEffect(() => {
        const fileNames = files.map((file: File) => file.name);
        handleImage(files);
    }, [files]);
    const img = files.map((file: FileProp) => (

        <img key={file.name} alt={file.name} className='single-file-image' src={URL.createObjectURL(file as any)} />
    ))
    return (
        <DropzoneWrapper>

            <Grid item xs={12} >
                <label style={{ marginTop: '12px' }}>
                    {label}
                    {mandatory && <span style={{ color: 'red' }}>*</span>}
                </label>
                <Box {...getRootProps({ className: 'dropzone' })} sx={files.length ? { height: '100%' } : {}}>
                    <input {...getInputProps()} title='Upload or Drag Image ' />
                    {files.length ? (
                        img
                    ) : (
                        // <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        //     <IconButton
                        //         sx={{
                        //             color: 'text.secondary',
                        //         }}
                        //     >
                        //         <Icon icon='icon-park-outline:upload-one' fontSize={50} />
                        //     </IconButton>
                        //     <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: ['center', 'center', 'inherit'] }}>
                        //         <HeadingTypography variant='h6'>{t('Drag & drop your file here')}</HeadingTypography>
                        //         <Typography textAlign={'center'}>{t('or')}</Typography>

                        //         <Button variant='contained'>
                        //             {t('browse file')}
                        //         </Button>


                        //     </Box>
                        // </Box>
                        <Box sx={{ display: 'flex', flexDirection: ['column', 'column', 'row'], alignItems: 'center', flexWrap:'wrap', justifyContent:'center' }}>
                            <Img alt='Upload img' src={`/images/misc/upload-${theme.palette.mode}.png`} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: ['center', 'center', 'inherit'] }}>
                                <HeadingTypography variant='h5'>Drop file here or click to upload.</HeadingTypography>
                                <Typography color='textSecondary' sx={{ '& a': { color: 'primary.main', textDecoration: 'none' } }}>
                                    Drop file here or click{' '}
                                    <Link href='/' onClick={e => e.preventDefault()}>
                                        browse
                                    </Link>{' '}
                                    thorough your machine
                                </Typography>
                                <Typography color='textSecondary'>Allowed *.jpeg, *.jpg, *.png, *.gif</Typography>

                            </Box>
                        </Box>
                    )}
                    {defaultPhoto?.length > 0 && !files.length && (
                        <img alt={'Previous Image'} className='single-file-image' src={defaultPhoto} />
                    )}
                </Box>

            </Grid>
        </DropzoneWrapper>
    )
}
