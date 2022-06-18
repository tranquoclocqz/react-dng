app.controller('settingCashCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.getGroups();
        $scope.rows = [];
        $scope.group = {
            active: 1
        }
    };

    $scope.getGroups = () => {
        $http.get(base_url + '/ketoan/cashbooks/setting_cashbook?filter=1').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data;
            }
        })
    }

    $scope.openModal = (item = 0) => {
        if (item) {
            if (item.main_group_confirm_id && item.main_group_confirm_id.length > 0) {
                angular.forEach(item.main_group_confirm_id, function (value, key) {
                    item.main_group_confirm_id[key] = String(value);
                });
            }
            if (item.user_confirm_id && item.user_confirm_id.length > 0) {
                angular.forEach(item.user_confirm_id, function (value, key) {
                    item.user_confirm_id[key] = String(value);
                });
            }
            if (item.user_re_confirm_id && item.user_re_confirm_id.length > 0) {
                angular.forEach(item.user_re_confirm_id, function (value, key) {
                    item.user_re_confirm_id[key] = String(value);
                });
            }
            $scope.group = item;
            $scope.group.active = Number(item.active);
        } else {
            $scope.group = {
                active: 1,
                cashbook_type: 'expenditures',
                type: '0',
                quota_per_month: 0,
                link_function_type: '0',
                main_group_confirm_id: [],
                user_confirm_id: [],
                user_re_confirm_id: [],
            }
        }
        setTimeout(() => {
            $('.select2').select2({
                selectionTitleAttribute: false
            });
        }, 100);
        $('#addGR').modal('show');
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
    }

    $scope.addOrUpdate = () => {
        console.log($scope.group);
        $http.post(base_url + '/ketoan/cashbooks/ajax_create_update_cashbook_group', $scope.group).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']($scope.group.id ? 'Cập nhật thành công' : 'Tạo thành công!');
                $scope.getGroups();
                $('#addGR').modal('hide');
            } else toastr['success']('Có lỗi xẩy ra. Vui lòng thử lại!')
        })
    }
})