import axiosClient from "../axiosClient";
const MarketingOffline = {
    getLocation: (params) => {
        return axiosClient.post("marketing_offlines/ajax_search_locations", params);
    },
    getCampaign: (params) => {
        return axiosClient.get("marketing_offlines/ajax_search_campaigns", {
            params
        })
    },
    getParnter: (params) => {
        return axiosClient.get("marketing_offlines/ajax_get_partners", {
            params
        })
    },
    getChannel: (params) => {
        return axiosClient.get("marketing_offlines/ajax_get_required_channels", {
            params
        })
    },
    getReportMarketing: (params) => {
        return axiosClient.post("marketing_offlines/get_reports_marketing", params)
    },
    getReportPG: (params) => {
        return axiosClient.post("marketing_offlines/get_partner_reports", params);
    }
};
export default MarketingOffline