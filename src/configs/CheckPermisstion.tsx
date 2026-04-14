// const checkPermission = (permissionName) => {
//   const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
//   console.log(userInfo,"userInfo")
//   if (userInfo?.is_super_admin === true) return true;
//   return userInfo?.permission?.some(
//     (permission) =>
//       permission?.permission_name === permissionName
//   );
// };

// export default checkPermission;

const checkPermission = (permissionName: string): boolean => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userInfo?.is_super_admin) return true;

    return userInfo?.permission?.some(
      (perm: { permission_name: string }) =>
        perm.permission_name === permissionName
    );
  } catch (err) {
    console.error('Error checking permission:', err);
    return false;
  }
};

export default checkPermission;
