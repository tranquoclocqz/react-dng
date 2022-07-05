export default (state = {
    menu: [],
    stores: []
}, action) => {
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