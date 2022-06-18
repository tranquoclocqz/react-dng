app.controller('sb_invoice_detail', function ($scope, $sce, $http, $compile) {
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
        $scope.getAll();
        $scope.dateInputInit();
    }


    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.countPrice = (val1, val2) => {
        return Number(val1) + Number(val2);
    }
    $scope.unset = () => {
        $scope.object_generating();
        $scope.getAll();
    }
    $scope.object_generating = () => {
        $scope.filter = {};
        $scope.filter.customer_id = CUSTOMER_ID;
        $scope.filter.user = USER;
        $scope.filter.limit_view = 15;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        setTimeout(() => {
            select2_reset();
        }, 200);
    }
    $scope.getAll = (reload = 0) => {
        if (reload == 0) {
            $scope.pagingInfo.currentPage = 1;
            $scope.pagingInfo.offset = 0;
            $scope.filter.offset = 0;
        }
        $scope.loading = true;
        $http.get(base_url + 'share_beauty/ajax_get_invoice_detail?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.loading = false;
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
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
                $scope.filter.date = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
                $scope.getAll();
            });
        }
    }

    function select2_reset() {
        $('.select2').select2();
    }

    function resetDatePicker() {
        $('input.date-range-picker').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            minYear: 1901,
            maxYear: parseInt(moment().format('YYYY'), 10),
            locale: {
                format: 'DD/MM/YYYY'
            }
        })
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(1);
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
    //end paging
    // $scope.openModel = (id, type) => {
    //     $http.get(base_url + 'share_beauty/ajax_get_partner_detail/' + id).then(r => {
    //         if (r && r.data.status == 1) {
    //             $scope.detail = r.data.data;

    //             $scope.detail.files = (r.data.data.files) ? r.data.data.files : [];

    //             delete $scope.detail.password;
    //             $scope.getDistict(r.data.data.province_id);


    //             $('#detailModal').modal('show');
    //             setTimeout(() => {
    //                 $('.select2').select2();
    //                 resetDatePicker();
    //             }, 200);
    //         } else toastr["error"](r.data.message);
    //     })
    // }
    // $scope.setDefaultBonus = () => {
    //     $http.get(base_url + 'share_beauty/ajax_set_default_bonus/' + $scope.detail.customer_id).then(r => {
    //         if (r && r.data.status == 1) {
    //             $scope.detail = r.data.data;
    //         } else toastr["error"](r.data.message);
    //     })
    // }
    // $scope.invoicesDetail = (customer_id) => {
    //     $http.get(base_url + 'share_beauty/ajax_get_invoice_detail/' + customer_id).then(r => {
    //         if (r && r.data.status == 1) {
    //             $scope.invoice_detail = r.data.data;
    //         } else toastr["error"](r.data.message);
    //     })
    // }
});