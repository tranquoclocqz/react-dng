import {
    combineReducers
} from "redux";
import dngReducer from "./dngReducer";
import menuReducer from "./menuReducer";
const rootReducer = combineReducers({
    dng: dngReducer,
    menu: menuReducer
})
export default rootReducer;