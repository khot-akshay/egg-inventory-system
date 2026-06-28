// ** Type Imports
// import { NavLink, NavGroup, LayoutProps, NavSectionTitle, VerticalNavItemsType } from 'src/@core/layouts/types'

// // ** Custom Menu Components
// import VerticalNavLink from './VerticalNavLink'
// import VerticalNavGroup from './VerticalNavGroup'
// import VerticalNavSectionTitle from './VerticalNavSectionTitle'
// import { useAuth } from 'src/hooks/useAuth'
// import { useDispatch } from 'react-redux'
// import { setAuthPermissionData } from 'src/store/apps/permissions'
// import { useEffect } from 'react'
// interface Props {
//   parent?: NavGroup
//   navHover?: boolean
//   navVisible?: boolean
//   groupActive: string[]
//   isSubToSub?: NavGroup
//   currentActiveGroup: string[]
//   navigationBorderWidth: number
//   settings: LayoutProps['settings']
//   saveSettings: LayoutProps['saveSettings']
//   setGroupActive: (value: string[]) => void
//   setCurrentActiveGroup: (item: string[]) => void
//   verticalNavItems?: LayoutProps['verticalLayoutProps']['navMenu']['navItems']
// }

// const resolveNavItemComponent = (item: NavGroup | NavLink | NavSectionTitle) => {
//   if ((item as NavSectionTitle).sectionTitle) return VerticalNavSectionTitle
//   if ((item as NavGroup).children) return VerticalNavGroup

//   return VerticalNavLink
// }

// const VerticalNavItems = (props: Props) => {
//   // ** Props
//   const { verticalNavItems } = props
//   const auth = useAuth()
//   const dispatch = useDispatch()


//   let displayMenu: VerticalNavItemsType = []
//   // // const handleMenus = () => {
//       displayMenu = verticalNavItems as any;

//   //   if (+auth.user.is_super_admin== 1) {

//   //     displayMenu = verticalNavItems as any;
//   //     // dispatch(setAuthPermissionData(displayMenu))

//   //   } else {

//   //     displayMenu = verticalNavItems?.filter((item) => {
//   //       if (item?.isPemissionNeeded == true) {
//   //         return auth.user?.permission?.some(permission => permission?.permission_name === item.permissionName);
//   //       } else {
//   //         return true
//   //       }
//   //     }) ?? [];

//   //   }
// let result = []
//   // }
//   // useEffect(() => {
//   //   handleMenus()
//   // }, [auth.user, verticalNavItems])
//   const RenderMenuItems = displayMenu?.map((item: NavGroup | NavLink | NavSectionTitle, index: number) => {
//     const TagName: any = resolveNavItemComponent(item)
//     result.push(item)
//       // dispatch(setAuthPermissionData(result))

//     return <TagName {...props} key={index} item={item} />
//   })

//   return <>{RenderMenuItems}</>
// }

// export default VerticalNavItems
















// ** Type Imports
import {
  NavLink,
  NavGroup,
  LayoutProps,
  NavSectionTitle,
  VerticalNavItemsType
} from 'src/@core/layouts/types'

// ** Custom Menu Components
import VerticalNavLink from './VerticalNavLink'
import VerticalNavGroup from './VerticalNavGroup'
import VerticalNavSectionTitle from './VerticalNavSectionTitle'

// ** Hooks & Redux
import { useAuth } from 'src/hooks/useAuth'
import { useDispatch } from 'react-redux'
import { setAuthPermissionData } from 'src/store/apps/permissions'

// ** React
import { useEffect, useMemo } from 'react'

// ** Config
import themeConfig from 'src/configs/themeConfig'

interface Props {
  parent?: NavGroup
  navHover?: boolean
  navVisible?: boolean
  groupActive: string[]
  isSubToSub?: NavGroup
  currentActiveGroup: string[]
  navigationBorderWidth: number
  settings: LayoutProps['settings']
  saveSettings: LayoutProps['saveSettings']
  setGroupActive: (value: string[]) => void
  setCurrentActiveGroup: (item: string[]) => void
  verticalNavItems?: LayoutProps['verticalLayoutProps']['navMenu']['navItems']
}

const resolveNavItemComponent = (item: NavGroup | NavLink | NavSectionTitle) => {
  if ((item as NavSectionTitle).sectionTitle) return VerticalNavSectionTitle
  if ((item as NavGroup).children) return VerticalNavGroup
  return VerticalNavLink
}

const VerticalNavItems = (props: Props) => {
  // ** Props
  const { verticalNavItems } = props
  const auth = useAuth()
  const dispatch = useDispatch()
// ✅ Helper: check if user has a specific permission
  const hasPermission = (permissionName?: string): boolean => {
    if (auth?.user?.is_super_admin) return true
    if (!permissionName) return true

    return auth?.user?.permission?.some(
      (perm: any) => perm.permission_name === permissionName
    )
  }

  // ✅ Recursive filtering (permissions + projectFor + hiding empty groups)
  const filterMenuItems = (items: VerticalNavItemsType): VerticalNavItemsType => {
    if (!items) return []

    return items
      .map(item => {
        // Recursively filter children first
        const filteredChildren = item.children
          ? filterMenuItems(item.children)
          : undefined

        // Check permission and project visibility
        const matchesProject =
          !item.projectFor ||
          item.projectFor.includes(themeConfig.projectFor)

        const matchesPermission =
          !item.isPemissionNeeded || hasPermission(item.permissionName)

        // Skip item if it doesn’t meet requirements or has no visible children
        if (!matchesProject || !matchesPermission) return null
        if (item.children && (!filteredChildren || filteredChildren.length === 0))
          return null

        return { ...item, children: filteredChildren }
      })
      .filter(Boolean) as VerticalNavItemsType
  }

  // ✅ Memoize filtered menu
  const displayMenu: VerticalNavItemsType = useMemo(() => {
    if (!verticalNavItems) return []
    return filterMenuItems(verticalNavItems as VerticalNavItemsType)
  }, [verticalNavItems, auth.user])

  // ✅ Dispatch filtered menu to Redux (avoids infinite loop)
  useEffect(() => {
    dispatch(setAuthPermissionData(displayMenu))
  }, [dispatch, JSON.stringify(displayMenu)]) // safe dependency

  // ✅ Render menu
  const RenderMenuItems = displayMenu.map(
    (item: NavGroup | NavLink | NavSectionTitle, index: number) => {
      const TagName: any = resolveNavItemComponent(item)
      return <TagName {...props} key={index} item={item} />
    }
  )

  return <>{RenderMenuItems}</>
}

export default VerticalNavItems
