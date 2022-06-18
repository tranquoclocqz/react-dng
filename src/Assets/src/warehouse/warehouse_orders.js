app.controller('warehouseOrderCtrl', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        console.log(1);
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.loading = false;
        $scope.loadDataInit();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.handleFilter();
        }, 10);
    }
    $scope.loadDataInit = () => {
        $http.get('partner/ajax_get_suppliers').then(r => {
            $scope.loadingPage = false;
            if (r.data && r.data.status == 1) {
                $scope.providers = r.data.data.rows;
            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        })
    };
    $scope.getTypeClass = (type) => {
        if (type == 'retail') return 'label label-primary';
        if (type == 'profession') return 'label label-success';
    }
    $scope.getStatusClass = (status) => {
        if (status == 1) return 'label label-primary';
        if (status == 2) return 'label label-danger';
        if (status == 3) return 'label label-success';
        if (status == 4) return 'label label-danger';
        return 'label label-default';
    }

    function convertDateFormat(date) {
        // date = 2021-03-20 return 20-03-2021
        // date = 20-03-2021 return 2021-03-20
        var dateOrgParts = (date + '').split("-");
        return dateOrgParts[2] + "-" + dateOrgParts[1] + "-" + dateOrgParts[0];
    }
    $scope.confirm = (val) => {
        window.open(HOST_URL + '/app/warehouse/order_detail/' + val.id);
    }

    $scope.formatDate = (date, type) => {
        return moment(date).format(type);
    }

    $scope.handleFilter = () => {
        $scope.filter.offset = 0;
        if ($scope.filter.date) {
            var date = $scope.filter.date.split('-');
            var fromDate = date[0].replaceAll('/', '-').replaceAll(' ', '');
            var toDate = date[1].replaceAll('/', '-').replaceAll(' ', '');

            $scope.filter.from_date = convertDateFormat(fromDate);
            $scope.filter.to_date = convertDateFormat(toDate);
        } else {
            $scope.filter.from_date = '';
            $scope.filter.to_date = '';
        }
        $scope.getAll();
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


    $scope.changeProvider = (item) => {
        let rq = {
            'id': item.id,
            'provider_id': item.provider_id
        };
        $http.post(base_url + 'warehouse/update_order_provider', rq).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Cập nhật thành công!');
            } else toastr["error"](r.data.messages);
        })
    }

    $scope.getAll = () => {
        $scope.loadingPage = true;
        $http.get('warehouse/get_list_order?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loadingPage = false;
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data.rows;
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loading = false;
        })
    }

    $scope.exportExcel = () => {

        if ($scope.filter.date) {
            var date = $scope.filter.date.split('-');
            var fromDate = date[0].replaceAll('/', '-').replaceAll(' ', '');
            var toDate = date[1].replaceAll('/', '-').replaceAll(' ', '');

            $scope.filter.from_date = convertDateFormat(fromDate);
            $scope.filter.to_date = convertDateFormat(toDate);
        } else {
            $scope.filter.from_date = '';
            $scope.filter.to_date = '';
        }

        window.open(HOST_URL + '/app/warehouse/excelOrders?' + $.param($scope.filter));
    }

    $scope.createTran = (id) => {
        window.open('warehouse/warehouse_order_detail/' + id);
    }


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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
})