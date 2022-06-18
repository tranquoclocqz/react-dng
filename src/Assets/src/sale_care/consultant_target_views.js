app.controller('consultant_target_views', function ($scope, $http, $sce, $compile) {
    $scope.current_user_id = CURRENT_USER_ID;
    $scope.target_id = ID;
    $scope.init = () => {
        $scope.filter_init();
        $scope.getAll();
    }
    $scope.filter_init = () => {
        $scope.filter = {};
        $scope.filter.id = $scope.target_id;
        $scope.filter.report = true;
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


                    element.total_ap = parseInt(element.total_ap, 10);
                    element.total_arrived = parseInt(element.total_arrived, 10);
                    element.total_failed = parseInt(element.total_failed, 10);
                    element.total_invoice = parseInt(element.total_invoice, 10);
                    element.total_phone = parseInt(element.total_phone, 10);
                });
            }
        })
    }

    $scope.bind_target = (current, target, type = 'normal') => {
        let htmlbd = (type == 'normal') ? bind_target_fnc(current, target) : bind_target_cancel_appointment(current, target);
        return $sce.trustAsHtml(htmlbd);
    }

    function bind_target_cancel_appointment(current, target) {
        if (target == 0) return '';
        current_per_day = current / $scope.rows.number_days_to_current;
        target_per_day = target / $scope.rows.number_days;
        let determind = current_per_day / target_per_day;
        if (determind >= 0) {
            if (determind > 0.1) {
                if (determind > 0.2) {
                    if (determind > 0.3) {
                        if (determind > 0.4) {
                            return '<div class="bg-danger">' + determind.toFixed(2) + '</div>'
                        }
                        return '<div class="bg-warning">' + determind.toFixed(2) + '</div>'
                    }
                }
                return '<div class="bg-info">' + determind.toFixed(2) + '</div>'
            }
            return '<div class="bg-success">' + determind.toFixed(2) + '</div>'
        }
    }


    function bind_target_fnc(current, target) {
        if (target == 0) return '';

        current_per_day = current / $scope.rows.number_days_to_current;
        target_per_day = target / $scope.rows.number_days;
        let determind = current_per_day / target_per_day;
        if (determind >= 0) {
            if (determind > 0.8) {
                if (determind > 0.9) {
                    if (determind > 1) {
                        return '<div class="bg-success">' + determind.toFixed(2) + '</div>'
                    }
                    return '<div class="bg-info">' + determind.toFixed(2) + '</div>'
                }
                return '<div class="bg-warning">' + determind.toFixed(2) + '</div>'
            }
            return '<div class="bg-danger">' + determind.toFixed(2) + '</div>'
        }
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
})