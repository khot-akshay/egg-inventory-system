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

const makeApiRequest = async (method:string, url:string, data = null, headers:any={}) => {
    // const router = useRouter();

    
  try {
let token=Cookies.get('accessToken')   
let orgID = window.localStorage.getItem('org_id');
    if(token){
          headers = {...headers ,
            "Authorization" : `Bearer ${token}`,
            "orgId": orgID
          }
    }
    const response = await api({
        method,
        url,
        data,
        headers,
    });
    return response.data;
  } catch (error) {
    // Handle error or throw it for the calling component to handle
    // console.error('API Request Error:', error);
      if (error.response && error.response.status === 401) {
          return error?.response.data
      }
    throw error?.response?.data;
  }
};

export const get = async (url:string, headers = {}) => {
    return makeApiRequest('get', url, null, headers);
};



export const post = async (url:string, data:any,headers = {}, formData = false) => {
    if (formData) {
        headers = {
            'Content-Type': 'multipart/form-data;',
            ...headers
        }
    }
    return makeApiRequest('post', url, data, headers);
};

export const put = async (url:string, data:any, headers = {}) => {
    return makeApiRequest('put', url, data, headers);
};

export const del = async (url:string, headers = {}) => {
    return makeApiRequest('delete', url, null, headers);
};
