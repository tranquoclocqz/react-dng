app.controller('accountCtrl', function ($scope, $http, $sce) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box1').css('opacity', '1');
        $scope.is_admin = is_admin;
        $scope.is_webmaster = is_webmaster;
        $scope.filter = {};
        $scope.load = 0;
        $scope.plusDomain = [1];
        $scope.filter.down = 1;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.loadding = true;
        $scope.getAll();
    }

    $scope.getAll = () => {
        $scope.loadding = true;
        $scope.listUser = [];
        let sumTask = 0;
        $http.get(base_url + 'cashbooks/get_excel?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.start = r.data.start;
                $scope.nation_id = r.data.nation_id;
                $scope.total_amount = r.data.start_amount;
                $scope.total_visa = r.data.start_transfer;
                $scope.total = parseInt(r.data.start_amount) + parseInt(r.data.start_transfer);
                $scope.total_end = r.data.total;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                select2();
                $scope.loadding = false;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau! ' + r.data.messages);
        });
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.getAll();
    }


    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 300);
    }
    //paging-----------------------------------

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

});