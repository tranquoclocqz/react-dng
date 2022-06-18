
app.controller('add_order', function ($scope, $http, $compile) {
    $scope.init = () => {
        $('.box').css('opacity', 1);
        $scope.current_user_id = id_current_user;
        $scope.arr = [];
        $scope.order = {};
        $scope.loading = false;
        $scope.order.user_id = 0;
        $scope.off_date = 0;
        $scope.id_group_user = 0;
        $scope.confirm_off_date = false;
        $scope.is_contact = 0;
        $scope.arr_off_select = []; //tạo
        $scope.arr_off_confirm = []; //duyệt
        $scope.expired_time_off = 0;
        $scope.off_seniority = 0;
        $scope.total_off = 0;
        $scope.expired_day_off = 0;
        $scope.historys_off_count = 0;
        $scope.check = false;
        $scope.order.status = "0";
        $scope.id_off = 0;
        $scope.order.off_type = "1";
        $scope.is_office = is_office;
        $scope.historys_off = {};
        $scope.is_show_day_off = true;
        $scope.all_employees = all_employees;
        $scope.count_history = 0; // số ngày đã off định kì chi nhánh
        $scope.current_id = current_id;
        $scope.current_main_store_id = current_main_store_id;
        $scope.current_main_group_id = current_main_group_id;
        if (c_user_id)
            $scope.order.user_id = c_user_id;
            
        $scope.order.date_session = "0";
        if (!$scope.arr_off_confirm || $scope.arr_off_confirm == '') {
            $.each($scope.arr_off_select, function (key, value) {
                $scope.arr.push(1);
                setTimeout(() => {
                    $(document).find(`.datepicker` + key).val($scope.arr_off_select[key]);
                }, 0);
            });
        } else {
            $.each($scope.arr_off_confirm, function (key, value) {
                $scope.arr.push(1);
                setTimeout(() => {
                    $(document).find(`.datepicker` + key).val($scope.arr_off_confirm[key]);
                }, 0);
            });
        }
        let param_id = getParamsValue('id');
        if (param_id) {
            $('.content-header H1').html('Chi tiết');
            $scope.openOrderDetail({ id: param_id });
        }
        $scope.datePicker();
        $scope.get_list_user_request();
    }

    $scope.openOrderDetail = (data) => {
        $('form').addClass('loading');
        $http.get(base_url + 'staffs/get_detail_order?filter=' + JSON.stringify(data)).then(r => {
            $('form').removeClass('loading');
            if (r.data) {
                r = r.data;
                $scope.detail_order = r;
                $scope.id_off = r.id;
                $scope.order.company_id = r.company_id;
                $scope.order.user_id = r.user_id;
                $scope.order.user_name = r.user_name;
                $scope.order.store_name = r.store_name;
                $scope.order.main_group_id = r.main_group_id;
                $scope.order.confirm_id = r.confirm_id;
                $scope.order.date_session = r.date_session;
                $scope.order.date_start = r.min_date;
                $scope.order.date_end = r.max_date;
                if ($scope.order.confirm_id == id_current_user) {
                    $scope.order.status = "1";
                }
                $scope.order.note = r.note;
                $scope.order.confirm_note = r.confirm_note;
                if (type == 2) {
                    $scope.order.store_arrival_id = r.store_arrival_id;
                } else if (type == 1) {
                    $scope.order.off_type = r.off_type;
                    // $scope.get_day_off();
                } else if (type == 3) {
                    $scope.order.late_minutes = parseInt(r.late_minutes);
                    $scope.order.soon_minutes = parseInt(r.soon_minutes);
                }

                $scope.select2();
            }
        });
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }
    $scope.unsetDis = () => {
        $('.content .disabled').removeClass('disabled');
        $('.content .users').addClass('disabled');
    }

    $scope.changeInputStart = () => {
        if (!$scope.id_off) {
            $scope.arr = [];
            $scope.arr_off_select = [];
        }
        if ($scope.order.date_start && $scope.order.date_start != '') {
            if (is_ql) {
                if (moment().diff($scope.order.date_start, 'day') >= write_limit_day) {
                    toastr["error"]("Không thể chọn sau " + write_limit_day + " ngày!");
                    $scope.order.date_start = '';
                }
            } else {
                if (moment().diff($scope.order.date_start, 'day') > 0) {
                    toastr["error"]("Vui lòng chọn ngày trong tương lai!");
                    $scope.order.date_start = '';
                }
            }
        }
        if ($scope.order.date_end && $scope.order.date_end != '') {
            if (is_ql) {
                if (moment().diff($scope.order.date_start, 'day') >= write_limit_day) {
                    toastr["error"]("Không thể chọn sau " + write_limit_day + " ngày!");
                    $scope.order.date_end = '';
                }
            } else {
                if (moment().diff($scope.order.date_end, 'day') > 0) {
                    toastr["error"]("Vui lòng chọn ngày trong tương lai!");
                    $scope.order.date_end = '';
                }
            }
        }
        if ($scope.order.date_start && $scope.order.date_start != '' && $scope.order.date_end && $scope.order.date_end != '') {
            if (moment($scope.order.date_start, 'YYYY-MM-DD').diff(moment($scope.order.date_end, 'YYYY-MM-DD')) > 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.order.date_end = '';
            }
        }
    }

    $scope.detail_off = () => {
        $('#detail_off').modal('show');
    }
   

    $scope.check_type = () => {
        // if (typeof $scope.order.off_type != 'undefined') {
        if ($scope.order.date_session != 0 && $scope.order.off_type == 1) {
            $scope.arr = [];
            $scope.arr_off_select = [];
            // $scope.get_day_off();
            $('#btn_choice_date_off').css('display', 'none');
        } else {
            $scope.arr_off_select = [];
            $('.datepicker_change').val("");
            if ($scope.is_show_day_off) {
                setTimeout(() => {
                    $('#btn_choice_date_off').css('display', '');
                }, 60);
            } else {
                setTimeout(() => {
                    $('#btn_choice_date_off').css('display', 'none');
                }, 60);
            }
        }
        if ($scope.order.off_type == 2) {
            $('#btn_choice_date_off').css('display', 'none');
        }
        // }
        if ($scope.off_date == 0) {
            // $scope.order.off_type = "2";
            $('#btn_choice_date_off').css('display', 'none');
        }
        setTimeout(() => {
            $('.select2').select2();
        }, 100)
    }
    $scope.check_date_session = () => {
        if ($scope.order.date_session == 0) {
            $('#btn_choice_date_off').css('display', 'unset');
        } else {
            $('#btn_choice_date_off').css('display', 'none');
            $scope.check_type();
            toastr.error("Nghỉ phép chỉ áp dụng với cả ngày ");
        }
    }
    $scope.datePicker = () => {
        setTimeout(() => {
            $('.datepicker_change').datepicker({
                minDate: new Date($scope.order.date_start),
                maxDate: new Date($scope.order.date_end),
                dateFormat: "yy-mm-dd"
            });
        }, 500);
    }
    $scope.confirm_off = () => {
        $scope.confirm_off_date = true;
        $('#click').trigger('click');

    }
    $scope.changeStatus = (status, id, type, event) => {
        if ($scope.confirm_note == '' || !$scope.confirm_note) {
            toastr["error"]("Nhập lý do!");
            return false;
        }
        $(event.target).css('pointer-events', 'none');
        var data = {
            type: type,
            confirm_note: $scope.confirm_note
        };

        $http.post(base_url + 'staffs/ajax_change_status_order/' + id + '/' + status, JSON.stringify(data)).then(r => {
            $(event.target).css('pointer-events', 'initial');
            if (r && r.data.status == 1) {
                if (status == 1) {
                    $('#accept').modal('hide');
                } else {
                    $('#denit').modal('hide');
                }
                $('#remove').modal('hide');
                toastr["success"]("Thành công!");
                $scope.confirm_note = "";
                setTimeout(() => {
                    window.location = base_url + 'staffs/order_date_off';
                }, 2000);

            } else if (r && r.data.status == 0) {
                toastr["error"]("Bạn không có quyền duyệt đơn này!");
            } else if (r && r.data.status == 2) {
                toastr["error"]("Chỉ có thể hủy đơn trong ngày!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.openRemove = (max_date, id, type) => {
        if (!is_only_dev) {
            var left = moment().diff(moment(max_date, 'DD/MM/YYYY').add(2, "days"), 'days');
            if (left <= 0) {
                $scope.cr_id = id;
                $scope.cr_type = type;
                $('#remove').modal('show');
            } else {
                toastr["error"]("Quá ngày!");
            }
        } else {
            $scope.cr_id = id;
            $scope.cr_type = type;
            $('#remove').modal('show');
        }
    }
    $scope.history_off = () => {
        $('#history_off').modal('show');
    }
    $(document).on('change', '.datepicker_change', function (e) {
        var self = $(this),
            day_ = self.val(),
            check = new Date(day_).getDay(),
            flag_exit = false,
            arr_select = $('.datepicker_change'),
            cr_key = self.attr('data-key'),
            month_crr = new Date(day_).getMonth(),
            month_selected = [];

        if (arr_select.length > 1)
            $.each($('.datepicker_change'), function (key, value) {
                if (key != cr_key) {
                    var tmp = new Date($(this).val());
                    month_selected.push(tmp.getMonth());
                }
                if (key != cr_key && $(this).val() == day_ && day_) {
                    flag_exit = true;
                }

            });
        if (flag_exit) {
            toastr.error("Ngày này đã được chọn");
            self.val('');
            return;
        }

        if (month_selected.includes(month_crr) && $scope.is_contact == 0) {
            toastr.error("Không thể chọn 2 ngày phép trong một tháng");
            self.val('');
            return;
        }

        if (check === 0) {
            toastr.error("Ngày vừa chọn là Chủ Nhật");
            self.addClass('input-error');
        } else {
            self.removeClass('input-error');
        }
    });

    $scope.sub_nb = (key) => {
        $(`.datepicker` + key).val("");
    }

    $scope.select_date_off = () => {
        if ($scope.id_off) {
            $scope.arr_off_confirm = [];
            for (i = 0; i < $scope.arr.length; i++) {
                if ($(`.datepicker` + i).val() != '' && $(`.datepicker` + i).val() != undefined) {
                    $scope.arr_off_confirm.push($(`.datepicker` + i).val());
                } else {
                }
            }
        } else {
            $scope.arr_off_select = [];
            for (i = 0; i < $scope.arr.length; i++) {
                if ($(`.datepicker` + i).val() != '' && $(`.datepicker` + i).val() != undefined) {
                    $scope.arr_off_select.push($(`.datepicker` + i).val());
                } else {
                }
            }
        }
    }

    $scope.show_date_off = () => {
        if ($scope.order.date_start != '' && $scope.order.date_end != '') {
            if ($scope.arr < $scope.off_date) {
                for (i = 0; i < $scope.off_date; i++) {
                    $scope.arr.push(1);
                }
                var d_start = $scope.order.date_start.split('-');
                var d_end = $scope.order.date_end.split('-');
                var day = d_start[2];
                var month = d_start[1];
                var year = d_start[0];
                var month_shift = ["01", "03", "05", "07", "08", "10", "12"];
                setTimeout(() => {
                    for (i = 0; i < $scope.arr.length; i++) {
                        if ($scope.is_contact == 0 && i > 0) {
                            break;
                        }
                        if (day > 31 && month_shift.includes(month)) {
                            day = 1;
                            ++month;
                        }
                        if (day > 30 && !month_shift.includes(month) && month != '02') {
                            day = 1;
                            ++month;
                        }
                        if (day > 28 && month == '02') {
                            day = 1;
                            ++month;
                        }
                        if (month > 12) {
                            month = 1;
                            ++year;
                        }
                        if ((day <= d_end[2] && d_start[1] == d_end[1]) || d_start[1] != d_end[1]) {
                            if ($(`.datepicker` + i).val() == '') {
                                $(`.datepicker` + i).val(year + '-' + month + '-' + day);
                            }
                        }
                        day++;
                    }
                }, 600);

            }
            $('#modal_set_date_off').modal('show');
        } else {
            toastr["error"]("Chọn ngày bắt đầu và kết thúc");
        }
        $scope.datePicker();
    }

    $scope.checkDayLastMonth = () => {
        var tmp = new Date(new Date().getTime());
        tmp.setDate(tmp.getDate() + 1);
        return tmp.getDate() === 1;
    }

    $scope.checkForm = (event) => {
        $scope.hour_crr = new Date().getHours();
        $scope.minute_crr = new Date().getMinutes();
        if ($scope.checkDayLastMonth() == true && (($scope.hour_crr >= "12" && $scope.minute_crr >= "30") || $scope.hour_crr >= "13")) {
            event.preventDefault();
            toastr["error"]("Đã quá thời gian tạo đơn trong tháng mày! Vui lòng tạo đơn trước 12:30 để nhân sự xác nhận");
            return false;
        }
        if (!$scope.order.user_id || $scope.order.user_id == 0) {
            event.preventDefault();
            toastr["error"]("Chọn nhân viên!");
            return false;
        }
        if (!$scope.order.confirm_id || $scope.order.confirm_id == 0) {
            event.preventDefault();
            toastr["error"]("Chọn người duyệt!");
            return false;
        }
        if (type == 1) {
            if (!$scope.order.off_type) {
                event.preventDefault();
                toastr["error"]("Chọn loại nghỉ phép!");
                return false;
            }
        }
        if (!$scope.order.date_start || $scope.order.date_start == "") {
            event.preventDefault();
            toastr["error"]("Chọn ngày bắt đầu!");
            return false;
        }
        if (type == 1 || type == 2) {
            if (!$scope.order.date_end || $scope.order.date_end == "") {
                event.preventDefault();
                toastr["error"]("Chọn ngày kết thúc!");
                return false;
            }
        }
        if (type == 2) {
            if (!$scope.order.store_arrival_id) {
                event.preventDefault();
                toastr["error"]("Chọn chi nhánh công tác!");
                return false;
            }
        }

        if (type == 3) {
            if (!$scope.order.late_minutes && !$scope.order.soon_minutes) {
                event.preventDefault();
                toastr["error"]("Chọn phút!");
                return false;
            }
            if ($scope.order.late_minutes < 0 || $scope.order.soon_minutes < 0) {
                event.preventDefault();
                toastr["error"]("Không được âm!");
                return false;
            }
        }

        if (!$scope.order.note || $scope.order.note && $scope.order.note == '') {
            event.preventDefault();
            toastr["error"]("Nhập lý do!");
            return false;
        }
        if ($scope.id_off == 0 && $scope.off_date > 0 && $scope.arr_off_select.length == 0 && $scope.confirm_off_date == false) {
            event.preventDefault();
            $('#confirm_off').modal('show');
            return false;
        }
        swal({
            title: "Cảnh báo",
            text: "Bạn có chất muốn thưc hiện hành động này?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        },
        function () {
            $scope.saveOrder();
            $('form').addClass('loading');
            $(event.target).addClass('disabled');
        });
    }

    $(".file_upload").on("change", function (e) {
        $(e.target).addClass('loading');
        var fd = new FormData();
        var files = $(e.target)[0].files[0];

        fd.append('file', files);

        $('#click').addClass('disabled');

        $http({
            method: 'post',
            url: 'Uploads/ajax_upload_to_filehost?func=staffs_submit_order',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(r) {
            $('#click').removeClass('disabled');

            $(e.target).removeClass('loading');
            if (r && r.data.status) {
                $scope.order[$(e.target).attr('data-model')] = r.data.data[0];
                console.log($scope.order);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    });


    $scope.saveOrder = () => {
        $scope.order.type = type;
        $scope.order.is_office = is_office;
        $scope.order.id_off = $scope.id_off;
        $scope.order.arr_off_select = [];
        $scope.order.arr_off_confirm = [];
        $http.post(base_url + 'staffs/save_order', $scope.order).then(r => {
            $('form').removeClass('loading');
            $('#click').removeClass('disabled');
            if (r.data.url) {
                window.location = r.data.url;
            }
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    $scope.getNumberDateOff = (id) => {
        if (type == 1) {
            $scope.user_id = id;
            // $scope.get_day_off();
            $scope.get_number_off_in_month();
            $scope.arr = [];
            $scope.arr_off_select = [];
            $scope.order.date_start = '';
            $scope.order.date_end = '';
            setTimeout(() => {
                if ($scope.off_date > 0) {
                    $('.datepicker_change').val("");
                    $('#btn_choice_date_off').css('display', 'unset');
                }
            }, 1000);
        }
        if (!$scope.is_office) {
            if (id != id_current_user) {
                $scope.order.status = '1';
            } else {
                $scope.order.status = '0';
            }
        }
        if (type == 1) {
            $http.get(base_url + 'staffs/get_number_date_off/?filter=' + JSON.stringify($scope.order)).then(r => {
                if (r && r.data.status == 1) {
                    // $scope.numberDayOff = r.data.data;
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }

        $http.get(base_url + '/staffs/get_company_and_group_user' + '?user_id=' + $scope.order.user_id).then(r => { // lấy danh sách người duyệt dựa theo người được chọn
            if (r.data && r.data.status == 1) {
                $scope.order.company_id = r.data.data.company_id;

                if (current_main_store_id == 8 && r.data.data.main_store_id == 8) {
                    $scope.office = 1;
                } else {
                    $scope.office = 0;
                }

                $scope.get_list_user_permission_approve_off($scope.order.user_id, r.data.data.main_group_id, $scope.order.company_id);
                select2();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });

        // $http.get(base_url + '/staffs/get_company_and_group_user' + '?user_id=' + $scope.order.user_id).then(r => {
        //     if (r.data && r.data.status == 1) {
        //         $scope.order.company_id = r.data.data.company_id;
        //     } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        // });
    }

    $scope.get_list_user_request = () => {
        $http.get(base_url + '/staffs/ajax_get_list_user_request_off' + '?user_id=' + $scope.current_id + '&main_group_id=' + $scope.current_main_group_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_request = r.data.data;
                select2();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }

    $scope.get_list_user_permission_approve_off = (user_id, group_id, company_id) => { // lấy tất cả những người và nhóm có quyền duyệt đề xuất
        $http.get(base_url + '/staffs/get_list_user_permission_approve_off' + '?user_id=' + user_id + '&main_group_id=' + group_id + '&company_id=' + company_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_approve = r.data.data;
                select2();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }
})