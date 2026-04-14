// ** React Imports
import { useState } from 'react'


// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import toast from 'react-hot-toast'
// ** Icon Imports
import Icon from 'src/@core/components/icon'
import axiosInstance from 'src/services/axios'
import SubmitButton from '../button/Button'
import { Divider, IconButton } from '@mui/material'

export default function DeleteDialogPopup({ show, handleclose, selectedItems, fetchData, label, apiUrl }) {
    const [loading, setLoading] = useState(false)
    const handleDelete = async () => {
        setLoading(true)
        const id = selectedItems

        const response = axiosInstance.delete(`/${apiUrl}${id}`)
            .then(res => {
                handleclose()
                setLoading(false)
                toast.success(res?.data?.message ?? 'Data deleted successfully.')
                fetchData()
            }).catch((error) => {
                toast.error(error.response?.data.message)
                setLoading(false)
            });
    }
    return (
        <>
            <Dialog
                fullWidth
                open={show}
                onClose={handleclose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{ borderRadius: '20px', padding: '20px' }}

            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    flexWrap: 'nowrap',


                }}>
                    <Typography variant='h6' sx={{ fontWeight: 700, ml: '10px' }}>Confirmation </Typography>
                    <IconButton aria-label="delete" size="medium" onClick={handleclose} sx={{ marginRight: '10px' }}>
                        <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
                    </IconButton>
                </Box>
                <Divider />
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <ReportProblemIcon sx={{ fontSize: '30px', mt: '20px' }} />
                        <Typography style={{ fontSize: '15px', fontFamily: 'sans-serif', marginTop: '10px', marginLeft: '13px' }}>
                            <span style={{ fontWeight: 'bold' }}>Are you sure that you want to delete permanently? </span> <br />
                            <span>  If you delete this data, it will be permanently removed from the system.
                            </span>
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{ display: "flex", justifyContent: "end" }}
                >     <Button
                    variant='outlined'
                    // color='secondary'
                    onClick={handleclose}
                    color='error'

                >
                        Cancel
                    </Button>
                    <SubmitButton
                        onSubmit={() => handleDelete()}
                        isLoading={loading}
                        label={'Confirm'}
                        isWidth={false}
                        color='primary'
                    />

                </DialogActions>
            </Dialog>
        </>
    )
}



// import { Dialog, Box, Typography, IconButton, DialogContent, DialogActions, Button, Divider } from "@mui/material";
// import CloseIcon from '@mui/icons-material/Close';
// import { useState } from "react";
// import ReportProblemIcon from '@mui/icons-material/ReportProblem';
// import HighlightOffIcon from '@mui/icons-material/HighlightOff';

// interface Confirmation {
//   onSubmit: () => void;
//   onClose: () => void;
//   open: boolean;
// }
// const DeleteConfirmationModal: React.FC<Confirmation> = ({
//   onSubmit,
//   onClose,
//   open
// }) => {


//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//   aria-labelledby="alert-dialog-title"
//   aria-describedby="alert-dialog-description"
//   sx={{ borderRadius: '20px', padding: '20px' }}
//   fullWidth
//     >
//   <Box sx={{
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     flexDirection: 'row',
//     flexWrap: 'nowrap',

//   }}>
//     <Typography variant='h6' sx={{ fontWeight: 700, }}>Confirmation </Typography>
//     <IconButton aria-label="delete" size="medium" onClick={onClose}>
//       <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize="large" />
//     </IconButton>
//   </Box>
//   <Divider />
//   <DialogContent>
//     <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//       <ReportProblemIcon sx={{ fontSize: '30px', mt: '20px' }} />
//       <Typography style={{ fontSize: '15px', fontFamily: 'sans-serif', marginTop: '10px', marginLeft: '13px' }}>
//         <span style={{ fontWeight: 'bold' }}>Are you sure that you want to delete permanently? </span> <br />
//         <span>  If you delete this data, it will be permanently removed from the system.
//         </span>
//       </Typography>
//     </Box>
//   </DialogContent>
//       <DialogActions sx={{ display: "flex", justifyContent: "end" }}>
//         <Button variant='outlined' sx={{ color: 'white', textTransform: 'none !important', textAlign: "center", background: '#E34747', '&:hover': { backgroundColor: '#E34747' } }} onClick={onClose}> Cancel</Button>
//         <Button variant='contained' sx={{ textTransform: 'none !important', textAlign: "center", }} onClick={onSubmit} autoFocus>
//           Confirm
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )

// }
// export default DeleteConfirmationModal;

