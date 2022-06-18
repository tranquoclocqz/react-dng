app.controller('permission_groups', function ($scope, $http) {
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
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.list_permissions = [];
        $scope.get_list_permission_groups();
        $scope.ajax_get_list_permissions();
    }

    $scope.get_list_permission_groups = () => {
        $http.post(base_url + '/permission_groups/ajax_get_list_permission_groups?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.permission_groups = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.ajax_get_list_permissions = () => {
        $http.get(base_url + '/permission_groups/ajax_get_list_permissions').then(r => {
            if (r.data.status == 1) {
                $scope.list_permissions = r.data.data;
            }
        });
    }

    $scope.change_active_permission_groups = (item) => {
        let data = {
            id: item.id,
            active: item.active == 1 ? 0 : 1,
        }
        $http.post(base_url + 'permission_groups/ajax_change_active_permission_groups', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra. Vui lòng thử lại sau!");
        });
    }

    $scope.btn_add_permission_groups = (view) => {
        $scope.view = view;
        $scope.permission_group = {};
        $scope.errorPermissionGroupName = 0;
        $scope.errorPermissionGroupType = 0;
        $scope.errorPermissionGroupNote = 0;
        $scope.permissions = angular.copy($scope.list_permissions);
        select2();
        $('#modalPermissionGroup').modal('show');
    }

    $scope.savePermissionGroup = () => {
        if (!$scope.permission_group.name) {
            $scope.errorPermissionGroupName = 1;
            return false;
        } else {
            $scope.errorPermissionGroupName = 0;
        }

        if (!$scope.permission_group.type) {
            $scope.errorPermissionGroupType = 1;
            return false;
        } else {
            $scope.errorPermissionGroupType = 0;
        }

        if (!$scope.permission_group.note) {
            $scope.errorPermissionGroupNote = 1;
            return false;
        } else {
            $scope.errorPermissionGroupNote = 0;
        }

        var permission_detail_ids = [];
        $scope.permissions.forEach(p => {
            p.permission_details.forEach(pd => {
                if (pd.checked && pd.checked == '1') {
                    permission_detail_ids.push(pd.id);
                }
            });
        });

        let data = {
            permission_group: $scope.permission_group,
            permission_detail_ids: permission_detail_ids
        }

        $http.post(base_url + 'permission_groups/ajax_add_permission_groups', data).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", r.data.message, "success");
                $('#modalPermissionGroup').modal('hide');
                $scope.get_list_permission_groups();
            } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
        });
    }

    $scope.showModalEditPermissionGroups = (item, view) => {
        $scope.view = view;
        $scope.permission_group = angular.copy(item);
        $scope.permissions = angular.copy($scope.list_permissions);
        $http.get(base_url + '/permission_groups/ajax_get_list_permission_group_details?permission_group_id=' + item.id).then(r => {
            if (r.data.status == 1) {
                var permission_detail_ids = r.data.data;
                $scope.permissions.forEach((p, k) => {
                    p.permission_details.forEach((pd, key) => {
                        if (jQuery.inArray(pd.id, permission_detail_ids) !== -1) {
                            p.permission_details[key].checked = '1';
                        }
                    });
                });
            }
        });

        $scope.errorPermissionGroupName = 0;
        $scope.errorPermissionGroupType = 0;
        $scope.errorPermissionGroupNote = 0;
        select2();
        $('#modalPermissionGroup').modal('show');
    }

    $scope.updatePermissionGroup = () => {
        if (!$scope.permission_group.name) {
            $scope.errorPermissionGroupName = 1;
            return false;
        } else {
            $scope.errorPermissionGroupName = 0;
        }

        if (!$scope.permission_group.type) {
            $scope.errorPermissionGroupType = 1;
            return false;
        } else {
            $scope.errorPermissionGroupType = 0;
        }

        if (!$scope.permission_group.note) {
            $scope.errorPermissionGroupNote = 1;
            return false;
        } else {
            $scope.errorPermissionGroupNote = 0;
        }


        var permission_detail_ids = [];
        $scope.permissions.forEach(p => {
            p.permission_details.forEach(pd => {
                if (pd.checked && pd.checked == '1') {
                    permission_detail_ids.push(pd.id);
                }
            });
        });

        let data = {
            permission_group: $scope.permission_group,
            permission_detail_ids: permission_detail_ids
        }

        $http.post(base_url + 'permission_groups/ajax_update_permission_groups', data).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", r.data.message, "success");
                $('#modalPermissionGroup').modal('hide');
                $scope.get_list_permission_groups();
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
        $scope.get_list_permission_groups();
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