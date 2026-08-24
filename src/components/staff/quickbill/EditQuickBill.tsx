import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography, Button } from '@mui/material'
import React, { useEffect } from 'react'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import toast, { Toaster } from 'react-hot-toast'
import AddQuickBillForm from './AddQuickBill'

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: any
}

const EditQuickBill = ({ open, handleClose, fetchData, selectedItem }: Props) => {

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      handleClose()
    }
  }, [open, handleClose])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={'sm'}
      fullWidth
    >
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
      >
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', flexGrow: 1, paddingLeft: '10px' }}>
          Edit Quick Bill
        </Typography>
        <IconButton onClick={handleClose}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Toaster position="top-right" reverseOrder={false} />
        <AddQuickBillForm
          handleClose={handleClose}
          fetchData={fetchData}
          selectedItem={selectedItem}
        />
      </DialogContent>
    </Dialog>
  )
}

export default EditQuickBill
