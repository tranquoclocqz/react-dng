app.controller('permissions', function ($scope, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.list-permission-tb').css('opacity', '1');
        $scope.permission_details = [];
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.get_list_permission();
    }

    $scope.get_list_permission = () => {
        $http.post(base_url + '/permission/ajax_get_list_permission?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.permissions = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.change_active_permission = (item) => {
        let data = {
            id: item.id,
            active: item.active == 1 ? 0 : 1,
        }
        $http.post(base_url + 'permission/ajax_change_active_permission', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra. Vui lòng thử lại sau!");
        });
    }

    $scope.btn_add_permission = (view) => {
        $scope.view = view;
        $scope.permission = {};
        $scope.permission_details = [];
        $scope.errorPermissionName = 0;
        $scope.errorPermissionURL = 0;
        $scope.errorPermissionNote = 0;
        $('#modalPermission').modal('show');
    }

    $scope.add_permission_detail = () => {
        $scope.permission_details.push({
            name: '',
            code: '',
            note: '',
            active: "1"
        });
    }

    $scope.savePermission = () => {
        if (!$scope.permission.name) {
            $scope.errorPermissionName = 1;
            return false;
        } else {
            $scope.errorPermissionName = 0;
        }

        if (!$scope.permission.url) {
            $scope.errorPermissionURL = 1;
            return false;
        } else {
            $scope.errorPermissionURL = 0;
        }

        if (!$scope.permission.note) {
            $scope.errorPermissionNote = 1;
            return false;
        } else {
            $scope.errorPermissionNote = 0;
        }

        var errorValidate = 0;
        $scope.permission_details.forEach((val, key) => {
            if ((!val.name && val.code) || (val.name && !val.code)) {
                if (!val.name) {
                    $('.errorPermissionDetailName_' + key).addClass('has-error');
                    $('.errorPermissionDetailNameText_' + key).css('display', 'block');
                }

                if (!val.code) {
                    $('.errorPermissionDetailCode_' + key).addClass('has-error');
                    $('.errorPermissionDetailCodeText_' + key).css('display', 'block');
                }
                errorValidate = 1;
            } else {
                $('.errorPermissionDetailName_' + key).removeClass('has-error');
                $('.errorPermissionDetailCode_' + key).removeClass('has-error');
                $('.errorPermissionDetailNameText_' + key).css('display', 'none');
                $('.errorPermissionDetailCodeText_' + key).css('display', 'none');
            }
        });
        if (errorValidate == 1) {
            return false;
        }

        let data = {
            permission: $scope.permission,
            permission_details: $scope.permission_details,
        }
        $http.post(base_url + 'permission/ajax_add_permission', data).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", r.data.message, "success");
                $('#modalPermission').modal('hide');
                $scope.get_list_permission();
            } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
        });
    }

    $scope.showModalEditPermission = (item, view) => {
        $scope.view = view;
        $scope.permission = angular.copy(item);
        $scope.permission_details = {};
        $http.get(base_url + '/permission/ajax_get_list_permission_details?permission_id=' + item.id).then(r => {
            if (r.data.status == 1) {
                $scope.permission_details = r.data.data;
            }
        });
        $scope.errorPermissionName = 0;
        $scope.errorPermissionURL = 0;
        $scope.errorPermissionNote = 0;
        $('#modalPermission').modal('show');
    }

    $scope.updatePermission = () => {
        if (!$scope.permission.name) {
            $scope.errorPermissionName = 1;
            return false;
        } else {
            $scope.errorPermissionName = 0;
        }

        if (!$scope.permission.url) {
            $scope.errorPermissionURL = 1;
            return false;
        } else {
            $scope.errorPermissionURL = 0;
        }

        if (!$scope.permission.note) {
            $scope.errorPermissionNote = 1;
            return false;
        } else {
            $scope.errorPermissionNote = 0;
        }

        var errorValidate = 0;
        $scope.permission_details.forEach((val, key) => {
            if (((!val.name && val.code) || (val.name && !val.code)) || (val.id && (!val.name || !val.code))) {
                if (!val.name) {
                    $('.errorPermissionDetailName_' + key).addClass('has-error');
                    $('.errorPermissionDetailNameText_' + key).css('display', 'block');
                }

                if (!val.code) {
                    $('.errorPermissionDetailCode_' + key).addClass('has-error');
                    $('.errorPermissionDetailCodeText_' + key).css('display', 'block');
                }
                errorValidate = 1;
            } else {
                $('.errorPermissionDetailName_' + key).removeClass('has-error');
                $('.errorPermissionDetailCode_' + key).removeClass('has-error');
                $('.errorPermissionDetailNameText_' + key).css('display', 'none');
                $('.errorPermissionDetailCodeText_' + key).css('display', 'none');
            }
        });
        if (errorValidate == 1) {
            return false;
        }

        let data = {
            permission: $scope.permission,
            permission_details: $scope.permission_details,
        }
        $http.post(base_url + 'permission/ajax_update_permission', data).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", r.data.message, "success");
                $('#modalPermission').modal('hide');
                $scope.get_list_permission();
            } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
        });
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.get_list_permission();
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