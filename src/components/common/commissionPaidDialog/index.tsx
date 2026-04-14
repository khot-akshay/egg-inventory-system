import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { Divider, IconButton } from '@mui/material'

import toast from 'react-hot-toast'
import axiosInstance from 'src/services/axios'
import SubmitButton from '../button/Button'

export default function CommissionPaidDialog({
  show,
  handleclose,
  selectedItems, // commission id
  fetchData,
  label,          // optional dynamic text like amount or commission title
  apiUrl          // endpoint for mark paid
}) {
  const [loading, setLoading] = useState(false)

  const handleMarkPaid = async () => {
    setLoading(true)

    const id = selectedItems

    axiosInstance
      .post(`/${apiUrl}${id}`)
      .then(res => {
        handleclose()
        setLoading(false)
        toast.success(res?.data?.message ?? 'Commission marked as paid.')
        fetchData()
      })
      .catch(error => {
        toast.error(error.response?.data?.message ?? 'Something went wrong.')
        setLoading(false)
      })
  }

  return (
    <>
      <Dialog
        fullWidth
        open={show}
        onClose={handleclose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        sx={{ borderRadius: '20px', padding: '20px' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'row'
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700, ml: '10px' }}>
            Confirmation
          </Typography>

          <IconButton aria-label='close' onClick={handleclose} sx={{ marginRight: '10px' }}>
            <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize='large' />
          </IconButton>
        </Box>

        <Divider />

        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ReportProblemIcon sx={{ fontSize: '30px', mt: '20px' }} />

            <Typography
              style={{
                fontSize: '15px',
                fontFamily: 'sans-serif',
                marginTop: '10px',
                marginLeft: '13px'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>
                Are you sure you want to mark this commission as paid?
              </span>
              <br />
              <span>
                {label
                  ? `Commission: ${label} will be marked as paid.`
                  : 'Once updated, the commission will be recorded as paid in the system.'}
              </span>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button variant='outlined' onClick={handleclose} color='error'>
            Cancel
          </Button>

          <SubmitButton
            onSubmit={handleMarkPaid}
            isLoading={loading}
            label={'Mark Paid'}
            isWidth={false}
            color='primary'
          />
        </DialogActions>
      </Dialog>
    </>
  )
}
