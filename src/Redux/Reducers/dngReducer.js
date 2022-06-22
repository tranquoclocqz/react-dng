const initState = {
    openMenu: false
}

const dngReducer = (state = initState, action) => {
    switch (action.type) {
        case 'TOGGLE_MENU':
            return {
                ...state,
                openMenu: action.payload
            };
        default:
            return state;
    }

}
export default dngReducer;