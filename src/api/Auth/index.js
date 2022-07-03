import axiosClient from "../axiosClient";
export default {
    login: (params) => {
        return axiosClient.post("/login", params);
    }
}