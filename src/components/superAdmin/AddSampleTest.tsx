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

export default function AddSampleDataPopup({ show, handleclose }) {
    const [loading, setLoading] = useState<boolean | false>(false)
    const handleAddData = async () => {
        setLoading(true)
        axiosInstance.delete(`/admin/v1/seedData/addSeedData`)
            .then(res => {
                handleclose()
                window.location.reload()

            }).catch((error) => {
                toast.error(error.response.data.message, {
                    position: 'top-center'
                })
            }).finally(()=>{
                setLoading(false)
            })
    }
    return (
        <>
            <Dialog fullWidth open={show} onClose={handleclose} maxWidth='lg' sx={{ '& .MuiPaper-root': { width: '100%', } }}>
                <DialogContent sx={{ pb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    {/* <Button variant='contained' sx={{ mr: 1.5 }} onClick={handleAddData}>
                        Submit
                    </Button> */}
                    <SubmitButton onSubmit={handleAddData} isLoading={loading} label={'Submit'} isWidth={false} />
                    <Button variant='outlined' color='secondary' onClick={handleclose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
