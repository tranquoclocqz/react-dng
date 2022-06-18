app.controller('statisticsCustomerCtrl', function ($scope, $http, $sce, $window) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.rows = {};
        $scope.reports = {};
        $scope.all_nations = all_nations;
        $scope.all_stores = all_stores;
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.date = '';
        $scope.filter.nation_id = '1';
        $scope.filter.sale_care = '0';
        $scope.getStatisticsCustomer();
    }

    $scope.getStatisticsCustomer = (is_go_page = false) => {
        $scope.loadPage = true
        if ($scope.filter.date && $scope.filter.date != '') {
            let date = $scope.filter.date.split('-');
            $scope.filter.from = moment(date[0]).format('YYYY-MM-DD');
            $scope.filter.to = moment(date[1]).format('YYYY-MM-DD');
        }

        if (!is_go_page) { // nếu không phải gọi từ hàm chuyển trang thì set lại limit trang 1
            $scope.pagingInfo = {
                itemsPerPage: 30,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };

            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = 0;
        }

        $http.post(base_url + '/statistics/ajax_get_statistics_customer?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.reports = r.data.reports;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            $scope.loadPage = false;
        });
    }

    $scope.exportExcel = () => {
        $scope.filter.is_excel = true;
        window.open(base_url + '/statistics/ajax_get_statistics_customer?filter=' + JSON.stringify($scope.filter));
        $scope.filter.is_excel = false;
        return;
    }

    $scope.dateFormat = (date, fm) => {
        return moment(date).format(fm);
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getStatisticsCustomer(true);
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

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
});