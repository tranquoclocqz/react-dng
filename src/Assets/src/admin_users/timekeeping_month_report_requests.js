var app = angular.module('app', ['chart.js']);
app.controller('timeCtrl', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.pagingInfo = {
            itemsPerPage: 50,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.filter = {
            key: '',
            type: 1, // 1 xác nhận công, 2 yêu cầu chỉnh công, 3 số lần tăng ca
            group_id: '0',
            count_overtime: '0',
            store_id: (is_dev || is_only_hr ? 0 : store_id) + '',
            month: month + '',
            year: year + '',
            cf_manager: '0',
            type_request: '0',
            cf_hr: '',
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
        };

        $scope.obj_user_off = {};
        $scope.user_x2 = {};
        $scope.obj_last_invoice = {};
        $scope.obj_edit = {};

        $scope.current_user_id = id_current_user;
        $scope.is_dev = is_dev;
        $scope.is_only_hr = is_only_hr;
        $scope.img_account_df = img_account_df;
        $scope.allow_edit = allow_edit;
        $scope.allow_view_all = allow_view_all;

        $scope.lists = [];
        $scope.load = false;
        $scope.list_user = [];
        $scope.isOpen = {};
        $('.box-m').css('opacity', '1');
        select2_img();
        setTimeout(() => {
            // $('.datepicker').datepicker('option', 'dateFormat', 'dd-mm-yy');
            $('.time-input').datetimepicker({
                format: 'HH:mm'
            }).on('dp.change', function () {
                $(this).trigger('input');
            });
        }, 500);
    }

    $scope.checkShow = (type, value = null) => {
        var edit = angular.copy($scope.obj_edit),
            item = angular.copy(value);
        if (type == 'date') {
            if (['2', '3', '4', '5'].includes(edit.type)) {
                return true;
            }
        } else if (type == 'date_add_kepping') {
            if (['6'].includes(edit.type)) {
                return true;
            }
        } else if (type == 'store_id_add_kepping') {
            if (['6'].includes(edit.type)) {
                return true;
            }
        } else if (type == 'shift_id') {
            if (['4', '6'].includes(edit.type)) {
                return true;
            }
        } else if (type == 'checkin') {
            if (['2', '5', '6'].includes(edit.type)) {
                return true;
            }
        } else if (type == 'checkout') {
            if (['3', '5', '6'].includes(edit.type)) {
                return true;
            }
        } else if (type == 'table-timekeeping-month') {
            return true;
        } else if (type == 'box-filter') {
            if (edit.type > 0) {
                return true;
            }
        } else if (type == 'date_in_list') {
            if (['2', '3', '4', '5', '7'].includes(item.type)) {
                return true;
            }
        } else if (type == 'shift_in_list') {
            if (['4', '6'].includes(item.type)) {
                return true;
            }
        } else if (type == 'checkin_in_list') {
            if (['2', '5', '6'].includes(item.type)) {
                return true;
            }
        } else if (type == 'checkout_in_list') {
            if (['3', '5', '6'].includes(item.type)) {
                return true;
            }
        } else if (type == 'date_from_to_in_list') {
            if (['6'].includes(item.type)) {
                return true;
            }
        } else if (type == 'timekeeping_id_in_list') {
            if (['2', '3', '4', '5'].includes(item.type)) {
                return true;
            }
        } else if (type == 'store_checkin_in_list') {
            if (['7'].includes(item.type) && item.checkin_store_id != 0) {
                return true;
            }
        } else if (type == 'store_checkout_in_list') {
            if (['7'].includes(item.type) && item.checkout_store_id != 0) {
                return true;
            }
        } else if (type == 'store_check_in_out') {
            if (['7'].includes(edit.type)) {
                return true;
            }
        }

        return false;
    }

    $scope.checkDisabledInEdit = (type) => {
        var edit = angular.copy($scope.obj_edit);
        if (['filter_month', 'filter_year', 'filter_store', 'filter_user'].includes(type)) {
            if (edit.id > 0) {
                return true;
            }
        } else if (type == 'type') {
            if (edit.id > 0) {
                return true;
            }
        } else if (type == 'store_id_add_kepping') {
            if (edit.id > 0) {
                return true;
            }
        }

        return false;
    }

    $scope.confirmRequest = (value, status) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Sau khi xác nhận bạn không thể thay đổi!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.load = true;
                $http.post(url_api + 'ajax_confirm_timekeeping_requests', {
                    id: value.id,
                    status: status
                }).then(r => {
                    $scope.load = false;
                    if (r.data.status) {
                        showMessSuccess();
                        $scope.go2Page(1);
                    } else {
                        showMessErr(r.data.message);
                    }
                }, function () {
                    showMessErrSystem();
                })
            }
        })
    }

    $scope.confirmRemove = (value) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
        }).then((result) => {
            if (result.isConfirmed) {
                $http.post(url_api + 'ajax_remove_timekeeping_requests', {
                    id: value.id
                }).then(r => {
                    $scope.obj_edit.load = false;
                    if (r.data.status) {
                        showMessSuccess();
                        $scope.go2Page(1);
                    } else {
                        showMessErr(r.data.message);
                    }
                }, function () {
                    showMessErrSystem();
                })
            }
        })
    }

    $scope.saveRequest = () => {
        var item = angular.copy($scope.obj_edit);
        if (item.type == 0) {
            showMessErr('Vui lòng chọn loại yêu cầu');
            return;
        }

        if (!Number(item.user_id)) {
            showMessErr('Vui lòng chọn nhân viên');
            return;
        }

        if (['6'].includes(item.type)) {
            if (!item.date_add_kepping) {
                showMessErr('Vui lòng nhập thời gian thêm công');
                return;
            }
            var values_time = item.date_add_kepping.split(' - '),
                times_start = values_time[0].split('/'),
                times_end = values_time[1].split('/'),
                _start = times_start[2] + '-' + times_start[1] + '-' + times_start[0],
                _end = times_end[2] + '-' + times_end[1] + '-' + times_end[0];

            if (_end >= today) {
                showMessErr('Chỉ cho phép tạo yêu cầu thêm công bé hơn hiện tại');
                return;
            }

            item.date_from = _start;
            item.date_to = _end;

            if (!Number(item.store_id_add_kepping)) {
                showMessErr('Vui lòng chọn Chi nhánh cần thêm công');
                return;
            }
        } else {
            item.date_add_kepping = '';
            item.store_id_add_kepping = 0;
        }

        if (['4', '6'].includes(item.type)) {
            if (!Number(item.shift_id)) {
                showMessErr('Vui lòng chọn ca làm việc');
                return;
            }
        } else {
            item.shift_id = 0;
        }

        if (['2', '3', '4', '5', '7'].includes(item.type)) {
            if (!item.date) {
                showMessErr('Không xác ngày chấm công cần chỉnh sửa');
                return;
            }
            item.date = moment(item.date, 'DD-MM-YYYY').format('YYYY-MM-DD');
        } else {
            item.date = null;
        }

        if (['2', '5', '6'].includes(item.type)) {
            if (!item.checkin) {
                showMessErr('Vui lòng nhập checkin');
                return;
            }

            item.checkin = item.checkin + ':00';

        } else {
            item.checkin = null;
        }

        if (['3', '5', '6'].includes(item.type)) {
            if (!item.checkout) {
                showMessErr('Vui lòng nhập checkout');
                return;
            }
            item.checkout = item.checkout + ':00';
        } else {
            item.checkout = null;
        }

        if (item.checkin && item.checkout && (item.checkout < item.checkin)) {
            showMessErr('Checkout phải lớn hơn checkin');
            return;
        }

        if (!item.note) {
            showMessErr('Lý do không được bỏ trống');
            return;
        }
        if (['7'].includes(item.type)) {
            if (!item.checkin_store_id || !item.checkout_store_id || item.checkin_store_id == item.checkout_store_id) {
                showMessErr('Vui lòng chọn ngày có checkout và CN checkout khác CN checkin');
                return false;
            }

            if (item.change_store_checkin) {
                item.checkin_store_id = item.checkout_store_id;
                item.checkout_store_id = 0;
            } else {
                item.checkout_store_id = item.checkin_store_id;
                item.checkin_store_id = 0;
            }
        }

        $scope.obj_edit.load = true;
        $http.post(url_api + 'ajax_save_timekeeping_requests', item).then(r => {
            $scope.obj_edit.load = false;
            if (r.data.status) {
                showMessSuccess();
                $scope.go2Page(1);
                $('#modal_edit').modal('hide');
            } else {
                showMessErr(r.data.message);
            }
        }, function () {
            showMessErrSystem();
        })
    }

    $scope.changeShiff = () => {
        if (!['6'].includes($scope.obj_edit.type)) {
            // Thêm công mơi update in-out
            return false;
        }
        var shift_id = angular.copy($scope.obj_edit.shift_id),
            obj_shiff = all_shifts.find(x => x.id == shift_id);
        $scope.obj_edit.checkin = obj_shiff.begin;
        $scope.obj_edit.checkout = obj_shiff.end;
    }

    $scope.changeTyle = () => {
        if (['6'].includes($scope.obj_edit.type)) {
            $scope.obj_edit.checkin = '';
            $scope.obj_edit.checkout = '';
            $scope.obj_edit.shift_id = '0';
            select2_img(0);
        }
    }

    $scope.openEdit = (value) => {
        $scope.resetEditTimekepping();
        var item = angular.copy(value),
            date_from = moment(item.date_from, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            date_to = moment(item.date_to, 'YYYY-MM-DD').format('DD/MM/YYYY'),
            day = moment(item.date, 'YYYY-MM-DD').format('D');
        if (item.type == 6) {
            day = '';
        }
        $scope.obj_edit = {
            id: item.id,
            store_id: item.store_id + '',
            date: moment(item.date, 'YYYY-MM-DD').format('DD-MM-YYYY'),
            day: day,
            year: moment(item.date, 'YYYY-MM-DD').format('YYYY'),
            month: moment(item.date, 'YYYY-MM-DD').format('M'),
            checkin: _formatTimeInOut(item.checkin),
            checkout: _formatTimeInOut(item.checkout),
            user_id: item.user_id,
            note: item.note,
            timekeeping_id: item.timekeeping_id,
            shift_id: item.shift_id,
            date_add_kepping: '',
            store_id_add_kepping: item.store_id + '',
            type: item.type,
            checkin_store_id: item.checkin_store_id_old,
            checkout_store_id: item.checkout_store_id_old,
            change_store_checkin: item.checkin_store_id > 0
        };
        _setDaterangepicker(date_from, date_to);
        $scope.loadTimekeepMonth();
        $scope.getListUserByRule();
        $('#modal_edit').modal('show');
    }

    $scope.openAdd = () => {
        $scope.resetEditTimekepping();
        $scope.obj_edit = {
            id: 0,
            type: '0',
            date_add_kepping: '',
            store_id: store_id + '',
            date: '',
            month: month + '',
            year: year + '',
            checkin: '',
            checkout: '',
            user_id: '0',
            note: '',
            timekeeping_id: 0,
            shift_id: '0',
            store_id_add_kepping: '0',
            checkin_store_id: '',
            checkout_store_id: '',
            change_store_checkin: true,
        };

        _setDaterangepicker();
        $scope.changeStoreUser();
        $('#modal_edit').modal('show');
    }

    $scope.changeStoreUser = () => {
        $scope.obj_edit.user_id = '0';
        $scope.obj_edit.store_id_add_kepping = angular.copy($scope.obj_edit.store_id);
        $scope.resetEditTimekepping();
        $scope.getListUserByRule();
    }

    $scope.resetEditTimekepping = () => {
        $scope.obj_timekeeping = {};

        $scope.obj_edit.timekeeping_id = 0;
        $scope.obj_edit.date = '';
        $scope.obj_edit.day = '';
        $scope.obj_edit.checkin = '';
        $scope.obj_edit.checkout = '';
        $scope.obj_edit.checkin_store_id = '';
        $scope.obj_edit.checkout_store_id = '';
        $scope.obj_edit.change_store_checkin = 1;
        $scope.rows = [];
    }

    $scope.getListUserByRule = () => {
        $scope.obj_edit.load = true;
        $http.get(url_api + 'ajax_get_user_by_rule?filter=' + JSON.stringify({
            store_id: $scope.obj_edit.store_id,
            or_user_id: $scope.obj_edit.user_id
        })).then(r => {
            $scope.obj_edit.load = false;
            if (r.data.status == 1) {
                $scope.list_user = r.data.data;
                select2_img();
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    /**
     * check nếu trong tháng thì mở quyền cho user_id 636
     */
    $scope.enableUser636 = (status, confirm_date) => {
        const today = moment().format("MM YYYY");
        const confirmDate = moment(confirm_date).format("MM YYYY");
        if (today == confirmDate && id_current_user == 636) {
            return false;
        }
        if (status != 0) {
            return true;
        }
        return false;
    }

    $scope.confirmTimekeeping = (value) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Sau khi xác nhận bạn không thể thay đổi!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: base_url + "admin_users/ajax_confirm_timekeeping",
                    type: "post",
                    data: {
                        timekeeping_id: value.timekeeping_id,
                        status: value.status_edit
                    },
                    dataType: "json",
                    success: function (response) {
                        if (response.status) {
                            value.status = angular.copy(value.status_edit);
                            showMessSuccess();
                            Swal.close();
                            $scope.$apply();
                        } else {
                            Swal.fire(response.message, '', 'error');
                        }
                    },
                    complete() {},
                    error() {
                        Swal.fire('Lỗi hệ thống!', '', 'error');
                    }
                });
            } else {
                value.status_edit = angular.copy(value.status);
            }
            $scope.$apply();
        })
    }

    $scope.getList = () => {
        if ($scope.filter.type == 2) {
            $scope.filter.cf_manager = '0';
            if (!['', '0', '1', '-1'].includes($scope.filter.cf_hr)) {
                $scope.filter.cf_hr = '';
            }
        }
        var data_rq = angular.copy($scope.filter);
        if (data_rq.type == 1) {
            data_rq.type_request = [1];
        } else {
            if (data_rq.type_request == 0) {
                data_rq.type_request = [2, 3, 4, 5, 6, 7];
            } else {
                data_rq.type_request = [data_rq.type_request];
            }
        }
        if (data_rq.type == 3) {
            delete data_rq.type_request;
            delete data_rq.cf_manager;

            if (!data_rq.cf_hr) {
                data_rq.cf_hr = [1, 8, 9];
            } else {
                data_rq.cf_hr = [data_rq.cf_hr];
            }
        }
        select2_img(50);
        $scope.lists = [];
        $scope.load = true;
        $http.get(url_api + 'ajax_timekeeping_month_report_requests?' + $.param(data_rq)).then(r => {
            $scope.load = false;
            if (r.data.status) {
                if ([4, 5].includes(data_rq.type)) {
                    if (data_rq.type == 4) {
                        $scope.labelChartHr = {
                            '1': {
                                color: '#ef4b20',
                                value: 'Xác nhận tăng ca'
                            },
                            '-1': {
                                color: '#00c0ef',
                                value: 'Xác nhận không tăng ca'
                            },
                            '2': {
                                color: '#ffc000',
                                value: 'Quên bấm tay'
                            },
                            '3': {
                                color: '#5abb47',
                                value: 'X/2'
                            },
                            '4': {
                                color: '#f02c61',
                                value: 'OFF không trừ công'
                            },
                            '5': {
                                color: '#b485b7',
                                value: 'OFF trừ công'
                            },
                            '6': {
                                color: '#c1d7ef',
                                value: 'X/2 phép'
                            },
                            '7': {
                                color: '#3f51b5',
                                value: 'X/2 không phép'
                            },
                            '8': {
                                color: '#cddc39',
                                value: 'QTB/TC'
                            },
                            '9': {
                                color: '#aa00ff',
                                value: 'X/2 & TC'
                            }
                        };
                    } else {
                        $scope.labelChartHr = {
                            '2': {
                                color: '#ef4b20',
                                value: 'Sửa checkin'
                            },
                            '3': {
                                color: '#00c0ef',
                                value: 'Sửa checkout'
                            },
                            '4': {
                                color: '#ffc000',
                                value: 'Sửa ca làm việc'
                            },
                            '5': {
                                color: '#5abb47',
                                value: 'Checkin & out'
                            },
                            '6': {
                                color: '#f02c61',
                                value: 'Thêm công'
                            },
                            '7': {
                                color: '#b485b7',
                                value: 'Sửa chi nhánh'
                            }
                        };
                    }

                    $scope.chart = {
                        chart1: {
                            total: 0,
                            label: $scope.labelChartHr
                        },
                        chart2: {
                            total: 0,
                            color: [
                                '#ffc000',
                                '#5abb47',
                                '#f02c61',
                            ]
                        }
                    };

                    const data = r.data.data;
                    const chart1 = data.chart1;
                    const chart2 = data.chart2;
                    $scope.chart.chart2.data = chart2;
                    $scope.chart.chart2.total = chart2.map(v => parseInt(v.value)).reduce((sum, a) => sum + a, 0);
                    $scope.chart.chart1.data = chart1;
                    $scope.loadChart();
                } else {
                    var data = r.data.data,
                        lists = data.lists,
                        count = data.count;

                    lists = lists.filter(x => (x.checked = false) || (x.status_edit = x.status) || 1);
                    $scope.lists = lists;
                    $scope.pagingInfo.total = count;
                    $scope.pagingInfo.totalPage = Math.ceil(count / $scope.pagingInfo.itemsPerPage);
                    $("html, body").animate({
                        scrollTop: 0
                    }, 0);
                }
            } else showMessErr();
        }, function () {
            showMessErrSystem();
        })
    }

    $scope.loadChart = () => {
        const chart2_color = $scope.chart.chart2.color;
        const chart1_label = $scope.chart.chart1.label;
        $scope.dataChartType = {
            labels: [],
            data: [],
            colors: [],
            cusTypes: [],
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Trạng thái'
                },
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0
                    }
                }
            }
        };
        $scope.chart.chart2.data.forEach((e, key) => {
            $scope.dataChartType.data.push(e.value);
            $scope.dataChartType.labels.push(e.label);
            $scope.dataChartType.colors.push(chart2_color[key]);
        });


        $scope.dataChartType1 = {
            labels: [],
            data: [],
            colors: [],
            cusTypes: [],
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Xác nhận HR'
                },
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0
                    }
                }
            }
        };
        $scope.chart.chart1.data.forEach((e, key) => {
            $scope.dataChartType1.data.push(e.total);
            $scope.dataChartType1.labels.push(chart1_label[e.status]['value']);
            $scope.dataChartType1.colors.push(chart1_label[e.status]['color']);
        });
    }
    $scope.getListLastInvoiceTechnician = (value) => {
        $('#modal_last_invoice').modal('show');
        var item = angular.copy(value),
            data_rq = {
                date: item.date,
                technician_id: item.user_id,
            };
        $scope.obj_last_invoice = item;
        $scope.obj_last_invoice.load = true;

        $http.get(base_url + 'invoices_v2/ajax_get_last_invoice_by_technician_id?' + $.param(data_rq)).then(r => {
            $scope.obj_last_invoice.load = false;
            if (r.data.status) {
                $scope.obj_last_invoice.list = r.data.data;
            } else showMessErr();
        })
    }

    $scope.viewUserOff = (value) => {
        $('#modal_user_off').modal('show');
        var item = angular.copy(value),
            data_rq = {
                date: item.date,
                staff_id: item.user_id,
            };
        $scope.obj_user_off = {};
        $scope.obj_user_off.load = true;

        $http.post(url_api + 'ajax_get_user_off_by_staff_id', data_rq).then(r => {
            $scope.obj_user_off.load = false;
            if (r.data.status) {
                var data = r.data.data,
                    status = '',
                    type = '',
                    date_session = '',
                    user_confirm = data.user_confirm;

                if (data.status == -1) {
                    status += ' Từ chối';
                } else if (data.status == 1) {
                    status += ' Đã duyệt';
                } else if (data.status == 2) {
                    status += ' Hủy';
                } else { //0
                    status += ' Chờ duyệt';
                    user_confirm = '';
                }

                if (data.type == 1) {
                    type += ' Nghỉ phép';
                } else if (data.type == 2) {
                    type += ' Công tác';
                } else if (data.type == 3) {
                    type += ' Đi muộn, về sớm';
                } else { //4
                    type += ' Thôi việc';
                }

                if (data.date_session == 1) {
                    date_session += ' Sáng';
                } else if (data.date_session == 2) {
                    date_session += ' Chiều';
                } else { //0
                    date_session += ' Cả ngày';
                }
                $scope.obj_user_off = {
                    status: status,
                    type: type,
                    date_session: date_session,
                    user_confirm: user_confirm,
                    note: data.note,
                    note_manager: item.note,
                }
            } else showMessErr(r.data.message);
        })
    }

    $scope.go2Page = (page) => {
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getList();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage;
    }

    $scope.Previous = (page) => {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = (paging) => {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        return _.range(min, max);
    }

    $scope.getNamebyType = (type) => {
        var info_cf_manager = '';

        if (type == '-1') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label label-danger">${arr_name_stt[type]}</span>`;
        } else if (type == '0') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label label-default">${arr_name_stt[type]}</span>`;
        } else if (type == '1') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label label-success">${arr_name_stt[type]}</span>`;
        } else if (type == '2') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label label-warning">${arr_name_stt[type]}</span>`;
        } else if (type == '3') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label label-info">${arr_name_stt[type]}</span>`;
        } else if (type == '4') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label" style="color: #000 !important;background-color: #ecf0f5 !important;">${arr_name_stt[type]}</span>`;
        } else if (type == '5') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label" style="background: #000;">${arr_name_stt[type]}</span>`;
        } else if (type == '6') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label" style="color: #000 !important;background-color: rgb(255,255,0) !important;">${arr_name_stt[type]}</span>`;
        } else if (type == '7') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label" style="background: rgb(255,199,206);color: #000;">${arr_name_stt[type]}</span>`;
        } else if (type == '8') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label" style="color: #fff !important;background-color: rgb(174,82,108) !important;">${arr_name_stt[type]}</span>`;
        } else if (type == '9') {
            info_cf_manager = `<span title="${arr_name_stt[type]}" class="label" style="background: rgb(26, 255, 97);color: #000;">${arr_name_stt[type]}</span>`;
        }

        return info_cf_manager;
    }

    $scope.arr_name_stt = arr_name_stt;

    //CHẤM CÔNG
    $scope.chooseTimekeepingMonth = (value) => {
        $scope.obj_timekeeping = {};
        if ($scope.obj_edit.type == 6) return;
        var item = angular.copy(value);
        $scope.obj_timekeeping = item;
        $scope.obj_edit.date = _towNumberText(item.day) + '-' + _towNumberText($scope.filter_timekeep_month.month) + '-' + _towNumberText($scope.filter_timekeep_month.year);
        $scope.obj_edit.day = item.day;
        $scope.obj_edit.timekeeping_id = item.id;
        $scope.obj_edit.shift_id = item.shift_id == 26 || !item.id ? '0' : item.shift_id;
        $scope.obj_edit.checkin = _formatTimeInOut(item.checkin);
        $scope.obj_edit.checkout = _formatTimeInOut(item.checkout);
        $scope.obj_edit.checkin_store_id = value.checkin_store_id;
        $scope.obj_edit.checkout_store_id = value.checkout_store_id;
        select2_img(0);
    }

    $scope.setColorRbg = (color_text = '') => {
        return color_text ? `color: rgb(${color_text}) !important` : '';
    }

    $scope.isWeeken = (day) => {
        let wk = $scope.rows.calendar.find(r => {
            return r.day == day
        });
        return wk && (wk.dayofweek == 'T7' || wk.dayofweek == 'CN') ? true : false;
    }

    $scope.submitLoadTimekeepMonth = () => {
        // if (!$scope.checkShow('table-timekeeping-month')) {
        //     showMessErr('Loại yêu cầu không phù hợp để lấy dữ liệu chấm công');
        //     return;
        // }
        $scope.resetEditTimekepping();
        $scope.loadTimekeepMonth();
    }

    $scope.loadTimekeepMonth = () => {
        var data_rq = angular.copy($scope.obj_edit);
        data_rq.export = false;
        data_rq.group_id = 0;
        data_rq.api_version = 2;
        data_rq.user_id_filter = data_rq.user_id;
        $scope.filter_timekeep_month = data_rq;

        $scope.rows = [];
        if (!Number(data_rq.user_id_filter)) {
            showMessErr('Vui lòng chọn nhân viên');
            return;
        }
        $scope.obj_edit.load = true;
        $http.get(url_api + 'ajax_timekeeping_month_report?filter=' + JSON.stringify($scope.filter_timekeep_month)).then(r => {
            $scope.obj_edit.load = false;
            if (r.data.status == 1) {
                $scope.rows = r.data.data
            } else {
                showMessErr();
            }
        });
    }
})

