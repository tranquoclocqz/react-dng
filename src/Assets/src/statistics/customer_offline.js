app.controller('rpCtrl', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.filter = {};
        $scope.start = moment().format('MM-DD-YYYY');
        $scope.end = moment().format('MM-DD-YYYY');
        $scope.getStore();
        $scope.getVouchers();
        $scope.dateInputInit();
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    $scope.getStore = () => {
        $http.get(base_url + '/statistics/ajax_get_store').then(r => {
            $scope.stores = r.data.data;
        })
    }

    $scope.getVouchers = () => {
        $http.get(base_url + '/statistics/ajax_get_voucher').then(r => {
            $scope.vouchers = r.data.data;
        })
    }

    $scope.filter = () => {

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
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                autoUpdateInput: false,
                startDate: start,
                endDate: end,
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
                $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
                $scope.filter.date = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
            });

        }
    }
});