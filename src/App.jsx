import router from "./pages/routes";
import "./App.css";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import React from "react";
function App() {
  return (
    <BrowserRouter>
      <Link to="/">Home</Link> 
      <Link to="report-kpi">kpi-report</Link>
      <Routes>
        <Route index path="/" element={<Home />} />
        {router.map((item) => {
          const Com = React.lazy(() => import(`./pages/${item.component}`));
          return (
            <Route
              key={item.path}
              path={item.path}
              element={
                <React.Suspense fallback={<>...</>}>
                  <Com/>
                </React.Suspense>
              }
            />
          );
        })}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
