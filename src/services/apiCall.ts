// api.js

import axios from 'axios';
import Cookies from "js-cookie";
// const BASE_URL = 'http://192.168.0.109:8000';
const BASE_URL = `${process.env.NEXT_PUBLIC_BASEURL}`;


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const makeApiRequest = async (method: string, url: string, data = null, headers: any = {}) => {
  try {
    let token = Cookies.get('accessToken') || (typeof window !== 'undefined' ? window.localStorage.getItem('accessToken') : null);
    let userData = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem('userData') || '{}') : {};
    let orgID = (typeof window !== 'undefined' ? window.localStorage.getItem('org_id') : null) || userData?.shop_id;

    if (token) {
      headers = {
        ...headers,
        "Authorization": `Bearer ${token}`,
        "orgId": orgID
      };
    }
    const response = await api({
      method,
      url,
      data,
      headers,
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || error;
  }
};

export const get = async (url: string, headers = {}) => {
  return makeApiRequest('get', url, null, headers);
};



export const post = async (url: string, data: any, headers = {}, formData = false) => {
  if (formData) {
    headers = {
      'Content-Type': 'multipart/form-data;',
      ...headers
    }
  }
  return makeApiRequest('post', url, data, headers);
};

export const put = async (url: string, data: any, headers = {}) => {
  return makeApiRequest('put', url, data, headers);
};

export const del = async (url: string, headers = {}) => {
  return makeApiRequest('delete', url, null, headers);
};
