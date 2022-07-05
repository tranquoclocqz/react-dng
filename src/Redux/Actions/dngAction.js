const toggleMenu = (value) => {
    return {
        type: 'TOGGLE_MENU',
        payload: value
    }
}

const setStoreId = (value) => {
    return {
        type: 'SET_STORE_ID',
        payload: value
    }
}

const setCompnayId = (value) => {
    return {
        type: 'SET_COMPANY_ID',
        payload: value
    }
}
const setModule = (value) => {
    return {
        type: 'SET_MODULE',
        payload: value
    }
}

export {
    toggleMenu,
    setStoreId,
    setCompnayId,
    setModule
};