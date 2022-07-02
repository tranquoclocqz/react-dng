import classNames from "classnames";
import React, { Fragment, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Routes } from "react-router-dom";
import Footer from "./Layouts/Footer/Footer";
import Header from "./Layouts/Header/Header";
import Sidebar from "./Layouts/Sidebar/Sidebar";
import Error404 from "./Pages/Error/404";
import Home from "./Pages/Home";
import Login from "./Pages/Login/Login";
import { setMenu } from "./Redux/Actions/menuAction";
import { useEffect } from "react";
import Permission from "./Api/Permission";
function App() {
  const openMenu = useSelector((state) => state.dng.openMenu);
  const menu = useSelector((state) => state.menu.menu);
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
    <div
      className={classNames("main-wrapper fixed", "skin-green", {
        "sidebar-collapse": openMenu,
      })}
    >
      <div className="wrapper">
        <Header />
        <Sidebar />
        <div className="content-wrapper">
          <section className="content">
            <Fragment>
              <Suspense fallback={<>Loading................</>}>
                <Routes>
                  <Route path="/login" element={<Login />}></Route>
                  <Route path="*" element={<Error404 />} />
                  <Route index path="/" element={<Home />} />
                  {menu.map((item) => {
                    if (typeof item.children === "undefined") {
                      const Com = React.lazy(() =>
                        import(`./Pages/${item.component}`)
                      );
                      return (
                        <Route
                          key={item.path}
                          path={item.path}
                          element={<Com />}
                        />
                      );
                    } else {
                      item.children.map((child) => {
                        const ComChild = React.lazy(() =>
                          import(`./Pages/${child.component}`)
                        );
                        return (
                          <Route
                            key={child.path}
                            path={child.path}
                            element={<ComChild />}
                          />
                        );
                      });
                    }
                  })}
                </Routes>
              </Suspense>
            </Fragment>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
