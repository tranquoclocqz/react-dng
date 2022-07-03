const loginSuccess = (value) => {
    return {
        type: 'LOGIN_SUCCESS',
        payload: value
    }
}
const loginFail = (value) => {
    return {
        type: 'LOGIN_FAIL',
        payload: value
    }
}
const logout = (value) => {
    return {
        type: 'LOGOUT',
        payload: value
    }
}

export {
    loginSuccess,
    loginFail,
    logout
};