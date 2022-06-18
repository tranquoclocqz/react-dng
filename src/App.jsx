import router from "./Pages/routes";
import Home from "./Pages/Home";
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
            <section className="content">
              <Routes>
                <Route index path="/" element={<Home />} />
                {router.map((item) => {
                  const Com = React.lazy(() =>
                    import(`./Pages/${item.component}`)
                  );
                  return (
                    <Route key={item.path} path={item.path} element={<Com />} />
                  );
                })}
              </Routes>
            </section>
          </div>
        </Suspense>
      </Fragment>
      <Footer />
    </>
  );
}

export default App;
