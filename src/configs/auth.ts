export default {
  meEndpoint: '/api/v1/admin/getCurrentProfile',
  loginEndpoint: '/admin/v1/auth/user-login',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
