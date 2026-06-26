import React from 'react';
import { useRouter } from 'next/router';
import Icon from 'src/@core/components/icon';
import { useAuth } from 'src/hooks/useAuth';

const BottomNav = ({ menuItems = null }: { menuItems?: any }) => {
  const router = useRouter();
  const { user } = useAuth();

  const hasRole = (roleName: string) => {
    if (user?.is_super_admin) return true;
    const targetRole = roleName.toLowerCase();
    
    // Check direct role string
    if (user?.role?.toLowerCase() === targetRole || 
        (user?.role?.toLowerCase() === 'admin' && targetRole === 'administrator')) {
      return true;
    }

    // Check roles array
    if (user?.roles?.length) {
      return user.roles.some((role: any) => {
        const name = role.name?.toLowerCase();
        const slug = role.slug?.toLowerCase();
        return name === targetRole || slug === targetRole || (name === 'admin' && targetRole === 'administrator');
      });
    }

    return false;
  };

  const hasPermission = (permissionName?: string): boolean => {
    if (user?.is_super_admin) return true;
    if (!permissionName) return false;
    if (!user?.permissions?.length) return false;

    if (user.permissions.includes(permissionName)) return true;

    return user.permissions.some((perm: string) => typeof perm === 'string' && perm.startsWith(`${permissionName}.`));
  };

  // Custom defined menu items for the Bottom Navigation
  const defaultMenuItems = [
    {
      name: 'Dashboards',
      icon: 'bx:home-circle',
      href: '/dashboards',
      label: 'Dashboards',
      allowedRoles: ['Administrator', 'Staff']
    },
    {
      name: 'Quick Bill',
      icon: 'mdi:clipboard-text-outline',
      href: '/quickBill',
      label: 'Quick Bill',
      allowedRoles: ['Staff'],
      isPermissionNeeded: true,
      permissionName: 'quick_bill'
    },
    {
      name: 'Dist. Quick Bill',
      icon: 'mdi:clipboard-text-outline',
      href: '/distributorQuickBill',
      label: 'Quick Bill',
      allowedRoles: ['Distributor']
    },
    {
      name: 'Day Opening',
      icon: 'mdi:calendar-start',
      href: '/openingDay',
      label: 'Opening',
      allowedRoles: ['Staff']
    },
    {
      name: 'Day Closing',
      icon: 'mdi:calendar-end',
      href: '/dayclosing',
      label: 'Closing',
      allowedRoles: ['Staff']
    },
    // {
    //   name: 'Stock',
    //   icon: 'mdi:warehouse',
    //   href: '/stocks',
    //   label: 'Stock',
    //   allowedRoles: ['Staff', 'Distributor'],
    //   isPermissionNeeded: true,
    //   permissionName: 'stock'
    // },
    // {
    //   name: 'Purchases',
    //   icon: 'mdi:cart-arrow-down',
    //   href: '/purchase',
    //   label: 'Purchases',
    //   allowedRoles: ['Staff', 'Distributor']
    // },
    // {
    //   name: 'Vendors',
    //   icon: 'mdi:store-outline',
    //   href: '/vendor',
    //   label: 'Vendors',
    //   allowedRoles: ['Administrator', 'Staff', 'Distributor'],
    //   isPermissionNeeded: true,
    //   permissionName: 'vendor'
    // },
    {
      name: 'Product',
      icon: 'bx:package',
      href: '/products',
      label: 'Product',
      allowedRoles: ['Administrator']
    },
    {
      name: 'Orders',
      icon: 'mdi:clipboard-text-outline',
      href: '/orders',
      label: 'Orders',
      allowedRoles: ['Administrator']
    },
  
    {
      name: 'Roles & Perm.',
      icon: 'mdi:medal-outline',
      href: '/rolesandpermission',
      label: 'Roles',
      allowedRoles: ['Administrator']
    }
  ];

  // Filter based on roles and permissions
  let navigationItems = (menuItems || defaultMenuItems).filter((item: any) => {
    const matchesRole = !item.allowedRoles || item.allowedRoles.some((role: string) => hasRole(role));
    const matchesPermission = !item.isPermissionNeeded || hasPermission(item.permissionName);
    return matchesRole && matchesPermission;
  });

  // Apply explicit rule: If distributor ONLY, limit to specific 4 tabs as requested
  if (!hasRole('administrator') && hasRole('distributor')) {
    const distributorTabs = ['/distributorQuickBill', '/stocks', '/purchase', '/vendor'];
    navigationItems = navigationItems.filter((item: any) => distributorTabs.includes(item.href));
  }

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isNavLinkActive = (path: string) => {
    if (!path) return false;
    if (router.pathname === path || router.pathname.startsWith(path + '/')) {
      return true;
    }
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16 mx-8 px-2 overflow-x-auto scrollbar-hide">
        {navigationItems.map((item: any, index: number) => {
          const isActive = isNavLinkActive(item.href);
          
          return (
            <button
              key={item.name || index}
              onClick={() => handleNavigation(item.href)}
              className={`
                flex flex-col items-center justify-center 
                min-w-[60px] py-2 px-2 rounded-lg mx-1
                transition-all duration-200 ease-in-out
                ${isActive 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon 
                icon={item.icon || 'mdi:circle-outline'}
                className={`
                  text-2xl mb-1 transition-transform duration-200
                  ${isActive ? 'text-green-700 scale-110' : 'text-current'}
                `}
              />
              <span className={`
                text-xs font-medium truncate transition-colors duration-200
                ${isActive ? 'text-green-700 font-semibold' : 'text-current'}
              `}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
