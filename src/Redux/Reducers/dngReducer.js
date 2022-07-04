export default (state = {
    openMenu: false,
    storeId: localStorage.getItem("storeId") || 0,
    companyId: localStorage.getItem("companyId") || 1
}, action) => {
    switch (action.type) {
        case 'TOGGLE_MENU':
            return {
                ...state,
                openMenu: action.payload
            };
        case 'SET_STORE_ID':
            localStorage.setItem("storeId", action.payload);
            return {
                ...state,
                storeId: action.payload
            }
        case 'SET_COMPANY_ID':
            localStorage.setItem("companyId", action.payload);
            return {
                ...state,
                companyId: action.payload
            }
        default:
            return state;
    }
}