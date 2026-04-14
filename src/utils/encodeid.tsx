import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
const crypto = require('crypto');
// Helper functions to handle Base64 URL encoding and decoding
const base64UrlEncode = (str: string) => {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64UrlDecode = (str: string) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return str;
};

export const encodeParams = (params: any) => {
  const stringifiedParams = JSON.stringify(params);
  const encrypted = CryptoJS.AES.encrypt(stringifiedParams, 'cb536e3c58f2412b3b9aa08380e496c59fa4dbff18d6b8fbd2e09a2fc26f979f').toString();
  return base64UrlEncode(encrypted);
};

export const decodeParams = (encodedParams: any) => {
  const encrypted = base64UrlDecode(encodedParams);
  const bytes = CryptoJS.AES.decrypt(encrypted, 'cb536e3c58f2412b3b9aa08380e496c59fa4dbff18d6b8fbd2e09a2fc26f979f');
  const decodedString = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decodedString);
};

export const signOut = async () => {
  const token = Cookies.get('accessToken');
  const deviceInfo = Cookies.get('deviceInfo') ? JSON.parse(Cookies.get('deviceInfo') as string) : null;
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');


  // try {
  //   await axiosInstance.post(`/admin/v1/auth/logOutDevice`, {
  //     token,
  //     id: userData.id,
  //     ip_address: deviceInfo.ip_address,
  //     devices_name: deviceInfo.devices_name,
  //     browser: deviceInfo.browser,
  //   });

  // } catch (e) {
  //   console.error('Error logging out:', e);
  // }
  Cookies.remove('accessToken');
  Cookies.remove('deviceInfo');
  localStorage.clear();

  window.location.href = '/login';
};
export const capitalizeFirstLetter = (str: string) => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

