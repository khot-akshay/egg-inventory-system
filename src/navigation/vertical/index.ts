import { VerticalNavItemsType } from "src/@core/layouts/types";
import themeConfig from "src/configs/themeConfig";
import React from "react";
import { useAuth } from "src/hooks/useAuth";

const tempObject: VerticalNavItemsType = [
  {
    title: "Dashboards",
    icon: "bx:home-circle",
    path: "/dashboards",
    allowedRoles: ["Administrator", "Staff"],
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
  // {
  //   title: "Distributor Dashboard",
  //   icon: "bx:home-circle",
  //   path: "/distributorDashboard",
  //   allowedRoles: ["Administrator"],
  //   // isPermissionNeeded: true,
  //   // permissionName: "dashboard",
  // },

  {
    title: "Dashboards",
    icon: "mdi:warehouse", // inventory / storage
    allowedRoles: ["Distributor"],
    path: "/managedaytrip",
  },
  // {
  //   title: "Dashboards",
  //  icon: "bx:home-circle",
  //   path: '/dashboards',
  //   allowedRoles: ["Administrator"],
  //   // isPermissionNeeded: true,
  //   // permissionName: "dashboard",
  // },



  {
    title: "Product Price",
    icon: "mdi:credit-card-outline",
    path: '/price',
    allowedRoles: ["Administrator"],
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
  {
    title: "Customers",
    icon: "bx:buildings",
    path: '/customer',
    allowedRoles: ["Administrator", "Staff", "Distributor"],
    isPermissionNeeded: true,
    permissionName: "customer",
  },
  // {
  //   title: "Products",
  //   icon: "mdi:clipboard-text-outline",
  //   allowedRoles: ["Administrator"],
  //   path: "/products",
  //   // isPermissionNeeded: true,
  //   // permissionName: "view_orders", // aligned with backend permission

  // },
  {
    title: "Quick Bill",
    icon: "mdi:clipboard-text-outline",
    allowedRoles: ["Staff"],
    path: "/quickBill",
    isPermissionNeeded: true,
    permissionName: "quick_bill", // aligned with backend permission

  },
  {
    title: "Distributor Quick Bill",
    icon: "mdi:clipboard-text-outline",
    allowedRoles: ["Distributor"],
    path: "/distributorQuickBill",
    // isPermissionNeeded: true,
    // permissionName: "quick_bill", // aligned with backend permission

  },
  {
    title: "Day Opening",
    icon: "mdi:calendar-start",
    allowedRoles: ["Staff"],
    path: "/openingDay",
  },
  {
    title: "Day Closing",
    icon: "mdi:calendar-end",
    allowedRoles: ["Staff"],
    path: "/dayclosing",
  },

  {
    title: " Vehicle Closing",
    icon: "mdi:calendar-end",
    allowedRoles: ["Distributor"],
    path: "/distributorVehicleclosing",
  },

  {
    title: "Transfer to Shop",
    icon: "mdi:warehouse", // inventory / storage
    allowedRoles: ["Distributor"],
    path: "/stocks",
    isPermissionNeeded: true,
    permissionName: "stock",
  },

  {
    title: "Purchases",
    icon: "mdi:cart-arrow-down", // buying items
    allowedRoles: ["Staff", "Distributor"],
    path: "/purchase",
    //  isPermissionNeeded: true,
    // permissionName: "purchase",
  },
  {
    title: "Vendors",
    icon: "mdi:store-outline",
    allowedRoles: ["Administrator", "Distributor"],
    path: "/vendor",
    isPermissionNeeded: true,
    permissionName: "vendor",
  },
  {
    title: "Distributors",
    icon: "mdi:truck-fast-outline",
    allowedRoles: ["Administrator"],
    path: "/distributor",
  },
  {
    title: "Expenses",
    icon: "mdi:cash-minus", // money going out
    allowedRoles: ["Administrator"],
    path: "/expense",
  },
  {
    title: "Day Closing History",
    icon: "mdi:calendar-end",
    allowedRoles: ["Administrator"],
    path: "/dayclosingHistory",
  },

  {
    title: "Stock History",
    icon: "mdi:warehouse", // inventory / storage
    allowedRoles: ["Administrator"],
    path: "/stockhistory",
  },

  {
    title: "Quick Bill History",
    icon: "mdi:file-document-outline", // invoices
    allowedRoles: ["Administrator"],
    path: "/quickBillHistory",
  },
  // {
  //   title: "Payments",
  //   icon: "mdi:credit-card-outline", // payments
  //   allowedRoles: ["Administrator", "Staff"],
  //   path: "/commission",
  // },

  {
    title: "Expenses",
    icon: "mdi:cash-minus", // money going out
    allowedRoles: ["Staff", "Distributor"],
    path: "/staffExpense",
    isPermissionNeeded: true,
    permissionName: "expense",
  },

  // {
  //   title: 'Organisations',
  //   icon: 'bx:building-house',
  //   path: '/organisations',
  //   isPermissionNeeded: true,
  //   permissionName: 'view_organization',
  // },

  // {
  //   title: "Trucks",
  //   icon: "mdi:truck",
  //   isPermissionNeeded: true,
  //   permissionName: "view_trucks",
  //   path: "/truck",

  // },
  // {
  //   title: "Drivers",
  //   icon: "bx:car",
  //   isPermissionNeeded: true,
  //   permissionName: "view_drivers",
  //   path: "/driver",

  // },
  // {
  //   title: "Customers",
  //   icon: "mdi:account-group-outline",
  //   isPermissionNeeded: true,
  //   permissionName: "view_customers",
  //   path: "/customer",

  // },
  // {
  //   title: 'Reports',
  //   icon: 'mdi:information-outline',
  //   allowedRoles: ["Administrator", "Staff", "Distributor"],
  //   path: '/query',

  // },

  //  {

  //       title: 'Products',
  //       path: '/metadata/products',
  //       icon: 'carbon:name-space',
  //       // permissionName: 'view_brand',
  //       // isPermissionNeeded: true,



  //     },
  {
    title: 'Settings',
    icon: 'icon-park-outline:data-file',
    allowedRoles: ["Administrator"],
    path: '/superAdmin/all-careTaker',

    children: [
      {
        title: "Users",
        icon: "bx:group",
        path: '/user',
        allowedRoles: ["Administrator"],
        // isPermissionNeeded: true,
        // permissionName: "dashboard",
      },

      {

        title: 'Roles & Permissions',
        path: '/rolesandpermission',
        icon: 'mdi:medal-outline',
        // permissionName: 'view_truck_model',
        // isPermissionNeeded: true,


      },
      {

        title: 'Roles',
        path: '/allRoleshow',
        icon: 'mdi:medal-outline',
        // permissionName: 'view_truck_model',
        // isPermissionNeeded: true,


      },

      {
        title: 'Metadata',
        icon: 'icon-park-outline:data-file',
        allowedRoles: ["Administrator"],
        path: '/superAdmin/all-careTaker',

        children: [
          {

            title: 'Categories',
            path: '/metadata/categories',
            icon: 'carbon:name-space',
            //   // permissionName: 'view_brand',
            //   // isPermissionNeeded: true,



          },
          // {

          //   title: 'Products',
          //   path: '/metadata/products',
          //   icon: 'carbon:name-space',
          //   // permissionName: 'view_brand',
          //   // isPermissionNeeded: true,



          // },
          {

            title: 'Shop',
            path: '/metadata/shop',
            icon: 'mdi:medal-outline',
            // permissionName: 'view_truck_model',
            // isPermissionNeeded: true,


          },
          {
            title: "Vehicles",
            icon: "mdi:car-outline",
            allowedRoles: ["Administrator"],
            path: "/vehicles",
            isPermissionNeeded: true,
            permissionName: "vehicle",
          },


        ]
      },

    ]
  },


  // {
  //   title: 'Activity Logs ',
  //   icon: 'mdi:history',
  //   allowedRoles: ["Administrator", "Staff"],
  //   path: '/logs',

  // },
  // {
  //   title: "Roles & Permissions",
  //   icon: "oui:app-users-roles",
  //   path: "/userManagement",
  //   allowedRoles: ["Administrator"],
  // },
];

const navigation = (): VerticalNavItemsType => {
  const { user } = useAuth();

  // Debug logging
  // // // :', user?.role);

  const hasRole = (roleName: string): boolean => {
    if (user?.is_super_admin) return true;

    const targetRole = roleName.toLowerCase();

    // Check user.role string (case-insensitive)
    if (user?.role?.toLowerCase() === targetRole ||
      (user?.role?.toLowerCase() === 'admin' && targetRole === 'administrator')) {
      return true;
    }

    // Check user.roles array
    if (user?.roles?.length) {
      return user.roles.some((role: any) => {
        const name = role.name?.toLowerCase();
        const slug = role.slug?.toLowerCase();

        return name === targetRole ||
          slug === targetRole ||
          (name === 'admin' && targetRole === 'administrator');
      });
    }

    return false;
  };

  const hasPermission = (permissionName?: string): boolean => {
    if (user?.is_super_admin) return true;
    if (!permissionName) return false;
    if (!user?.permissions?.length) return false;

    // Direct match (e.g., 'customer.view')
    if (user.permissions.includes(permissionName)) return true;

    // Module prefix match (e.g., 'vendor' matches 'vendor.add')
    return user.permissions.some((perm: string) => typeof perm === 'string' && perm.startsWith(`${permissionName}.`));
  };

  const filterItems = (items: VerticalNavItemsType): VerticalNavItemsType => {
    return (items
      ?.filter((item) => {
        const matchesProject =
          !item.projectFor ||
          item.projectFor.includes(themeConfig.projectFor);

        const matchesPermission =
          !item.isPermissionNeeded || hasPermission(item.permissionName);

        // Role-based filtering
        const matchesRole = !item.allowedRoles ||
          item.allowedRoles.some((role: string) => hasRole(role));

        return matchesProject && matchesPermission && matchesRole;
      })
      .map((item) => {
        if ("children" in item && item.children) {
          return { ...item, children: filterItems(item.children) };
        }

        return item;
      }) ?? []);
  };

  return filterItems(tempObject);
};

// Export raw nav items for external permission-scoping (e.g., AuthGuard)
export const allNavItems: VerticalNavItemsType = tempObject;

export default navigation;
