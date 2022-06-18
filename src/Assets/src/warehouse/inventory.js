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
            $scope.filter.date = '';
        }, 100);
        $scope.getAll();
        $('.box-hide').css('opacity', '1');
        $scope.loading = false;
    }

    $scope.confirm = (val) => {
        window.open(base_url + '/warehouse/inventory_detail/' + val.id);
    }

    $scope.formatDate = (date, type) => {
        return moment(date).format(type);
    }

    $scope.handleFilter = () => {
        $scope.filter.offset = 0;
        if ($scope.filter.date && $scope.filter.date != '') {
            var _date = $scope.filter.date.split(' - '),
                _start = _date[0].split('/'),
                _end = _date[1].split('/');

            $scope.filter.from = _start[2] + '-' + _start[1] + '-' + _start[0];
            $scope.filter.to = _end[2] + '-' + _end[1] + '-' + _end[0];
        }
        $scope.getAll();
    }

    $scope.getAll = () => {
        $http.get(base_url + '/warehouse/ajax_get_inventory_tmps?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }

    $scope.createTran = () => {
        $('#createTran').modal('show');
        $scope.peg = {};
    }

    $scope.createPeg = () => {
        $scope.loading = true;
        $http.post(base_url + '/warehouse/ajax_create_inventory_tmps', $scope.peg).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Tạo phiếu thành công!');
                $('#createTran').modal('hide');
                $scope.getAll();
            } else {
                toastr['error'](r.data.message);
            }
            $scope.loading = false;
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
})