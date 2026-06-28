// ** React Imports
import { useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Hook Imports
import { useAuth } from 'src/hooks/useAuth'
import themeConfig from 'src/configs/themeConfig'

/**
 *  Set Home URL based on User Roles
 */
export const getHomeRoute = (user: any) => {
// if (role === 'CareTaker') return '/care_taker'
  // else if(role === 'Manager') return '/turf_management'
  // else
  // const permissionArray = user?.permission?.filter((permission: any) => permission?.parent_id == null)
  // const permissionNames = permissionArray.map((perm: any) => perm.permission_name);
    return '/dashboards'

  // if (+user.is_super_admin == 1) {

  //   return '/dashboards'
  // } else {
  //   if (permissionNames.includes('dashboard')) return '/dashboards'
  //   if (permissionNames.includes('metadata')) return '/metadata/amenity_type'
  //   if (permissionNames.includes(themeConfig.projectFor)) return `/${themeConfig.projectFor}_management/${themeConfig.projectFor}`
  //   if (permissionNames.includes('bookings')) return '/bookings'
  //   if (permissionNames.includes('customer_enquiries')) return '/cutomer_inquiries'
  //   if (permissionNames.includes('venue-calender-management')) return '/calender'
  //   if (permissionNames.includes('promocode')) return '/offers/promocode'
  //   if (permissionNames.includes('user-management')) return '/userManagement'
  //   return '/calender'
  // }
}

const Home = () => {
  // ** Hooks
  const auth = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (auth.user) {
      const homeRoute = getHomeRoute(auth.user)
// Redirect user to Home URL
      router.replace(homeRoute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Spinner sx={{ height: '100%' }} />
}

export default Home
