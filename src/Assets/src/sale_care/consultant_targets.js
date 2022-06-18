app.controller('consultant_targets', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.current_user_id = CURRENT_USER_ID;
    $scope.init = () => {
        $scope.filter_init();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
    }
    $scope.filter_init = () => {
        $scope.filter = {};
        $scope.filter.type = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    function resetNewTarget() {
        $scope.newTarget = {};
        $scope.newTarget.type = 'personal';
        $scope.newTarget.date = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
    }
    $scope.confirmModalAction = () => {
        $scope.create_loading = true;
        data = angular.copy($scope.newTarget);
        $http.post('sale_care/ajax_create_consultant_target', data).then(r => {
            $scope.create_loading = false;
            if (r && r.data.status == 1) {
                $scope.getAll();
                resetNewTarget();
                $('#createModal').modal('hide');
            } else toastr["error"](r.data.message);
        })

    }

    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $scope.loading = true;
        $http.get(base_url + 'sale_care/ajax_get_consultant_targets?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loading = false;
            if (r && r.data.status == 1) {
                $scope.rows = r.data.data.data;
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
            }
        })
    }

    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month'),
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
    $scope.createTarget = () => {
        resetNewTarget();
        $('#createModal').modal('show');
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(false);
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
    // end paging
})