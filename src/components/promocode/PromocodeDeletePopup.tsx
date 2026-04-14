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

export default function DeletePromocodeDialog({ show, handleclose, selctedPromocodeForDelete }) {
    //..................API call to delete Promocode.................//

    const handleDelete = async () => {
        const id = selctedPromocodeForDelete

        axiosInstance.delete(`/v1/admin/deletePromocodeById?id=${id}`)

            .then(res => {
                handleclose()
                toast.success('Promocode Deleted Successfully', {
                    position: 'top-center'
                })
            }).catch((error) => {
                handleclose()
                toast.success('Promocode Could Not Deleted ', {
                    position: 'top-center'
                })
                console.log(error.response.data.message)
            });
    }
    return (
        <>
            <Dialog fullWidth open={show} onClose={handleclose} sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}>
                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <Box sx={{ mb: 9, maxWidth: '85%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign: 'center', '& svg': { mb: 12.25, color: 'warning.main' } }}>
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
            </Dialog>
        </>
    )
}
