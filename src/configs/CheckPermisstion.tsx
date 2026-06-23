const checkPermission = (permissionName: string): boolean => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');

    // Super admin has all permissions
    if (userInfo?.is_super_admin === true) return true;

    // Permissions live inside roles[n].permissions[]
    // Each permission has: { slug: "vendor.add", name: "Add vendor", ... }
    if (Array.isArray(userInfo?.roles)) {
      for (const role of userInfo.roles) {
        if (Array.isArray(role?.permissions)) {
          const found = role.permissions.some(
            (perm: { slug?: string; name?: string; permission_name?: string }) =>
              perm.slug === permissionName ||
              perm.name === permissionName ||
              perm.permission_name === permissionName
          );
          if (found) return true;
        }
      }
    }

    return false;
  } catch (err) {
    return false;
  }
};

export default checkPermission;
