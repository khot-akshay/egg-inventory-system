import axios, { AxiosInstance } from 'axios';
import { baseUrl } from './baseUrl';
import Cookies from 'js-cookie';
const axiosInstance: AxiosInstance = axios.create({
  // Axios instance configuration options
  baseURL: `${process.env.NEXT_PUBLIC_BASEURL}`
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken') || window.localStorage.getItem('accessToken')
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      if (userData?.shop_id) {
        config.headers.orgId = userData.shop_id;
      }
    }
    if (config.headers) {
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      if (error.response.status === 401 || error.response.status === 403) {

        // signOut()

      } else if (error.response.status === 500) {
        // Handle 500 status code
        // For example, show an error message
        // Show an error message to the user
      }
    } else if (error.request) {
      // The request was made but no response was received
      // Show an error message to the user
    } else {
      // Something else happened in setting up the request that triggered an error
      // Show an error message to the user
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
