import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material'
import dayjs from 'dayjs'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import toast from 'react-hot-toast'
import axiosInstance from 'src/services/axios'
import exp from 'constants'
import RHFInput from 'src/hook-forms/RHFInput'
// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import checkPermission from 'src/configs/CheckPermisstion'
interface MaintenanceDetailsProps {
  turfData?: any
}
const schema = yup.object().shape({
  status: yup.string().required('Status is required'),
  reason: yup.string().when('status', {
    is: 'rejected',
    then: yup.string().required('Reason is required'),
    otherwise: yup.string().notRequired()
  })
})

function MaintenanceDetails({ turfData }: MaintenanceDetailsProps) {
  const router = useRouter()
  const [expenseData, setExpenseData] = useState<any>(null)
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)
  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    if (router.query.id) {
      fetchData()
    }
  }, [router.query.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(`v1/admin/getMaintenance?id=${router.query.id}`)
      setExpenseData(response.data.data)
    } catch (error) {
      console.error('Error fetching maintenance data:', error)

    }
    finally {
      setLoading(false)
    }
  }



  const handleUpdateStatus = async (status: string, reason?: string) => {
    try {
      const updatedStatus = status === 'accepted' ? 'acknowledged' : status; // Convert 'accepted' to 'acknowledged'

      const payload = {
        id: router.query.id,
        status: updatedStatus,
        reason: reason || null
      };

      await axiosInstance.post('/v1/admin/updateMaintenance', payload);

      // Immediately update the state to reflect the new status in UI
      setExpenseData(prevData => ({
        ...prevData,
        status: updatedStatus
      }));

      toast.success(`Maintenance request ${updatedStatus}!`);
      setOpenRejectDialog(false);
      setRejectReason('');
    } catch (error) {
      toast.error('Failed to update status');
      console.error('API Error:', error);
    }
  };


  useEffect(() => {
    if (router.query.id) {
      fetchData()
    }
  }, [router.query.id])


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }




  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon />
      case 'pdf':
        return <img src='/images/icons/file-icons/pdf.png' width='24' height='24' alt="PDF" />
      case 'xls':
        return <img src='/images/icons/file-icons/xls.png' width='24' height='24' alt="XLS" />
      default:
        return <InsertDriveFileIcon />
    }
  }



  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ fontSize: '25px', fontWeight: 'bold', mb: 3 }}>
        Maintenance Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 7, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                Basic Details
              </Typography>

              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'inline-block',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  minWidth: 80,
                  textAlign: 'center',

                  backgroundColor:
                    expenseData?.status === 'open' ? '#FFF3E0' :
                      expenseData?.status === 'acknowledged' ? '#C8E6C9' :
                        expenseData?.status === 'accepted' ? '#C8E6C9' :
                          expenseData?.status === 'rejected' ? '#FFEBEE' :
                            expenseData?.status === 'closed' ? '#F5F5F5' :
                              'transparent',

                  color:
                    expenseData?.status === 'open' ? '#E65100' :
                      expenseData?.status === 'acknowledged' ? '#388E3C' :
                        expenseData?.status === 'accepted' ? '#388E3C' :
                          expenseData?.status === 'rejected' ? '#D32F2F' :
                           expenseData?.status === 'closed' ? '#9E9E9E' :
                            'inherit',
                            
                }}
              >
                {expenseData?.status === 'acknowledged' ? 'Accepted' : expenseData?.status}
              </Typography>
            </Box>



            <Grid container spacing={5} alignItems="center">
              <Grid item xs={4} md={2}>
                <Typography variant="subtitle2">Villa Name:</Typography>
              </Grid>
              <Grid item xs={8} md={10}>
                <Typography>{expenseData?.villas?.name || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={4} md={2}>
                <Typography variant="subtitle2">Maintenance Name:</Typography>
              </Grid>
              <Grid item xs={8} md={10}>
                <Typography>{expenseData?.maintenance_name || 'N/A'}</Typography>
              </Grid>

              <Grid item xs={4} md={2}>
                <Typography variant="subtitle2">Category:</Typography>
              </Grid>
              <Grid item xs={8} md={10} >
                <Typography>{expenseData?.category?.category_name || 'N/A'}</Typography>
              </Grid>



              <Grid item xs={4} md={2}>
                <Typography variant="subtitle2">Priority:</Typography>
              </Grid>
              <Grid item xs={8} md={10}>

                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor:
                      expenseData?.priority === 'High' ? '#FFEBEE' : // Light red for high
                        expenseData?.priority === 'Medium' ? '#FFF3E0' : // Light orange for medium
                          expenseData?.priority === 'Low' ? '#E8F5E9' : 'transparent', // Light green for low
                    color:
                      expenseData?.priority === 'High' ? '#D32F2F' : // Red text for high
                        expenseData?.priority === 'Medium' ? '#FF9800' : // Orange text for medium
                          expenseData?.priority === 'Low' ? '#388E3C' : 'inherit', // Green text for low
                    fontWeight: 'bold'
                  }}
                >
                  {expenseData?.priority || 'N/A'}
                </Box>
              </Grid>

              <Grid item xs={4} md={2}>
                <Typography variant="subtitle2">Added At:</Typography>
              </Grid>
              <Grid item xs={8} md={10}>
                <Typography>
                  {dayjs(expenseData?.created_at).format('DD-MM-YYYY hh:mm A') || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={4} md={2}>
                <Typography variant="subtitle2">Added By:</Typography>
              </Grid>
              <Grid item xs={8} md={10}>
                <Typography>{expenseData?.users?.name || 'N/A'}</Typography>
              </Grid>

              {expenseData?.status === 'rejected' && expenseData?.reason && (
                <>
                  <Divider sx={{ mt: 8, mb: 9 }} />

                  <Grid item xs={4} md={2}>
                    {/* <Typography variant="subtitle2">Reason of Rejected:</Typography> */}
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Reason of Rejected
                    </Typography>
                  </Grid>
                  
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{expenseData?.reason || 'N/A'}</Typography>
                  
                </>
              )}


            </Grid>

            <Divider sx={{ mt: 8, mb: 9 }} />

            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Notes/Description
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {expenseData?.description || 'N/A'}
            </Typography>

          </Paper>
        </Grid>

        {/* Right Side Panel */}
        <Grid item xs={12} md={4}>

          {/* Check if the user is an admin before showing buttons */}
          { checkPermission('update-maintenance-status') && (
            <>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                  {/* Accept Button - Show only when status is NOT 'accepted' or 'closed' */}
                  {expenseData?.status !== 'accepted' && expenseData?.status !== 'closed' &&   (
                    <Button variant="contained" color="success" onClick={() => handleUpdateStatus('accepted')}>
                      Accept
                    </Button>
                  )}

                  {/* Reject Button - Always visible unless status is 'closed' */}
                  {expenseData?.status !== 'closed' && (
                    <Button variant="contained" color="error" onClick={() => setOpenRejectDialog(true)}>
                      Reject
                    </Button>
                  )}

                  {/* Close Button - Show only when status is 'acknowledged' */}
                  {expenseData?.status === 'acknowledged' && (
                    <Button variant="contained" color="primary" onClick={() => handleUpdateStatus('closed')}>
                      Close
                    </Button>
                  )}
                </Box>
              </Paper>
            </>
          )}
          {/* Attachments */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>
              Attachments
            </Typography>
            <List>
              {expenseData?.attachment?.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    mb: 1,
                    maxWidth: 350,
                    overflow: 'hidden'
                  }}
                >
                  <ListItemIcon>{getFileIcon(item.attachment)}</ListItemIcon>

                  <ListItemText
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      wordBreak: 'break-word', // Ensures long words wrap correctly
                      display: 'block', // Ensures it behaves as a block element
                      cursor: 'pointer', // Makes it clickable
                      color: 'blue', // Optional: Styles it as a link
                      textDecoration: 'none' // Optional: Removes underline
                    }}
                    primary={item.attachment.split('/').pop()} // Extracts only the file name
                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_BASE_URL}${item.attachment}`, '_blank')}
                  />


                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}
        maxWidth="md" fullWidth>
        <DialogTitle>Reason for Rejection</DialogTitle>
        <DialogContent>
           <TextField
            fullWidth
            multiline
            rows={3}
            label="" // Remove label if you want only the placeholder
            placeholder="Enter reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                border: "1px solid rgba(230, 234, 239, 0.5)",
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#A0A0A0", // Adjust color if needed
                opacity: 1, // Ensure visibility
              },
            }}
          />



          {/* <RHFInput
            control={control}
            name=""
            label="Reason"
            multiline
            rows={4}
            placeholder="Enter reason"
            fullWidth
            mandatory
           
          /> */}


        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleUpdateStatus('rejected', rejectReason)}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MaintenanceDetails


