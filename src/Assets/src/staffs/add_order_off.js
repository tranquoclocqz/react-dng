app.controller('add_order', function ($scope, $http) {

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
        $('.box1').css('opacity', 1);
        $scope.order = {};
        $scope.user_id = userId;
        $scope.order = {
            date_session: '0',
            off_type: '1',
            status: '0'
        };

        $scope.isUpdate = false;
        $scope.isConfirm = false;
        if (offData.id > 0) {
            $scope.order = offData;
            $scope.isUpdate = $scope.order.status == 0 && $scope.order.import_id == $scope.user_id ? true : false;
            $scope.isConfirm = $scope.order.status == 0 && $scope.user_id == $scope.order.confirm_id;
            $scope.order.paid_leave = JSON.parse($scope.order.paid_leave);
            $scope.order.paid_leave_confirm = JSON.parse($scope.order.paid_leave_confirm);
            $scope.order.date_start = moment($scope.order.date_start).format('DD-MM-YYYY');
            $scope.order.date_end = moment($scope.order.date_end).format('DD-MM-YYYY');
            getStatus();
        }

        $scope.order.images = [];

        if ($scope.order.user_id > 0) {
            $scope.getDaySabbaticalLeave($scope.order.user_id);
        }
        $scope.all_companies = all_companies;
        $scope.current_id = current_id;
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

    $scope.datePicker = () => {
        if ($scope.order.date_start && $scope.order.date_end) {
            let d1 = $scope.order.date_start.split('-');
            let start = d1[2] + '-' + d1[1] + '-' + d1[0];
            let d2 = $scope.order.date_end.split('-');
            let end = d2[2] + '-' + d2[1] + '-' + d2[0];

            setTimeout(() => {
                $('.datepicker_change').datepicker({
                    minDate: new Date(start),
                    maxDate: new Date(end),
                    dateFormat: "dd-mm-yy"
                });
            }, 100);
        }
    }

    $scope.changeInputStart = () => {
        if ($scope.order.date_start && $scope.order.date_start != '' && $scope.order.date_end && $scope.order.date_end != '') {
            var days = diffDate($scope.order.date_start, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.order.date_end = '';
            }
        }

        $scope.order.date_end = '';
        $scope.ressetDateOff();
    }

    $scope.changeInputEnd = () => {
        if ($scope.order.date_start && $scope.order.date_start != '' && $scope.order.date_end && $scope.order.date_end != '') {
            var days = diffDate($scope.order.date_start, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.order.date_end = '';
            }
        }

        $scope.numberDayOff = $scope.getNumberTwoDay($scope.order.date_start, $scope.order.date_end);
        $scope.chooseDay = {
            maxDay: $scope.sabbaticalLeave.paid_leave_number >= $scope.numberDayOff ? $scope.numberDayOff : $scope.sabbaticalLeave.paid_leave_number,
            days: [],
            dayConfirms: []
        }

        var date_start = '';
        var date_end = '';
        if ($scope.order.date_start) {
            date_start = $scope.order.date_start.split('-');
            date_end = $scope.order.date_end.split('-');
        }
        
        const date1 = new Date(date_start[1] + '/' + date_start[0] + '/' + date_start[2]);
        const date2 = new Date(date_end[1] + '/' + date_end[0] + '/' + date_end[2]);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (!$scope.order.id) {
            for (var i = 1; i <= $scope.chooseDay.maxDay; i++) {
                if (i > 5) {
                    break;
                }

                $scope.chooseDay.days.push({ day: '' });

                if ((i > diffDays && diffDays != 0) || diffDays == 0) {
                    break;
                }
            }
        } else {
            //Trường hợp nếu trạng thái =! vừa tạo thì show danh sách ngày phéo có trước đó
            //nếu vừa tạo thì show danh sách số ngày có thể dùng
            let numfor = $scope.order.status == 0 ? $scope.chooseDay.maxDay : $scope.order.paid_leave.length;
            for (var i = 0; i < numfor; i++) {
                if (i > 4) {
                    break;
                }

                let d = '';
                if ($scope.order.paid_leave[i]) d = moment($scope.order.paid_leave[i]).format('DD-MM-YYYY');
                $scope.chooseDay.days.push({ day: d });

                if ((i > diffDays && diffDays != 0) || diffDays == 0) {
                    break;
                }
            }

            for (var i = 0; i < numfor; i++) {
                if (i >= $scope.order.paid_leave.length) {
                    break;
                }

                let dcf = '';
                if ($scope.order.paid_leave_confirm[i]) dcf = moment($scope.order.paid_leave[i]).format('DD-MM-YYYY');
                $scope.chooseDay.dayConfirms.push({ day: dcf });
            }
        }

        $scope.datePicker();
    }

    $scope.checkLengthDay = (day) => {
        if (day) {
            let hasDay = day.find(r => { return r.day != '' });
            return hasDay ? true : false;
        }
        return false;
    }

    $scope.show_date_off = (type) => {
        let tmp = type == 1 ? $('#modal_set_date_off_cf').modal('show') : $('#modal_set_date_off').modal('show');
    }

    function isWeekend(date) {
        var dt = new Date(date);

        if (dt.getDay() == 0) {
            return true;
        }
        return false;
    }

    $scope.getNumberTwoDay = (day1, day2) => {
        if (day1 && day2) {
            let start = moment(day1);
            let end = moment(day2);
            return end.diff(start, "days") + 1;
        }
        return 0;
    }

    $scope.ressetDateOff = () => {
        $scope.chooseDay = {
            maxDay: 0,
            days: [],
            dayConfirms: []
        }
    }

    $scope.checkDay = (key, dayChoose, type) => {
        let dupDay = [];
        if (type == 0) {
            dupDay = $scope.chooseDay.days.filter(r => { return r.day == dayChoose; });
            if (dupDay.length > 1) {
                $scope.chooseDay.days[key].day = '';
                toastr.error('Bạn đã chọn ngày này!');
                return;
            }
        } else {
            dupDay = $scope.chooseDay.dayConfirms.filter(r => { return r.day == dayChoose; });
            if (dupDay.length > 1) {
                $scope.dayConfirms.days[key].day = '';
                toastr.error('Bạn đã chọn ngày này!');
                return;
            }
        }

        if ($scope.isOffice) {
            if (isWeekend(dayChoose)) {
                toastr.error('Không sử dụng ngày phép vào chủ nhật!');
            }
            dayChoose = '';
            return;
        }
    }

    $scope.changeUserConfirm = () => {
        $scope.order.confirm_note = '';
    }

    $scope.changeUser = (user_id) => {
        $scope.order.confirm_id = '';
        $scope.order.confirm_note = '';
        $scope.getDaySabbaticalLeave(user_id);
    }

    $scope.getDaySabbaticalLeave = (user_id) => {
        $scope.loading = true;
        let data = {
            user_id: user_id
        }
        if ($scope.order.id && $scope.order.status == 0) data.id = $scope.order.id
        $http.get(base_url + '/staffs/ajax_get_day_sabbatical_leave?' + $.param(data)).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.sabbaticalLeave = r.data.data;
                $scope.histories = r.data.histories
                $scope.changeInputEnd();

                if (!$scope.order.id) {
                    $http.get(base_url + '/staffs/get_company_and_group_user' + '?user_id=' + $scope.order.user_id).then(r => {
                        if (r.data && r.data.status == 1) {
                            $scope.order.company_id = r.data.data.company_id;

                            if (current_main_store_id == 8 && r.data.data.main_store_id == 8) {
                                $scope.office = 1;
                            } else {
                                $scope.office = 0;
                            }

                            $scope.get_list_user_permission_approve_off(user_id, r.data.data.main_group_id, $scope.order.company_id);
                            select2();
                        } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                    });
                } else {
                    $scope.get_list_user_permission_approve_off($scope.order.user_id, $scope.order.main_group_id, $scope.order.company_id);
                }
                
            } else {
                toastr.error('Không lấy được thông tin ngày phép. Vui lòng thử lại sau');
            }
            $scope.loading = false;
        })
    }

    $scope.isUseSabbaticalLeave = () => {
        if ($scope.sabbaticalLeave) {
            let is_use = $scope.order.user_id > 0 && $scope.order.date_session == 0 && $scope.order.off_type == 1;
            let has_date = $scope.order.date_start && $scope.order.date_end;
            return is_use && has_date && ($scope.sabbaticalLeave.paid_leave_number > 0);
        }
    }

    $scope.getTitle = () => {
        if ($scope.chooseDay) {
            let pickDays = $scope.chooseDay.days.filter(val => { return val.day != '' });
            return pickDays.length == 0 ? 'Sử dụng ngày phép' : 'Chỉnh sửa';
        }
    }

    function formatDateYMD(day) {
        let d1 = day.split('-');
        return d1[2] + '-' + d1[1] + '-' + d1[0];
    }

    $scope.formatDate = (day, fm) => {
        return moment(day).format(fm);
    }

    $scope.handleSubmitOrder = () => {
        if (!$scope.order.user_id || $scope.order.user_id == '') {
            toastr.error('Vui lòng chọn nhân viên!');
            return false;
        }

        if (!$scope.order.confirm_id || $scope.order.confirm_id == '') {
            toastr.error('Vui lòng chọn người duyệt!');
            return false;
        }

        $scope.order.office = $scope.office;
        $scope.order.sabbaticalLeave = [];
        $scope.order.sabbaticalLeaveCf = [];
        $scope.chooseDay.days.forEach(e => {
            if (e.day != '') $scope.order.sabbaticalLeave.push(formatDateYMD(e.day));
        });

        $scope.chooseDay.dayConfirms.forEach(e => {
            if (e.day != '') $scope.order.sabbaticalLeaveCf.push(formatDateYMD(e.day));
        })

        let url = base_url + '/staffs/ajax_add_order_off';
        if ($scope.order.id) url = base_url + '/staffs/ajax_update_order_off';


        let or = angular.copy($scope.order);
        or.date_start = formatDateYMD(or.date_start);
        or.date_end = formatDateYMD(or.date_end);
        if (!$scope.order.id && $scope.order.status == 1) {
            or.sabbaticalLeaveCf = $scope.order.sabbaticalLeave;
        }
        if (!(or.date_session == 0 && or.off_type == 1)) {
            or.sabbaticalLeaveCf = [];
            or.sabbaticalLeave = [];
        }

        if ($scope.order.date_start && $scope.order.date_start != '' && $scope.order.date_end && $scope.order.date_end != '') {
            var days = diffDate($scope.order.date_start, $scope.order.date_end);
            if (days < 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                return;
            }
        }

        let title = '';
        if (!$scope.order.id) {
            title = 'Xác nhận tạo đơn!';
        } else {
            if ($scope.order.status == -1) {
                title = 'Xác nhận từ chối đơn!';
            }
            if ($scope.order.status == 1) {
                title = 'Xác nhận duyệt đơn!';
            }
            if ($scope.order.status == 0) {
                title = 'Xác nhận cập nhật đơn!';
            }
            if ($scope.order.status == 2) {
                title = 'Xác nhận huỷ đơn!';
            }
        }
        
        swal({
            title: "",
            text: title,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true,
            showLoaderOnConfirm: true
        },
            function () {
                $scope.loading = true;
                $http.post(url, or).then(r => {
                    if (r.data && r.data.status == 1) {
                        toastr.success($scope.order.id ? 'Cập nhật thành công' : 'Tạo đơn thành công');
                        if ($scope.order.id) {
                            window.location.replace(base_url + 'staffs/add_order_off/' + $scope.order.id);
                        } else {
                            window.location.replace(base_url + 'staffs/add_order_off/' + r.data.id);
                        }
                    } else {
                        toastr.error(r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại sau');
                        $scope.existOder = r.data.exist_ids;
                    }
                    $scope.loading = false;
                });
            }
        );
    }

    $scope.refuseOrderOff = () => {
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
            $http.post(base_url + '/staffs/ajax_refuse_order_off', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/add_order_off/' + r.data.data.id);
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.cancelOrderOff = () => {
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
            $http.post(base_url + '/staffs/ajax_cancel_order_off', $scope.order).then(r => {
                if (r.data && r.data.status == 1) {
                    window.location.replace(base_url + 'staffs/add_order_off/' + r.data.data.id);
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
            closeOnConfirm: true,
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/staffs/ajax_delete_image_order_quit', item).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.order.file = $scope.order.file.filter(e => {
                        return e.id != item.id;
                    });
                } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.fmDate = (date, fm) => {
        return moment(date).format(fm ? fm : 'DD/MM/YYYY');
    }

    $scope.changeStatus = (status) => {
        $scope.order.status = status;
        $scope.handleSubmitOrder();
    }

    $scope.history_off = () => {
        $('#history_off').modal('show');
    }

    $scope.viewOffDetail = (id) => {
        window.open(base_url + 'staffs/add_order_off/' + id, '_blank');
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

                $scope.list_user_approve = $scope.list_user_approve.filter(e => {
                    return e.id != ($scope.order.user_id + '');
                });
                select2();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
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