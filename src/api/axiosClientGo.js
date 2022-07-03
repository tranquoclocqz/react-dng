import axios from 'axios';
import queryString from 'query-string';
const axiosClientGo = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'content-type': 'application/json',
    },
    withCredentials: true,
    paramsSerializer: params => queryString.stringify(params),
});
// Handle token
axiosClientGo.interceptors.request.use(async(config) => {
    // Do something before request is sent
    // const {
    //     token
    // } = JSON.parse(localStorage.getItem("user"));
    // if (token)
    //     config.headers.token = token;
    config.headers.token = 123;
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