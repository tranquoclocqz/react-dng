import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Sidebar from "../Sidebar/Sidebar";
import classNames from "classnames";
import React, { Fragment, Suspense } from "react";
import { setMenu } from "../../Redux/Actions/menuAction";
import { useEffect } from "react";
import Permission from "../../Api/Permission";
import { useSelector, useDispatch } from "react-redux";
function Default({ children }) {
  const openMenu = useSelector((state) => state.dng.openMenu);
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
    getMenu();
  }, []);
  return (
    <div className={classNames("main-wrapper fixed skin-green")}>
      <div className="wrapper">
        <Header />
        <Sidebar />
        <div className="content-wrapper">
          <Fragment>
            <Suspense fallback={<h1>Loading profile...</h1>}>
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
