import React, { useState } from 'react';
import { Box, Dialog, DialogContent, IconButton } from '@mui/material';

import HighlightOffIcon from '@mui/icons-material/HighlightOff';

interface ImageModalProps {
  imageUrl: string;
  altText: string;
  width?: string;  // Optional width for the dialog image
  height?: string; // Optional height for the dialog image
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, altText, width = '500px', height = '500px' }) => {
  const [open, setOpen] = useState(false);

  // Function to open the dialog
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box sx={{
        height: "150px",
        width: "150px"
      }}>
        <img
          src={imageUrl}
          style={{

            objectFit: 'contain', // This ensures the image fills the entire area, but it may crop part of the image
            cursor: 'pointer',
            height: "100%",
            width: "100%"
            // Fixed height
          }}
          alt={altText}
          onClick={handleClickOpen}
        />
      </Box>



      {/* Dialog with fixed height and width */}
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxWidth: width,  // Set the dialog width to match the image width
            maxHeight: height, // Set the dialog height to match the image height
            margin: 'auto', // Center the dialog
          },
        }}
      >
        <DialogContent
          style={{
            padding: 0, // Remove padding to eliminate extra space
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0', // Optional background color for modal
          }}
        >
          {/* Close Button */}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              // backgroundColor: 'rgba(0, 0, 0, 0.5)',
              // color: '#fff',
            }}
          >
            {/* <CloseIcon /> */}
              <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
          </IconButton>

          {/* Image with fixed dimensions */}
          <img
            src={imageUrl}
            alt={altText}
            style={{
              width,    // Image width as per passed props
              height,   // Image height as per passed props
              objectFit: 'contain',  // Ensure image fits within dimensions while maintaining aspect ratio
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageModal;
