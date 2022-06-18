jQuery(function ($) {
    $.datepicker.regional["vi-VN"] = {
        closeText: "Đóng",
        prevText: "Trước",
        nextText: "Sau",
        currentText: "Hôm nay",
        monthNames: ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
        monthNamesShort: ["Một", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười một", "Mười hai"],
        dayNames: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
        dayNamesShort: ["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"],
        dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        weekHeader: "Tuần",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };

    $.datepicker.setDefaults($.datepicker.regional["vi-VN"]);
});
app.controller('timeCtrl', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.load = true;
        $scope.list_default = {};
        $scope.list_technicians = {};
        $scope.list_technician_wait = {};
        $('.box-m').css('opacity', '1');
        $('.datepicker-cus').datepicker({
            dateFormat: 'dd-mm-yy',
        });
        $('.datepicker-cus').datepicker('setDate', date_set);
        $scope.getLocalChooseSort();
        $scope.getListTourTechnical();
    }
    $scope.getLocalChooseSort = () => {
        var choose_sort = localStorage.getItem('choose_sort_tour');
        choose_sort = choose_sort ? choose_sort : 1;
        localStorage.setItem('choose_sort_tour', choose_sort);
        $scope.choose_sort = choose_sort + '';
    }

    $scope.getListTourTechnical = () => {
        $(document).find('li.list-item.temp').remove();
        $scope.load = true;
        let date_rq = $('.datepicker-cus').val();
        $http.get(base_url + `admin_store_tours/ajax_get_list_user_tour?date=${date_rq}`).then(r => {
            if (r.data.status == 1) {
                let data = r.data.data;
                $scope.list_default = data;
                // $scope.list_technicians = data.filter(item => item.position > 0);
                $scope.list_technician_wait = data.filter(item => item.position == 0);
                $scope.sortByChoose();
                $scope.setDragItem();
                $('title, .content-header>h1,.breadcrumb>.active').html('Xếp tour KTV ngày ' + date_rq);
            } else {
                toastr["error"](r.data.message);
            }
            $scope.load = false;

        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.setDragItem = () => {
        $('#list_wait').sortable({
            connectWith: "#list_touring",
            cursor: "move",
            revert: true,
        });

        $('#list_touring').sortable({
            connectWith: "#list_wait",
            cursor: "move",
            revert: true,
        });
    }

    $scope.confirmSetTour = () => {
        $scope.load = true;

        var arr_wait = [];
        var arr_touring = [];
        $.each($('#list_wait li'), function (i, v) {
            let user_id = $(this).attr('data-user_id');
            arr_wait.push(user_id);
        });
        $.each($('#list_touring li'), function (i, v) {
            let user_id = $(this).attr('data-user_id');
            arr_touring.push(user_id);
        });

        $http.post(base_url + 'admin_store_tours/ajax_set_list_tour_technicians', {
            list_wait: arr_wait,
            list_touring: arr_touring,
            date: $('.datepicker-cus').val()
        }).then(r => {
            if (r.data.status == 1) {
                toastr["success"]('Xếp tour thành công!');
            } else {
                toastr["error"](r.data.message);
            }
            $scope.load = false;

        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.setChooseSort = () => {
        localStorage.setItem('choose_sort_tour', $scope.choose_sort);
        $scope.sortByChoose();
    }

    $scope.sortByChoose = () => {
        var items = $scope.list_default.filter(item => item.position > 0);
        if ($scope.choose_sort == 1) { //Theo lượt nhận (để nguyên giá trị position server trả về)
            // items = $scope.list_default.filter(item => item.position > 0);
        } else if ($scope.choose_sort == 2) { //Theo tổng khách
            items.sort(function (a, b) {
                return parseFloat(a.total_invoice_day) - parseFloat(b.total_invoice_day);
            });
        } else if ($scope.choose_sort == 3) { //Theo tổng tour
            items.sort(function (a, b) {
                return parseFloat(a.total_tour) - parseFloat(b.total_tour);
            });
        }
        $scope.list_technicians = items;
    }
})

$(document).on('click', '#list_wait>li', function (e) {
    let self = $(this),
        user_id = self.attr('data-user_id'),
        this_html = self.html();
    li_html = `<li class="list-item temp" data-user_id="${user_id}">${this_html}</li>`;

    self.remove();
    $('#list_touring').append(li_html);
})
$(document).on('click', '#list_touring>li', function (e) {
    let self = $(this),
        user_id = self.attr('data-user_id'),
        this_html = self.html();
    li_html = `<li class="list-item temp" data-user_id="${user_id}">${this_html}</li>`;

    if ($(e.target).closest('.item-btn-sort').length) {
        let is_down = $(e.target).closest('.item-btn-sort').hasClass('down');
        if (is_down) {
            let self_change = $(self).next(),
                user_id_change = self_change.attr('data-user_id'),
                this_html_change = self_change.html(),
                li_html_change = `<li class="list-item temp" data-user_id="${user_id_change}">${this_html_change}</li>` + li_html;
            $(self).next().replaceWith(li_html_change)
        } else {
            let self_change = $(self).prev(),
                user_id_change = self_change.attr('data-user_id'),
                this_html_change = self_change.html(),
                li_html_change = li_html + `<li class="list-item temp" data-user_id="${user_id_change}">${this_html_change}</li>`;
            $(self).prev().replaceWith(li_html_change)
        }
    } else {
        $('#list_wait').append(li_html);
    }
    self.remove();
})