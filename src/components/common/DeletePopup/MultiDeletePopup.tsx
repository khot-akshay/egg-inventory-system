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
import axiosInstance from 'src/services/axios'
import SubmitButton from '../button/Button'

export default function MultiDeleteDialogPopup({ show, handleclose, selectedItems, fetchData, label, apiUrl }) {
    const [loading, setLoading] = useState(false)
    const handleDelete = async () => {
        setLoading(true)
        const id = selectedItems

        axiosInstance.delete(`/${apiUrl}`, {
            data: { images: id }
        })
            .then(res => {
                handleclose()
                setLoading(false)
                fetchData()
            }).catch((error) => {
                toast.error(error.response?.data.message, {
                    position: 'top-center'
                })
                setLoading(false)
            });
    }
    return (
        <>
            <Dialog
                fullWidth
                open={show}
                onClose={handleclose}
                sx={{
                    '& .MuiPaper-root': {
                        width: '100%',
                        maxWidth: 512
                    }
                }}
            >
                <DialogContent sx={{ pb: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            pt: 4
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 4,
                                maxWidth: '85%',
                                textAlign: 'center',
                                '& svg': {
                                    mb: 4,
                                    color: 'warning.main',
                                    fontSize: '5.5rem'
                                }
                            }}
                        >
                            <Icon icon='bx:error-circle' />
                            <Typography
                                variant='h4'
                                sx={{
                                    color: 'text.secondary',
                                    mt: 2
                                }}
                            >
                                Are you sure?
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontSize: '1.125rem',
                                textAlign: 'center'
                            }}
                        >
                            {label}
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        justifyContent: 'center',
                        pb: 6,
                        gap: 2
                    }}
                >
                    <SubmitButton
                        onSubmit={() => handleDelete()}
                        isLoading={loading}
                        label={'Yes, Remove'}
                        isWidth={false}
                    />
                    <Button
                        variant='outlined'
                        color='secondary'
                        onClick={handleclose}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
