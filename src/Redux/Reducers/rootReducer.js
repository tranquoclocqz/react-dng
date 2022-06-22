import { combineReducers } from "redux";
import dngReducer from "./dngReducer";
const rootReducer = combineReducers({ dng: dngReducer })
export default rootReducer;