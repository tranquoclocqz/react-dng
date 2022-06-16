import React from "react";
import Report from "./components/Report";
function ReportKPI(){
    const data = {
        "channel_id": "0",
        "import_id": "0",
        "loading": true,
        "campaign_id": "1",
        "location_id": 0,
        "campaign_name": "Activation Khai trương Phan Rang",
        "date": "01/05/2022 - 31/05/2022",
        "location_name": "Bình Điền"
    };
    return (
        <div>
            <Report data={data}/>
        </div>
    );
}
export default ReportKPI;