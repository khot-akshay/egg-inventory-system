import React from 'react';
import { useRouter } from 'next/router';
import Icon from 'src/@core/components/icon';
import { useAuth } from 'src/hooks/useAuth';

const BottomNav = ({ menuItems = null }) => {
  const router = useRouter();
  const { user } = useAuth();

  const hasRole = (roleName) => {
    if (user?.is_super_admin) return true;
    const targetRole = roleName.toLowerCase();
    
    // Check direct role string
    if (user?.role?.toLowerCase() === targetRole || 
        (user?.role?.toLowerCase() === 'admin' && targetRole === 'administrator')) {
      return true;
    }

    // Check roles array
    if (user?.roles?.length) {
      return user.roles.some((role) => {
        const name = role.name?.toLowerCase();
        const slug = role.slug?.toLowerCase();
        return name === targetRole || slug === targetRole || (name === 'admin' && targetRole === 'administrator');
      });
    }

    return false;
  };

  // Default menu items with allowedRoles
  const defaultMenuItems = [
    {
      name: 'Dashboards',
      icon: 'bx:home-circle',
      href: '/dashboards',
      label: 'Dashboards',
      allowedRoles: ['Administrator', 'Staff', 'Distributor']
    },
    {
      name: 'Product',
      icon: 'bx:package',
      href: '/products',
      label: 'Product',
      allowedRoles: ['Administrator', 'Staff']
    },
    {
      name: 'Orders',
      icon: 'mdi:clipboard-text-outline',
      href: '/orders',
      label: 'Orders',
      allowedRoles: ['Administrator', 'Staff']
    },
    {
      name: 'Query Requests',
      icon: 'mdi:information-outline',
      href: '/query',
      label: 'Query',
      allowedRoles: ['Administrator', 'Staff', 'Distributor']
    },
    {
      name: 'Activity Logs',
      icon: 'mdi:history',
      href: '/logs',
      label: 'Logs',
      allowedRoles: ['Administrator', 'Staff']
    }
  ];

  const navigationItems = (menuItems || defaultMenuItems).filter(item => 
    !item.allowedRoles || item.allowedRoles.some(role => hasRole(role))
  );

  const handleNavigation = (href) => {
    router.push(href);
  };

  const isNavLinkActive = (path) => {
    if (router.pathname === path || router.pathname.startsWith(path + '/')) {
      return true;
    }
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16 mx-8 px-2">
        {navigationItems.map((item) => {
          const isActive = isNavLinkActive(item.href);
          
          return (
            <button
              key={item.name}
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
                icon={item.icon}
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
