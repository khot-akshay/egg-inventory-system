// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'


import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axiosInstance from "../../services/axios";
import { error } from 'node:console'

export default function PropertyListingDeletePopup({ show, handleclose, selctedMsgDelete }) {
    //..................API call to delete Promocode.................//

    const handleDelete = async () => {
        const id = selctedMsgDelete

        axiosInstance.delete(`/v1/admin/deleteListingProperty?id=${id}`)
        // axiosInstance.delete('/v1/admin/deleteListingProperty', {
        //     data: { id }
        //   })
          


            .then(res => {
                handleclose()
                toast.success('Property Listing Deleted Successfully.', {
                    position: 'top-right'
                })
            }).catch((error) => {
                handleclose()
                toast.error('Property Listing Could Not Deleted.', {
                    position: 'top-right'
                })
                console.log(error.response.data.message, 'error aaaa') 
            });
    }
    // console.log(error ,'qqqqqqq');
    return (
        <>
            {/* <Dialog fullWidth open={show} onClose={handleclose} sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}>
                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <Box sx={{ mb: 9, maxWidth: '85%', textAlign: 'center', '& svg': { mb: 12.25, color: 'warning.main' } }}>
                            <Icon icon='bx:error-circle' fontSize='5.5rem' />
                            <Typography variant='h4' sx={{ color: 'text.secondary' }}>
                                Are you sure?
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '1.125rem' }}>You won't be able to see this Promocode!</Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Button variant='contained' sx={{ mr: 1.5 }} onClick={handleDelete}>
                        Yes, Delete Promocode!
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={handleclose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog> */}
            <Dialog
                fullWidth
                open={show}
                onClose={handleclose}
                sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}
            >
                <DialogContent sx={{ pb: 4, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <Box
                            sx={{
                                mb: 6,
                                maxWidth: '85%',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center', // Ensures everything is centered
                                '& svg': { mb: 3, color: 'warning.main', fontSize: '5.5rem', display: 'block', margin: '0 auto' }
                            }}
                        >
                            <Icon icon='bx:error-circle' fontSize='5.5rem' />
                            <Typography variant='h4' sx={{ color: 'text.secondary' }}>
                                Are you sure?
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '1.125rem', mt: 2 }}>
                            You won't be able to see this Property Listing!
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button variant='contained' onClick={handleDelete}>
                        Yes, Delete Property Listing!
                    </Button>
                    <Button variant='outlined' color='secondary' onClick={handleclose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>


        </>
    )
}
