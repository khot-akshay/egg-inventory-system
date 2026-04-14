// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import NotAuthorized from 'src/pages/401'
import Cookies from 'js-cookie'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'
import { useSelector } from 'react-redux'
import { RootState } from 'src/store'
import { allNavItems } from 'src/navigation/vertical'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()
  const { authPermissionMenus } = useSelector((state: RootState) => state.permissions)
  useEffect(
    () => {
      if (!router.isReady) {
        return
      }

      if (auth.user === null && !window.localStorage.getItem('userData')) {
        Cookies.remove('accessToken');
        if (router.asPath !== '/') {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        } else {
          router.replace('/login')
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.route]
  )

  if (auth.loading) {
    return fallback
  }
  // Build a flat list of permitted paths (including nested menu items)
  const flattenPaths = (items: any[] | undefined): string[] => {
    if (!items || !Array.isArray(items)) return []
    const paths: string[] = []
    for (const item of items) {
      if (item?.path) paths.push(item.path as string)
      if (item?.children) paths.push(...flattenPaths(item.children))
    }
    return paths
  }

  const allowedPaths = flattenPaths(authPermissionMenus)
  const allMenuPaths = flattenPaths(allNavItems as any)
  const currentAsPath = (router.asPath || '/').split('?')[0]

  // Allow always-accessible routes
  const publicAllowed = ['/', '/login', '/forgot-password']
  const isPublic = publicAllowed.includes(currentAsPath)

  // Exact or segment-prefixed path match helper
  const matchesAllowed = (p: string) =>
    currentAsPath === p || currentAsPath.startsWith(p.endsWith('/') ? p : p + '/')

  // Super admin bypass
  const isSuperAdmin = Boolean((auth as any)?.user?.is_super_admin)
  const isAuthenticated = Boolean(auth.user)

  // Do not block rendering while menus/permissions are computing in navigation
  // Allow by default until we have explicit allowed paths
  const permissionsReady = allowedPaths.length > 0

  // While redirecting unauthenticated users from protected routes, keep showing fallback
  if (!isPublic && !isAuthenticated) {
    return fallback
  }

  // Only enforce permission if route is a menu route; allow other authenticated routes (e.g., profile)
  const isMenuRoute = allMenuPaths.some(matchesAllowed)
  const hasAccess =
    isPublic ||
    isSuperAdmin ||
    (isAuthenticated && (!isMenuRoute || !permissionsReady || allowedPaths.some(matchesAllowed)))

  if (!hasAccess) {
    return <NotAuthorized />
  }
  return <>{children}</>
}

export default AuthGuard