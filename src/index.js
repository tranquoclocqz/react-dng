import "./Assets/Styles/adminlte.min.css";
import "./Assets/Styles/lib.min.css";
import "./Assets/Styles/app.min.css";
import "./Assets/Styles/style.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
const root = ReactDOM.createRoot(document.getElementById("root"));
/**
 * Provider redux here
 */
root.render(
  <React.StrictMode>
    {/* <Provider store={store} > */}
    <BrowserRouter>
      <div className="main-wrapper skin-green">
        <div className="wrapper">
          <App />
        </div>
      </div>
    </BrowserRouter>
    {/* </Provider> */}
  </React.StrictMode>
);
reportWebVitals();
