app.controller('log_settings', function ($scope, $http, $compile, $filter) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 10,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.base_url = base_url;
        $scope.objectGeneration();
        $scope.check_all = 1;
        $scope.filter.type_log = '0';
        $scope.filter.name_api = '0';
        $scope.filter.log_type = '0';
        $scope.get_list_api();
        setTimeout(() => {
            $scope.list_api = angular.copy($scope.list_apis);
            $scope.dateInputInit();
            $scope.group_by_file();
            $scope.get_list_log_type();
            $scope.getAll();
        }, 10);
    }

    $scope.get_list_by_type = () => {
        $scope.getAll();
        $scope.get_list_api_by_filter();
    }

    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.user_id = '-1';
        $scope.filter.transType = '0';
        $scope.filter.store_id = '0';
        $scope.filter.group_id = '0';
        $scope.filter.unit = '-1';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.heartSend = {};
        $scope.heartSend.unitType = '0';
        $scope.heartSend.unit_id = '0';
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({ nameselectionTitleAttribute: false });
        }, 50);
    }
    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }

        $http.get(base_url + '/options/get_list_log?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            // console.log(r.data);
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);


        })
    }
    // paging
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

    $scope.get_list_log_type = () => {
        $http.get(base_url + '/options/get_list_log_type').then(r => {
            if (r && r.data.status == 1) {
                $scope.list_type = r.data.data;
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }
    $scope.get_list_log = () => {
        $http.get(base_url + '/options/get_list_log').then(r => {
            if (r && r.data.status == 1) {
                $scope.rows = r.data.data;
                // console.log(r.data);
                // toastr["success"]($scope.rs.messeger);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.group_by_file = () => {
        $http.get(base_url + '/options/group_by_file').then(r => {
            if (r && r.data.status == 1) {
                $scope.group_by_fi = r.data.data;
                console.log(r.data);
                // toastr["success"]($scope.rs.messeger);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.get_list_api = () => {
        $http.get(base_url + '/options/get_list_api').then(r => {
            if (r && r.data.status == 1) {
                $scope.list_apis = r.data.data;
                console.log(r.data);
                // toastr["success"]($scope.rs.messeger);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }
    $scope.get_list_api_by_filter = () => {

        $http.get(base_url + '/options/get_list_api_by_filter?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.list_api = r.data.data;
                console.log(r.data);
                // toastr["success"]($scope.rs.messeger);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.update_stores_active = (data = 0) => {
        if (data == 0)
            $scope.check_all = $scope.check_all == 0 ? '1' : '0';
        event.preventDefault();
        console.log(data);
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