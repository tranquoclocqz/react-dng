import classNames from "classnames";
import React, { Fragment, Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import Footer from "./Layouts/Footer/Footer";
import Header from "./Layouts/Header/Header";
import Sidebar from "./Layouts/Sidebar/Sidebar";
import Error404 from "./Pages/Error/404";
import Home from "./Pages/Home";
import router from "./Pages/routes";
function App() {
  const openMenu = useSelector((state) => state.dng.openMenu);
  useEffect(() => {}, []);
  return (
    <div
      className={classNames("main-wrapper", "skin-green", {
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
                  <Route path="*" element={<Error404 />} />
                  <Route index path="/" element={<Home />} />
                  {router.map((item) => {
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
