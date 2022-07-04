const initState = {
    menu: [],
    stores: []
}
const menuReducer = (state = initState, action) => {
    switch (action.type) {
        case 'SET_MENU':
            return {
                ...state,
                menu: action.payload
            };
        case 'SET_STORE':
            return {
                ...state,
                stores: action.payload
            }
        default:
            return state;
    }

}
export default menuReducer;