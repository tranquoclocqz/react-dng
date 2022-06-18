app.controller('date_off', function($scope, $http, $compile, $window, $timeout) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 1,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    localStorage = window.localStorage;
    $scope.init = () => {
        $('.opacity').css('opacity', '1');
        $scope.screen = 'form';

        $scope.total_number = {};

        $scope.total_number.total = 0;
        $scope.triggerFunctionTagCare = {};
        $scope.triggerFunction2 = {};
        $scope.triggerSeachSource = {};
        $scope.triggerFunction3 = {};
        $scope.triggerSourceDetail = {};
        $scope.triggerSourceExcel = {};
        $scope.triggerStore = {};
        $scope.triggerStoreUpdate = {};

        $scope.phoneData = {};
        $scope.user = {};
        param_user = getParamsValue('user');
        if (!param_user) {
            $('#Login').modal('show');
        } else {
            $scope.loginBg(param_user);
        }
    }

    function resetPhoneElement() {
        $scope.phoneData = {};
        if ($scope.user) {
            $scope.phoneData.voucher_id = $scope.user.voucher_id;
            $scope.phoneData.campaign_id = $scope.user.campaign_id;
            $scope.phoneData.import_id = $scope.user.id;
            $scope.phoneData.location_id = $scope.user.current_shift.location_id;
            $scope.phoneData.shift_id = $scope.user.current_shift.id;
        }
    }

    function get_user_information() {
        $scope.loading = true;
        $http.get('bg_user/get_current_partner_information?phone=' + $scope.current_phone).then(r => {
            $scope.loading = false;
            if (r && r.data.status == 1) {
                $scope.user = r.data.data;
                localStorage.setItem('currentPartner', JSON.stringify(r.data.data));
                resetPhoneElement()
            } else toastr["error"](r.data.messages);
        })
    }

    $scope.changeScreen = (type) => {
        $scope.screen = type;
        switch (type) {
            case 'panel':
                get_user_information();
                break;
            case 'history':
                $scope.getNumberPhone();
                break;
            default:
                break;
        }
    }

    $(document).on('mouseup', function(e) {
        var container = $(".table-search");
        // Nếu click bên ngoài đối tượng container thì ẩn nó đi
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.addClass('hide');
        }
    })

    $scope.getNumberPhone = () => {
        var data = {
            import_id: $scope.user.id,
            campaign_id: $scope.user.campaign_id
        };
        $http.post(base_url + 'bg_user/ajax_get_total_phone', data).then(r => {
            if (r && r.data.status == 1) {
                $scope.list_number = r.data.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.logout = () => {
        let url = window.location.href;
        url = removeParam('user', url);
        window.open(url, "_self")
    }

    $scope.loginBg = (phone = "") => {
        if (phone != "") {
            $scope.user.phone = phone;
        }
        if (!$scope.user.phone) {
            $scope.loginMessages = "Nhập số điện thoại!";
            return false;
        }

        $('.container-tab').addClass('loading');
        $http.post(base_url + 'bg_user/ajax_login_bg', JSON.stringify($scope
                .user))
            .then(r => {
                $('.container-tab').removeClass('loading');

                if (r && r.data.status == 1) {
                    $scope.user = {};
                    if (!phone)
                        toastr["success"]("Thành công!");
                    $scope.current_phone = r.data.data.phone;
                    $scope.user = r.data.data;
                    resetPhoneElement();
                    insertParam('user', r.data.data.phone);
                    localStorage.setItem('currentPartner', JSON.stringify(r.data.data));
                    $scope.getNumberPhone();
                    $('#Login').modal('hide');
                } else if (r && r.data.status == 0) {
                    toastr["error"](r.data.message);
                    $('#Login').modal('show');
                } else {
                    toastr["error"]("Đã có lỗi xẩy ra!");
                }
            });
    }

    $scope.checkData = () => {
        var vnf_regex = /((08|09|03|07|05)+([0-9]{8})\b)/g;

        if (!$scope.phoneData.name || $scope.phoneData.name == "") {
            $scope.addErrorMessage = "Không để trống tên!";
            return false;
        }

        if (!$scope.phoneData.phone || $scope.phoneData.phone == "") {
            $scope.addErrorMessage = "Không để trống số điện thoại!";
            return false;
        }
        if ($scope.phoneData.phone.length <= 9 || $scope.phoneData.phone.length >= 11) {
            $scope.addErrorMessage = "Số điện thoại gồm 10 chữ số!";
            return false;
        }

        if (!vnf_regex.test($scope.phoneData.phone)) {
            $scope.addErrorMessage = "Sai số điện thoại!";
            return false;
        }
        return true;
    }

    function current_datetime() {
        var currentdate = new Date();
        var datetime =
            currentdate.getFullYear() + "-" +
            (currentdate.getMonth() + 1) + "-" +
            currentdate.getDate() + "-" +
            currentdate.getHours() + ":" +
            currentdate.getMinutes() + ":" +
            currentdate.getSeconds();
        return datetime;
    }

    function checkShift() {
        const currentPartner = JSON.parse(localStorage.getItem('currentPartner'));
        if (!currentPartner) return false;

        let start_shift = currentPartner.current_shift.start_real;
        let end_shift = currentPartner.current_shift.end_real;
        let current_dt = current_datetime();
        start_shift = Date.parse(start_shift);
        end_shift = Date.parse(end_shift);
        current_dt = Date.parse(current_dt);

        if (start_shift < current_dt && end_shift > current_dt) return true;

        localStorage.removeItem('currentPartner');
        toastr["warning"]("Bạn đang không ở trong ca làm việc!");
        return false;
    }

    function save_error_phone() {
        $scope.phoneData.error_messages = $scope.addErrorMessage;
        $http.post(base_url + 'bg_user/save_error_phones', JSON.stringify($scope.phoneData)).then(r => {
            get_user_information();
            resetPhoneElement();
        });
    }

    $scope.addPhoneData = (type = null) => {
        if ($scope.user.in_error == 1) {
            toastr["error"]("Vui lòng liên hệ admin để tiếp tục!");
            return false;
        }
        delete $scope.addErrorMessage;
        if (!$scope.checkData()) {
            //save_error_phone();
            return false;
        }

        $scope.addLoading = true;
        let data = angular.copy($scope.phoneData);
        data.store_id = $scope.user.store_id;
        data.campaign_name = $scope.user.campaign_name;
        data.location_name = $scope.user.current_shift.location_name;
        data.channel_name = $scope.user.current_shift.channel_name;
        data.user_insert = $scope.user.name + '/' + $scope.user.phone;

        $http.post(base_url + 'bg_user/ajax_save_sale_care_phones', JSON.stringify(data)).then(r => {
            delete $scope.addErrorMessage;
            $scope.addLoading = false;
            if (r && r.data.status == 1) {
                toastr["success"]("Tạo thành công!");
                $scope.user.current_shift.current_process++;
            } else if (r && r.data.status == 0) {
                $scope.addErrorMessage = r.data.message;
                get_user_information();
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
            resetPhoneElement();
        });
    }

    $scope.selectPhone = (value) => {
        $scope.phoneData.name = value.name;
        $scope.phoneData.phone = value.phone;
        $scope.customers = [];
    }

    $scope.hidePhone = (e) => {
        $scope.filter.isHide = e;
        $scope.getDataPhones($scope.filter.is_registed);
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 100);
    }


    $scope.getCamp = () => {
        $http.get(base_url + 'bg_user/ajax_get_main_campaign').then(r => {
            if (r && r.data.status == 1) {
                $scope.camps = r.data.data;
                // $scope.camps.push({
                //     id: 0,
                //     name: 'Chưa xác định',
                //     description: 'Chưa xác định'
                // })
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.clickOutSide = () => {
        $scope.list_key = [];
    }
});
app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})