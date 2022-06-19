import { useEffect, useState } from "react";

function DNGRoute() {
  const [dngRoute, setDngRoute] = useState([]);
  useEffect(() => {
    setDngRoute([
      {
        name: "reports_v2",
        path: "/marketing_offlines/reports_v2",
        component: "MarketingOffline/Reports_v2",
      },
    ]);
  }, []);
  return dngRoute;
}

export default DNGRoute;