import router from "./Pages/routes";
import Home from "./Pages/Home";
import { Routes, Route } from "react-router-dom";
import React, { Fragment, Suspense } from "react";
import Header from "./Layouts/Header/Header";
import Footer from "./Layouts/Footer/Footer";
import Sidebar from "./Layouts/Sidebar/Sidebar";
import Error404 from "./Pages/Error/404";
function App() {
  return (
    <>
      <Header />
      <Sidebar />
      <div className="content-wrapper">
        <section className="content">
          <Fragment>
            <Suspense fallback={<>Loading................</>}>
              <Routes>
                <Route path='*' element={<Error404 />} />
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
            </Suspense>
          </Fragment>
        </section>
      </div>
      <Footer />
    </>
  );
}

export default App;
