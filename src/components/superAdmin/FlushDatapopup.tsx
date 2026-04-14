// ** React Imports
import { useState } from 'react'


// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import SubmitButton from '../common/button/Button'

import toast from 'react-hot-toast'
// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axiosInstance from 'src/services/axios'

export default function FlushDataPopup({ show, handleclose }) {
    const [loading, setLoading] = useState(false)
    const handleDelete = async () => {
        setLoading(true)
        axiosInstance.delete(`/admin/v1/seedData/trashData`)
            .then(res => {
                handleclose()
                window.location.reload()
            }).catch((error) => {
                toast.error(error.response.data.message, {
                    position: 'top-center'
                })
            }).finally(() => {
                setLoading(false)
            })
    }
    return (
        <>
            <Dialog fullWidth open={show} onClose={handleclose} sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 512 } }}>
                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <Box sx={{ mb: 9, maxWidth: '85%', textAlign: 'center', '& svg': { mb: 12.25, color: 'warning.main' } }}>
                            <Icon icon='bx:error-circle' fontSize='5.5rem' />
                            <Typography variant='h4' sx={{ color: 'text.secondary' }}>
                                Are you sure?
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '1.125rem' }}>Please note, this action will delete all your data permanently.</Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>

                    <SubmitButton onSubmit={handleDelete} isLoading={loading} label={'Delete'} isWidth={false} />
                    <Button variant='outlined' color='secondary' onClick={handleclose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
