import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import dayjs from 'dayjs'
import CloseIcon from '@mui/icons-material/Close'
import Button from '@mui/material/Button'
import { Link } from '@mui/material'

export default function PropertListingViewPopup({ show, handleclose, setSelectedItem }) {
    return (
        <Dialog open={show} onClose={handleclose} maxWidth='sm' fullWidth>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Grid container justifyContent='space-between' alignItems='center'>
                    <Typography variant='h6'>Property Listing</Typography>
                    <IconButton onClick={handleclose}>
                        <CloseIcon />
                    </IconButton>
                </Grid>
                <DialogContent>
                    <Grid container spacing={4} sx={{ mt: 1 }}>
                        {/* Name */}
                        <Grid item xs={6}><Typography variant='subtitle2'> Name:</Typography></Grid>
                        <Grid item xs={6}><Typography>{setSelectedItem?.full_name || 'N/A'}</Typography></Grid>
                        {/* Email ID */}
                        <Grid item xs={6}><Typography variant='subtitle2'>Email ID:</Typography></Grid>
                        <Grid item xs={6}><Typography>{setSelectedItem?.email || 'N/A'}</Typography></Grid>
                        {/* Mobile No */}
                        <Grid item xs={6}><Typography variant='subtitle2'>Mobile Number:</Typography></Grid>
                        <Grid item xs={6}><Typography>{setSelectedItem?.mobile_no || 'N/A'}</Typography></Grid>
                        {/* Location: */}
                        <Grid item xs={6}><Typography variant='subtitle2'>Location:</Typography></Grid>
                        <Grid item xs={6}><Typography>{setSelectedItem?.cities?.name || 'N/A'}</Typography></Grid>

                        {/* Photos/Website Link */}

                        {/* <Grid item xs={6}><Typography variant='subtitle2'>Photos/Website Link:</Typography></Grid>
                        <Grid item xs={6}><Typography>{setSelectedItem?.link || 'N/A'}</Typography></Grid> */}
                        <Grid item xs={6}>
                            <Typography variant="subtitle2">Photos/Website Link:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            {setSelectedItem?.link ? (
                                <Link href={setSelectedItem.link} target="_blank" rel="noopener noreferrer" sx={{ color: '#1976d2' }}>
                                    {setSelectedItem.link}
                                </Link>
                            ) : (
                                <Typography>N/A</Typography>
                            )}
                        </Grid>
                        {/* Created At On */}
                        <Grid item xs={6}><Typography variant='subtitle2'>Date:</Typography></Grid>
                        <Grid item xs={6}><Typography>
                            {dayjs(setSelectedItem?.created_at).format('DD/MM/YYYY, hh:mm A ') || 'N/A'}</Typography></Grid>
                        {/* Message */}
                        <Grid item xs={6}><Typography variant='subtitle2'>Message:</Typography></Grid>
                        <Grid item xs={6}><Typography sx={{ whiteSpace: 'pre-wrap' }}>{setSelectedItem?.description || 'N/A'}</Typography></Grid>
                    </Grid>
                    <Grid container justifyContent='center' sx={{ mt: 3 }}>
                        <Button onClick={handleclose} variant='contained'>Close</Button>
                    </Grid>
                </DialogContent>
            </Paper>
        </Dialog>
    )
}





