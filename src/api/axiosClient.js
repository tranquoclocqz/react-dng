import axios from 'axios';
import queryString from 'query-string';
const axiosClient = axios.create({
    baseURL: 'http://localhost/crm-dng/',
    headers: {
        'content-type': 'application/json',
        'Cookie': 'ci_session_admin=t6oqppmgu2n6n96fn4cjfrf747phjvhv',
        'Set-Cookie': 'ci_session_admin=a7439ki5n2a5pq7334mdgd1eit5jis1l; expires=Thu, 16-Jun-2022 12:30:44 GMT; Max-Age=7200; path=/; HttpOnly'
    },
    paramsSerializer: params => queryString.stringify(params),
});
// Handle token
axiosClient.interceptors.request.use(async(config) => {
    // Do something before request is sent
    return config;
}, (error) => {
    // Do something with request error
    return Promise.reject(error);
});

axiosClient.interceptors.response.use((response) => {
    if (response && response.data) {
        return response.data;
    }
    return response;
}, (error) => {
    throw error;
});

export default axiosClient;