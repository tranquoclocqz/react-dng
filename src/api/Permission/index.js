import axiosClient from "../axiosClient";
const Permission = {
    getMenu: (params) => {
        return axiosClient.get("permission/get-menu", {
            params
        })
    }
}
export default Permission