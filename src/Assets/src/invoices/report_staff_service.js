app.controller('report_staff_service', function ($scope, $http, $compile, $filter) {
    $scope.init = () => {
        $scope.filter = {
            date: date_bw,
            store_id: store_id + '',
            user_id: '0'
        };
        $scope.img_account_df = img_account_df;
        $scope.list_user = [];
        $scope.resetData();
        $scope.getListUserByRule();
    }

    $scope.resetData = () => {
        $scope.load = false;
        $scope.list_services = [];
        $scope.list_cpu = [];
        $scope.obj_total = {
            invoice_service: 0,
            cpu: 0
        }
    }

    $scope.getList = (is_excel) => {
        var data_rq = angular.copy($scope.filter);
        if (data_rq.user_id == 0) {
            showMessErr('Vui lòng chọn nhân viên');
            return;
        }

        data_rq.begin = getDateBw(data_rq.date);
        data_rq.end = getDateBw(data_rq.date, 0);
        $scope.resetData();
        $scope.load = true;
        $http.get(base_url + 'invoices/ajax_get_staff_service?' + $.param(data_rq)).then(r => {
            $scope.load = false;
            if (r.data && r.data.status) {
                var data = r.data.data;
                $.each(data, function (index, value) {
                    value.date = moment(value.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
                    value.total_kpi = Number(value.total_kpi);
                    value.customer_phone = '****' + (value.customer_phone.substr(-6));
                    if (value.type == 'invoice_service') {
                        $scope.list_services.push(value);
                        $scope.obj_total.invoice_service += value.total_kpi;
                    } else {
                        $scope.list_cpu.push(value);
                        $scope.obj_total.cpu += value.total_kpi;
                    }
                })

                if (is_excel) {
                    setTimeout(() => {
                    exportExcelTable('.tb_export', 'class')
                }, 300)
                }
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        })
    }

    $scope.getListUserByRule = () => {
        $scope.filter.user_id = '0';
        $scope.list_user = [];

        if ($scope.filter.store_id == 0) {
            select2_img();
            return;
        }

        $scope.filter_user_load = true;
        $http.get(base_url + 'admin_users/ajax_get_user_by_rule?filter=' + JSON.stringify({
            group_id: [11, 16],
            store_id: $scope.filter.store_id
        })).then(r => {
            $scope.filter_user_load = false;
            if (r.data.status) {
                $scope.list_user = r.data.data;
                select2_img();
            } else {
                showMessErr(r.data.message);
            }
        });
    }
})