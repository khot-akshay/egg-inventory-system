// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'
import Typography, { TypographyProps } from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'

interface FileProp {
    name: string
    type: string
    size: number
}

interface Props {
    handleImage: any
    label: string
    mandatory?: boolean
    defaultPhoto?:any
}
// Styled component for the upload image inside the dropzone area
const Img = styled('img')(({ theme }) => ({
    width: 300,
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

// Styled component for the heading inside the dropzone area
const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(4)
    }
}))

const MultiFileUploader = ({ handleImage, label, mandatory, defaultPhoto }: Props) => {
    // ** State
    const [files, setFiles] = useState<File[]>(defaultPhoto?defaultPhoto:[])

    // ** Hooks
    const theme = useTheme()
    const { getRootProps, getInputProps } = useDropzone({
        maxSize: 2000000,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.pdf', '.xls']
        },
        onDrop: (acceptedFiles: File[]) => {
            // setFiles( acceptedFiles.map((file: File) => Object.assign(file)))
            setFiles((prevFiles) => [
                ...prevFiles,
                ...acceptedFiles.map((file: File) => Object.assign(file)),
            ]);
        },
        onDropRejected: () => {
            toast.error('You can only upload  images & maximum size of 2 MB.', {
                duration: 2000
            })
        }
    })
    useEffect(() => {
        const fileNames = files.map((file: File) => file.name);
        handleImage(files);
    }, [files]);
    const renderFilePreview = (file: FileProp) => {
        if (file.type.startsWith('image')) {
            return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file as any)} />
        } else {
            return <Icon icon='bx:file' />
        }
    }

    const handleRemoveFile = (file: FileProp) => {
        const uploadedFiles = files
        const filtered = uploadedFiles.filter((i: FileProp) => i.name !== file.name)
        setFiles([...filtered])
    }
    const fileList = files.map((file: FileProp) => (
        <ListItem key={file.name} >
            <div className='file-details'>
                <div className='file-preview'>{renderFilePreview(file)}</div>
                <div>
                    <Typography className='file-name'>{file.name}</Typography>
                    <Typography className='file-size' variant='body2'>
                        {Math.round(file.size / 100) / 10 > 1000
                            ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
                            : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
                    </Typography>
                </div>
            </div>
            <IconButton onClick={() => handleRemoveFile(file)}>
                <Icon icon='bx:x' fontSize={20} />
            </IconButton>
        </ListItem>
    ))

    const handleRemoveAllFiles = () => {
        setFiles([])
    }

    return (
        <DropzoneWrapper>
            <label style={{ marginTop: '12px' }}>
                {label}
                {mandatory && <span style={{ color: 'red' }}>*</span>}
            </label>
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <Box sx={{ display: 'flex', flexDirection: ['column', 'column', 'row'], alignItems: 'center', flexWrap:'wrap' }}>
                    <Img alt='Upload img' src={`/images/misc/upload-${theme.palette.mode}.png`} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: ['center', 'center', 'inherit'] }}>
                        <HeadingTypography variant='h5'>Drop files here or click to upload.</HeadingTypography>
                        <Typography color='textSecondary' sx={{ '& a': { color: 'primary.main', textDecoration: 'none' } }}>
                            Drop files here or click{' '}
                            <Link href='/' onClick={e => e.preventDefault()}>
                                browse
                            </Link>{' '}
                            thorough your machine
                        </Typography>
                        <Typography color='textSecondary'>Allowed *.jpeg, *.jpg, *.pdf, *.doc</Typography>

                    </Box>
                </Box>
            </div>
            {files.length ? (
                <Fragment>
                    <List >{fileList}</List>
                    <div className='buttons'>
                        <Button sx={{ mb: 3 }} color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                            Remove All
                        </Button>
                        {/* <Button variant='contained'>Upload Files</Button> */}
                    </div>
                </Fragment>
            ) : null}
        </DropzoneWrapper>
    )
}

export default MultiFileUploader
