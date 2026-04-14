import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
interface TextViewDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  content: string;
}

const TextViewDialog: React.FC<TextViewDialogProps> = ({ open, onClose, title = 'Details', content }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small" color='error'>
          {/* <CloseIcon /> */}
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {content || 'NA'}
        </Typography> */}
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',   // Breaks long words
            hyphens: 'auto',           // Adds hyphenation where supported
          }}
        >
          {content || 'NA'}
        </Typography>

      </DialogContent>
    </Dialog>
  );
};

export default TextViewDialog;
