import { useEffect, useState } from "react";
import service from "../service";
import React from "react";
function Report({ data }) {
    const params = data;
    console.log(params);
  const [result, setResult] = useState({});
  useEffect(() => {
    const fetchData = async () => {
        const response = await service.getReportKPI();
        setResult(response);
    }
    fetchData();
  }, [params]);
  return <div>
    Report here
  </div>;
}
export default React.memo(Report);
