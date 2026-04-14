import { Backdrop, Box, CircularProgress } from '@mui/material'
import React from 'react'
import AllRoles from 'src/components/userManagement/roles/AllRoles'
import { useAuth } from 'src/hooks/useAuth'
import UserList from 'src/components/userManagement/User/UserList'
export default function RoleAndPermission() {
  const auth = useAuth()

  return (
    <Box >
      <AllRoles />
      <UserList />
    </Box>
  )
}
