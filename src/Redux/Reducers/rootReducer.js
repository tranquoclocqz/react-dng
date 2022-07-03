import {
    combineReducers
} from "redux";
import dngReducer from "./dngReducer";
import menuReducer from "./menuReducer";
import authReducer from "./authReducer";
const rootReducer = combineReducers({
    dng: dngReducer,
    menu: menuReducer,
    auth: authReducer
})
export default rootReducer;