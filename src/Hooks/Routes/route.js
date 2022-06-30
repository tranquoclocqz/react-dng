import { useEffect, useState } from "react";
import Permission from "../../Api/Permission";

function DNGRoute() {
    const [dngRoute, setDngRoute] = useState([]);
    useEffect(() => {
        async function getMenu() {
            const data = await Permission.getMenu();
            setDngRoute(data.data);
        }
        getMenu();
    }, []);
    return dngRoute;
}

export default DNGRoute;