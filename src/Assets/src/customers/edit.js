app.controller('edit', function ($scope, $http) {
    $scope.init = () => {
        $scope.new_phone = '';
        $scope.step = 1;
        $scope.customer_info = {};
        $scope.otp_code = {};
        $scope.is_search_cus = false;
        $scope.is_disabled = false;
        $scope.obj_change_phone = {
            phone_old: phone_old,
            customer_id: customer_id,
            store_id: store_id,
            nation_id: nation_id,
            loading: false
        }
        $scope.resetOtpCode();
    }
    $scope.resetInfoCustomer = () => {
        $scope.customer_info = {
            name: '',
            created: '',
            store_name: ''
        };
    }
    $scope.resetObjectChangePhone = () => {
        $scope.obj_change_phone = {
            customer_id: customer_id,
            store_id: store_id,
            nation_id: nation_id,
            otp_id: '',
            phone_new: '',
            phone_old: phone_old,
            send_type: '',
            code_otp: '',
            note: '',
            time: '',
            is_send_sms: '',
            has_invoice: '',
            loading: false
        }
    }
    $scope.resetOtpCode = () => {
        $scope.otp_code = {
            one: '',
            two: '',
            three: '',
            fore: '',
            five: '',
            six: ''
        }
    };

    $scope.searchPhone = (id_cus) => {
        if ($scope.new_phone == '') {
            return false;
        }
        if ($scope.new_phone.length < 8) {
            return false;
        }
        $('#load').css('display', 'inline-block');
        $('.load').css('display', 'inline-block');
        $('.result').css('display', 'none');
        $('.req1,.req,.req2').css('display', 'none');

        $http.get(base_url + '/customers/ajax_get_user_phone/' + id_cus + '?filter=' + JSON.stringify($scope.new_phone)).then(r => {
            $('.load').css('display', 'none');
            $('.result').css('display', 'inline-block');
            if (r.data.data == null) {
                $('#load').css('display', 'none');
                $('#btn-f').css('background', '#3c8dbc')
                $('#btn-f').css('border', '1px solid #367fa9')
            } else {
                $scope.user = r.data.data;
                $('#load').css('display', 'inline-block');
                $('#btn-f').css('background', '#d43f3a')
                $('#btn-f').css('border', '1px solid #d43f3a')
            }
        })
    }

    $scope.changePhone = () => {

        if (!$scope.obj_change_phone.phone_new) {
            $scope.is_search_cus = false;
            $scope.is_disabled = false;
            $scope.resetInfoCustomer();
        }

        if (!$scope.obj_change_phone.phone_new || $scope.obj_change_phone.phone_new && $scope.obj_change_phone.phone_new.length < 9 || $scope.obj_change_phone.phone_new.length > 12) {
            return false;
        }

        if ($scope.time) {
            clearTimeout($scope.time);
        }
        $scope.is_disabled = true;
        $scope.time = setTimeout(() => {
            $scope.searchCusByPhone();
        }, 350);
    }

    $scope.searchCusByPhone = () => {
        $scope.obj_change_phone.phone_old = $scope.obj_change_phone.phone_old.replace(/[^\d]{12,}/, '').replace(/\D/g, '');
        $scope.obj_change_phone.phone_new = $scope.obj_change_phone.phone_new.replace(/[^\d]{12,}/, '').replace(/\D/g, '');

        var data = {
            phone_old: $scope.obj_change_phone.phone_old,
            phone_new: $scope.obj_change_phone.phone_new
        }
        $scope.customer_info.loading = true;
        $http.get(base_url + '/customers/search_info_cus_by_phone?' + $.param(data)).then(r => {
            $scope.customer_info.loading = false;

            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $scope.customer_info.name = data.name;
                $scope.customer_info.created = data.created;
                $scope.customer_info.store_name = data.name_stores
                $scope.is_search_cus = true;
                $scope.is_disabled = false;
                $scope.obj_change_phone.has_invoice = r.data.data.has_invoice;
            } else {
                $scope.customer_info = {};
                $scope.is_search_cus = true;
                $scope.is_disabled = false;
                $scope.obj_change_phone.has_invoice = '';
            }
        });
    }

    $scope.toApiFixPhone = (old_phone) => {
        if ($scope.new_phone == '') {
            $('.req').css('display', 'inline-block');
            return false;
        }
        if ($scope.new_phone == old_phone) {
            $('.req2').css('display', 'inline-block');
            return false;
        }
        var letters = /[0-9]{9,13}/;
        if (!letters.test($scope.new_phone) || $scope.new_phone.length > 13) {
            $('.req1').css('display', 'inline-block');
            return false;
        }
        $http.post(base_url + '/customers/api_fix_phone/' + old_phone + '?filter=' + JSON.stringify($scope.new_phone)).then(r => {
            if (r.data.message == 'OK' && r.data.status == 1) {
                toastr["success"]("Đổi thành công!");
                location.reload();
                return false;
            }
            $('.req3').html(r.data.message)
        })
    }

    $scope.goToPrev = () => {
        $scope.obj_change_phone.send_type = '';
        $scope.obj_change_phone.time = '';
        $scope.step = parseInt($scope.step) - 1 > 0 ? parseInt($scope.step) - 1 : parseInt($scope.step);

    }

    $scope.goToNextStep = () => {
        switch ($scope.step) {
            case 1:
                $scope.chooseTypeOtp();
                break;
            case 2:
                $scope.sendOtp();
                break;
            case 3:
                $scope.confirmCodeOtp();
                break;
        }
    }

    $scope.checkDisabledBtn = () => {
        if ($scope.step == 2) {
            return false;
        } else if ($scope.step == 3) {
            return !Object.values($scope.otp_code).every(val => val.replace(/[^0-9]/g, ''));
        }
    }

    $scope.checkShowBtn = () => {
        switch ($scope.step) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 3:
                return 3;
        }
    }
    $scope.chooseTypeOtp = () => {
        var regexPhone = /[0-9]{9,13}/g;

        if (!$scope.obj_change_phone.phone_new) {
            showMessErr('Vui lòng nhập số điện thoại mới');
            return;
        }

        if ($scope.obj_change_phone.phone_new == $scope.obj_change_phone.phone_old) {
            showMessErr('Số điện thoại mới không được trùng số cũ');
            return;
        }

        if ($scope.obj_change_phone.nation_id == 1 && $scope.obj_change_phone.phone_new.length != 10) {
            showMessErr('Số điện thoại mới phải gồm 10 chữ số');
            return;
        }

        if (!$scope.obj_change_phone.phone_new.match(regexPhone) || $scope.obj_change_phone.phone_new.length > 12 || $scope.obj_change_phone.phone_new.length < 9) {
            showMessErr('Số điện thoại không đúng');
            return;
        }

        if (!$scope.obj_change_phone.customer_id) {
            showMessErr('Không tồn tại khách hàng');
            return;
        }

        if (!$scope.obj_change_phone.note) {
            showMessErr('Vui lòng nhập ghi chú');
            return;
        }

        var data_rq = {
            phone_old: $scope.obj_change_phone.phone_old,
            phone_new: $scope.obj_change_phone.phone_new,
            customer_id: $scope.obj_change_phone.customer_id
        }
        $scope.obj_change_phone.loading = true;
        $http.post(base_url + 'customers/check_exist_request_phone', data_rq).then(r => {
            $scope.obj_change_phone.loading = false;
            if (r.data && r.data.status == 1) {
                $scope.step = 2;
                $scope.obj_change_phone.is_send_sms = r.data.data.is_send_sms;
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.sendOtp = () => {
        if (!$scope.obj_change_phone.send_type) {
            showMessErr('Vui lòng chọn hình thức gửi mã OTP');
            return;
        }
        var data_rq = {
            phone_new: $scope.obj_change_phone.phone_new,
            send_type: $scope.obj_change_phone.send_type,
            store_id: $scope.obj_change_phone.store_id
        }
        $scope.obj_change_phone.loading = true;
        var data;
        $http.post(base_url + 'customers/ajax_update_type_send_otp', data_rq).then(r => {
            $scope.obj_change_phone.loading = false;
            if (r.data && r.data.status == 1) {
                data = r.data.data;
                $scope.obj_change_phone.otp_id = data.otp_id;
                $scope.step = 3;
                $scope.resetOtpCode();
            } else {
                data = r.data.data;
                if (data) {
                    $scope.obj_change_phone.time = data.time ? data.time : '';
                }
                if (r.data.message != '') {
                    showMessErr(r.data.message);
                }
            }
        });
    }

    $scope.confirmCodeOtp = () => {
        var otp_code = $scope.otp_code.one + $scope.otp_code.two + $scope.otp_code.three + $scope.otp_code.fore + $scope.otp_code.five + $scope.otp_code.six;
        if (otp_code.length != 6) {
            showMessErr('Mã OTP phải đủ 6 chứ số');
            return;
        }
        $scope.obj_change_phone.code_otp = otp_code;
        var data_rq = angular.copy($scope.obj_change_phone)
        $scope.obj_change_phone.loading = true;
        $http.post(base_url + 'customers/ajax_confirm_change_phone', data_rq).then(r => {
            $scope.obj_change_phone.loading = false;
            if (r.data && r.data.status == 1) {
                $scope.step = 4;
                $scope.phone_old = $scope.obj_change_phone.phone_old;
                $scope.phone_new = $scope.obj_change_phone.phone_new;
                phone_old = angular.copy($scope.phone_new);
                $('.customer-phone').val($scope.obj_change_phone.phone_new);
                $('#phone_old').val($scope.obj_change_phone.phone_new);
                $scope.resetOtpCode();
                $scope.resetObjectChangePhone();
                $scope.resetInfoCustomer();
                showMessSuccess();
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.confirmAddToListRequestPhone = () => {
        event.preventDefault();
        if ($scope.step == 1 && !$scope.obj_change_phone.note) {
            showMessErr('Vui lòng nhập ghi chú!');
            return;
        }
        swal({
            title: "Thông báo",
            text: "Bạn có muốn duyệt thủ công?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            confirmButtonColor: "#00a65a",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        },
            function () {
                var data = {
                    customer_id: $scope.obj_change_phone.customer_id,
                    phone_old: $scope.obj_change_phone.phone_old,
                    phone_new: $scope.obj_change_phone.phone_new,
                    note: $scope.obj_change_phone.note
                }
                $http.post(base_url + 'customers/ajax_request_phone_customer_v2', data).then(r => {
                    if (r.data && r.data.status == 1) {
                        $('#request-change-phone-modal').modal("hide");
                        $scope.step = 1;
                        $scope.resetObjectChangePhone();
                        $scope.resetInfoCustomer();
                        swal("Thông báo", "Đã thêm yêu cầu vào danh sách chờ duyệt. Bạn vui lòng chờ trong giây lát để xác nhận.", "success");
                    } else {
                        $scope.step = 1;
                        swal("Thông báo", r.data.message, "error");
                    }
                }, function () {
                    showMessErrSystem();
                })
            });
    }

    $scope.closePopup = () => {
        if ((!$scope.obj_change_phone.phone_new && !$scope.obj_change_phone.note) || $scope.step == 4) {
            $('#request-change-phone-modal').modal('hide');
            return;
        }
        swal({
            title: "Thông báo",
            text: "Bạn có chắc chắn muốn đóng hộp thoại làm việc này?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            confirmButtonColor: "#dc3741",
            closeOnConfirm: true,
            showLoaderOnConfirm: true,
        },
            function (isConfirm) {
                if (isConfirm) {
                    $('#request-change-phone-modal').modal('hide');
                }
            });
    }

    $scope.openReqChangePhone = () => {
        $scope.step = 1;
        $scope.is_search_cus = false;
        $scope.resetOtpCode();
        $scope.resetObjectChangePhone();
        $scope.resetInfoCustomer();
    }
});


$(document).on('input', 'input.phone', function () {
    var self = $(this)
    self.val(self.val().replace(/[^\d]{12,}/, '').replace(/\D/g, ''));
});

$(document).on('input', 'input.otp', function () {
    var self = $(this)
    self.val(self.val().replace(/[^0-9]/g, ''));
});

function toNextNumber(val) {
    let ele = document.querySelectorAll('input.otp');
    if (ele[val - 1].value != '') {
        if (val == 6) return;
        ele[val].focus();
    }

    if (ele[val - 1].value == '') {
        if (val == 1) return;
        ele[val - 2].focus();
    }
}