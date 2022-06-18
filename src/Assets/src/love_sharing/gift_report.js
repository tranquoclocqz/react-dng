app.controller('gift_report', function ($scope, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.base_url = base_url;
        $scope.objectGeneration();

    }
    $scope.objectGeneration = () => {
        $scope.filter = {};

        $scope.filter.gift_id = '0';
        $scope.filter.store_id = '0';
        $scope.filter.group_id = '0';
        $scope.select2();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.get_data();
        }, 10);
    }
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({ selectionTitleAttribute: false });
        }, 50);
    }
    $scope.get_data = () => {
        $http.get(base_url + 'love_sharing/ajax_get_gift_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.data = r.data.data;
                $scope.data_count = r.data.data_count;
                angular.forEach($scope.data, function (value, key) {
                    value.total = (value.total) ? value.total : 0;
                    value.total_use = (value.total_use) ? value.total_use : 0;
                });
            }
        })
    }

    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(6, 'days'),
            endDate: moment(),
            // maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            ranges: {
                'Hôm nay': [moment(), moment()],
                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1,
                    'days')],
                '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                'Tháng trước': [moment().subtract(1, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
                ]
            },
            locale: {
                format: 'DD/MM/YYYY',
            }
        });

    }
});