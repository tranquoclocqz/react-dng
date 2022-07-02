import axios from 'axios';
import queryString from 'query-string';
const axiosClientGo = axios.create({
    baseURL: process.env.REACT_APP_API_URL_GO,
    headers: {
        'content-type': 'application/json',
        'token': '123'
    },
    withCredentials: true,
    paramsSerializer: params => queryString.stringify(params),
});
// Handle token
axiosClientGo.interceptors.request.use(async(config) => {
    // Do something before request is sent
    return config;
}, (error) => {
    // Do something with request error
    return Promise.reject(error);
});

axiosClientGo.interceptors.response.use((response) => {
    if (response && response.data) {
        return response.data;
    }
    return response;
}, (error) => {
    throw error;
});

export default axiosClientGo;