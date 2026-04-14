// MultiImageDrop.js
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller } from 'react-hook-form';
// @mui
import { Box, Button, Grid } from '@mui/material';
// icons
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

const RHFMultiselectDropZone = ({ control, name, onImagesDrop, disabled, ...rest }) => {
    const onDrop = useCallback(acceptedFiles => {
        if (onImagesDrop) {
            onImagesDrop(acceptedFiles);
        }
    }, [onImagesDrop]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/jpeg, image/png, image/jpg, image/gif', // Specify accepted file types
        multiple: true,    // Enable multiple file selection
    });

    return (
        <Box {...getRootProps()} className={`multi-image-drop ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {isDragActive ? (
                <p>Drop the images here...</p>
            ) : (
                <>
                    <Grid container spacing={2} sx={{   }}>
                       <Grid item md={12} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                       <ImageOutlinedIcon sx={{ fontSize: '50px', color: '#2B6FF2' }} />
                        <Box sx={{ display: 'block' }}>
                            <Controller
                                name={name}
                                control={control}
                                {...rest} disabled={disabled}
                                render={({ field }) => (
                                    <>
                                        <Button variant='contained' className='card-button' sx={{ textTransform: 'capitalize', mt: 2, background: '#2B6FF2' }} startIcon={<FileUploadOutlinedIcon />} onClick={field.onChange}>
                                            Choose images
                                        </Button>
                                    </>
                                )}
                            />
                        </Box>
                       </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default RHFMultiselectDropZone;
