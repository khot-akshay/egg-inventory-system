import { VerticalNavItemsType } from "src/@core/layouts/types";
import themeConfig from "src/configs/themeConfig";
import { useAuth } from "src/hooks/useAuth";

const tempObject: VerticalNavItemsType = [
  {
    title: "Dashboards",
    icon: "bx:home-circle",
    path: "/dashboards",
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
  {
    title: "Shops",
icon: "bx:package",
        path: '/products',
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },

  {
    title: "Users",
    icon: "bx:group",
        path: '/user',
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
    {
    title: "Customers",
    icon: "bx:buildings",
        path: '/plants',
    // isPermissionNeeded: true,
    // permissionName: "dashboard",
  },
  {
    title: "Products",
    icon: "mdi:clipboard-text-outline",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission
    path: "/orders",

  },
  {
    title: "Stock",
  icon: "mdi:cash-multiple",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission
    path: "/commission",

  },
    {
    title: "Purchases",
  icon: "mdi:cash-multiple",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission
    path: "/commission",

  },
    {
    title: "Vendors",
  icon: "mdi:cash-multiple",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission
    path: "/commission",

  },
    {
    title: "Bills",
  icon: "mdi:cash-multiple",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission
    path: "/commission",

  },
    {
    title: "Payments",
  icon: "mdi:cash-multiple",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission
    path: "/commission",

  },
    {
    title: "Expenses",
  icon: "mdi:cash-multiple",
    // isPermissionNeeded: true,
    // permissionName: "view_orders", // aligned with backend permission
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
    // isPermissionNeeded: true,
    // permissionName: 'view_query_request',
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
    path: '/superAdmin/all-careTaker',
    // isPermissionNeeded: true,
    permissionName: 'metadata',

    children: [
      {

        title: 'Categories',
        path: '/metadata/categories',
        icon: 'carbon:name-space',
        // permissionName: 'view_brand',
        // isPermissionNeeded: true,



      },
      // {

      //   title: 'Products',
      //   path: '/metadata/products',
      //   icon: 'carbon:name-space',
      //   // permissionName: 'view_brand',
      //   // isPermissionNeeded: true,



      // },
      {

        title: 'Products Grade',
        path: '/metadata/productsGrade',
icon: 'mdi:medal-outline',
        // permissionName: 'view_truck_model',
        // isPermissionNeeded: true,


      },
      {

        title: 'Polish Type',
        path: '/metadata/polishType',
icon: 'mdi:sparkles',
        // permissionName: 'view_truck_model',
        // isPermissionNeeded: true,


      },
      {  title: 'Truck Price',
        path: '/metadata/truck_price',
        icon: 'ion:pricetags-outline',
        permissionName: 'view_truck_price',
        isPermissionNeeded: true,
      },
      {
        title: 'FAQs',
        path: '/metadata/faqs',
        icon: 'streamline-ultimate:contact-us-faq',
        // permissionName: 'view_faqs',
        // isPermissionNeeded: true,

      },
      {
        title: 'Terms & Conditions',
        path: '/metadata/term_condition',
        icon: 'tabler:file-check',
        // permissionName: 'view_terms_and_conditions',
        // isPermissionNeeded: true,

      },
      {
        title: 'Privacy Policy',
        path: '/metadata/privacy_policy',
        icon: 'material-symbols:privacy-tip-outline',
        // permissionName: 'view_privacy_and_policy',
        // isPermissionNeeded: true,


      },
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
      {
        title: 'Query Category',
        path: '/metadata/query-category',
        icon: 'material-symbols:free-cancellation-outline',
        // permissionName: 'view_query_category',
        // isPermissionNeeded: true,


      },
      {
        title: 'Material Type',
        path: '/metadata/material-type',
        icon: 'hugeicons:material-and-texture',
        permissionName: 'view_material_type',
        isPermissionNeeded: true,


      },

    ]
  },
 
  {
    title: 'Activity Logs ',
    icon: 'mdi:history'  ,  // isPermissionNeeded: true,
    // permissionName: 'view_query_request',
    path: '/logs',

  },
  {
    title: "Roles & Permissions",
    icon: "oui:app-users-roles",
    path: "/userManagement",
    isPermissionNeeded: true,
    permissionName: "roles_and_permissions",
  },
];

const navigation = (): VerticalNavItemsType => {
  const { user } = useAuth();

  const hasPermission = (permissionName?: string): boolean => {
    if (user?.is_super_admin) return true;
    if (!permissionName) return false;
    if (!user?.permission?.length) return false;

    return user.permission.some((p) => p.permission_name === permissionName);
  };

  const filterItems = (items: VerticalNavItemsType): VerticalNavItemsType => {
    return (
      items
        ?.filter((item) => {
          const matchesProject =
            !item.projectFor ||
            item.projectFor.includes(themeConfig.projectFor);

          const matchesPermission =
            !item.isPermissionNeeded || hasPermission(item.permissionName);

          return matchesProject && matchesPermission;
        })
        .map((item) => {
          if ("children" in item && item.children) {
            return { ...item, children: filterItems(item.children) };
          }

          return item;
        }) ?? []
    );
  };

  return filterItems(tempObject);
};

// Export raw nav items for external permission-scoping (e.g., AuthGuard)
export const allNavItems: VerticalNavItemsType = tempObject;

export default navigation;
