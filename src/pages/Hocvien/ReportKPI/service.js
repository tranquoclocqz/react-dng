import axiosClient from '../../../api/axiosClient';
const service = {
    getReportKPI: (params) => {
        return axiosClient.post('marketing_offlines/get_reports_marketing', { params });
    }
}
export default service;