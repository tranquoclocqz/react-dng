app.controller('data_commitment_report', function ($scope, $http, $sce, $compile) {
    $scope.init = () => {
        $scope.filter = {
            all: true
        };
        $scope.filter2 = {
            all: false
        };
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll(true);
        }, 10);
    }
    $scope.getAll = (first = false) => {
        $http.get('marketings/get_data_commitment_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            if (first) $scope.get_by_date();
        })
    }
    function split_date(date) {
        var date = date.split('-');
        $scope.fromDate = date[0].trim().slice(0, 5);
        $scope.toDate = date[1].trim().slice(0, 5);
    }
    $scope.get_by_date = () => {
        split_date($scope.filter2.date);
        $http.get('marketings/get_data_commitment_report?filter=' + JSON.stringify($scope.filter2)).then(r => {
            angular.forEach($scope.rows, function (value, key) {
                r.data.data.forEach(element => {
                    if (value.id == element.id) value.phone_by_date = element.phone;
                });
            });
        })
    }
    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().startOf('month'),
            endDate: moment(),
            maxDate: moment(),
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
        $('.custom-daterange2').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment(),
            endDate: moment(),
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
})