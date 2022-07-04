import axiosClient from "../axiosClient"
export default {
    getStore: (params) => {
        return axiosClient.get("/store/list", {
            params
        });
    }
}