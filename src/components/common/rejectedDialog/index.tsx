// components/RejectDialog.tsx

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Divider, IconButton, Button, TextField,
  Grid
} from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import RHFInput from 'src/hook-forms/RHFInput'

interface RejectDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { reason: string }) => void
  title?: string
}

const schema = yup.object().shape({
  reason: yup
    .string()
    .required('Rejection Reason is required.')
    .min(3, 'Rejection Reason must be at most 3 characters long.')
    .max(255, 'Rejection Reason must not exceed 255 characters.')
    .matches(/^(?!\s*$).+/, 'Rejection Reason cannot be just empty or spaces.')
    // .matches(/^[A-Za-z0-9\s.,'-]+$/, 'Rejection Reason cannot contain invalid special characters.')
    

})

export default function RejectDialog({
  open,
  onClose,
  onSubmit,
  title = 'Reject Opportunity'
}: RejectDialogProps) {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<{ reason: string }>({
    resolver: yupResolver(schema),
    defaultValues: { reason: '' }
  })

  const handleFormSubmit = (data: { reason: string }) => {
    onSubmit(data)
    setTimeout(()=>{
    reset()

    },1000)
  }

  const handleClose = () => {
   
    onClose()
     reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 5, pt: 4 }}>
          <Typography variant='h6' fontWeight={700}>Reject Request
</Typography>
          <IconButton onClick={handleClose}>
            <HighlightOffIcon sx={{ color: '#f52d2d' }} fontSize="medium" />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        <DialogContent>
       
<Grid spacing={2} container>
            <Grid item xs={12} md={12}>
                                                <RHFInput control={control} name={'reason'} label={'Rejected Reson'} placeholder={'Rejected Reson'} mandatory />
                                 </Grid>           </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 5, pb: 3 }}>
          <Button variant='outlined' onClick={handleClose}>
            Close
          </Button>
          <Button
            type='submit'
            variant='contained'
            sx={{
              backgroundColor: '#E34747',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#d13b3b',
                color: '#fff'
              }
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
