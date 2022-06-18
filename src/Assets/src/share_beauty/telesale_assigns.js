app.controller('telesale_assigns', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.object_generating();
        $scope.get_assign_list();
    }

    function select2_reset() {
        $('.select2').select2();
    }
    $scope.object_generating = () => {
        $scope.filter = {};
        $scope.filter.consultant = '0';
        $scope.filter.sort = 'newest';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.limit_view = 15;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }
    $scope.get_assign_list = () => {
        $http.get(base_url + 'share_beauty/ajax_get_assign_list?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.assign_list = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                setTimeout(() => {
                    select2_reset();
                }, 100);
                // $scope.pagingInfo.total = r.data.count;
                // $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.set_sb_telesale_partners = (data) => {
        $http.post(base_url + 'share_beauty/api_set_telesale_partners', data).then(r => {
            if (r && r.data.status == 1) { } else toastr["error"](r.data.message);
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
        $scope.get_assign_list();
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