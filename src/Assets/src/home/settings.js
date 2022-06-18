app.controller('settingsCtrl', function ($scope, $http, $sce, $window) {
    $scope.groups = GROUPS;
    $scope.init = () => {
        $scope.get_home_tabs();
    }
    $scope.get_home_tabs = () => {
        $http.get(base_url + 'home/get_home_tabs').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.home_tabs = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.openHometag = (item) => {
        $scope.detailHt = item;
        $scope.checkItem();
        $('#htDetail').modal('show');
    }
    $scope.checkItem = () => {
        if ($scope.detailHt.group_accepted.length > 0) {
            angular.forEach($scope.groups, function (value, key) {
                if ($scope.detailHt.group_accepted.indexOf(parseInt(value.id)) >= 0) $scope.groups[key].checked = true;
                else $scope.groups[key].checked = false;
            });
        } else {
            angular.forEach($scope.groups, function (value, key) {
                $scope.groups[key].checked = false;
            });
        }
    }
    $scope.updateRoleHomeTab = () => {
        let data = {};

        data.tab_id = $scope.detailHt.id;
        data.group_ids = [];
        angular.forEach($scope.groups, function (value, key) {
            if (value.checked) data.group_ids.push(parseInt(value.id));
        });
        $http.post(base_url + 'home/update_hometab_role', data).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"](r.data.messages);
                $scope.get_home_tabs();
                $('#htDetail').modal('hide');
            } else toastr["error"](r.data.messages);
        })

    }
})