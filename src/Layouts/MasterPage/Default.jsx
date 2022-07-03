import classNames from "classnames";
import { Fragment, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Navigate, useLocation
} from "react-router-dom";
import Permission from "../../Api/Permission";
import { setMenu } from "../../Redux/Actions/menuAction";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
function Default({ children }) {
  const openMenu = useSelector((state) => state.dng.openMenu);
  const { isAuth } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    async function getMenu() {
      const data = await Permission.getMenu();
      const routes = data.data;
      const array_route = routes.map((e) => {
        let menu = {
          name: e.name,
          icon: e.icon,
        };
        if (typeof e.children === "undefined") {
          menu.path = e.url;
          menu.component = "MarketingOffline/Reports_v2";
        } else {
          menu.path = "#";
          menu.children = e.children.map((child) => {
            return {
              name: child.name,
              path: `/` + child.url,
              component: "MarketingOffline/Reports_v2",
            };
          });
        }
        return menu;
      });
      dispatch(setMenu(array_route));
    }
    if (isAuth) {
      getMenu();
    }
  }, []);
  if (!isAuth)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return (
    <div className={classNames("main-wrapper fixed skin-green")}>
      <div className="wrapper">
        <Header />
        <Sidebar />
        <div className="content-wrapper">
          <Fragment>
            <Suspense fallback={<>Loading ............</>}>
              <section className="content">{children}</section>
            </Suspense>
          </Fragment>
        </div>
        <Footer />
      </div>
    </div>
  );
}
export default Default;
