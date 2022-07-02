import React from "react";
import { Route, Routes } from "react-router-dom";
import Error404 from "./Pages/Error/404";
import Home from "./Pages/Home";
import Login from "./Pages/Login/Login";
import Default from "./Layouts/MasterPage/Default";
import Empty from "./Layouts/MasterPage/Empty";
import { useSelector } from "react-redux";
function App() {
  const menu = useSelector((state) => state.menu.menu);
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Empty>
            <Login />
          </Empty>
        }
      ></Route>
      <Route
        path="*"
        element={
          <Default>
            <Error404 />
          </Default>
        }
      />
      <Route
        index
        path="/"
        element={
          <Default>
            <Home />
          </Default>
        }
      />
      {menu.map((item) => {
        if (typeof item.children === "undefined") {
          const Com = React.lazy(() => import(`./Pages/${item.component}`));
          return (
            <Route
              key={item.path}
              path={item.path}
              element={
                <Default>
                  <Com />
                </Default>
              }
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
                element={
                  <Default>
                    <ComChild />
                  </Default>
                }
              />
            );
          });
        }
      })}
    </Routes>
  );
}

export default App;
