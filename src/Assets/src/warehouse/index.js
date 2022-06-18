app.controller('whCtl', function ($scope, $http) {
    $scope.init = () => {
        $scope.filter = {};
        $scope.getWarehouses();
        $scope.warehouse_type = [
            { key: '', value: '' },
            { key: 'BRANCH', value: 'Chi nhánh' },
            { key: 'MAIN_BRANCH', value: 'Kho tổng' },
        ]
        $scope.warehouse = {};
        $scope.warehouse.type = 'BRANCH';
        $scope.isChooseStore = true;
        $scope.isFilter = false;

    }

    $scope.handelFilter = () => {
        $scope.isFilter = $scope.filter.type == 'BRANCH' ? true : false;
        $scope.filter.store_id = $scope.filter.type == 'BRANCH' ? $scope.filter.store_id : 0;
    }

    $scope.handelStore = () => {
        $scope.isChooseStore = $scope.warehouse.type == 'BRANCH' ? true : false;
    }

    $scope.getWarehouses = () => {
        $http.get(base_url + '/warehouse/api_get_warehouses?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
        })
    }

    $scope.createOrUpdateWareHouse = ($id) => {
        $query = $id ? '?id=' + $id : '';
        if ($scope.warehouse.type != 'MAIN_BRANCH' && $scope.warehouse.store_id) {
            $scope.warehouse.store_id = $scope.warehouse.type == 'MAIN_BRANCH' ? 0 : $scope.warehouse.store_id;
            $http.post(base_url + '/warehouse/api_created_warehouses' + $query, $scope.warehouse).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"]("Cập nhật thành công!");
                    $scope.getWarehouses();
                } else {
                    toastr["error"]("Đã có lổi xẩy ra!. Vui lòng thử lại.");
                }
            })
            $('#addWH').modal('hide');
        }

    }

    $scope.editWarehosue = ($id) => {
        if ($id) {
            $http.get(base_url + '/warehouse/ajax_get_warehouses_by_id?id=' + $id).then(r => {
                $scope.warehouse = r.data.data;
                $scope.warehouse.active = Number($scope.warehouse.active);
                $scope.titleModal = 'Sửa thông tin kho';
                $scope.warehouse.store_id = $scope.warehouse.store_id;
                $scope.handelStore();
                $('#addWH').modal('show');
            })
        } else {
            $('#addWH').modal('show');
            $scope.titleModal = 'Tạo kho';
            $scope.warehouse = {
                active: 1
            }
        }
    }
});