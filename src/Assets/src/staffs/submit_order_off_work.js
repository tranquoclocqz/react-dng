
app.controller('submit_order_off_work', function ($scope, $http) {
    $scope.dzOptions = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + 'uploads/ajax_upload_to_filehost?folder=staff',
        acceptedFiles: 'image/*',
        dictDefaultMessage: 'Thêm đơn từ',
        params: {
            folder: 'staff'
        }
    };

    $scope.dzCallbacks = {
        'addedfile': function (file) {
            $scope.newFile = file;
        },
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            if (res.success) {
                $scope.order.images.push(res.data[0]);
                $('.dz-image').remove();
            } else toastr.error(res.message);
        }
    };

    $scope.showImg = (url) => {
        $scope.currImg = url;
        $("#modalImg").modal("show");
    };
    
    $scope.init = () => {
        $('.box').css('opacity', 1);
        
        $scope.stores = stores;
        $scope.current_user_id = current_user_id;
        $scope.order = {
            store_arrival_id: '',
            date_session: '0'
        };

        if (offData.id > 0) {
            $scope.order = offData;
            $scope.order.date_start = moment($scope.order.date_start).format('DD-MM-YYYY');
            $scope.order.date_end = moment($scope.order.date_end).format('DD-MM-YYYY');
            $scope.getUserApprove($scope.order.user_id);
            getStatus();
        }

        $scope.order.images = [];
    
        $scope.current_user_id = current_user_id;
        $scope.current_main_group_id = current_main_group_id;
        $scope.current_main_store_id = current_main_store_id;
        $scope.office = 0;
        $scope.get_list_user_request();
        
        select2();
    }

    function getStatus() {
        if ($scope.order.id) {
            if ($scope.order.status == -1) {
                $scope.order.class = 'label label-danger';
                $scope.order.status_name = 'Từ chối';
            }
            if ($scope.order.status == 0) {
                $scope.order.class = 'label label-primary';
                $scope.order.status_name = 'Chờ phê duyệt';
            }
            if ($scope.order.status == 1) {
                $scope.order.class = 'label label-success';
                $scope.order.status_name = 'Chấp thuận';
            }
            if ($scope.order.status == 2) {
                $scope.order.class = 'label label-danger';
                $scope.order.status_name = 'Đã hủy';
            }
        }
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200)
    }

    $scope.changeInputStart = () => {
        if ($scope.order.date_start && $scope.order.date_start != '' && $scope.order.date_end && $scope.order.date_end != '') {
            var days = diffDate($scope.order.date_start, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.order.date_end = '';
            }
        }
    }

    $scope.get_list_user_request = () => {
        $http.get(base_url + '/staffs/ajax_get_list_user_request_off' + '?user_id=' + $scope.current_user_id + '&main_group_id=' + $scope.current_main_group_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_request = r.data.data;
                select2();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }

    $scope.changeUser = (user_id) => {
        $scope.order.confirm_id = '';
        $scope.order.confirm_note = '';
        $scope.getUserApprove(user_id);
    }

    $scope.getUserApprove = (user_id) => {
        $http.get(base_url + '/staffs/get_main_group_user' + '?user_id=' + user_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.get_list_user_permission_approve_off(user_id, r.data.data);
                select2();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }

    $scope.get_list_user_permission_approve_off = (user_id, group_id) => { // lấy tất cả những người và nhóm có quyền duyệt đề xuất
        $scope.loadchange = true;
        $http.get(base_url + '/staffs/get_list_user_permission_approve_off' + '?user_id=' + user_id + '&main_group_id=' + group_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_approve = r.data.data;

                $scope.list_user_approve = $scope.list_user_approve.filter(e => {
                    return e.id != ($scope.order.user_id + '');
                });

                select2();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
            $scope.loadchange = false;
        });
    }

    $scope.addOrderOffWork = () => {
        if (!$scope.order.user_id) {
            toastr.error('Vui lòng chọn nhân viên!');
            return;
        }

        if (!$scope.order.confirm_id) {
            toastr.error('Vui lòng chọn người duyệt!');
            return;
        }
     

        if (!$scope.order.date_start) {
            toastr.error('Vui lòng chọn ngày bắt đầu!');
            return;
        }

        if (!$scope.order.date_end) {
            toastr.error('Vui lòng chọn ngày kết thúc!');
            return;
        }

        if (!$scope.order.store_arrival_id) {
            toastr.error('Vui lòng chọn chi nhánh công tác!');
            return;
        }

        if (!$scope.order.note) {
            toastr.error('Vui lòng nhập lý do công tác!');
            return;
        }

        var days = diffDate($scope.order.date_start, $scope.order.date_end);
        if (days < 0) {
            toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
            return;
        }

        swal({
            title: "",
            text: "Xác nhận tạo đơn",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_add_order_off_word', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/submit_order_off_work/' + r.data.data.id);
                } else if (r.data && r.data.status == 0) {
                    toastr["error"](r.data.message);
                    $scope.existID = r.data.data;
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.updateOrderOffWork = () => {
        if (!$scope.order.confirm_id) {
            toastr.error('Vui lòng chọn người duyệt!');
            return;
        }

        if (!$scope.order.date_start) {
            toastr.error('Vui lòng chọn ngày bắt đầu!');
            return;
        }

        if (!$scope.order.date_end) {
            toastr.error('Vui lòng chọn ngày kết thúc!');
            return;
        }

        if (!$scope.order.store_arrival_id) {
            toastr.error('Vui lòng chọn chi nhánh công tác!');
            return;
        }

        if (!$scope.order.note) {
            toastr.error('Vui lòng nhập lý do công tác!');
            return;
        }

        var days = diffDate($scope.order.date_start, $scope.order.date_end);
        if (days < 0) {
            toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
            return;
        }

        swal({
            title: "",
            text: "Xác nhận cập nhật",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_update_order_off_word', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/submit_order_off_work/' + r.data.data.id);
                } else if (r.data && r.data.status == 0) {
                    toastr["error"](r.data.message);
                    setTimeout(() => {
                        window.location.replace(r.data.data);
                    }, 3000);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.confirmOrderOffWord = () => {

        if (!$scope.order.date_start) {
            toastr.error('Vui lòng chọn ngày bắt đầu!');
            return;
        }

        if (!$scope.order.date_end) {
            toastr.error('Vui lòng chọn ngày kết thúc!');
            return;
        }

        if (!$scope.order.store_arrival_id) {
            toastr.error('Vui lòng chọn chi nhánh công tác!');
            return;
        }

        var days = diffDate($scope.order.date_start, $scope.order.date_end);
        if (days < 0) {
            toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
            return;
        }

        swal({
            title: "",
            text: "Xác nhận duyệt đơn",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_confirm_order_off_word', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/submit_order_off_work/' + r.data.data.id);
                } else if (r.data && r.data.status == 0) {
                    toastr["error"](r.data.message);
                    setTimeout(() => {
                        window.location.replace(r.data.data);
                    }, 3000);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.refuseOrderOffWord = () => {
        swal({
            title: "",
            text: "Xác nhận từ chối đơn",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_refuse_order_off_word', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/submit_order_off_work/' + r.data.data.id);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.cancelOrderOffWord = () => {
        swal({
            title: "",
            text: "Xác nhận huỷ đơn",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_cancel_order_off_word', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/submit_order_off_work/' + r.data.data.id);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.deleteImage = (item) => {
        swal({
            title: "Cảnh báo",
            text: "Hành động này không thể phục hồi!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_delete_image_order_quit', item).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $scope.order.file = $scope.order.file.filter(e => {
                        return e.id != item.id;
                    });
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.viewOffDetail = (id) => {
        window.open(base_url + 'staffs/submit_order_off_work/' + id, '_blank');
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