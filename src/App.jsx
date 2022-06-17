import router from "./pages/routes";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import React, { Fragment, Suspense } from "react";
import Header from "./Layouts/Header/Header";
import Footer from "./Layouts/Footer/Footer";
import Sidebar from "./Layouts/Sidebar/Sidebar";
function App() {
  return (
    <>
      <Header />
      <Sidebar />
      <Fragment>
        <Suspense fallback={<div className="loading-lazy" />}>
          <div className="content-wrapper">
            <Routes>
              <Route index path="/" element={<Home />} />
              {router.map((item) => {
                const Com = React.lazy(() =>
                  import(`./pages/${item.component}`)
                );
                return (
                  <Route key={item.path} path={item.path} element={<Com />} />
                );
              })}
            </Routes>
          </div>
        </Suspense>
      </Fragment>
      <Footer />
    </>
  );
}

export default App;
