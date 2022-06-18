app.controller('add_order_quit', function ($scope, $http) {

    $scope.dzOptions = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + 'uploads/ajax_upload_to_filehost?folder=admin_user',
        acceptedFiles: 'image/*',
        dictDefaultMessage: 'Thêm đơn từ',
        params: {
            folder: 'admin_user'
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
        $scope.order = {};
        $scope.order.id = 0;
        $scope.order.percent_salary = ''
        $scope.order.type = type;
        $scope.order.userIsOffice = 0;
        $scope.current_id = current_id;
        $scope.current_main_group_id = current_main_group_id;
        $scope.is_only_dev = is_only_dev;
        $scope.showinForOrder = 0;

        if (offData.id > 0) {
            $scope.order = offData;
            $scope.confirm_id = offData.confirm_id;
            $scope.admin_id = offData.admin_id;
            $scope.confirm_note = offData.confirm_note;
            $scope.admin_note = offData.admin_note;

            if (offData.percent_salary == '') {
                $scope.order.percent_salary = ''
            } else {
                $scope.order.percent_salary = parseInt(offData.percent_salary);
            }
            $scope.getUserApprove($scope.order.user_id);
        }

        $scope.order.images = [];

        $scope.get_list_user_request();
    }

    $scope.get_list_user_request = () => {
        $http.get(base_url + '/staffs/ajax_get_list_user_request_off' + '?user_id=' + $scope.current_id + '&main_group_id=' + $scope.current_main_group_id + '&type=' + $scope.order.type).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_request = r.data.data;
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
            select2();
        });
    }

    $scope.getUserApprove = (user_id) => {
        $scope.loadingApprove = true;
        $http.get(base_url + '/staffs/get_company_and_group_user' + '?user_id=' + user_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.get_list_user_permission_approve_off(user_id, r.data.data.main_group_id);
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
            select2();
        });
    }

    $scope.checkUserIsOffice = (user_id) => {
        $http.get(base_url + '/staffs/ajax_check_user_is_office' + '?user_id=' + user_id).then(r => {
            if (r.data && r.data.status == 1) {
                var store = r.data.data.main_store_id;
                if (store == 8 || store == 13 || store == 46 || store == 49) {
                    $scope.order.userIsOffice = 1; // là văn phòng
                } else {
                    $scope.order.userIsOffice = 2; // là chi nhánh
                }
                // nếu trường hợp tạo đơn cho người khác mà người tạo là GDKV hoặc GDV và người được tạo ở chi nhánh
                if ($scope.order.id == 0 && $scope.order.userIsOffice == 2 && $scope.current_id != $scope.order.user_id) {
                    $scope.order.confirm_id = $scope.current_id + ''; // set người duyệt 1 là người tạo
                }

                // loại bỏ confirm_id trong ô GDKV neu người confirm_id khoong phải là GĐKV
                if ($scope.order.userIsOffice == 2 && $scope.order.user_id != $scope.current_id && $scope.current_main_group_id != 2 && $scope.current_main_group_id != 39) {
                    $scope.list_user_approve_last = $scope.list_user_approve_last.filter(e => {
                        return e.id != ($scope.order.confirm_id + '');
                    });
                }

                // nếu tạo đơn cho người khác thì hiển thị hình thức thôi việc, % thôi việc
                if (($scope.order.id == 0 && $scope.order.user_id != $scope.current_id) || ($scope.order.id != 0 && ($scope.order.status != 0 || $scope.confirm_id == $scope.current_id || $scope.admin_id == $scope.current_id))) {
                    $scope.showinForOrder = 1;
                } else {
                    $scope.showinForOrder = 0;
                }
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
            $scope.loadingApprove = false;
            select2();
        });
    }

    $scope.get_list_user_permission_approve_off = (user_id, group_id) => { // lấy tất cả những người và nhóm có quyền duyệt đề xuất
        $scope.order.confirm_id = '';
        $http.get(base_url + '/staffs/get_list_user_permission_approve_off' + '?user_id=' + user_id + '&main_group_id=' + group_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_approve = r.data.data;
                
                $scope.list_user_approve = $scope.list_user_approve.filter(e => {
                    return e.id != ($scope.order.user_id + '');
                });

                $scope.list_user_approve_last = $scope.list_user_approve;

                if ($scope.order.id != 0) {
                    $scope.order.confirm_id = $scope.confirm_id;
                    $scope.order.admin_id = $scope.admin_id;

                    if ($scope.order.admin_id == 0 && $scope.order.confirm_id == $scope.current_id && ($scope.current_main_group_id == 2 || $scope.current_main_group_id == 39)) {
                        $scope.order.admin_id = ($scope.current_id + '');
                    }
                }
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
            $scope.loadingApprove = false;

            $scope.checkUserIsOffice($scope.order.user_id);
            select2();
        });
    }

    $scope.addOrderQuit = () => {
        if (!$scope.order.user_id) {
            toastr.error('Vui lòng chọn nhân viên!');
            return;
        }

        if ($scope.order.user_id == $scope.current_id) { // nếu tạo đơn cho mình
            if (!$scope.order.confirm_id) {
                toastr.error('Vui lòng chọn người duyệt!');
                return;
            }
        }

        if ($scope.order.user_id != $scope.current_id && $scope.order.userIsOffice == 1 && !$scope.order.confirm_id) {
            toastr.error('Vui lòng chọn người duyệt!');
            return;
        }

        if ($scope.order.user_id != $scope.current_id) { // nếu tạo đơn cho người khác
            if (!$scope.order.admin_id && $scope.order.userIsOffice == 2) {
                toastr.error('Vui lòng chọn giám đốc khu vực!');
                return;
            }

            if (!$scope.order.quit_type && $scope.order.type == 4) {
                toastr.error('Vui lòng chọn hình thức thôi việc!');
                return;
            }

            if ((typeof $scope.order.percent_salary == 'undefined' || $scope.order.percent_salary === '') && $scope.order.type == 4) {
                toastr.error('Vui lòng nhập % thôi việc!');
                return;
            }
        }

        if (!$scope.order.date) {
            toastr.error($scope.order.type == 4 ? 'Vui lòng chọn ngày thôi việc!' : 'Vui lòng chọn ngày bắt đầu!');
            return;
        }

        if ($scope.order.type == 6 && !$scope.order.date_end) {
            toastr.error('Vui lòng chọn ngày kết thúc!');
            return;
        }

        if (!$scope.order.note) {
            toastr.error('Vui lòng nhập lý do nghỉ việc!');
            return;
        }

        if ($scope.order.user_id != $scope.current_id) { // nếu tạo đơn cho người khác
            // nếu tạo đơn cho chi nhánh thì người duyệt ở ô giám đốc khu vực không thể là chính mình, ngoài trừ là GĐKV và GĐV
            if ($scope.order.userIsOffice == 2 && ($scope.current_main_group_id != 2 && $scope.current_main_group_id != 39) && $scope.order.confirm_id == $scope.order.admin_id) {
                toastr.error('Giám đốc khu vực và bạn không thể giống nhau!');
                return;
            }
        }

        if ($scope.order.type == 6 && $scope.order.date && $scope.order.date != '' && $scope.order.date_end && $scope.order.date_end != '') {
            var days = diffDate($scope.order.date, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                return;
            }
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
            $http.post(base_url + '/staffs/ajax_add_order_quit', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.open(base_url + 'staffs/add_order_quit/' + r.data.data.id);
                } else if (r.data && r.data.status == 0) {
                    toastr["error"](r.data.message);
                    $scope.existID = r.data.data;
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.viewOffDetail = (id) => {
        window.open(base_url + 'staffs/add_order_quit/' + id, '_blank');
    }

    $scope.confirmOrderQuit = () => {
        if ($scope.order.userIsOffice == 1 && (!$scope.order.confirm_id || $scope.order.confirm_id == '0')) {
            toastr.error('Vui lòng chọn người duyệt!');
            return;
        }

        if ($scope.order.userIsOffice == 2 && (!$scope.order.admin_id || $scope.order.admin_id == '0')) {
            toastr.error('Vui lòng chọn giám đốc khu vực!');
            return;
        }

        if (!$scope.order.date) {
            toastr.error($scope.order.type == 4 ? 'Vui lòng chọn ngày thôi việc!' : 'Vui lòng chọn ngày bắt đầu!');
            return;
        }

        if ($scope.order.type == 6 && !$scope.order.date_end) {
            toastr.error('Vui lòng chọn ngày kết thúc!');
            return;
        }

        if ((typeof $scope.order.percent_salary == 'undefined' || $scope.order.percent_salary === '') && $scope.order.type == 4) {
            toastr.error('Vui lòng nhập % thôi việc!');
            return;
        }

        swal({
            title: "",
            text: "Xác nhận duyệt đơn?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_confirm_order_quit', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/add_order_quit/' + r.data.data.id);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.changeInputStart = () => {
        if ($scope.order.date && $scope.order.date != '' && $scope.order.date_end && $scope.order.date_end != '' && $scope.order.type == 6) {
            var days = diffDate($scope.order.date, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.order.date_end = '';
            }
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

    $scope.updateOrderQuitDev = () => {
        if (!$scope.order.quit_type && $scope.order.type == 4) {
            toastr.error('Vui lòng chọn hình thức thôi việc!');
            return;
        }

        if (!$scope.order.date) {
            toastr.error($scope.order.type == 4 ? 'Vui lòng chọn ngày thôi việc!' : 'Vui lòng chọn ngày bắt đầu!');
            return;
        }

        if ($scope.order.type == 6 && !$scope.order.date_end) {
            toastr.error('Vui lòng chọn ngày kết thúc!');
            return;
        }

        if (!$scope.order.note) {
            toastr.error('Vui lòng nhập lý do nghỉ việc!');
            return;
        }

        if ($scope.order.type == 6 && $scope.order.date && $scope.order.date != '' && $scope.order.date_end && $scope.order.date_end != '') {
            var days = diffDate($scope.order.date, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                return;
            }
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
            $http.post(base_url + '/staffs/ajax_update_order_quit_dev', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/add_order_quit/' + r.data.data.id);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.updateOrderQuit = () => {

        if ($scope.order.user_id == $scope.current_id) { // nếu tạo đơn cho mình
            if (!$scope.order.confirm_id) {
                toastr.error('Vui lòng chọn người duyệt!');
                return;
            }
        }

        if ($scope.order.user_id != $scope.current_id) { // nếu tạo đơn cho người khác
            if (!$scope.order.admin_id) {
                toastr.error('Vui lòng chọn người duyệt!');
                return;
            }

            if (!$scope.order.quit_type && $scope.order.type == 4) {
                toastr.error('Vui lòng chọn hình thức thôi việc!');
                return;
            }

            if ((typeof $scope.order.percent_salary == 'undefined' || $scope.order.percent_salary === '') && $scope.order.type == 4) {
                toastr.error('Vui lòng nhập % thôi việc!');
                return;
            }
        }

        if (!$scope.order.date) {
            toastr.error($scope.order.type == 4 ? 'Vui lòng chọn ngày thôi việc!' : 'Vui lòng chọn ngày bắt đầu!');
            return;
        }

        if ($scope.order.type == 6 && !$scope.order.date_end) {
            toastr.error('Vui lòng chọn ngày kết thúc!');
            return;
        }

        if (!$scope.order.note) {
            toastr.error('Vui lòng nhập lý do nghỉ việc!');
            return;
        }

        if ($scope.order.user_id != $scope.current_id) { // nếu tạo đơn cho người khác
            // nếu tạo đơn cho chi nhánh thì người duyệt ở ô giám đốc chi nhánh không thể là chính mình
            if ($scope.order.userIsOffice == 2 && $scope.current_main_group_id != 2 && $scope.current_main_group_id != 39 && $scope.order.confirm_id == $scope.order.admin_id) {
                toastr.error('Giám đốc khu vực và bạn không thể giống nhau!');
                return;
            }
        }

        if ($scope.order.type == 6 && $scope.order.date && $scope.order.date != '' && $scope.order.date_end && $scope.order.date_end != '') {
            var days = diffDate($scope.order.date, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                return;
            }
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
            $http.post(base_url + '/staffs/ajax_update_order_quit', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/add_order_quit/' + r.data.data.id);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.cancelOrderQuit = () => {
        swal({
            title: "",
            text: "Xác nhận huỷ đơn?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_cancel_order_quit', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/add_order_quit/' + r.data.data.id);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.cancelConfirmOrderQuit = () => {
        swal({
            title: "",
            text: "Xác nhận từ chối đơn?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_cancel_order_confirm_quit', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/add_order_quit/' + r.data.data.id);
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
                    $scope.order.files = $scope.order.files.filter(e => {
                        return e.id != item.id;
                    });
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100)
    }

})