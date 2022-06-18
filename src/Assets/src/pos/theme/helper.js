var currentSegment = location.pathname.substr(1);
currentSegment = currentSegment.split("/");
let CURRENT_SEGMENT = currentSegment[1] ? currentSegment[1] : "dashboard";

$(document).ready(function () {
    renderStores();
});

function showInputErr(selector = '') {
    if (selector) {
        $(selector).addClass('boder-err');
        setTimeout(() => {
            $(selector).removeClass('boder-err');
        }, 1500);
    }
    return false;
}

function showMessErr(message = '') {
    toastr.error(message)
}

function showMessInfo(message) {
    toastr.info(message)
}

function showMessSuccess(message = 'Thành công') {
    toastr.success(message)
}

function showMessErrSystem(message = 'Vui lòng thử lại sau!') {
    toastr.error(message, 'Lỗi hệ thống');
}

function formatDefaultNumber(value = 0) { // xóa dấu , trong chuổi
    var tmp = parseFloat((value + '').split(',').join(''));
    return isNaN(tmp) ? 0 : tmp;
}

$(document).on('keypress', '.input-not-enter', function (event) {
    return event.key === 'Enter' ? false : true;
});

$(document).on('keyup', '.input-format-number', function (event) {
    var self = $(this),
        n = Number(self.val().replace(/\,/g, ''), 10);
    if (n > 0)
        self.val(n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    else {
        n = n != 0 ? '' : 0;
        self.val(n);
    }
});

function parseNumber(num) { // 100000 => 100,000
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function _reload() {
    window.location.reload();
}

$('#switch_store').on('change', function () {
    var store_id = $(this).val();
    if (!Number(store_id)) return;

    ajax_change_store(store_id);
})

function ajax_change_store(id) {
    var check = _userStores.find(x => x.id == id);
    if (!check) {
        showMessErr('Bạn chưa được phân quyền chi nhánh này');
        return;
    }
    $('html').addClass('loading');
    $.ajax({
        url: base_url + 'ajax/change_store',
        type: "POST",
        dataType: "json",
        data: {
            'val': id,
        },
        success: function (data) {
            if (data.success) {
                _reload();
            } else {
                showInputErr('Lỗi hệ thống');
                $('html').removeClass('loading');
            }
        },
        error: function () {
            showMessErrSystem();
        }
    });
}

function renderStores() {
    var _option = '';
    $.each(_userStores, function (index, value) {
        _option += `<option value="${value.id}">${value.id}: ${value.description}</option>`;
    });

    $('.switch_store').html(_option);
    $('.switch_store').val(store_id + '');
    select2();
}

$(document).on('input', '.date_format_input', function () {
    var input = $(this).val();
    if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
    var values = input.split('/').map(function (v) {
        return v.replace(/\D/g, '')
    });

    if (values[0]) values[0] = checkValueDate(values[0], 31);
    if (values[1]) values[1] = checkValueDate(values[1], 12);
    var output = values.map(function (v, i) {
        return v.length == 2 && i < 2 ? v + ' / ' : v;
    });
    $(this).val(output.join('').substr(0, 14));
})

function checkValueDate(str, max) {
    if (str.charAt(0) !== '0' || str == '00') {
        var num = parseInt(str);
        if (isNaN(num) || num <= 0 || num > max) num = 1;
        str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString();
    };
    return str;
};

function showZoomImg(src) {
    $('body').append(`<div class="popup-img active">
                                <button type="button" class="btn"><i class="fa fa-times" aria-hidden="true"></i></button>
                                <img class="img-c" alt="Hình ảnh" src="${src}">
                            </div>`).addClass('overflow-hidden')
}

function hideZoomImg() {
    $('.popup-img').remove();
    $('body').removeClass('overflow-hidden');
}

$(document).on('keyup', function (e) {
    if (e.keyCode == 27) {
        hideZoomImg();
    }
});

$(document).on('click', '.popup-img', function (e) {
    if (!($(e.target).hasClass('img-c'))) {
        hideZoomImg();
    }
});
$(document).on('click', '.input-number-decrement, .input-number-increment', function () {
    var self = $(this),
        oldValue = self.parent().find("input"),
        max = oldValue.attr('max') ? oldValue.attr('max') : 10000,
        min = oldValue.attr('min') ? oldValue.attr('min') : 0,
        oldValue = oldValue.val() > 0 ? oldValue.val() : 0,
        newVal = oldValue;
    if (self.hasClass('input-number-increment')) {
        if (parseFloat(oldValue) + 1 <= parseInt(max))
            newVal = parseFloat(oldValue) + 1;
    } else {
        if (parseFloat(oldValue) - 1 >= parseInt(min))
            newVal = parseFloat(oldValue) - 1;
    }

    self.parent().find("input").val(newVal).trigger('input');
});

$(document).on('click', '[data-dismiss=popup]', function () {
    var target = $(this).closest('.popup').attr('id');
    hidePopup('#' + target);
})

$(document).on('click', '[date-toggle="popup"]', function () {
    var target = $(this).attr('data-target');
    showPopup(target);
})

function showPopup(popup) {
    $(popup).addClass('active').animate({
        scrollTop: 0
    }, 0);
    $('body').addClass('popup-open');
}

function hidePopup(popup) {
    $(popup).removeClass('active');
    $('.popup.active').length == 0 && $('body').removeClass('popup-open');
}

function togglePopup(popup) {
    if ($(popup).hasClass('active')) {
        hidePopup(popup);
    } else {
        showPopup(popup);
    }
}

function hideAllPopup() {
    hidePopup('.popup');
}

function select2(timeout = 100, selector = '.select2') {
    setTimeout(() => {
        jQuery(selector).select2({
            templateResult: _formatStateSelect2,
            templateSelection: _formatStateSelect2
        });
    }, timeout);
}

function _formatStateSelect2(node) {
    var level = jQuery(node.element).data('select2-level');
    var optimage = $(node.element).data('image');

    if (level) {
        return jQuery(treeRender(level, node.text));
    }
    if (optimage) {
        var $opt = $(`<span><img src="${optimage}" style="width: 22px; height: 22px; object-fit: cover; border-radius: 50%; margin-right: 5px; border: 1px solid #dadce0" />${node.text}</span>`);
        return $opt;
    }
    return node.text;
}


function ToSlug(title) {
    if (title == '' || !title) return '';
    //Đổi chữ hoa thành chữ thường

    slug = title.toLowerCase();
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    slug = slug.replace(/đ/gi, 'd');
    //Xóa các ký tự đặt biệt
    slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
    //Đổi khoảng trắng thành ký tự gạch ngang
    //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
    //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
    slug = slug.replace(/\-\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-\-/gi, '-');
    slug = slug.replace(/\-\-\-/gi, '-');
    slug = slug.replace(/\-\-/gi, '-');
    //Xóa các ký tự gạch ngang ở đầu và cuối
    slug = '@' + slug + '@';
    slug = slug.replace(/\@\-|\-\@|\@/gi, '');
    return slug;
}

function setStorage(key, value) {
    var data = {};
    if (localStorage.getItem(CURRENT_SEGMENT) !== null) {
        data = JSON.parse(localStorage.getItem(CURRENT_SEGMENT));
    }
    data[key] = value;
    localStorage.setItem(CURRENT_SEGMENT, JSON.stringify(data));
}

function getStorage(key) {
    if (localStorage.getItem(CURRENT_SEGMENT) !== null) {
        var data = JSON.parse(localStorage.getItem(CURRENT_SEGMENT));
        return data[key];
    }
    return false;
}

function _jsonObj(value) {
    if (!value) return {};
    return JSON.parse(value);
}

function _jsonArr(value) {
    if (!value) return [];
    return JSON.parse(value);
}

function showSoundErr() {
    var _sound = new Audio(base_url + 'assets/music/error.mp3');
    _sound.play();
}

function _linkInvoice(invoice_id) {
    return base_url + 'invoices_v2/detail/' + invoice_id;
}

$(document).on('click', '.slide-head', function () {
    var self = $(this),
        slide_body = self.parent().find('.slide-body');
    slide_body.toggleClass('active');
    setTimeout(() => {
        slide_body.find('input').focus();
    }, 50);
})

$(document).on('keyup', "input[data-type='currency']", function () {
    input_formatCurrency($(this));
});

function formatNumber_not_decimals(n) {
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function input_formatCurrency(input) {

    var input_val = input.val();
    if (input_val === "") {
        return;
    }
    var original_len = input_val.length;

    var caret_pos = input.prop("selectionStart");

    input_val = _formatValueCurrency(input_val);
    // send updated string to input
    input.val(input_val);

    // put caret back in the right position
    var updated_len = input_val.length;
    caret_pos = updated_len - original_len + caret_pos;
    input[0].setSelectionRange(caret_pos, caret_pos);
}

function _formatValueCurrency(input_val) {
    input_val += '';
    if (input_val.indexOf(".") >= 0) {

        var decimal_pos = input_val.indexOf(".");

        var left_side = input_val.substring(0, decimal_pos);
        var right_side = input_val.substring(decimal_pos);

        left_side = formatNumber_not_decimals(left_side);

        right_side = formatNumber_not_decimals(right_side);

        right_side = right_side.substring(0, 2);

        input_val = left_side + "." + right_side;

    } else {
        input_val = formatNumber_not_decimals(input_val);
        input_val = input_val;
    }
    return input_val;
}

if ($('.reportrangeClass').length) {
    $('.reportrangeClass').daterangepicker({
        opens: 'right',
        alwaysShowCalendars: true,
        showCustomRangeLabel: false,
        minDate: new Date($('.reportrangeClass').attr('date_start')),
        ranges: {
            'Hôm nay': [moment(), moment()],
            'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '7 ngày trước': [moment().subtract(6, 'days'), moment()],
            '30 ngày trước': [moment().subtract(29, 'days'), moment()],
            'Tháng này': [moment().startOf('month'), moment().endOf('month')],
            'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        "locale": {
            "format": 'DD/MM/YYYY',
            "customRangeLabel": "Custom",
            "applyLabel": "Gắn",
            "cancelLabel": "Hủy",
            "daysOfWeek": ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
            "monthNames": ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
        }
    });
}

function checkShowUrlImageVisa(url_image) {
    if (!url_image) return;
    var url = url_image + '';
    if (url.slice(0, 4) == 'http') {} else {
        url = base_url + 'assets/uploads/visas/' + url;
    }
    return url;
}

window.addEventListener('mouseover', function () {
    $('[title]').tooltip();
});

window.addEventListener('click', function () {
    $('.tooltip.show').remove();
});