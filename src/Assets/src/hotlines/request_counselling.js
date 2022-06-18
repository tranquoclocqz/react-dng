app.controller('request', function ($scope, $http, $compile, $window) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.openAddFilter = false;
        $('.box').css('opacity', '1');
        $scope.dateInputInit();
        $scope.filter = {};
        $scope.newFilter = {};
        $scope.data_report = {};
        $scope.request_acitve_element = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.counsel = {};
        $scope.counsellings_hide = [];

        $scope.filter.staff_id = '0';
        $scope.filter.booking = '0';
        $scope.filter.active = 1;
        $scope.confirm_text = 'Xác nhận'

        $scope.filter.ex_filter = false;

        $scope.getCounselling();

        $scope.get_sourse();
        console.log(1);

        $scope.snd_data();

    }

    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".create-filter, .openAddFilter")) return;

        // If user clicks outside the element, hide it!
        $scope.$apply(function () {
            $scope.openAddFilter = false;
        });
        // $('.bg-dark').css('display', 'none');
    });

    $scope.setType = (value, event) => {
        $('.type .filter-chose').removeClass('active');
        $(event.target).addClass('active');
        $scope.newFilter.type = value;
    }
    $scope.setCond = (value, event) => {
        $('.condition .filter-chose').removeClass('active');
        $(event.target).addClass('active');
        $scope.newFilter.setCond = value;
    }

    $scope.dateInputInit = () => {
        if ($('.daterange').length) {
            var start = moment().format('MM-DD-YYYY');
            var end = moment().format('MM-DD-YYYY');
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            $('.daterange').daterangepicker({
                opens: 'right',
                maxDate: moment(),
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                autoUpdateInput: false,
                ranges: {
                    'Hôm nay': [moment(), moment()],
                    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                    '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            });
            $('.daterange').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
                $scope.filter.date_times = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
                $scope.setDefaultPage();
            });
        }
    }

    $scope.setPercen = (a, b) => {

        var num = a / b;
        if (b == 0) {
            return (0);
        } else {
            return (num * 100).toFixed(2);
        }

    }
    $scope.get_hide_counselling = () => {
        $http.get(base_url + 'hotlines/ajax_get_counselling_hide?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.counsellings_hide = r.data.data;
                // $scope.pagingInfo.total = r.data.count;
                // $scope.data_report = r.data.result;
                // $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.sent_note = (value, index) => {

        var data = {
            adv_note: value.adv_note,
            adv_user_id: id_current_user
        }

        $http.post(base_url + 'hotlines/ajax_sent_counselling/' + value.id, JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getCounselling();
                $scope.snd_data()
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.confirmHide = (id, old_value, event) => {

        $scope.confirm_text = (old_value == 1) ? 'Bạn có muốn ẩn yêu cầu này?' : 'Bạn có muốn khôi phục yêu cầu này?';

        $scope.request_acitve_element.id = id;
        $scope.request_acitve_element.old_value = old_value;
        $scope.request_acitve_event = event;
        $('#hide-modal').modal('show');
    }
    $scope.request_acitve_set = () => {
        $http.get(base_url + 'hotlines/ajax_hide_request?filter=' + JSON.stringify($scope.request_acitve_element)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getCounselling();
                $scope.snd_data()
                $('#hide-modal').modal('hide');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.excelExport = () => {
        window.open(base_url + 'hotlines/excel_export?filter=' + JSON.stringify($scope.filter), '_blank');
    }
    $scope.unset = (cond) => {
        switch (cond) {
            case 'time':
                delete $scope.filter.date_times;
                break;
            case 'source':
                $scope.filter.source_id = undefined;
                // $scope.filter.staff_id = '0';
                // $('#userView').val('0');
                // $('#userView').trigger('change');
                break;
            default:
                break;
        }
        $scope.snd_data()
        $scope.getCounselling();
    }
    $scope.getTable = (status) => {
        $scope.filter.status = status;
        $scope.getCounselling();
        $scope.snd_data()
    }
    $scope.update_note = (id, value, type) => {
        var data = {};
        data.id = id;
        data.value = value;
        data.type = type;
        $http.post(base_url + 'hotlines/ajax_update_note', data).then(r => {
            if (r && r.data.status == 1) {
                // toastr["success"]("Thành công!");
                $scope.getCounselling();
                $scope.snd_data()
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.openField = (value, index) => {
        value.adv_user_id = 0;
    }
    $scope.get_list_telesales = () => {

    }
    $scope.getCounselling = () => {
        console.log($scope.filter);
        $http.get(base_url + 'hotlines/ajax_get_counselling?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.counsellings = r.data.data;
                console.log(r.data);

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.snd_data = () => {
        $http.get(base_url + 'hotlines/get_snd_data?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.pagingInfo.total = r.data.count;
                $scope.data_report = r.data.result;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.get_sourse = () => {
        $http.get(base_url + 'hotlines/ajax_get_soure').then(r => {
            if (r && r.data.status == 1) {
                $scope.sourse = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.setDefaultPage = () => {
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.getCounselling();

        $scope.snd_data()
        // setTimeout(() => {
        //     $('.select2').select2();
        // }, 500);
    }
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getCounselling();
        $scope.snd_data()
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page) {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = function (paging) {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }
    $scope.get_param = function (url, param) {
        if (!url) return '';
        else {
            var this_url = new URL(url);
            var params = this_url.search;
            // initialize an empty object
            let result = '';
            // remove the '?' character
            params = params.substr(1);
            let queryParamArray = params.split('&amp;');
            // iterate over parameter array
            queryParamArray.forEach(function (queryParam) {
                // split the query parameter over '='
                let item = queryParam.split("=");
                if (item[0] == param) result = decodeURIComponent(item[1]);
            });
            // return result object
            return result;
        }
    }
}).filter('cut', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace !== -1) {
                //Also remove . and , so its gives a cleaner result.
                if (value.charAt(lastspace - 1) === '.' || value.charAt(lastspace - 1) === ',') {
                    lastspace = lastspace - 1;
                }
                value = value.substr(0, lastspace);
            }
        }
        return value + (tail || ' …');
    };
});