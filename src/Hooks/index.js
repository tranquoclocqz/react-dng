import moment from "moment";

function formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format);
}

function formatNumber(number, decimal = 0, locale = 'vi-VN') {
    return number.toLocaleString(locale, {
        minimumFractionDigits: decimal
    })
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

export {
    formatDate,
    formatNumber,
    getMoney
};