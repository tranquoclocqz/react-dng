const toggleMenu = (value) => {
    return {
        type: 'TOGGLE_MENU',
        payload: value
    }
}

export { toggleMenu };