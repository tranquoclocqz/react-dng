app.controller('nhansu_add', function ($scope, $http) {
    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.nation = '1';
        $scope.getProvince();
        $scope.getDistrict();
    }

    $scope.changeNation = () => {
        $scope.getProvince();

    }
    $scope.changeProvice = () => {
        $scope.getDistrict();
    }
    $scope.getProvince = () => {
        $scope.waitmailload = false;
        $http.get(base_url + '/nhansu/admin_users/ajax_get_provinces/?filter=' + JSON.stringify($scope.filter.nation)).then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
                if (r.data.data.length > 0) {
                    setTimeout(() => {
                        $('#provinces').select2('val', r.data.data[0]['id']);
                    }, 10);
                } else {
                    setTimeout(() => {
                        $('#provinces').select2('val', '');
                    }, 10);
                }


            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getDistrict = () => {
        $scope.waitmailload = false;
        $http.get(base_url + '/nhansu/admin_users/ajax_get_district/?filter=' + JSON.stringify($scope.filter.province)).then(r => {
            if (r && r.data.status == 1) {
                $scope.districts = r.data.data;
                if (r.data.data.length > 0) {
                    setTimeout(() => {
                        $('#districts').select2('val', r.data.data[0]['id']);
                    }, 10)
                } else {
                    setTimeout(() => {
                        $('#districts').select2('val', '');
                    }, 10)
                }

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


});
