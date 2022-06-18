app.controller('btCtrl', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 100,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.isShow = false;
        $scope.start_date = start_date;
        $scope.skin_id = skin_id;
        $scope.filter = {
            end_date: moment(end_date).format('YYYY-MM-DD'),
            start_date: moment(start_date).format('YYYY-MM-DD'),
            skin_id: skin_id
        };
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.loading = false;
    }

    $scope.openInvoice = () => {
        $scope.isShow = !$scope.isShow;
        if ($scope.isShow) {
            $scope.loading = true;
            getInvoice();
            $scope.pagingInfo.offset = 0;
            $scope.pagingInfo.currentPage = 1;
            $scope.filter.offset = $scope.pagingInfo.offset;
        }
    }

    function getInvoice() {
        $http.get(base_url + '/staffs/ajax_get_invoice?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $scope.loading = false;
            }
        })
    }

    $scope.dateFormat = (d, f) => {
        return moment(d).format(f);
    }

    //paging-----------------------------------

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        getInvoice();
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
});