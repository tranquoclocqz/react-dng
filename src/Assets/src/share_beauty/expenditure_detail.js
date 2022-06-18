app.controller('exDetailCtr', function ($scope, $http, $sce, $compile) {
    $scope.init = () => {
        $('.box-1').css('opacity', '1');
        $scope.getExpenditure();
        $scope.expen = {};
    }

    $scope.getExpenditure = () => {
        $http.get(base_url + '/share_beauty/ajax_get_expenditure_detail?id=' + idExpenditure).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.expen = r.data.data;
            } else toastr["error"](r.data && r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!')
        })
    }

    $scope.confirmEx = (status) => {
        $scope.exStatus = status;
        $('#confirm').modal('show');
    }

    $scope.confirm = () => {
        let data = {
            id: $scope.expen.id,
            status: $scope.expen.store_id > 0 ? $scope.exStatus : 4,
            note: $scope.expen.confirm_note ? $scope.expen.confirm_note : ''
        }
        $http.post(base_url + '/share_beauty/ajax_change_status_expen', data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.getExpenditure();
                toastr['success'](data.status == 3 ? 'Xác nhận thanh toán thành công!' : 'yêu cầu thành công!');
            } else toastr["error"](r.data && r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!')
        })
    }

    $scope.dateFormat = (d, fm) => {
        return moment(d).format(fm);
    }
});