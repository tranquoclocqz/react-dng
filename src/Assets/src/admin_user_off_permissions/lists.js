app.controller('offPermissions', function ($scope, $http, AdminUserOffPermissionSvc) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.list-off-permission-tb').css('opacity', '1');
        $scope.filter = {};
        $scope.filter.user_type = 'user';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.list_all_user = list_all_user;
        $scope.all_groups = all_groups;
        $scope.all_companies = all_companies;
        $scope.ajax_get_list_admin_user_off_permissions();
    }

    $scope.ajax_get_list_admin_user_off_permissions = () => {
        AdminUserOffPermissionSvc.getListRequestSalaryPermissions($scope.filter).then(r => {
            $scope.permissions = r.data;
            $scope.pagingInfo.total = r.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.btn_add_permission = (view) => {
        $scope.view = view;
        $scope.permission = {};
        $scope.permission.user_type = '';
        $scope.permission.user_id = '';
        $scope.permission.target_type = '';
        $scope.permission.target_ids = [];
        $scope.permission.active = '1';

        $scope.errorType = 0;
        $scope.errorUserType = 0;
        $scope.errorUserId = 0;
        $scope.errorTargetType = 0;
        $scope.errorTargetIds = 0;
        $scope.errorCompany = 0;
        select2();
        $('#modalPermission').modal('show');
    }

    $scope.change_active_salary_permission = (permission) => {
        $scope.permission.active = permission.active = 1 ? 0 : 1;
    }

    $scope.changeUserType = () => {
        $scope.permission.user_id = '';
        select2();
    }

    $scope.changeTargetType = () => {
        $scope.permission.target_ids = [];
        $scope.checkedAll = false;
        select2();
    }

    $scope.savePermission = () => {

        if (!$scope.permission.type) {
            $scope.errorType = 1;
            return false;
        } else {
            $scope.errorType = 0;
        }

        if (!$scope.permission.user_type) {
            $scope.errorUserType = 1;
            return false;
        } else {
            $scope.errorUserType = 0;
        }

        if (!$scope.permission.user_id) {
            $scope.errorUserId = 1;
            return false;
        } else {
            $scope.errorUserId = 0;
        }

        if (!$scope.permission.target_type) {
            $scope.errorTargetType = 1;
            return false;
        } else {
            $scope.errorTargetType = 0;
        }

        if ($scope.permission.target_ids.length == 0) {
            $scope.errorTargetIds = 1;
            return false;
        } else {
            $scope.errorTargetIds = 0;
        }

        if (!$scope.permission.company_id) {
            $scope.errorCompany = 1;
            return false;
        } else {
            $scope.errorCompany = 0;
        }

        $scope.permission.target_ids.forEach(e => {
            if (e == 'all') {
                var target_ids = [];
                if ($scope.permission.target_type == 'user') {
                    $scope.list_user_company.forEach(item => {
                        target_ids.push(item.id);
                    });
                } else {
                    $scope.all_groups.forEach(item => {
                        target_ids.push(item.id);
                    });
                }
                $scope.permission.target_ids = target_ids;
                return false;
            }
        });

        AdminUserOffPermissionSvc.createRequestSalaryPermissions($scope.permission).then(r => {
            $('#modalPermission').modal('hide');
            $scope.ajax_get_list_admin_user_off_permissions();
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.changeView = (type) => {
        $scope.filter.user_type = type;
        $scope.ajax_get_list_admin_user_off_permissions();
    }

    $scope.showModalEditPermission = (item, view) => {
        $scope.errorType = 0;
        $scope.errorUserType = 0;
        $scope.errorUserId = 0;
        $scope.errorTargetType = 0;
        $scope.errorTargetIds = 0;
        $scope.errorCompany = 0;

        $scope.view = view;
        $scope.permission = angular.copy(item);
        $scope.ChangeCompany();

        if ($scope.permission.target_type == 'user') {
            if ($scope.list_user_company.length == $scope.permission.target_ids.length) {
                $scope.checkedAll = true;
            } else {
                $scope.checkedAll = false;
            }
        } else {
            if ($scope.all_groups.length == $scope.permission.target_ids.length) {
                $scope.checkedAll = true;
            } else {
                $scope.checkedAll = false;
            }
        }

        select2();
        $('#modalPermission').modal('show');
    }

    $scope.setAllTargetIds = () => {
        if ($scope.checkedAll == true) {
            var target_ids = [];
                if ($scope.permission.target_type == 'user') {
                    $scope.list_user_company.forEach(item => {
                        target_ids.push(item.id);
                    });
                } else {
                    $scope.all_groups.forEach(item => {
                        target_ids.push(item.id);
                    });
                }
                $scope.permission.target_ids = target_ids;
        } else {
            $scope.permission.target_ids = [];
        }
        select2();
    }

    $scope.changeTargetIds = () => {
        if ($scope.permission.target_ids) {
            if ($scope.permission.target_type == 'user') {
                if ($scope.list_user_company.length == $scope.permission.target_ids.length) {
                    $scope.checkedAll = true;
                } else {
                    $scope.checkedAll = false;
                }
            } else {
                if ($scope.all_groups.length == $scope.permission.target_ids.length) {
                    $scope.checkedAll = true;
                } else {
                    $scope.checkedAll = false;
                }
            }    
        }
    }

    $scope.change_active_permission_in_list = (item) => {
        let data = {
            id: item.id,
            active: item.active == 1 ? 0 : 1,
        }

        AdminUserOffPermissionSvc.updateActive(data).then(r => {}).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.updatePermission = () => {
        if (!$scope.permission.type) {
            $scope.errorType = 1;
            return false;
        } else {
            $scope.errorType = 0;
        }

        if (!$scope.permission.user_type) {
            $scope.errorUserType = 1;
            return false;
        } else {
            $scope.errorUserType = 0;
        }

        if (!$scope.permission.user_id) {
            $scope.errorUserId = 1;
            return false;
        } else {
            $scope.errorUserId = 0;
        }

        if (!$scope.permission.target_type) {
            $scope.errorTargetType = 1;
            return false;
        } else {
            $scope.errorTargetType = 0;
        }

        if (!$scope.permission.target_ids || $scope.permission.target_ids.length == 0) {
            $scope.errorTargetIds = 1;
            return false;
        } else {
            $scope.errorTargetIds = 0;
        }

        if (!$scope.permission.company_id) {
            $scope.errorCompany = 1;
            return false;
        } else {
            $scope.errorCompany = 0;
        }

        AdminUserOffPermissionSvc.updateRequestSalaryPermissions($scope.permission).then(r => {
            $('#modalPermission').modal('hide');
            $scope.ajax_get_list_admin_user_off_permissions();
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.ChangeCompany = () => {
        AdminUserOffPermissionSvc.getListUserWithCompany($scope.permission.company_id).then(r => {
            $scope.list_user_company = r.data;
        }).catch(e => {
            toastr["error"]("Đã có lỗi xảy ra!!!");
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
        $scope.ajax_get_list_admin_user_off_permissions();
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