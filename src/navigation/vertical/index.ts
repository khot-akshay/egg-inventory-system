import { VerticalNavItemsType } from "src/@core/layouts/types";
import themeConfig from "src/configs/themeConfig";
import { useAuth } from "src/hooks/useAuth";

const tempObject: VerticalNavItemsType = [
  {
    title: "Dashboards",
    icon: "bx:home-circle",
    path: "/dashboards",
    allowedRoles: ["Administrator", "Staff", "Distributor"],
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
  {
    title: "Shops",
    icon: "bx:package",
    path: '/shop',
    allowedRoles: ["Administrator"],
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },

  {
    title: "Users",
    icon: "bx:group",
    path: '/user',
    allowedRoles: ["Administrator"],
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },

  {
    title: "Price",
    icon: "mdi:credit-card-outline",
    path: '/price',
    allowedRoles: ["Administrator"],
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
  {
    title: "Customers",
    icon: "bx:buildings",
    path: '/plants',
    allowedRoles: ["Administrator", "Staff", "Distributor"],
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
  {
    title: "Products",
    icon: "mdi:clipboard-text-outline",
    allowedRoles: ["Administrator"],
    path: "/products",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission

  },
  {
    title: "Quick Bill",
    icon: "mdi:clipboard-text-outline",
    allowedRoles: ["Staff"],
    path: "/quickBill",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission

  },

  {
    title: "Stock",
    icon: "mdi:warehouse", // inventory / storage
    allowedRoles: ["Administrator", "Staff"],
    path: "/stocks",
  },
  {
    title: "Purchases",
    icon: "mdi:cart-arrow-down", // buying items
    allowedRoles: ["Administrator", "Staff"],
    path: "/commission",
  },
  {
    title: "Vendors",
    icon: "mdi:truck-delivery", // suppliers
    allowedRoles: ["Administrator", "Staff"],
    path: "/vendor",
  },
  {
    title: "Bills",
    icon: "mdi:file-document-outline", // invoices
    allowedRoles: ["Administrator", "Staff"],
    path: "/commission",
  },
  {
    title: "Payments",
    icon: "mdi:credit-card-outline", // payments
    allowedRoles: ["Administrator", "Staff"],
    path: "/commission",
  },
  {
    title: "Expenses",
    icon: "mdi:cash-minus", // money going out
    allowedRoles: ["Administrator", "Staff"],
    path: "/commission",
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
  {
    title: 'Reports',
    icon: 'mdi:information-outline',
    allowedRoles: ["Administrator", "Staff", "Distributor"],
    path: '/query',

  },

  //  {

  //       title: 'Products',
  //       path: '/metadata/products',
  //       icon: 'carbon:name-space',
  //       // permissionName: 'view_brand',
  //       // isPermissionNeeded: true,



  //     },
  {
    title: 'Metadata',
    icon: 'icon-park-outline:data-file',
    allowedRoles: ["Administrator"],
    path: '/superAdmin/all-careTaker',

    children: [
      // {

      //   title: 'Categories',
      //   path: '/metadata/categories',
      //   icon: 'carbon:name-space',
      //   // permissionName: 'view_brand',
      //   // isPermissionNeeded: true,



      // },
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
      // {

      //   title: 'Polish Type',
      //   path: '/metadata/polishType',
      //   icon: 'mdi:sparkles',
        // permissionName: 'view_truck_model',
        // isPermissionNeeded: true,


      // },
      // {
      //   title: 'Truck Price',
      //   path: '/metadata/truck_price',
      //   icon: 'ion:pricetags-outline',
      //   permissionName: 'view_truck_price',
      //   isPermissionNeeded: true,
      // },
      // {
      //   title: 'FAQs',
      //   path: '/metadata/faqs',
      //   icon: 'streamline-ultimate:contact-us-faq',
      //   // permissionName: 'view_faqs',
      //   // isPermissionNeeded: true,

      // },
      // {
      //   title: 'Terms & Conditions',
      //   path: '/metadata/term_condition',
      //   icon: 'tabler:file-check',
      //   // permissionName: 'view_terms_and_conditions',
      //   // isPermissionNeeded: true,

      // },
      // {
      //   title: 'Privacy Policy',
      //   path: '/metadata/privacy_policy',
      //   icon: 'material-symbols:privacy-tip-outline',
      //   // permissionName: 'view_privacy_and_policy',
      //   // isPermissionNeeded: true,


      // },
      // {
      //   title: 'Refund  Policy',
      //   path: '/metadata/refund_policy',
      //   icon: 'mdi:cash-refund',
      //   // permissionName: 'view_refund_policy',
      //   // isPermissionNeeded: true,


      // },
      // {
      //   title: 'Cancellation Policy',
      //   path: '/metadata/cancellation_policy',
      //   icon: 'material-symbols:free-cancellation-outline',
      //   // permissionName: 'view_cancellation_policy',
      //   // isPermissionNeeded: true,


      // },
      // {
      //   title: 'Query Category',
      //   path: '/metadata/query-category',
      //   icon: 'material-symbols:free-cancellation-outline',
      //   // permissionName: 'view_query_category',
      //   // isPermissionNeeded: true,


      // },
      // {
      //   title: 'Material Type',
      //   path: '/metadata/material-type',
      //   icon: 'hugeicons:material-and-texture',
      //   permissionName: 'view_material_type',
      //   isPermissionNeeded: true,


      // },

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
  // console.log('Navigation Debug - User data:', user);
  // console.log('Navigation Debug - User roles:', user?.roles);
  // console.log('Navigation Debug - User role (string):', user?.role);

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

    return user.permissions.includes(permissionName);
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