var arr_name_stt = {
    '0': 'Chờ duyệt',
    '1': 'Xác nhận tăng ca',
    '-1': 'Xác nhận không tăng ca',
    '2': 'Quên bấm tay',
    '3': 'X/2',
    '4': 'OFF không trừ công',
    '5': 'OFF trừ công',
    '6': 'X/2 phép',
    '7': 'X/2 Không Phép',
    '8': 'QTB/TC',
    '9': 'X/2 & TC',
};

app.filter('safeHtml', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});
app.filter('momentFormat', function () {
    return (value, format) => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});

function _towNumberText(n) {
    var num = Number(n);
    return num < 10 ? '0' + num : num;
}

function _formatTimeInOut(time) {
    return time ? moment(time, 'HH:mm:ss').format('HH:mm') : '';
}

$(document).on('click', '.wrap-table-timekeeping-month>table>tbody>tr>td', function (e) {
    $('.wrap-table-timekeeping-month>table>tbody>tr>td').removeClass('active');
    $('.wrap-table-timekeeping-month>table>tbody>tr>td>.drop-cl').hide();
    $(this).closest('td').find('.drop-cl').show();
    $(this).addClass('active');
});

function _setDaterangepicker(date_from = '', date_to = '') {
    if (!date_from) {
        date_from = date_to = moment(today, 'YYYY-MM-DD').format('DD/MM/YYYY');
    }
    $('.reportrangeClass').data('daterangepicker').setStartDate(date_from);
    $('.reportrangeClass').data('daterangepicker').setEndDate(date_to);
    $('.reportrangeClass').trigger('keyup');
}