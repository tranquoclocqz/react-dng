import moment from "moment";
// import React, {
//     useRef,
//     useEffect
// } from "React"

function formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format);
}

function formatNumber(number, decimal = 0, locale = 'vi-VN') {
    return Number(number).toFixed(decimal);
}

function getMoney(val) {
    let mn = val ? Number(val) : 0;
    if (mn >= 1000000000) {
        return (mn / 1000000000).toFixed(2) + ' Tỷ';
    } else if (mn >= 1000000) {
        return (mn / 1000000).toFixed(2) + ' Tr';
    } else {
        return mn == 0 ? 0 : (mn / 1000).toFixed(0) + ' K';
    }
}

// function usePrevious(value) {
//     const ref = useRef();
//     useEffect(() => {
//         ref.current = value;
//     });
//     return ref.current;
// }
export {
    formatDate,
    formatNumber,
    getMoney,
    // usePrevious
};