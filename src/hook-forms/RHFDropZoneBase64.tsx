import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useController } from 'react-hook-form';
import { Box, Button } from '@mui/material';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

const RHFDropZoneBase64 = ({ control, name, onImageDrop, imgUrl, disabled: propDisabled, multiple = false, ...rest }) => {
  const [disabled, setDisabled] = useState(propDisabled);
  const [dropzoneError, setDropzoneError] = useState(null);

  React.useEffect(() => {
    setDisabled(propDisabled);
  }, [propDisabled]);

  const onDrop = useCallback((acceptedFiles) => {
    // Check if the dropzone is disabled or if any dropped files are not images
    const hasInvalidFiles = disabled || acceptedFiles.some(file => !(file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/x-icon'));

    // If there are invalid files, set an error message
    if (hasInvalidFiles) {
      setDropzoneError('Only JPG and PNG image files are accepted.');
      return;
    }

    // Clear any existing error message if all dropped files are valid
    setDropzoneError(null);

    // Do something with the dropped files
    if (onImageDrop) {
      onImageDrop(acceptedFiles);
    }
  }, [disabled, onImageDrop]);

  const {
    field: { value, onChange },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: '',
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/heic': [],

      "image/x-icon": []
    }, multiple: multiple
  })

  const imageUrl = (() => {
    if (value instanceof Blob || value instanceof File) {
      return URL.createObjectURL(value);
    } else if (typeof imgUrl === 'string') {
      return `${imgUrl}`;
    } else {
      return '';
    }
  })();

  return (
    <Box {...getRootProps()} className={`image-drop ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the image here...</p>
      ) : (
        <>
          <Box sx={{ height: `${multiple ? '100px' : '200px'}`, width: '100%', border: '1px solid #E6EAEF', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            {((imgUrl?.length === 0 || imgUrl === undefined || imgUrl === null) && (!value || value.length === 0)) ? (
              <>
                <ImageOutlinedIcon sx={{ fontSize: '50px', }} />
                <Box sx={{ display: 'block' }}>
                  <Controller
                    name={name}
                    control={control}
                    {...rest} disabled={disabled}
                    render={({ field }) => (
                      <>
                        <Button variant='contained' className='card-button' sx={{ textTransform: 'capitalize', mt: 2, }} startIcon={<FileUploadOutlinedIcon />} onClick={field.onChange}>
                          Choose an image
                        </Button>
                      </>
                    )}
                  />
                </Box>
              </>
            ) : <img
              src={imageUrl}
              alt="Uploaded File"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
            />}

          </Box>
          {invalid && <span style={{ fontSize: '0.75rem', color: '#FF3E1D', marginRight: '14px', marginLeft: '14px', fontWeight: 400, marginTop: '3px' }}>{error?.message}</span>}
          {dropzoneError && (
            <span style={{ fontSize: '0.75rem', color: '#FF3E1D', marginRight: '14px', marginLeft: '14px', fontWeight: 400, marginTop: '3px' }}>
              {dropzoneError}
            </span>
          )}
        </>
      )}

    </Box>
  );
};

export default RHFDropZoneBase64;
