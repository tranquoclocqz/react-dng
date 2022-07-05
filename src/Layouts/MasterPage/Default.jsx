import classNames from "classnames";
import { Fragment, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import Permission from "../../Api/Permission";
import Store from "../../Api/Store";
import { setMenu, setStore } from "../../Redux/Actions/menuAction";
import { setStoreId } from "../../Redux/Actions/dngAction";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import { toggleMenu } from "../../Redux/Actions/dngAction";
function Default({ children }) {
  const { isAuth, user } = useSelector((state) => state.auth);
  const { dng, openMenu } = useSelector((state) => state.dng);
  const location = useLocation();
  const dispatch = useDispatch();
  const onResizeFunction = () => {
    console.log("resized");
    if (window.innerWidth < 768) {
      dispatch(toggleMenu(true));
    } else {
      dispatch(toggleMenu(false));
    }
  };
  useEffect(() => {
    if (window.innerWidth < 768) {
      dispatch(toggleMenu(true));
    }
    window.addEventListener("resize", onResizeFunction, false);
    return () => {
      window.removeEventListener("resize", onResizeFunction, false);
    };
  }, []);
  useEffect(() => {
    async function getStore() {
      const data = await Store.getStore({
        user_id: user.id,
        company_id: dng.companyId,
      });
      dispatch(setStore(data.data));
      if (data.data.length == 1) {
        dispatch(setStoreId(data.data[0].id));
      } else {
        const pluckId = data.data.map((e) => {
          return e.id;
        });
        if (!pluckId.includes(user.main_store_id)) {
          dispatch(setStoreId(pluckId[0]));
        }
      }
    }

    async function getMenu() {
      const data = await Permission.getMenu({
        company_id: dng.companyId,
        store_id: dng.storeId,
        module: dng.module,
      });
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
      getStore();
    }
  }, []);
  if (!isAuth)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return (
    <div
      className={classNames("main-wrapper fixed skin-green", {
        "sidebar-collapse": openMenu,
      })}
    >
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
