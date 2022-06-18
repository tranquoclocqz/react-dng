app.controller('technician_previews', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.object_generating();
        $scope.get_invoice_list();
        $scope.dateInputInit();
        $scope.orientationchange_require();
    }

    $(window).on('resize orientationchange', function () {
        $scope.orientationchange_require();
    });
    $scope.orientationchange_require = () => {
        var window_with = window.innerWidth;
        if (window_with < 550) {
            $('body').append(
                `<div class="orientationchange-require"><img src="./assets/images/screen_rotate.png" alt=""></div>`)
        } else {
            $('.orientationchange-require').remove();
        }
    }
    $scope.object_generating = () => {
        $scope.filter = {};
        $scope.filter.user = '0';
        $scope.filter.sort = 'newest';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.limit_view = 15;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }
    $scope.get_invoice_list = () => {
        $http.get(base_url + 'technicians/ajax_invoice_list?filter=' + JSON.stringify($scope.filter)).then(r => {
            console.log(r.data);
            if (r && r.data.status == 1) {
                $scope.invoice_list = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.check_null_value = (value) => {
        if (value == null || value == "undefined") return true;
        else return false;
    }
    $scope.set_previews = (item) => {
        var temp = {
            id: item.id,
            previews_point: item.previews_point,
            previews_note: item.previews_note,
            technician_name: item.technician_name
        };
        $scope.detail_preview = temp;

        $scope.old_point = item.previews_point;
        $('#previews-moadl').modal('show');
    }
    $scope.confirm_previews = (value) => {
        $http.post(base_url + '/technicians/api_set_previews', value).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]('Đã câp nhật!');
                $scope.get_invoice_list();
                $('#previews-moadl').modal('hide');
            } else toastr["error"](r.data.message);
        })
    }
    $scope.clear_offset_go = () => {
        $scope.filter.limit = 20;
        $scope.filter.limit_view = 15;
        $scope.filter.offset = 0;
        $scope.pagingInfo.currentPage = 1;
        $scope.get_invoice_list();
    }
    $scope.unset = () => {
        delete $scope.filter.date_times;
        $scope.filter.user = '0';
        $scope.filter.sort = 'newest';
        setTimeout(() => {
            $('.select2').select2();
        }, 220);
        $scope.clear_offset_go();
    }
    $scope.dateInputInit = () => {
        if ($('.daterage').length) {
            var start = moment().format('MM-DD-YYYY');
            var end = moment().format('MM-DD-YYYY');
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            $('.daterage').daterangepicker({
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
            $('.daterage').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
                $scope.filter.date_times = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
                $scope.clear_offset_go();
            });
        }
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.get_invoice_list();
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

});