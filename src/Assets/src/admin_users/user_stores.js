app.controller('userStoresCtrl', function ($scope, $http, $sce) {

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
        $scope.filter.active = '1';
        $scope.getAll();
        $scope.rows = [];
        $scope.images = [];
        $scope.user = {};
        $scope.user.images = [];
        $scope.sexs = [{
            id: 1,
            name: 'NAM'
        }, {
            id: 2,
            name: 'NỮ'
        }, {
            id: 3,
            name: 'KHÁC'
        }];
        $scope.status = {
            open: 1
        };
        $scope.positions = [];
        $scope.getGroups();
        $scope.getAllPosition();
        $scope.getStatusUser();
        $scope.view = {
            type: 0,
            id: 0
        }
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.filter.currentPage = 1;
        $scope.getAll();
    }

    $scope.getAll = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_user_stores?filter=' + JSON.stringify($scope.filter)).then(r => {
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
        $scope.item = {};
        if (item) {
            $scope.user = angular.copy(item);
            $scope.user.fullname = item.fullname;
        }
        select2();
        $('#userModal').modal('show');
    }

    $scope.editUser = () => {
        $scope.loading = true;
        $http.post(base_url + "/admin_users/ajax_edit_user", $scope.user).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Cập nhật thành công');
                $('#userModal').modal('hide');
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
            $scope.loading = false;
        })
    }

    $scope.changeView = (val, state) => {
        if (val < $scope.status.open || !state) {
            $scope.status.open = val;
        }
    }

    $scope.getGroups = () => {
        $http.get(base_url + '/admin_users/ajax_get_list_groups').then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStatusUser = () => {
        $http.get(base_url + '/admin_users/ajax_get_status_user?type=2').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.userStatus = r.data.data;
            }
        })
    }

    $scope.getAllPosition = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_positions').then(r => {
            if (r.data.status == 1) {
                $scope.positions = r.data.data;
            }
        });
    }
    $scope.changeNation = () => {
        $http.get(base_url + '/admin_users/ajax_get_provinces?nation_id=' + $scope.user.nation_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.changeProvice = () => {
        $http.get(base_url + '/admin_users/ajax_get_district/?province_id=' + $scope.user.province_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.districts = r.data.data;
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