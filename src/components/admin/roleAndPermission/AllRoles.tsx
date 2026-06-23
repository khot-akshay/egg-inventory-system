import { Avatar, AvatarGroup, Box, Button, Card, CardContent, Divider, Grid, Link, Stack, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import UpdateRolePopupDialog from './UpdateRole'
import { useTheme } from '@mui/material/styles'
import AddRolePopupDialog from './AddRole'
import { useAuth } from 'src/hooks/useAuth'

import AddIcon from '@mui/icons-material/Add'
import axiosInstance from 'src/services/axios'
import Icon from 'src/@core/components/icon';


export default function AllRoles({ isUserUpdates }: any) {
    const theme = useTheme()
    const auth = useAuth()
    const [allRole, setAllRole] = useState([])
    const [loading, setLoading] = useState(false)
    const [openDeleteRole, setOpenDeleteRole] = useState(false)
    const [openEditRole, setOpenEditRole] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [openAddRole, setAddRole] = useState(false)
    const getAllRoles = async () => {
        setLoading(true)
        try {

            const response = await axiosInstance.get(`api/v1/getAllRoles`)
            setAllRole(response.data.data.roles)
        } catch (e) {
            } finally { 
            setLoading(false)
        }
    }
    useEffect(() => {
        getAllRoles()
    }, [isUserUpdates])



    const colors = ['#FF5733', '#2d953f', '#1733b4', '#FF33A8', '#12a29b'];

    return (
        <Box>
            <Typography sx={{ color: 'primary.main', fontSize: 20, fontWeight: 700 }}>Roles & Permissions</Typography>

            <Typography fontSize={16} fontWeight={500} marginTop={4}>
                A role provides access to predefined menus and features, allowing an administrator to grant users access to what they need based on their assigned role.
            </Typography>
            <Grid container spacing={2} marginTop={4}>
                {!!allRole?.length && (
                    allRole?.map((item) => (

                        <Grid item xs={12} md={3}>

                            <Card sx={{ p: 6, maxHeight: 130 }}>

                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {/* {`Total ${item?.users_count ?? item?.admin_users_count ?? 0} users`} */}
                                        {`Total ${item?.users_count ?? item?.admin_users_count ?? 0
                                            } ${item?.admin_users_count > 1 || item?.users_count > 1 ? 'users' : 'user'}`}
                                    </Typography>
                                    <AvatarGroup
                                        max={4}
                                        className='pull-up'
                                        sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.875rem' } }}
                                    >
                                        {item?.admin_users && item?.admin_users?.map((user, index: number) => (
                                            <Tooltip key={index} title={user.full_name}>
                                                <Avatar
                                                    key={index}
                                                    alt={user.full_name}
                                                    src={`${user?.profile_image}`}
                                                    sx={{ bgcolor: colors[index % colors.length], color: '#fff' }} />
                                            </Tooltip>
                                        ))}
                                        {item?.users && item?.users?.map((user, index: number) => (
                                            <Tooltip key={index} title={user.full_name}>
                                                <Avatar
                                                    key={index}
                                                    alt={user.full_name}
                                                    src={`${user?.profile_image}`}
                                                    sx={{ bgcolor: colors[index % colors.length], color: '#fff' }} />
                                            </Tooltip>
                                        ))}
                                    </AvatarGroup>
                                </Box>
                                {/* <Box>
                                    <Typography variant='h5'>{item.name}</Typography>
                                    <Stack direction={'row'} spacing={3}>
                                        <Typography variant='subtitle1' color='primary.main' onClick={() => {
                                            setSelectedItem(item);
                                            setOpenEditRole(true)
                                        }}>Edit</Typography>
                                        <Typography variant='subtitle1' color='primary.main' onClick={() => {
                                            setSelectedItem(item);
                                            setOpenDeleteRole(true)
                                        }}>Delete</Typography>
                                    </Stack>
                                </Box> */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                                        <Typography variant='h5' sx={{ mb: 1 }}>
                                            {item.name}
                                        </Typography>
                                        <Box display={'flex'} gap={3}>
                                            {/* {checkPermission('update-role') && ( */}

                                                <Typography
                                                    variant='body2'
                                                    sx={{ color: 'primary.main', textDecoration: 'none', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setOpenEditRole(true)
                                                    }}
                                                >
                                                    Edit
                                                </Typography>
                                            {/* )} */}
                                            {(item?.admin_users_count === 0 || item?.users_count === 0) && (
                                                <>
                                                    <Divider orientation='vertical' flexItem />

                                                    <Typography variant='body2'
                                                        sx={{ color: 'primary.main', textDecoration: 'none', cursor: 'pointer' }} onClick={() => {
                                                            setSelectedItem(item);
                                                            setOpenDeleteRole(true)
                                                        }}>Delete</Typography>
                                                </>
                                            )}
                                        </Box>

                                    </Box>
                                    {/* <IconButton sx={{ color: 'text.primary' }}>
                <Icon fontSize={20} icon='bx:copy' />
              </IconButton> */}
                                </Box>
                            </Card>
                        </Grid>
                    ))
                )}

                {/* {checkPermission('add-role') && ( */}

                    <Grid item xs={12} md={4}>
                        <Card
                        // sx={{ cursor: 'pointer' }}
                        // onClick={() => {
                        //     setAddRole(true)
                        // }}
                        >

                            {/* <Grid container
                                // sx={{ height: '100%' }}
                                spacing={2} alignItems={'center'} padding={2}>
                                <Grid item xs={6} md={4}>
                                    <img
                                        width={88}
                                        height={105}
                                        alt='add-role'
                                        src={`/images/pages/add-role-illustration-${theme.palette.mode}.png`}
                                    />
                                </Grid>
                                <Grid item xs={6} md={8}>
                                    <CardContent>
                                         <Box sx={{ textAlign: 'right' }}> 
                                        <Tooltip title="Add a new Role.">
                                            <Button
                                                variant="contained"
                                                style={{ backgroundColor: '#3e66f3', color: '#fff' }}
                                                startIcon={<AddIcon />}
                                                //   sx={{ mb: 3, whiteSpace: 'nowrap' }}
                                                // onClick={() => {
                                                //     //   handleClickOpen()
                                                //     //   setDialogTitle('Add')
                                                // }}
                                                onClick={() => {
                                                    setAddRole(true)
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </Tooltip>
                                        <Typography>Add role, if it doesn't exist.</Typography>
                                         </Box> 
                                    </CardContent>
                                </Grid>
                            </Grid> */}
                        </Card>
                    </Grid>
                {/* )} */}
            </Grid>
            {/* {openDeleteRole && (
                <DeletePopupDialog openDelete={openDeleteRole} fetchData={getAllRoles} selectedId={selectedItem.id} url={`v1/${auth?.user?.role}/deleteRole`} label={'Are you sure! You want to delete?'} onClose={() => setOpenDeleteRole(false)} />
            )} */}
            {openEditRole && (
                <UpdateRolePopupDialog openDelete={openEditRole} fetchData={getAllRoles} selectedItem={selectedItem} onClose={() => setOpenEditRole(false)} />
            )}
            {openAddRole && (
                <AddRolePopupDialog openDelete={openAddRole} fetchData={getAllRoles} onClose={
                    () => setAddRole(false)
                } />
            )}
        </Box>
    )
}
