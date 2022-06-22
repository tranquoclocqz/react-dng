import "./Assets/Styles/adminlte.min.css";
import "./Assets/Styles/lib.min.css";
import "./Assets/Styles/app.min.css";
import "./Assets/Styles/style.css";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import reportWebVitals from "./reportWebVitals";
import { createStore } from "redux";
import rootReducer from "./Redux/Reducers/rootReducer";
const store = createStore(rootReducer);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
reportWebVitals();
