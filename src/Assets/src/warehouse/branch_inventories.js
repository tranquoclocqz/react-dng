app.controller('invenCtrl', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 100);
        $scope.loading = false;
        $scope.loadInit();
    }
    $scope.loadInit = () => {
        $http.get('warehouse/get_permit_stocks').then(r => {
            if (r.data.status == 1) {
                $scope.warehouses = r.data.data;
            } else toastr["error"]('Vui lòng thử lại');
        }) 
    }

    $scope.getTypeClass = (type) => {
        if (type == 'retail') return 'label label-primary';
        if (type == 'profession') return 'label label-success';
    }

    $scope.getStatusClass = (status, type) => {
        if (type == 'STATUS') {
            if (status == 1) return 'label label-primary';
            if (status == 2) return 'label label-warning';
            if (status == 2) return 'label label-info';
            if (status == 5) return 'label label-success';
            if (status == 6) return 'label label-danger';
            return 'label label-default';
        }

        if (type == 'BTN') {
            if (status == 1) return 'btn btn-primary btn-sm';
            if (status == 2) return 'btn btn-warning btn-sm';
            if (status == 3) return 'btn btn-info btn-sm';
            if (status == 5) return 'btn btn-success btn-sm';
            if (status == 6) return 'btn btn-danger btn-sm';
            return 'btn btn-default';
        }
    }

    $scope.confirm = (val) => {
        window.open('warehouse/branch_inventory_detail/' + val.id);
    }

    $scope.print = (id) => {
        window.open('warehouse/print_branch_inventories?id=' + id)
    }

    $scope.formatDate = (date, type) => {
        return moment(date).format(type);
    }

    $scope.handleFilter = () => {
        $scope.filter.offset = 0;
        $scope.getAll();
    }

    $scope.getAll = () => {
        // debugger;
        $scope.loading = true;
        $http.get('warehouse/ajax_get_inventory_tmps?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]('Vui lòng thử lại');
        })
    }

    $scope.createTran = () => {
        jQuery('#createTran').modal('show');
        $scope.peg = {};
    }

    $scope.createPeg = async () => {
        $scope.loadingcreate = true;
        $http.post('warehouse/insert_inventory_tmps', $scope.peg).then(r => {
            $scope.loadingcreate = false;
            if (r.data.status == 1) {
                toastr["success"]('Tạo thành công');
                $('#createTran').modal('hide');
                // setTimeout(() => {
                //     window.open(HOST_URL + '/app/warehouse/branch_inventory_detail/' + rs.data.id);
                // }, 500);
                $scope.getAll();
            } else toastr["error"]('Vui lòng thử lại');
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


    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(1, 'days'),
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
})