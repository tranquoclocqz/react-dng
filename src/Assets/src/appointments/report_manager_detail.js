app.controller('report_manager_detail', function ($scope, $http, $compile, $filter) {
    $scope.init = () => {
        $('.op-report').removeClass('op-report');
        $scope.getDetail(params);
    }

    $scope.getDetail = (params) => {
        var data_rq = {
            date: params.date,
            manager_id: params.manager_id,
            store_id: params.store_id,
            all: 1
        }
        $scope.load = true;
        $http.get(base_url + 'appointments/ajax_get_detail_appointment_manager?' + $.param(data_rq)).then(r => {
            $scope.load = false;
            if (r.data.status) {
                $scope.detail = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        })
    };
});
app.filter('formatCurrency', function () {
    return (value, nation_id, noname = false) => {
        if (!value) return 0;
        value = Number(value);
        if (nation_id == 1) {
            return parseNumber(value) + (noname ? '' : ' đ');
        } else {
            return (Number(value) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + (noname ? '' : ' $');
        }
    };
});