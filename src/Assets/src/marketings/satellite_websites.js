
app.controller('siteCtrl', function ($scope, $http, $sce) {

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
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();

    }

    $scope.getAll = () => {
        $http.get(base_url + '/marketings/ajax_get_satellite_websites?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openModal = (item) => {
        $scope.satellite = {};
        if (item) {
            $scope.satellite = angular.copy(item);
        }
        // select2();
        $('#satelliteModal').modal('show');
    }

    $scope.addSatellite = () => {
        $scope.loading = true;
        $http.post(base_url + "/marketings/ajax_add_satellite", $scope.satellite).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']($scope.satellite.id ? 'Cập nhật thành công' : 'Tạo thành công!');
                $('#satelliteModal').modal('hide');
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
            $scope.loading = false;
        })
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.getAll();
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