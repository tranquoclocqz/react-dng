$(".js-example-data-ajax").select2();


if ($('body').width() <= 1250) {
    $('body').addClass('sidebar-collapse');
}
window.onresize = function(event) {
    if ($('body').width() <= 1250) {
        $('body').addClass('sidebar-collapse');
    }
};

app.controller('add', function($scope, $http) {
    $scope.init = () => {
        $('.box').css('opacity', 1);
        $scope.load_tvv = false;
        $scope.load_list_tvv = false;
        $scope.busy_check = false;
        $scope.filter = {};

        let store_param = getParamsValue('store_input');
        $scope.filter.store_id = first_store_id;
        if (store_param) $scope.filter.store_id = store_param;

        if (cr_company == 4) {
            $scope.open_(1);
        }

        $scope.filter.single_date = moment().format('YYYY-MM-DD');

        $scope.filter.service_detail = [];
        $scope.filter.old_package_detail = [];

        $scope.date = moment().format('DD-MM-YYYY');
        $scope.date1 = moment().add(1, 'days').format('DD-MM-YYYY');
        $scope.date2 = moment().add(2, 'days').format('DD-MM-YYYY');
        $scope.is_cskh = 0;
        $scope.app_id = 0;
        $scope.ob = {}
        $scope.ob.name = getParamsValue('name_input');
        $scope.ob.phone = getParamsValue('phone_input');
        $scope.data_tvv = [];
        $scope.technicianHiding = true;

        $scope.setTime();
        var temp = {};
        temp.id = 0;
        $scope.selectUser(temp);
        $scope.getAppChart();
        $scope.ob.technician_id = 0;

        $scope.data = [];
        let param_id = getParamsValue('id');
        if (param_id) {
            $('.content-header H1').html('Chỉnh sửa lịch');
            $scope.openAppDetail({
                appointment_id: param_id
            });
        }

        $scope.open_(1);
    }

    $scope.openHistory = () => {
        $scope.load_his_user = true;
        var data = {
            cr_user: id_current_user
        }
        $http.get(base_url + '/appointments/ajax_open_history?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.load_his_user = false;

                $scope.list_customers = r.data.list_customers;
                $scope.lists = r.data.lists;
                $scope.list_tomorow_customers = r.data.list_tomorow_customers;

            } else toastr["error"]("Đã có lỗi xẩy ra!");

        });
    }


    $scope.openAppDetail = (values) => {
        if (!values.appointment_id || values.appointment_id && values.appointment_id == 0) {
            return false;
        }
        var data = {
            appointment_id: values.appointment_id
        }

        $('form').addClass('loading');
        $http.get(base_url + 'sale_care/ajax_get_detail_app?filter=' + JSON.stringify(data)).then(r => {
            $('form').removeClass('loading');
            if (r && r.data.status == 1) {
                var data_ = angular.copy(r.data.data);

                if (data_.note) {
                    $('#appointment_app .lt_note').html('<b>Lễ tân :</b>' + data_.note);
                } else {
                    $('#appointment_app .lt_note').html('');
                }
                if (data_.cs_note) {
                    $('#appointment_app .cs_note').html('<b>CSKH :</b>' + data_.cs_note);
                } else {
                    $('#appointment_app .cs_note').html('');
                }
                if (data_.adv_note) {
                    $('#appointment_app .adv_note').html('<b>TVV :</b>' + data_.adv_note);
                } else {
                    $('#appointment_app .adv_note').html('');
                }
                $('#appointment_app .created_user_').html('<span class="text-success">*Người tạo: ' + data_.import_name + '</span>');

                angular.element(document.getElementById('btn-moreAttr')).scope().addMoreobject(data_);

                $('#appoint').modal('show');

                if (data_.unit_service) {
                    $scope.filter.service_detail = data_.unit_service.split(",");
                }
                if (data_.unit_old_package) {
                    $scope.filter.old_package_detail = data_.unit_old_package.split(",");
                }
                $scope.changePhone();

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.check_date = (date) => {
        return true;
        var bind = [0, 5, 6];
        var date = moment(date, "YYYY-MM-DD").day();
        if (bind.indexOf(date) >= 0) {
            return false;
        }
        return true;
    }

    $scope.close_technician = () => {
        $scope.technicianHiding = true;
    }

    $scope.open_technician = () => {
        $scope.tvvByTime();
        $scope.technicianHiding = false;
    }

    $scope.selectDate = (date) => {
        if (!date) {
            $scope.filter.single_date = moment().format('YYYY-MM-DD');
        } else {
            $scope.filter.single_date = moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
        }

    }

    $scope.setTime = () => {

        $scope.arr_time = $scope.someFunction();
        $scope.ob_time = [];

        $scope.arr_time.forEach((element, index) => {
            var temp = {
                time: element,
                active: 0
            }

            $scope.ob_time.push(temp);
        });
    }

    $scope.$watch('filter.single_date', function(newValue, oldValue) {
        var date = moment($scope.filter.single_date);
        $scope.cr_date = moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
        if (newValue == oldValue) {
            return false;
        }

        if (date.isValid()) {
            $scope.getAppChart();
            $scope.changePhone();
            if ($scope.load_list_tvv && !$scope.ob.id) {
                $scope.tvvByTime();
            } else {
                var temp = {};
                temp.id = 0;
                $scope.selectUser(temp);
            }
        } else {
            toastr["error"]("Nhập sai ngày");
        }

    }, true);


    $scope.tvvByTime = (id = null) => {
        $scope.load_list_tvv = true;
        $http.get(base_url + '/appointments/ajax_get_tvv_by_time?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {

                $scope.data_tvv = r.data.data;
                $scope.data_tvv.forEach((element, index) => {
                    element.active = 0;
                    if (id) {
                        if (element.id == id) {
                            element.active = 1;
                            var check = true;
                            $scope.selectUser($scope.data_tvv[index]);
                        }
                    } else {
                        if (index == 0) {
                            element.active = 1;
                            $scope.ob.technician_id = element.id;
                            $scope.selectUser($scope.data_tvv[0]);
                        }
                    }

                });


            } else toastr["error"]("Đã có lỗi xẩy ra!");

        })
    }

    $scope.changeStore = () => {
        setTimeout(() => {
            if ($('#storeForm').find(':selected').length == 0) {
                $('select[name=store_id]').select2('val', 1).trigger('change');
            }
            $scope.changeStore_();
        }, 0);


    }

    $scope.changeStore_ = () => {
        $scope.searchTextChild = '';
        //$scope.type = undefined;

        if ($scope.load_list_tvv == true) {
            $scope.tvvByTime();
        } else {
            var temp = {};
            temp.id = 0;
            $scope.selectUser(temp);
        }

        $scope.getService();
        $scope.getAppChart();
    }

    $scope.reFreshForm = () => {
        $scope.ob = {};
        $scope.ob.technician_id = 0;
        $scope.filter.single_date = moment().format('YYYY-MM-DD');
        $scope.time = undefined;
        //$scope.filter.store_id = 1;
        // if (cr_company == 1) {
        //     $scope.type = undefined;
        // }
        $scope.load_history = false;
        $scope.filter.service_detail = [];
        $scope.filter.old_package_detail = [];
        $scope.customer_history = [];
        $scope.is_cskh = 0;

        window.history.pushState("", "", base_url + 'appointments/add');
        $('#appointment_app .lt_note').html('');
        $('#appointment_app .cs_note').html('');
        $('#appointment_app .adv_note').html('');
        $('#appointment_app .created_user_').html('');
        $scope.select2();
        $scope.changeStore();
    }

    $scope.add_appoiments = (event) => {

        if (!$scope.ob.name || $scope.ob.name == "") {
            toastr["error"]("Nhập tên khách hàng");
            return false
        }
        if (!$scope.ob.phone || $scope.ob.phone == "") {
            toastr["error"]("Nhập số điện thoại khách hàng");
            return false

        } else {
            if ($scope.ob.phone.length < 9 && $scope.filter.store_id != 32) {
                toastr["error"]("Sai số điện thoại");
                return false
            }
        }

        if (!$scope.time) {
            toastr["error"]("Chọn thời gian");
            return false
        }

        /*if (!$scope.type && cr_company == 1) {
            toastr["error"]("Chọn loại dịch vụ");
            return false
        }*/

        if ($scope.filter.service_detail.length === 0 && $scope.filter.old_package_detail.length === 0) {
            toastr["error"]("Bạn phải chọn dịch vụ hoặc liệu trình củ nếu có !");
            return false
        }

        /* if ($scope.type == 'service' && $scope.filter.service_detail.length === 0) {
            toastr["error"]("Chọn dịch vụ");
            return false
        }
        if ($scope.type == 'old_package' && $scope.filter.old_package_detail.length === 0) {
            toastr["error"]("Chọn liệu trình cũ");
            return false
        } */
        if (moment().diff($scope.filter.single_date + ' ' + $scope.time, 'YYYY-MM-DD HH:mm') >= 0) {
            toastr["error"]("Đã qua mốc thời gian này!");
            return false;
        }
        //$(event.target).css('pointer-events', 'none');
        var data = {
                id: $scope.ob.id,
                name: $scope.ob.name,
                phone: $scope.ob.phone,
                date: $scope.filter.single_date,
                time: $scope.time,
                store_id: $scope.filter.store_id,
                //unit_type: $scope.type,
                technician_id: $scope.ob.technician_id,
                source_id: getParamsValue('source_id') ? getParamsValue('source_id') : 0,
                adv_request_id: getParamsValue('adv_request_id') ? getParamsValue('adv_request_id') : 0,
                note: $scope.ob.note,
                checkSent: $scope.ob.checkSent ? $scope.ob.checkSent : 0,
                customer_id: $scope.ob.customer_id,
                is_cskh: $scope.is_cskh,
                appointment_id: $scope.ob.appointment_id,
                invoice_id: $scope.ob.invoice_id,
                care_phone_id: $scope.ob.care_phone_id,
                sale_source_id: $scope.ob.sale_source_id,
                sale_services: $scope.ob.sale_services,
                sale_camp_id: $scope.ob.sale_camp_id,
                sale_care_id: $scope.ob.sale_care_id,
                position: $scope.ob.position,
                type_care: $scope.ob.type_care,
                url: window.location.pathname,
                unit_service: $scope.filter.service_detail,
                unit_old_package: $scope.filter.old_package_detail
            }
            /*if ($scope.type == "service") {
                data.unit_id = $scope.filter.service_detail
            } else if ($scope.type == "old_package") {
                data.unit_id = $scope.filter.old_package_detail
            } else {
                data.unit_id = -1;
            }*/
        $(event.target).css('pointer-events', 'none');

        if (cr_company == 4) {
            data.unit_type = $scope.filter.service_detail;
            data.unit_id = 0;
        }

        $http.post(base_url + '/appointments/ajax_save', JSON.stringify(data)).then(r => {
            $(event.target).css('pointer-events', 'auto');
            $('#btnFreshApp').trigger('click');

            if (r && r.data.status == 1) {
                $('#note_error').empty();
                $scope.reFreshForm();
                toastr["success"]("Thành công");
                $('.add_modal').modal('hide');
                var url = location.pathname.split('/').pop();
                if (url == 'cancle_appoints' || url == 'in_day') {
                    if ($('table tr[data-appointid=' + r.data.data.appointment_id + '] .booking .book').has('a').length == 0) {
                        $('table tr[data-appointid=' + r.data.data.appointment_id + '] .booking .book').
                        append('<a href="' + base_url + 'appointments/add/' + r.data.data.re_appointment_id + '" class="lb-ct label-success" target="_blank">Đã đặt lịch</a>')
                    }

                    $('table tr[data-appointid=' + r.data.data.appointment_id + '] .last_node').
                    append('<br> ' + r.data.data.note);
                } else if (url == 'sale_care') {
                    $('#btnLoadPage').trigger('click');
                } else if (url == 'telesales_v2') {
                    angular.element(document.getElementById('insertData')).scope().insertData(r.data.detail);
                }
                $scope.old_package_rs = [];
                
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
                if (r.data.data) {
                    $scope.app_id = r.data.data;
                }
                if (location.pathname.split('/').pop() == 'cancle_appoints' || location.pathname.split('/').pop() == 'in_day' || location.pathname.split('/').pop() == 'sale_care' || location.pathname.split('/').pop() == 'telesales_v2') {
                    if (r.data.data) {
                        $('#note_error').
                        append('<a href="' + base_url + 'appointments/add/' + r.data.data + '" class="lb-ct text-danger" target="_blank">Bấm vào để đến chỉnh sửa lịch hẹn</a>')
                    }
                }

            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        })


    }

    $scope.addMoreobject = (value) => {

        if (value.source_id) {
            $scope.ob.sale_source_id = value.source_id;
        }

        if (value.services) {
            $scope.ob.sale_services = value.services;
        }

        if (value.camp_id) {
            $scope.ob.sale_camp_id = value.camp_id;
        }

        if (value.id) {
            $scope.ob.id = value.id;
        }

        if (value.name) {
            $scope.ob.name = value.name;
        }

        if (value.phone) {
            $scope.ob.phone = value.phone;
        }

        if (value.customer_id) {
            $scope.ob.customer_id = value.customer_id;
        }

        if (value.store_id) {
            $scope.filter.store_id = value.store_id;
            $scope.getService();
        }

        if (value.date) {
            $scope.filter.single_date = value.date;
        }

        /*if (value.unit_type) {
            $scope.type = value.unit_type;
            setTimeout(() => {
                if (value.unit_type == "service") {
                    //	$scope.filter.service_detail = value.unit_id;
                    $scope.getService(value.unit_id);
                } else if (value.unit_type == "old_package") {
                    $scope.get_old_package(value.unit_id);
                }
                $scope.$apply();
            }, 100);
        }*/

        if (cr_company == 4) {
            $scope.filter.service_detail = value.unit_type.trim();
        }

        if (value.time) {
            $scope.time = value.time;
        }


        if (value.sale_care_id) {
            $scope.ob.sale_care_id = value.sale_care_id;
        }
        if (value.invoice_id > 0) {
            value.is_over = 1;
        }

        if (value.is_over) {
            $scope.ob.is_over = value.is_over;
        }



        if (value.today && value.today == 1 && value.technician_id == 0) {
            $scope.selectUser({
                id: 0
            });
        }

        $scope.technicianHiding = true;
        if (value.technician_id > 0) {
            $scope.tvvByTime(value.technician_id);
            $scope.technicianHiding = false;
        }

        $scope.select2();
    }



    $scope.select2 = (time = 200) => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, time);
    }

    $scope.open_ = (e) => {
        if (e == 1) {
            $scope.getService();
        } else if (e == 2) {
            $scope.get_old_package();
        }
    }

    $scope.getService = () => {

        var data = angular.copy($scope.filter);
        $('.load-dr').css('display', 'block');

        $http.get(base_url + '/appointments/ajax_get_service?filter=' + JSON.stringify(data)).then(r => {
            $('.load-dr').css('display', 'none');

            if (r && r.data.status == 1) {
                $scope.category_rs = r.data.data;
                $scope.select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");

        })

    }

    $scope.get_old_package = (id = null) => {
        var data = {
            limit: 20,
            customer_id: $scope.ob.customer_id
        };
        $('.load-dr').css('display', 'block');
        $scope.old_package_rs = [];
        $http.get(base_url + '/customers/ajax_get_customer_package_unit_service_can_use?' + $.param(data)).then(r => {
            $('.load-dr').css('display', 'none');
            if (r && r.data.status == 1) {
                $scope.load_history = false;
                $scope.old_package_rs = r.data.data;
                $scope.select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $('.dropdown-menu.resust-search').on('mousedown', 'table tbody tr:not(.par-info)', function(e) {
        console.log(2);
        let p = $(this).attr('data-phone').trim(),
            n = $(this).attr('data-name');
        customer_id = $(this).attr('data-phone-id');

        $scope.$apply(function() {
            $scope.ob.name = n;
            $scope.ob.phone = p;
            $scope.ob.customer_id = customer_id;
            $scope.changePhone();
        });
    });

    $scope.changePhone = (event) => {
        if ($scope.ob.phone && $scope.ob.phone > 3) {
            searchPhone($scope.ob.phone);
        }
        if (!$scope.ob.phone || ($scope.ob.phone && $scope.ob.phone.length < 9)) {
            return false;
        } else if ($scope.ob.phone && $scope.ob.phone.length > 11) {
            $scope.ob.phone = $scope.cr_phone;
        }
        $scope.load_history = true;

        var data = {
            phone: $scope.ob.phone,
            date: $scope.filter.single_date
        }
        $('input[name=save]').css('pointer-events', 'none');
        $http.get(base_url + '/appointments/ajax_customer_history?filter=' + JSON.stringify(data)).then(r => {

            $scope.load_history = false;
            if (r && r.data.status == 1) {
                $scope.customer_history = r.data.data;
                $scope.app_id = r.data.app;

                if ($scope.app_id == 0) {
                    $scope.filter.service_detail = [];
                    $scope.filter.old_package_detail = [];
                }

                if ($scope.ob.customer_id) {
                    $scope.open_(2);
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $('input[name=save]').css('pointer-events', 'initial');
        });
        $scope.cr_phone = angular.copy($scope.ob.phone);
    }

    $scope.changeTime = (item) => {
        if (moment().diff($scope.filter.single_date + ' ' + item.time, 'YYYY-MM-DD HH:mm') >= 0) {
            toastr["error"]("Đã qua mốc thời gian này!");
            return false;
        }
        if (item.percent > $scope.percent && $scope.ob.customer_id) {
            toastr["error"]("Lựa chọn mốc thời gian khác!");
            return false;
        }


        $scope.current_time = item;

        $scope.time = item.time;
        $scope.ob_time.map(function(x) {
            x.active = 0;
            return x
        });

        //	$scope.time.value = item;
        item.active = 1;
        $scope.checkIssetKtv(item.time);
    }

    $scope.checkIssetKtv = (time) => {
        if ($scope.ob.technician_id == 0) {
            return false;
        }
        var data = {
            id: $scope.ob.technician_id,
            date: $scope.filter.single_date,
            time: time + ':00',
            phone: $scope.ob.phone
        }
        $('input.save').css('pointer-events', 'none');

        $http.get(base_url + '/appointments/ajax_check_isset_ktv?filter=' + JSON.stringify(data)).then(r => {
            $('input.save').css('pointer-events', 'initial');

            if (r && r.data.status == 1) {
                if (r.data.data > 0) {
                    $scope.clearTime();
                    toastr["error"]("KTV tại khung giờ này đang bận, vui lòng chọn KTV khác!");
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }

    $scope.clearTime = () => {
        $scope.time = undefined;
        $scope.ob_time.map(function(x) {
            x.active = 0;
            return x
        });
    }

    $scope.resetTime = () => {
        //	$scope.time = undefined;
        $scope.ob_time.map(function(x) {
            x.active = 0;

            if ($scope.time) {
                $scope.ob_time.map(function(x) {
                    x.active = 0;
                    var time = $scope.time;
                    if (moment(x.time + ':00', 'HH:mm:ss')._i == moment(time, 'HH:mm:ss')._i) {
                        x.active = 1;
                    }
                    return x
                });
            }
            return x
        });
    }




    $scope.selectUser = (item) => {

        $scope.resetTime();
        $scope.cr_user = item;
        $scope.filter.technician_id = item.id;
        $scope.ob.technician_id = item.id;
        $scope.data_tvv.map(function(x) {
            x.active = 0;
            return x
        });
        item.active = 1;
        $scope.load_tvv = true;
        $http.get(base_url + '/appointments/ajax_get_tvv_ap?filter=' + JSON.stringify($scope.filter)).then(r => {


            $scope.load_tvv = false;
            $('.title-ktv').css('display', 'block');

            if (r && r.data.status == 1) {


                $scope.total_in = r.data.total_in;

                $scope.percent = r.data.percent;

                $scope.off;
                $scope.ob_time.map(function(x, index) {
                    x.app_customer_old = 0;
                    x.app_customer_new = 0;
                    x.total = undefined;
                    x.bettwen = false;


                    x.off = false;
                    if (r.data.off) {
                        $scope.off = r.data.off;

                        var time = moment($scope.filter.single_date + ' ' + x.time + ':00', 'YYYY-MM-DD HH:mm:ss'),
                            beforeTime = moment($scope.off.closed_from, 'YYYY-MM-DD HH:mm:ss'),
                            afterTime = moment($scope.off.closed_to, 'YYYY-MM-DD HH:mm:ss');


                        if (time.isBetween(beforeTime, afterTime, null, '[]')) {

                            x.off = true;

                        }
                    }

                    if (item.shift_id && item.shift_id != 0) {
                        var time = moment(x.time + ':00', 'HH:mm:ss'),
                            beforeTime = moment(item.begin, 'HH:mm:ss'),
                            afterTime = moment(item.end, 'HH:mm:ss');

                        if (time.isBetween(beforeTime, afterTime, null, '[]')) {

                            x.bettwen = true;

                        }
                    }
                    if (item.id == 0) {
                        x.bettwen = true;
                    }
                    //set tay
                    if (index == 24 && item.shift_id != -1 && item.shift_id != 0) {
                        x.bettwen = true;
                    }
                    x.percent = 0;
                    r.data.data.map(function(y) {
                        if (moment(x.time, 'HH:mm').format('HH:mm') == moment(y.hour, 'HH:mm').format('HH:mm')) {

                            x.total = y.total;

                            if (r.data.total_ktv) {
                                x.percent = y.total / r.data.total_ktv;
                            }

                        }
                    });

                    x.active = 0;
                    if ($scope.time) {
                        var time = $scope.time;
                        if (moment(x.time + ':00', 'HH:mm:ss')._i == moment(time, 'HH:mm:ss')._i) {
                            x.active = 1;
                        }
                    }
                    return x
                });

                $scope.getAppHourCustomerType();

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getAppHourCustomerType = () => {
        $scope.load_tvv = true;
        var data_rq = {
            date: $scope.filter.single_date,
            store_id: $scope.filter.store_id,
        };
        $http.get(base_url + 'appointments/ajax_get_list_appointment_hour_customer_type?' + $.param(data_rq)).then(r => {
            $scope.load_tvv = false;
            if (r && r.data.status == 1) {
                var data = r.data.data;
                $.each($scope.ob_time, function(index, value) {
                    var check = data.find(x => x.hour == value.time);
                    if (check) {
                        value.app_customer_old = check.old;
                        value.app_customer_new = check.new;
                    }
                });

            } else showMessErr(r.data.message)
        }, function() {
            showMessErrSystem('Không thể lấy khách mới cũ theo khung giờ');
        })
    }

    $scope.getAppChart = () => {
        $scope.data = [];
        $http.get(base_url + '/appointments/ajax_get_scheduled_time_by_appointment?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.appointments = r.data.data;
                $scope.total_all = r.data.total_all;
                $scope.total_fi = r.data.total_fi;
                $scope.total_su = r.data.total_su;
                r.data.data.forEach(element => {
                    element.total = parseInt(element.total);
                    element.success_show = parseInt(element.success);
                    element.success = parseInt(element.success);
                    element.unsuccess = element.total - element.success;
                    element.finish = parseInt(element.finish);
                    if (element.finish > 0) {
                        element.success = element.success - element.finish;
                    }

                });
                $scope.dataApmt = r.data.data;
                var time = $scope.someFunction();

                time.forEach((element, k) => {
                    let defaut_time = {
                        hour: element,
                        total: 0,
                        success: 0,
                        success_show: 0,
                        unsuccess: 0,
                        finish: 0,
                        obs: []
                    }
                    r.data.data.forEach((e, key) => {
                        var time = e.hour

                        if (moment(element, 'H:mm').unix() == moment(time, 'H:mm').unix()) {
                            defaut_time.hour = element;
                            defaut_time.total = e.total;
                            defaut_time.success = e.success || 0;
                            defaut_time.success_show = e.success_show || 0;
                            defaut_time.unsuccess = e.unsuccess || 0;
                            defaut_time.finish = e.finish || 0;
                            defaut_time.obs = e.obs;
                        } else {
                            defaut_time.hour = element;
                        }
                    });
                    $scope.data.push(defaut_time);
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    ///bảng đặt lịch


    $scope.openDetailHour = (list, time) => {
        $scope.detailHour = list;
        $scope.time_current = time;
        $('#detailHour').modal('show');
    }

    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.someFunction = () => {
        let items = [];
        new Array(24).fill().forEach((acc, index) => {
            if (index > 7 && index < 22) {
                if (index > 8) {
                    items.push(moment({
                        hour: index
                    }).format('HH:mm'));
                }

                if (index != 21) {
                    items.push(moment({
                        hour: index,
                        minute: 30
                    }).format('HH:mm'));
                }
            }
        })
        return items;
    }

    $scope.outOfInput = () => {
        $('.dropdown-menu.resust-search').addClass('hidden');
    }


});
app.filter('custom', function() {
    return function(input, search) {
        function ToSlug(title) {
            if (title == '') return '';
            //Đổi chữ hoa thành chữ thường
            slug = title.toLowerCase();

            //Đổi ký tự có dấu thành không dấu
            slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
            slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
            slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
            slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
            slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
            slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
            slug = slug.replace(/đ/gi, 'd');
            //Xóa các ký tự đặt biệt
            slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*||∣|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
            //Đổi khoảng trắng thành ký tự gạch ngang
            //slug = slug.replace(/ /gi, " - ");
            //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
            //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
            slug = slug.replace(/\-\-\-\-\-/gi, '-');
            slug = slug.replace(/\-\-\-\-/gi, '-');
            slug = slug.replace(/\-\-\-/gi, '-');
            slug = slug.replace(/\-\-/gi, '-');
            //Xóa các ký tự gạch ngang ở đầu và cuối
            slug = '@' + slug + '@';
            slug = slug.replace(/\@\-|\-\@|\@/gi, '');
            return slug
        }

        if (!input) return input;
        if (!search) return input;
        //var expected = ('' + search).toLowerCase();
        var expected = ToSlug(search);
        var result = {};
        angular.forEach(input, function(value, key) {
            //	var actual = ('' + value.user_name).toLowerCase();
            var actual = ToSlug(value.user_name);
            if (actual.indexOf(expected) !== -1) {
                result[key] = value;
            }
        });
        return result;
    }
});
// begin search phone	
var timer;
$('input[name=phone]').on('change', function() {
    if (v.length > 3) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            searchPhone(v);
        }, 350);
    }
});

function viewRs(html) {
    $('.dropdown-menu.resust-search').html(`
    <table class="table table-bordered tablelte-full table-hover">
        <tbody>
            <tr class="info par-info">
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th>Ngày tạo</th>
                <th>Chi nhánh</th>
            </tr>
            ${html}
        </tbody>
    </table>`);
}

function searchPhone(v) {
    $.ajax({
        type: "get",
        url: base_url + 'customers/get_list_customer_by_phone',
        data: {
            phone: v,
            company_id: cr_company
        },
        beforeSend: function() {
            $('.dropdown-menu.resust-search table').addClass('load');
            $('input[name=phone]').parent().addClass('loading2');
        },
        dataType: "json",
        success: function(response) {
            if (response.status) {
                var data = response.data,
                    tbody = '';
                if (data) {
                    $.each(data, function(index, element) {
                        tbody += `<tr ${element.app_now == "YES" ? 'class="info"' : ''} data-name="${element.name}" data-phone-id="${element.id}" data-phone="${element.phone}" data-store_id="${element.store_id}">
											<td><div title="${element.name}">${element.app_now == "YES" ? '<i class="fa fa-calendar" style="color: #00a65a;"></i>' : ''} ${element.name}</div></td>
											<td>${element.phone}</td>
											<td>${element.created}</td>
											<td><div>${element.name_stores}</div></td>
										</tr>`;
                    });
                    viewRs(tbody);
                    setTimeout(() => {
                        if ($('input[name=phone]').is(':focus')) {
                            $('input[name=phone]').parent().addClass('open');
                        }
                    }, 100)
                }
            }
        },
        complete() {
            setTimeout(() => {
                $('.dropdown-menu.resust-search').parent().removeClass('loading2');
            }, 100);
        },
        error() {
            toastr.error('Có lỗi xảy ra!')
        }
    });
}

$(document).on('mouseup', function(e) {
    var container = $(".dropdown-menu .resust-search");
    // Nếu click bên ngoài đối tượng container thì ẩn nó đi
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('input[name=phone]').parent().removeClass('open');
    }
})