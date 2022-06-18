angular.module('app', [])
    .controller('timeCtrl', function ($scope, $http, $compile, $sce) {
        $scope.init = () => {
            $scope.isOpen = {
                row: null,
                colum: null
            };
            $scope.filter = {
                group_id: group_id + '',
                store_id: store_id + '',
                month: month + '',
                year: year + '',
                export: false,
                user_id_filter: '0',
                api_version: '2'
            };

            $scope.timekp = {};
            $scope.list_user_filter = [];
            $scope.changeStoreFilter();
            $scope.list_user_add = [];
            $scope.img_account_df = img_account_df;
            $scope.load = false;
            $scope.load_modal = false;
            $scope.sumbit_add = false;
            $scope.load_user = false;
            $scope.edit = {
                timekeeping_id: 0,
                checkin: '',
                checkout: '',
                review: false,
                status: '',
                note_edit: '',
                user_id: 0,
                type_request: '1',
                confirmed: false,
                manager_cf: true
            };
            $scope.list_user = {};
            $scope.cTime = setTimeout(() => {}, 0);
            $scope.cTimeRq = setTimeout(() => {}, 0);
            $('.box-m').css('opacity', '1');
            select2_img();
            inputRang();
        }

        $scope.changeStoreFilter = () => {
            $scope.filter.user_id_filter = '0';
            $scope.list_user_filter = [];
            if ($scope.filter.store_id == '0') return;
            $scope.load_user_filter = true;
            $http.get(base_url + 'admin_users/ajax_get_user_by_rule?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    let list_res = r.data.data;
                    $scope.list_user_filter = list_res;
                    select2_img();
                } else {
                    showMessErr(r.data.message);
                }
                $scope.load_user_filter = false;
            });
        }

        $scope.editWork = () => {
            window.open(base_url + '/nhansu/chamcong/store_report');
        }

        $scope.openDetail = (item, detail) => {
            /**
             * Check status TC
             */
            if (!detail.status.includes("TC")) return;
            if (detail.lastInvoiceHtml) return;
            if (!['16', '11'].includes(item.group_id)) return;

            const data_rq = {
                date: year + '-' + month + '-' + detail.day,
                technician_id: item.user_id,
            };
            $http.get(base_url + 'invoices_v2/ajax_get_last_invoice_by_technician_id?' + $.param(data_rq)).then(r => {
                var data = r.data.data,
                    row = '';
                if (data.length > 0) {
                    $.each(data, function (i, v) {
                        row += `<tr>
                                    <td class="text-center"><a href="${base_url + 'invoices_v2/detail/' + v.invoice_id}" target="_blank" title="Chi tiết hóa đơn">${v.invoice_id}</a></td>
                                    <td class="text-center">${v.created ? moment(v.created, 'YYYY-MM-DD HH:mm:ss').format('HH:mm') : '---'}</td>
                                    <td class="text-center">${(v.finish_time ? moment(v.finish_time, 'YYYY-MM-DD HH:mm:ss').format('HH:mm') : '---')}</td>
                                </tr>`;
                    });
                } else {
                    row = '<tr><td colspan="100%" class="text-center">Không có dữ liệu hóa đơn cuối ngày cho nhân viên này!</td></tr>';
                }
                detail.lastInvoiceHtml = $sce.trustAsHtml(
                    `<h4 class="heading-last-invoice">Hóa đơn cuối ngày</h4>
                            <div class="wrap-table-sroll">
                                <table class="table table-bordered tablelte-full table-last-invoice">
                                    <tbody>
                                        <tr class="info par-info">
                                            <th class="text-center">Id</th>
                                            <th class="text-center">Bắt đầu</th>
                                            <th class="text-center">Kết thúc</th>
                                        </tr>
                                        ${row}
                                    </tbody>
                                </table>
                            </div>`);
            });
        }

        $scope.loadTimekeepMonth = (isExcel) => {
            if ($scope.load) {
                toastr["warning"]('Đang tải dữ liệu');
                return;
            }
            $scope.filter.export = isExcel;
            $scope.load = true;
            $http.get(base_url + 'admin_users/ajax_timekeeping_month_report?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    $scope.rows = !isExcel ? r.data.data : $scope.rows;
                    if (isExcel) {
                        $scope.load = false;
                        downloadURI(r.data.download_url);
                        return;
                    }
                    let listReview = [];

                    $scope.rows.data.forEach(e => {
                        e.detail.forEach(detail => {
                            (detail.id > 0) && (listReview.push(detail.id)); //push cái timekeeping_id vào để qua controller query
                        });
                    });

                    $scope.loadTimekeepMonthRequest(listReview); // load các ô mà QL đã xác nhận
                } else {
                    showMessErr('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
                $scope.load = false;
            });
        }

        $scope.loadTimekeepMonthRequest = (listReview) => {
            if (!listReview.length) return;
            $http.post(base_url + 'admin_users/ajax_timekeeping_month_request', {
                listReview: listReview
            }).then(r => {
                if (r.data.status == 1) {
                    let list_res = r.data.data;
                    $scope.rows.data.forEach(e => {
                        e.detail.forEach(detail => {
                            let check = list_res[detail.id + ''];
                            /**
                             * xem cái id co nằm trong bảng admin_user_timekeeping_requests chưa. nếu có thì có nghĩa là đã có yêu cầu từ QL chi nhánh và ngược lại
                             *  - status=X      => value == 1 có nghĩa là QL chi nhánh xác nhận cho tăng ca và ngược lại
                             *  - status=OFF    => value == 4 có nghĩa là QL chi nhánh xác nhận OFF có phép và ngược lại
                             *  - status=X/2    => value == 6 có nghĩa là QL chi nhánh xác nhận X/2 có phép và ngược lại
                             */
                            if (typeof check !== 'undefined') {
                                if (detail.review == true) {
                                    detail.is_cf = true;
                                    if (detail.status == 'X' || detail.status == 'DM/TC') {
                                        check.type_request == '1' ? (detail.accept = true) : (detail.accept = false);
                                    } else if (detail.status == 'OFF') {
                                        check.type_request == '4' ? (detail.accept = true) : (detail.accept = false);
                                    } else if (detail.status == 'X/2') {
                                        check.type_request == '6' ? (detail.accept = true) : (detail.accept = false);
                                    } else {
                                        detail.accept = true;
                                    }
                                    detail.type_request = check.type_request;
                                    detail.status_rq = check.status_rq;
                                }
                                detail.manager_note = check.note
                            } else {
                                detail.is_cf = false;
                            }
                        });
                    });
                }
                $scope.loadUserOff(); // load các ô Off thứ 7,cn xem có đơn xin phép k
            });
        }

        $scope.loadUserOff = () => {
            $http.get(base_url + 'admin_users/ajax_list_user_off?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    let list_res = r.data.data;
                    $scope.rows.data.forEach(e => {
                        e.detail.forEach(detail => {
                            if ((detail.status == 'OFF' || detail.status == 'X/2') && $scope.isWeeken(detail.day)) {
                                let check = list_res.filter((value, key) => {
                                    if (parseInt(value.user_id) == parseInt(e.user_id)) {
                                        var currentDay = value.month_year + '-' + (parseInt(detail.day) < 10 ? '0' + detail.day : detail.day);
                                        return currentDay >= value.date_start && currentDay <= value.date_end;
                                    }
                                })
                                if (check.length) {
                                    check = check[0];
                                    let status = '',
                                        type = '',
                                        date_session = '',
                                        user_confirm = check.status == 0 ? false : ' ' + check.user_confirm;

                                    if (check.status == -1) {
                                        status += ' Từ chối';
                                    } else if (check.status == 1) {
                                        status += ' Đã duyệt';
                                    } else if (check.status == 2) {
                                        status += ' Hủy';
                                    } else { //0
                                        status += ' Chờ duyệt';
                                        user_confirm = false;
                                    }

                                    if (check.type == 1) {
                                        type += ' Nghỉ phép';
                                    } else if (check.type == 2) {
                                        type += ' Công tác';
                                    } else if (check.type == 3) {
                                        type += ' Đi muộn, về sớm';
                                    } else { //4
                                        type += ' Thôi việc';
                                    }

                                    if (check.date_session == 1) {
                                        date_session += ' Sáng';
                                    } else if (check.date_session == 2) {
                                        date_session += ' Chiều';
                                    } else { //0
                                        date_session += ' Cả ngày';
                                    }

                                    detail.info_off = {
                                        'user_confirm': user_confirm,
                                        'status': status,
                                        'type': type,
                                        'date_session': date_session,
                                        'note': check.note
                                    };

                                } else detail.info_off = false;
                            }
                        });
                    })
                }
            });
        }

        $scope.submitFiller = () => {
            clearTimeout($scope.cTimeRq);
            $scope.cTimeRq = setTimeout(() => {
                month = $scope.filter.month;
                year = $scope.filter.year;
                $scope.loadTimekeepMonth(false)
            }, 150);
        }

        $scope.isWeeken = (day) => {
            let wk = $scope.rows.calendar.find(r => {
                return r.day == day
            });
            return wk && (wk.dayofweek == 'T7' || wk.dayofweek == 'CN') ? true : false;
        }

        $scope.isShow = (i) => {
            return !((i.store_name && i.store_name != '') && (i.checkin && i.checkin != '') && (i.checkout && i.checkout != '') && (i.note && i.note != '') && (i.comment && i.comment != ''));
        }

        $scope.openEdit = (id, checkin, checkout, user_id, _status, review, day = '') => {
            var status = angular.copy(_status);
            for (var i = 0; i < 30; i++) {
                status = status.replace('-' + i, '');
            }

            let viewIvoice = ((status == 'X' || status == 'DM/TC') && day != '') ? true : false; // xem hóa đơn cuối ngày

            $scope.edit = {
                timekeeping_id: id,
                checkin: checkin,
                checkout: checkout,
                user_id: user_id,
                status: status,
                note_edit: '',
                review: review,
                type_request: '1',
                day: day,
                manager_cf: true, // flag xem QL đã xác nhận chưa
                flag_limit_date: false, // flag qua 4 ngày không thể cập nhật
                confirmed: false // xem cái status trong admin_user_timekeeping_requests nhân sự có xác nhận chưa. nếu chưa thì mới cho chỉnh sửa
            };

            if ((((new Date().getDate()) - parseInt(day)) < timekeeping_limit_day) || is_access) { // hiện nút cập nhật nếu bé hơn 4 ngày hoăc có quyền
                $scope.edit.flag_limit_date = true;
            }

            $('.invoices-last-day').html('');
            $('#modal_edit').modal('show');

            $scope.load_modal = true;

            if (status == 'OFF') {
                $scope.edit.type_request = '4';
            } else if (status == '-') {
                $scope.edit.type_request = '2';
            } else if (status == 'X/2') {
                $scope.edit.type_request = '6';
            } else {
                var data_rq = {
                    date: year + '-' + month + '-' + day,
                    technician_id: user_id,
                };
                if (viewIvoice == true) {
                    $.ajax({
                        url: base_url + 'invoices_v2/ajax_get_last_invoice_by_technician_id?' + $.param(data_rq),
                        dataType: "json",
                        success: function (response) {
                            var html_ = '';
                            if (response.status) {
                                var data = response.data;
                                if (data.length) {
                                    $.each(data, function (i, v) {
                                        html_ += `<tr>

                                                    <td class="text-center"><a href="${base_url + 'invoices_v2/detail/' + v.invoice_id}" target="_blank" title="Chi tiết hóa đơn">${v.invoice_id}</a></td>

                                                    <td>${v.cutomer_name}</td>

                                                    <td class="text-center">${v.created ? moment(v.created, 'YYYY-MM-DD HH:mm:ss').format('HH:mm') : '---'}</td>

                                                    ${is_access ? '<td class="text-center">' + (v.finish_time ? moment(v.finish_time, 'YYYY-MM-DD HH:mm:ss').format('HH:mm') : '---') + '</td>' : ''}

                                            </tr>`;
                                    });
                                } else {
                                    html_ = '<tr><td colspan="100%" class="text-center">Không có dữ liệu hóa đơn cuối ngày cho nhân viên này!</td></tr>';
                                }
                            }

                            $('.invoices-last-day').html(`<h4>Hóa đơn cuối ngày</h4>
                                <div class="wrap-table-sroll">
                                    <table class="table table-bordered tablelte-full">
                                        <tbody>
                                            <tr class="info par-info">
                                                <th class="text-center">Id</th>
                                                <th>Khách hàng</th>
                                                <th class="text-center">Bắt đầu</th>
                                                ${is_access ? '<th class="text-center">Kết thúc</th>' : ''}
                                            </tr>
                                            ${html_}
                                        </tbody>
                                    </table>
                                </div>`);
                        },
                        complete() {},
                        error() {
                            showMessErrSystem();
                        }
                    });
                }
            }
            select2_img();
            $scope.checkTimeRequest(id);
        }

        $scope.checkTimeRequest = (id) => {
            if (!id) { // id=0  => stt = OFF
                $scope.edit.manager_cf = false;
                $scope.load_modal = false;
                return;
            }
            $.ajax({
                url: base_url + "admin_users/ajax_get_timekeeping_rq_by_timekeeping_id",
                type: "post",
                data: {
                    timekeeping_id: id,
                    type: 1
                },
                dataType: "json",
                success: function (response) {
                    if (response.status) {
                        var data = response.data;

                        if (data) {
                            $scope.edit.type_request = data.type_request;
                            $scope.edit.checkin = data.checkin;
                            $scope.edit.checkout = data.checkout;
                            $scope.edit.confirmed = data.status != 0;
                            $scope.edit.note_edit = data.note;
                        } else $scope.edit.manager_cf = false;

                    } else showMessErr(r.message);
                },
                complete: function () {
                    $scope.load_modal = false;

                    setTimeout(() => {
                        $scope.$apply();
                    }, 100)
                    select2_img();
                },
                error: function () {
                    showMessErrSystem();
                }
            });
        }

        $scope.saveEdit = () => {
            let url_ = 'admin_users/ajax_set_time_keeping_requests';
            if ($('#type_request').val().includes('?') || !$('#type_request').val()) {
                showMessErr('Vui lòng chọn trạng thái!');
                return;
            }
            $scope.data_rq = $scope.edit;
            if ($scope.data_rq.status == 'OFF') {
                $scope.data_rq.store_id = $scope.filter.store_id;
                $scope.data_rq.month = month;
                $scope.data_rq.year = year;
                url_ = 'admin_users/ajax_set_time_keeping';
            }
            $scope.load_modal = true;
            clearTimeout($scope.cTime);
            $scope.cTime = setTimeout(() => {
                $.ajax({
                    url: base_url + url_,
                    type: "post",
                    data: $scope.data_rq,
                    dataType: "json",
                    success: function (response) {
                        if (response.status) {
                            showMessSuccess();
                            $('#modal_edit').modal('hide');
                        } else {
                            showMessErr(response.message);
                        }
                    },
                    complete: function () {
                        (!$scope.data_rq.timekeeping_id) && $('#submitFiller').trigger('click');
                        $scope.$apply(() => {
                            $scope.load_modal = false;
                        })
                    },
                    error: function () {
                        showMessErrSystem();
                    }
                });
            }, 200)
        }

        $scope.openAddMuti = () => {
            $scope.timekp = {
                store_user_id: store_id + '',
                user_id: '0',
                store_id: '0',
                group_id: '0',
                shift_id: '0',
                time: '',
                edit_reason: ''
            };
            $scope.changeStoreUserAddMuti();
            $('#modal_add_muti').modal('show');
        }

        $scope.changeStoreUserAddMuti = () => {
            $scope.timekp.user_id = '0';
            $scope.getListUserByRule();
        }

        $scope.getListUserByRule = () => {
            $scope.sumbit_add = true;
            $http.get(base_url + 'admin_users/ajax_get_user_by_rule?filter=' + JSON.stringify({
                store_id: $scope.timekp.store_user_id,
            })).then(r => {
                $scope.sumbit_add = false;
                if (r.data.status == 1) {
                    $scope.list_user_add = r.data.data;
                    select2_img();
                } else {
                    showMessErr(r.data.message);
                }
            });
        }

        $scope.addMutiTimekeeping = () => {
            if ($scope.timekp.store_id == '0') {
                showMessErr('Vui lòng chọn chi nhánh!');
                return;
            }

            if ($scope.timekp.user_id == '0') {
                showMessErr('Vui lòng chọn nhân viên!');
                return;
            }

            if ($scope.timekp.shift_id == '0') {
                showMessErr('Vui lòng chọn ca làm việc!');
                return;
            }

            if ($scope.timekp.time == '') {
                showMessErr('Vui lòng chọn thời gian!');
                return;
            }

            if ($scope.timekp.edit_reason == '') {
                showMessErr('Vui lòng nhập lý do!');
                return;
            }

            $scope.sumbit_add = true;
            $http.post(base_url + 'admin_users/ajax_add_muti_timekeeping', JSON.stringify($scope.timekp)).then(r => {
                if (r.data.status == 1) {
                    showMessSuccess();
                    $('#modal_add_muti').modal('hide');
                } else {
                    showMessErr(r.data.message);
                }
                $scope.sumbit_add = false;
            }, function error(response) {
                showMessErrSystem();
            })
        }

        function inputRang() {
            var date_end = date_start = $.datepicker.formatDate("dd/mm/yy", new Date());
            if ($('#reportrangeCustome').length) {
                $('#reportrangeCustome').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    showCustomRangeLabel: false,
                    ranges: {
                        'Hôm nay': [moment(), moment()],
                        'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                        '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                        'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                        'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    "locale": {
                        "format": 'DD/MM/YYYY',
                        "customRangeLabel": "Custom",
                        "applyLabel": "Gắn",
                        "cancelLabel": "Hủy",
                        "daysOfWeek": ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
                        "monthNames": ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
                    }
                });
            }
            setTimeout(() => {
                $scope.$apply(function () {
                    $scope.timekp.time = date_start + ' - ' + date_end;
                });
            }, 50);
        }

        $scope.changeStore = () => {
            $scope.list_user = {};
            if ($scope.timekp.store_id == '0') return;
            $scope.load_user = true;
            $http.get(base_url + 'admin_users/ajax_get_user_by_rule?filter=' + JSON.stringify($scope.timekp)).then(r => {
                if (r.data.status == 1) {
                    let list_res = r.data.data;
                    $scope.list_user = list_res;
                    select2_img();
                } else {
                    showMessErr(r.data.message);
                }
                $scope.load_user = false;
            });
        }

        $scope.arr_name_stt = (type) => {
            return arr_name_stt[type];
        }

        $scope.confirmStatus = (item, status) => {
            let timekeeping_id = item.id;
            if (!status) return;
            if (!timekeeping_id) {
                toastr.error('Lỗi. Không xác định id chấm công này!');
                return;
            }

            Swal.fire({
                title: 'Bạn có chắc chắn?',
                text: "Bạn có chắc thực hiện thao tác này?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Hủy',
                confirmButtonText: 'Đồng ý',
            }).then((result) => {
                if (result.value) {
                    $.ajax({
                        url: base_url + "admin_users/ajax_confirm_timekeeping",
                        type: "post",
                        data: {
                            timekeeping_id: timekeeping_id,
                            status: status
                        },
                        dataType: "json",
                        success: function (response) {
                            if (response.status) {
                                toastr.success('Thành công!');
                                setTimeout(() => {
                                    item.review = false;
                                    item.color_bg = false;
                                    $scope.$apply();
                                }, 0);
                            } else {
                                toastr.error(response.message);
                            }
                        },
                        complete() {},
                        error() {
                            Swal.fire('Lỗi hệ thống!', '', 'error');
                            return;
                        }
                    });
                }
            })
        }

        $scope.noteHtml = (htmlbd) => {
            htmlbd = htmlbd.toString().replace('\n', '<br>').replace('\n', '<br>').replace('\n', '<br>')
            return $sce.trustAsHtml(htmlbd);
        }
    });


var arr_name_stt = {
    '-1': 'Xác nhận không tăng ca',
    '0': 'Chờ duyệt',
    '1': 'Xác nhận tăng ca',
    '2': 'Quên bấm tay',
    '3': 'X/2',
    '4': 'OFF không trừ công',
    '5': 'OFF trừ công',
    '6': 'X/2 phép',
    '7': 'X/2 Không Phép',
    '8': 'QTB/TC',
    '9': 'X/2 & TC',
};

var is_dev_test = false;

$(document).on('click', 'table>tbody>tr>td', function (e) {
    $('table>tbody>tr>td').removeClass('active');
    if ($(e.target).hasClass('btn-close-drop')) {
        $(e.target).closest('td').find('.drop-cl').hide();
        return;
    }
    $('table>tbody>tr>td>.drop-cl').hide();
    $(this).closest('td').find('.drop-cl').show();
    $(this).addClass('active');
});

function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}