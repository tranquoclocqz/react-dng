app.controller('consultant_target_settings', function ($scope, $http, $sce, $compile) {
    $scope.current_user_id = CURRENT_USER_ID;
    $scope.target_id = ID;
    $scope.init = () => {
        $scope.filter_init();
        $scope.getAll();
        $scope.defaultTotal = 100;
    }
    $scope.filter_init = () => {
        $scope.filter = {};
        $scope.filter.id = $scope.target_id;
    }
    $scope.getAll = () => {
        $scope.loading = true;
        $http.get('sale_care/ajax_get_consultant_target_details?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loading = false;
            if (r && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.rows.data.forEach(element => {
                    element.phone_number = parseInt(element.phone_number, 10);
                    element.appointment = parseInt(element.appointment, 10);
                    element.arrived_appoitment = parseInt(element.arrived_appoitment, 10);
                    element.failed_appoitment = parseInt(element.failed_appoitment, 10);
                    element.invoice = parseInt(element.invoice, 10);
                });
            }
        })
    }

    $scope.confirmDfault = () => {
        $scope.rows.data.forEach(element => {
            element.phone_number = parseInt($scope.defaultTotal, 10);
            element.appointment = parseInt($scope.defaultTotal, 10);
            element.arrived_appoitment = parseInt($scope.defaultTotal, 10);
            element.failed_appoitment = parseInt($scope.defaultTotal, 10);
            element.invoice = parseInt($scope.defaultTotal, 10);
        });
        $('#defaultValueModal').modal('hide');
    }

    $scope.confirmRemove = () => {
        $http.post('sale_care/ajax_remove_consultant_target/' + $scope.rows.id).then(r => {
            $scope.loading = false;
            if (r && r.data.status == 1) {
                window.location.replace("sale_care/consultant_targets");
            }
        })
    }

    $scope.saveTarget = () => {
        $scope.confirm_messages = false;
        $scope.rows.data.forEach(element => {
            if (
                !element.phone_number || element.phone_number == 0 ||
                !element.appointment || element.appointment == 0 ||
                !element.arrived_appoitment || element.arrived_appoitment == 0 ||
                !element.failed_appoitment || element.failed_appoitment == 0 ||
                !element.invoice || element.invoice == 0
            ) $scope.confirm_messages = 'Data chưa đầy đủ bạn có chắc chắn muốn lưu';
        });
        if ($scope.confirm_messages) {
            $('#confirmModal').modal('show');
            return false;
        }
        $scope.confirmSave();
    }
    $scope.confirmSave = () => {
        let data = [];
        $scope.rows.data.forEach(element => {
            if (!element.phone_number) element.phone_number = 0;
            if (!element.appointment) element.appointment = 0;
            if (!element.arrived_appoitment) element.arrived_appoitment = 0;
            if (!element.failed_appoitment) element.failed_appoitment = 0;
            if (!element.invoice) element.invoice = 0;
            temp = {
                id: element.id,
                phone_number: element.phone_number,
                appointment: element.appointment,
                arrived_appoitment: element.arrived_appoitment,
                failed_appoitment: element.failed_appoitment,
                invoice: element.invoice,
            };
            data.push(temp);
        });

        $http.post('sale_care/update_consultant_target_details', data).then(r => {
            $scope.create_loading = false;
            if (r && r.data.status == 1) {
                $('#confirmModal').modal('hide');
                toastr["success"]('Đã cập nhật');
            } else toastr["error"](r.data.message);
        })
    }
})