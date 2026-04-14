

// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'

import ProfileUpdatePopup from './ProfileEditPopup'
// ** Third Party Imports
import axios from 'axios'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { ProfileHeaderType } from 'src/@fake-db/types'
import MobileUpdatePopup from './MobileEdit'
import EmailUpdatePopup from './updateEmail'
import ProfileEditDialog from './ProfileEditDialog'
import SubmitButton from '../common/button/Button'
import { is } from 'date-fns/locale'

const ProfilePicture = styled('img')(({ theme }) => ({
    width: 120,
    height: 120,
    borderRadius: theme.shape.borderRadius,
    border: `5px solid ${theme.palette.common.white}`,
    [theme.breakpoints.down('md')]: {
        marginBottom: theme.spacing(4)
    }
}))

const ProfileView = ({ userData, fetchData }) => {
    // ** State
    const [data, setData] = useState<ProfileHeaderType | null>(null)
    const [openEdit, setOpenEdit] = useState(false)
    const [openModal, setOpenModal] = useState('')
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false)


    const handleEditProfile = () => {
        setOpenEdit(true)
    }

    useEffect(() => {
        axios.get('/pages/profile-header').then(response => {
            setData(response.data)
        })

    }, [])


    const designationIcon = data?.designationIcon || 'bx:briefcase'

    return data !== null ? (
        <>

            <Card>
                <CardMedia
                    component='img'
                    alt='profile-header'
                    image={data.coverImg}
                    sx={{
                        height: { xs: 150, md: 250 }
                    }}
                />
                <CardContent
                    sx={{
                        pt: 0,
                        mt: -8,
                        display: 'flex',
                        alignItems: 'flex-end',
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                        justifyContent: { xs: 'center', md: 'flex-start' }
                    }}
                >
                    <Avatar
                        alt=''
                        src=''
                        // onClick={handleDropdownOpen}
                        sx={{ width: 90, height: 90 }}
                    />
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            ml: { xs: 0, md: 6 },
                            alignItems: 'flex-end',
                            flexWrap: ['wrap', 'nowrap'],
                            justifyContent: ['center', 'space-between']
                        }}
                    >
                        <Box sx={{ mb: [6, 0], display: 'flex', flexDirection: 'column', alignItems: ['center', 'flex-start'] }}>
                            <Typography variant='h5' sx={{ mb: 4, fontSize: '1.375rem' }} textTransform='capitalize'>
                                {userData?.name}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: ['center', 'flex-start']
                                }}
                            >
                            </Box>
                        </Box>

                    </Box>
                </CardContent>
            </Card>
            <Grid sx={{ marginTop: '20px' }} container spacing={6}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ mb: 7 }}>
                                <Typography variant='body2' sx={{ mb: 4, color: 'text.disabled', textTransform: 'uppercase' }}>
                                    About
                                </Typography>

                                {/* Name */}
                                <Box display='flex' justifyContent='space-between' flexWrap='wrap' alignItems='center' mb={2}>
                                    <Typography sx={{ flex: 1, minWidth: '200px' }}>
                                        Name: <span style={{ textTransform: 'capitalize' }}>{userData?.name}</span>
                                    </Typography>
                                    {/* <Button onClick={() => setOpenModal('name')}>
                                        <Icon icon='circum:edit' fontSize={24} />
                                    </Button> */}


                                </Box>

                                {/* Email */}
                                <Box display='flex' justifyContent='space-between' flexWrap='wrap' alignItems='center' mb={2}>
                                    <Typography sx={{ flex: 1, minWidth: '200px' }}>
                                        Email ID: {userData?.email}
                                    </Typography>
                                    {/* <Button onClick={() => setOpenModal('email')}>
                                        <Icon icon='circum:edit' fontSize={24} />
                                    </Button> */}


                                </Box>

                                {/* Mobile */}
                                <Box display='flex' justifyContent='space-between' flexWrap='wrap' alignItems='center'>
                                    <Typography sx={{ flex: 1, minWidth: '200px' }}>
                                        Mobile No: +{userData?.country_code}{userData?.mobile_number}
                                    </Typography>
                                    {/* <Button onClick={() => setOpenModal('phone')}>
                                        <Icon icon='circum:edit' fontSize={24} />
                                    </Button> */}


                                </Box>

                                {/* <Button onClick={() => setOpenEditDialog(true)} variant="outlined" size="small">
                                    <Icon icon='circum:edit' fontSize={20} />
                                    <Typography sx={{ ml: 1 }}>Update Profile</Typography>
                                </Button> */}
                                {/* <Box sx={{ mt: 4, display: 'flex', justifyContent: 'start' }}>
                                    <SubmitButton
                                        label="Update Profile"
                                        isLoading={isLoading}
                                        onSubmit={() => setOpenEditDialog(true)}
                                        isWidth={false}
                                    />
                                </Box> */}


                            </Box>


                        </CardContent>
                    </Card>
                </Grid>
                <ProfileEditDialog

                    open={openEditDialog}
                    handleClose={() => setOpenEditDialog(false)}
                    userData={userData}
                    fetchData={fetchData}
                />


                {/* {openModal == 'name' ? <ProfileUpdatePopup fetchData={fetchData} userData={userData} show={openModal == 'name'} handleclose={() => setOpenModal('')} /> : null}
                {openModal == 'email' ? <EmailUpdatePopup fetchData={fetchData} userData={userData} show={openModal == 'email'} handleclose={() => setOpenModal('')} /> : null}
                {openModal == 'phone' ? <MobileUpdatePopup fetchData={fetchData} userData={userData} show={openModal == 'phone'} handleclose={() => setOpenModal('')} /> : null} */}
            </Grid>
        </>
    ) : null
}

export default ProfileView

