export default (state = {
    isAuth: !!localStorage.getItem("user"),
    user: JSON.parse(localStorage.getItem("user")) || {},
    error: null
}, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            localStorage.setItem("user", JSON.stringify(action.payload));
            return {
                ...state,
                isAuth: true,
                user: action.payload
            }
        case 'LOGIN_FAIL':
            return {
                ...state,
                error: action.payload
            }
        case 'LOGOUT':
            localStorage.removeItem("user");
            localStorage.removeItem("storeId");
            localStorage.removeItem("companyId");
            return {
                ...state,
                isAuth: false,
                user: {}
            }
        default:
            return state;
    }
}