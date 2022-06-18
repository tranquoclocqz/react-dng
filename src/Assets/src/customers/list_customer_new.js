app.controller('customerNewCtrl', function ($scope, $http, $sce) {

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
        $scope.rows = [];
        $scope.getGroups();
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.filter.currentPage = 1;
        $scope.getAll();
    }

    $scope.getAll = () => {
        $http.get(base_url + '/customers/ajax_get_all_customer_new?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.formatDate = (date, fm) => {
        return moment(date).format(fm);
    }

    $scope.openModal = (item) => {
        $scope.item = {};
        if (item) {
            $scope.customer = angular.copy(item);
            $scope.customer.name = item.name;
            $scope.customer.birthday = $scope.formatDate(item.birthday, 'DD-MM-YYYY');
        }
        select2();
        $('#customerModal').modal('show');
    }

    $scope.editCustomer = () => {
        $scope.loading = true;
        console.log($scope.customer);
        $http.post(base_url + "/customers/ajax_edit_customer", $scope.customer).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Cập nhật thành công');
                $('#customerModal').modal('hide');
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
            $scope.loading = false;
        })
    }

    $scope.getGroups = () => {
        $http.get(base_url + '/customers/ajax_get_list_groups').then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.showImg = (url) => {
        $scope.currentImageUrl = base_url + url;
        $('#image').modal('show');
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
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