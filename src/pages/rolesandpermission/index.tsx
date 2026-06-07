import { Backdrop, Box, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import AllRoles from 'src/components/admin/roleAndPermission/AllRoles'
import UserList from 'src/components/admin/roleAndPermission/UserList'
import User from 'src/components/admin/user/User'

import { useAuth } from 'src/hooks/useAuth'

export default function RoleAndPermission() {
  // const { currentPackage, isSubscriptionActive, isLoading: fetchingPackage } = useSubscriptionCheck()
  const [isUserUpdates, setIsUserUpdated] = useState(true)
  const auth = useAuth()
  // if (fetchingPackage) return (
  //   <Backdrop
  //     sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
  //     open={fetchingPackage}
  //   >
  //     <CircularProgress color="inherit" />
  //   </Backdrop>
  // )
  // if (!isSubscriptionActive() && auth?.user?.role !== 'admin') {
  //   return (
  //     <NoSubscription subscriptionPath={'/organization/credits/buy/'} />
  //   )
  // }
  return (
    <Box >
      {/* <Metadata title='Roles & Permissions - MyIQChecker' description='' /> */}
      <AllRoles isUserUpdates={isUserUpdates} />
       {/* <User /> */}
      {/* <UserList setIsUserUpdated={setIsUserUpdated} isUserUpdates={isUserUpdates} /> */}
    </Box>
  )
}
