jQuery(function ($) {
    $.datepicker.regional["vi-VN"] = {
        closeText: "Đóng",
        prevText: "Trước",
        nextText: "Sau",
        currentText: "Hôm nay",
        monthNames: ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
        monthNamesShort: ["Một", "Hai", "Ba", "Bốn", "Năm", "Sáu", "Bảy", "Tám", "Chín", "Mười", "Mười một", "Mười hai"],
        dayNames: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"],
        dayNamesShort: ["CN", "Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy"],
        dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        weekHeader: "Tuần",
        dateFormat: "dd/mm/yy",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ""
    };

    $.datepicker.setDefaults($.datepicker.regional["vi-VN"]);
});

app.controller('timeCtrl', function ($scope, $http, $compile, $window) {
    $scope.init = () => {
        $scope.invoices = {};
        $scope.invoices_check_service = {};
        $scope.load = true;
        $scope.key_search_invoice = '';
        $scope.edit = {
            load: false,
            id: 0,
            doctor: '0',
            dieuduong_external: [],
            dieuduong: [],
            dieuduong_out: [],
        }
        $scope.filter = {
            date: toDay
        }

        $scope.complain = {
            list: {},
            load: false
        }

        $scope.toDay = toDay;
        $scope.isDev = isDev;

        $scope.submitFiller();

        $scope.check_ser = {
            load: false,
        }
        $scope.service_checks = {};
        $scope.loadServiceCheck();

        $('.datepicker-cus').datepicker({
            dateFormat: 'dd-mm-yy',
        });

        $('.datepicker-cus').datepicker('setDate', date_set);

        $('.box-m').css('opacity', '1');
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }

    // $scope.searchInvoice = () => {
    //     console.log($scope.key_search_invoice);
    //     if ($scope.key_search_invoice !== '' && $scope.key_search_invoice !== null) {
    //         var term = $scope.key_search_invoice; // search term (regex pattern)
    //         var search = new RegExp(term, 'i'); // prepare a regex object
    //         let b_toured = $scope.invoices.filter(item =>
    //                 search.test(item.phone) && item.technician_id != 0
    //             ),
    //             b_await = $scope.invoices.filter(item =>
    //                 search.test(item.phone) && item.technician_id == 0 && item.is_finish == 0
    //             );
    //         $scope.invoices_toured = b_toured;
    //         $scope.invoices_await = b_await;
    //     } else {
    //         $scope.invoices_toured = $scope.invoices.filter(item => item.technician_id != 0);
    //         $scope.invoices_await = $scope.invoices.filter(item => item.technician_id == 0 && item.is_finish == 0);
    //     }
    // }

    $scope.setTour = () => {
        $scope.edit.load = true;
        var data = $scope.edit;
        $http.post(base_url + 'invoices/ajax_set_tour_tmv', data).then(r => {
            if (r.data.status == 1) {
                $scope.submitFiller();
                $('#modal_choose').modal('hide');
                // Swal.fire({
                //     icon: 'success',
                //     title: 'Thành công',
                //     text: 'Cập nhật thành công!'
                // });
                toastr['success']('Cập nhật thành công!');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi...',
                    text: r.data.message
                });
            }
            $scope.edit.load = false;
        }, function error(response) {
            $scope.edit.load = false;
            Swal.fire({
                icon: 'error',
                title: 'Lỗi...',
                text: 'Lỗi hệ thống!'
            });
        });
    }

    $scope.setService = () => {
        var invoice_id = $scope.check_ser.invoice_id,
            service_id = [];
        if (!(invoice_id > 0)) {
            toastr.error('Không xác định phiếu thu!', 'Lỗi');
            return;
        }
        $scope.check_ser.load = true;

        $('#modal_service .list-group .list-group-item input[type=checkbox]').each(function (i, v) {
            let ser_id = ($(this).attr('id') + '').replace('check-ser-', '');
            if ($(this).prop('checked') && ser_id > 0) {
                service_id.push(ser_id);
            }
        });

        $http.post(base_url + 'invoices/ajax_set_service_tmv', {
            'invoice_id': invoice_id,
            'service_id': service_id,
        }).then(r => {
            if (r.data.status == 1) {
                $scope.submitFiller();
                $('#modal_service').modal('hide');
                toastr['success']('Cập nhật thành công!');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi...',
                    text: r.data.message
                });
            }
            $scope.check_ser.load = false;
        }, function error(response) {
            $scope.check_ser.load = false;
            Swal.fire({
                icon: 'error',
                title: 'Lỗi...',
                text: 'Lỗi hệ thống!'
            });
        });
    }

    $scope.submitFiller = () => {
        $scope.loadReceiveTour();
        $scope.loadReceiveCheckService();
    }

    $scope.loadReceiveTour = () => {
        $scope.load = true;
        let date = $('.date-filter').val();
        $http.get(base_url + 'invoices/ajax_get_list_invoice_receive_tour_tmv?date=' + date).then(r => {
            if (r.data.status == 1) {
                let data = r.data.data

                $.each(data, function (index, value) {
                    value.list_service = value.list_service ? JSON.parse(value.list_service) : [];

                    $.each(value.list_service, function (i_ser, vl_ser) {
                        vl_ser.list_avt = vl_ser.list_avt ? JSON.parse(vl_ser.list_avt) : [];

                        vl_ser.avt_doctor = vl_ser.list_avt.filter(item => item.type == 'doctor');
                        vl_ser.avt_nurse_external = vl_ser.list_avt.filter(item => item.type == 'nurse_external');
                        vl_ser.avt_nurse = vl_ser.list_avt.filter(item => item.type == 'nurse');
                        vl_ser.avt_nurse_out = vl_ser.list_avt.filter(item => item.type == 'nurse_out');
                    });
                });

                $scope.invoices = data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu phiếu thu cần nhận tour. Vui lòng thử lại sau!');
            }
            $scope.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.loadReceiveCheckService = () => {
        $scope.load = true;
        let date = $('.date-filter').val();
        $http.get(base_url + 'invoices/ajax_get_list_invoice_check_service?date=' + date).then(r => {
            if (r.data.status == 1) {
                let data = r.data.data;
                $scope.invoices_check_service = data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu phiếu thu cần tích dịch vụ. Vui lòng thử lại sau!');
            }
            $scope.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.loadServiceCheck = () => {
        $scope.check_ser.load = true;
        $http.get(base_url + 'invoices/ajax_get_list_service_tmv_check_tour').then(r => {
            if (r.data.status == 1) {
                let data = r.data.data;
                $scope.service_checks = data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu dịch vụ được tích vào phiếu thu. Vui lòng thử lại sau!');
            }
            $scope.check_ser.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.getServiceInvoice = () => {
        $scope.check_ser.load = true;

        $http.get(base_url + 'invoices/ajax_get_list_service_by_invoice?invoice_id=' + $scope.check_ser.invoice_id).then(r => {
            if (r.data.status == 1) {
                let data = r.data.data.length > 0 ? r.data.data : [];
                $('#modal_service .list-group .list-group-item input[type=checkbox]').each(function (i, v) {
                    let ser_id = ($(this).attr('id') + '').replace('check-ser-', '');
                    if ($.inArray(ser_id, data) !== -1) {
                        $(this).prop('checked', true);
                    }
                })
            } else {
                toastr.error(r.data.message, 'Lỗi')
            }
            $scope.check_ser.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.showListSer = (value) => {
        $scope.check_ser.invoice_id = value.invoice_id;
        $('#modal_service .list-group .list-group-item input[type=checkbox]').prop('checked', false);
        $scope.getServiceInvoice();
        $('#modal_service').modal('show');
    }


    $scope.showComplain = (customer_id, is_show = 1) => {
        if (is_show != 1) {
            return;
        }
        $('#modal_complain').modal('show');
        $scope.complain.load = true;
        $http.get(base_url + 'customer_tour/ajax_get_list_compalin?customer_id=' + customer_id).then(r => {
            if (r.data.status == 1) {
                $scope.complain.list = r.data.data;
            } else {
                toastr["error"]('Không thể danh sách khiếu nại. Vui lòng thử lại sau!');
            }
            $scope.complain.load = false;
        }, function error(response) {
            toastr["error"]('Lỗi hệ thống. Vui lòng thử lại sau!');
        });
    }

    $scope.showListTechnicianTMV = (value, obj_ser = 0) => { // obj_ser = 0 là chọn tour cho tất cả dịch vụ và ngc lại
        $('#modal_choose').modal('show');
        select2();

        let invoice_id = value.invoice_id,
            unit_id = '',
            service_description = '',
            type_unit = '';
        if (obj_ser !== 0) {
            unit_id = obj_ser.service_id;
            service_description = obj_ser.description;
            type_unit = obj_ser.type_unit;
        }
        // return;
        $scope.edit = {
            load: true,
            id: invoice_id,
            unit_id: unit_id,
            service_description: service_description,
            type_unit: type_unit,
            doctor: '0',
            dieuduong_external: [],
            dieuduong: [],
            dieuduong_out: [],
        }

        if (obj_ser == 0) {
            $scope.edit.load = false;
            return;
        }
        $http.post(base_url + 'invoices/ajax_get_tour_tmv', {
            'id': invoice_id,
            'unit_id': unit_id
        }).then(r => {
            if (r.data.status == 1) {
                $scope.edit.load = true;
                let data = r.data.data;
                if (data.length) {
                    var doctor = data.filter(item => item.type == 'doctor'),
                        dieuduong_external = data.filter(item => item.type == 'nurse_external'),
                        dieuduong = data.filter(item => item.type == 'nurse'),
                        dieuduong_out = data.filter(item => item.type == 'nurse_out');

                    if (doctor.length) {
                        $.each(doctor, function (i, v) {
                            setTimeout(() => {
                                $scope.edit.doctor = v.user_id;
                                $scope.$apply();
                            }, 0);
                        });
                    }

                    if (dieuduong_external.length) { // điều dưỡng ngoài
                        $.each(dieuduong_external, function (i, v) {
                            setTimeout(() => {
                                $scope.edit.dieuduong_external.push(v.user_id);
                                $scope.$apply();
                            }, 0);
                        });
                    }

                    if (dieuduong.length) {
                        $.each(dieuduong, function (i, v) {
                            setTimeout(() => {
                                $scope.edit.dieuduong.push(v.user_id);
                                $scope.$apply();
                            }, 0);
                        });
                    }

                    if (dieuduong_out.length) { // điều hậu phẩu
                        $.each(dieuduong_out, function (i, v) {
                            setTimeout(() => {
                                $scope.edit.dieuduong_out.push(v.user_id);
                                $scope.$apply();
                            }, 0);
                        });

                    }
                    console.log($scope.edit);
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi...',
                    text: r.data.message
                });
            }
            $scope.edit.load = false;
            select2();

        }, function error(response) {
            $scope.edit.load = false;
            Swal.fire({
                icon: 'error',
                title: 'Lỗi...',
                text: 'Lỗi hệ thống!'
            });
        });
    }

    $scope.removeService = (invoice_id, ser) => {
        if (ser.type_unit != 'customer_package_units') return;

        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: "Xóa <b>" + ser.description + "</b>?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.value) {
                setTimeout(() => {
                    $scope.load = true;
                    $scope.$apply();
                }, 0);

                $http.post(base_url + 'invoice_new/ajax_remove_service_tmv', {
                    'invoice_id': invoice_id,
                    'service_id': ser.service_id,
                }).then(r => {
                    if (r.data.status == 1) {
                        setTimeout(() => {
                            $scope.submitFiller();
                            $scope.$apply();
                        }, 0);

                        toastr['success']('Xóa thành công!');
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Lỗi...',
                            text: r.data.message
                        });
                        setTimeout(() => {
                            $scope.load = false;
                            $scope.$apply();
                        }, 0);
                    }
                }, function error(response) {
                    setTimeout(() => {
                        $scope.load = false;
                        $scope.$apply();
                    }, 0);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi...',
                        text: 'Lỗi hệ thống!'
                    });
                }, function (data, status, headers, config) {
                    toastr["error"]('Vui lòng thử lại!', 'Lỗi!');
                });
            }
        })
    }
})