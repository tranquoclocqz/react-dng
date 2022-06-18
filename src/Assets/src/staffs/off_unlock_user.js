app.controller('add_order', function ($scope, $http) {

    $scope.init = () => {
        $('.box1').css('opacity', 1);
        $scope.order = offData;
        $scope.current_user_id = current_user_id;
        $scope.order.date_start = moment($scope.order.date_start).format('DD-MM-YYYY');
        $scope.order.date_end = moment($scope.order.date_end).format('DD-MM-YYYY');
        if ($scope.order.status == 4) {
            $scope.order.class = 'label label-success';
            $scope.order.status_name = 'Hoàn tất';
        }
        if ($scope.order.status == 2) {
            $scope.order.class = 'label label-danger';
            $scope.order.status_name = 'Đã hủy';
        }

        $scope.is_only_dev = is_only_dev;
        $scope.currentDate = currentDate;
        $scope.isUpdate = 0;
        $scope.isCancel = 0;
        $scope.checkoutUpdate();
        $scope.checkoutCancel();
    }

    $scope.updateOrder = () => {
        swal({
            title: "",
            text: "Xác nhận cập nhật",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_update_unclock_user', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr["success"](r.data.message);
                } else {
                    toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                }
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.showModalCancelOrder = () => {
        $('#modalCancelOrder').modal('show');
    }

    $scope.cancelOrder = () => {
        $scope.errorNoteCancel = $scope.order.cancel_note ? 0 : 1;
        if (!$scope.order.cancel_note || $scope.order.cancel_note == '') return;

        let onWP = $scope.order.note.includes("WP:ON");
        let onCRM = $scope.order.note.includes("CRM:ON");
        
        var mess = '';
        if (onWP == true && onCRM == true) {
            mess = 'Nhân sự sẽ bị khoá Workplace và CRM khi huỷ đơn';
        } else if (onWP == true) {
            mess = 'Nhân sự sẽ bị khoá Workplace khi huỷ đơn';
        } else {
            mess = 'Nhân sự sẽ bị khoá CRM khi huỷ đơn';
        }

        swal({
            title: "",
            text: mess,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_cancel_unclock_user', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/off_unlock_user/' + $scope.order.id);
                } else {
                    toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                }
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.fmDate = (date, fm) => {
        return moment(date).format(fm ? fm : 'DD/MM/YYYY');
    }

    $scope.checkoutUpdate = () => {
        var days = diffDate($scope.order.date_end, $scope.currentDate);

        if (days <= 0) { // chỉ được cập nhật ở ngày vừa tạo
            $scope.isUpdate = 1;
        }
    }

    $scope.checkoutCancel = () => {
        var days = diffDate($scope.order.date_end, $scope.currentDate);
        if (days <= 0) { // chỉ được huỷ nếu ngày kết thúc lớn hơn hay bằng ngày hiện tại
            $scope.isCancel = 1;
        }
    }

    function diffDate(date_start, date_end) {
        var date_start = date_start.split('-');
        var startDate = new Date(date_start[2] + '-' + date_start[1] + '-' + date_start[0]);

        var date_end = date_end.split('-');
        var endDate = new Date(date_end[2] + '-' + date_end[1] + '-' + date_end[0]);

        const secondsInAMin = 60;
        const secondsInAnHour = 60 * secondsInAMin;
        const secondsInADay = 24 * secondsInAnHour;

        var remainingSecondsInDateDiff = (endDate - startDate) / 1000;
        var days = Math.floor(remainingSecondsInDateDiff / secondsInADay);
        return days;
    }
})