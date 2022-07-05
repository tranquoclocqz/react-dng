export default (state = {
    openMenu: false,
    dng: JSON.parse(localStorage.getItem("dng")) || {
        storeId: 0,
        companyId: 1,
        module: 1
    },
}, action) => {
    switch (action.type) {
        case 'TOGGLE_MENU':
            return {
                ...state,
                openMenu: action.payload
            };
        case 'SET_STORE_ID':
            localStorage.setItem("dng", JSON.stringify({
                ...state.dng,
                storeId: action.payload
            }));
            return {
                ...state,
                dng: {
                    ...state.dng,
                    storeId: action.payload
                }
            }
        case 'SET_COMPANY_ID':
            localStorage.setItem("dng", JSON.stringify({
                ...state.dng,
                companyId: action.payload
            }));
            return {
                ...state,
                dng: {
                    ...state.dng,
                    companyId: action.payload
                }
            }
        case 'SET_MODULE':
            localStorage.setItem("dng", JSON.stringify({
                ...state.dng,
                module: action.payload
            }));
            return {
                ...state,
                dng: {
                    ...state.dng,
                    module: action.payload
                }
            }
        default:
            return state;
    }
}