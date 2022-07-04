const setMenu = (value) => {
    return {
        type: 'SET_MENU',
        payload: value
    }
}

const setStore = (value) => {
    return {
        type: 'SET_STORE',
        payload: value
    }
}

export { setMenu, setStore };