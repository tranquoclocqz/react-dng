app.directive('ngFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('change', function () {
                $parse(attrs.ngFile).assign(scope, element[0].files)
                scope.$apply();
            });
        }
    };
}]);
app.controller('date_off', function ($scope, $http, $sce) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {

        $('.box').css('opacity', '1')
        $scope.filter = {};
        $scope.filter.type = '-1';
        $scope.filter.status = -2;
        $scope.paid_leave = [];
        $scope.paid_leave_confirm = [];
        $scope.all_users = all_users;
        $scope.is_only_dev = is_only_dev;
        $scope.is_admin = is_admin;
        $scope.is_manager = is_manager;
        $scope.is_only_assistantmanager = is_only_assistantmanager;
        $scope.is_region_admin = is_region_admin;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.sort = '1';
        $scope.filter.date = moment().startOf('month').format("MM/DD/YYYY") + ' - ' + moment().endOf('month').format("MM/DD/YYYY");

        $scope.id_current_user = id_current_user;
        $scope.policy_user_off = policy_user_off;

        $scope.type = '1';
        $scope.order = {};
        $scope.onlyNumbers = /^\d+$/;
        $scope.table_type = 1;

        $scope.type_mobile = '0';

        $scope.user_off = {};
        $scope.user_off.type = '';

        $scope.dateInputInit();

        $scope.getDateOffByType();

    }


    $scope.openAsset = (id) => {
        $('#asset').modal('show');
        getAssetPersonal(id);
    }

    $scope.openWebsite = (id) => {
        $('#website').modal('show');
        getOnlineAcounts(id);
    }

    function getAssetPersonal(id) {
        $scope.isActiveSetOff = false;
        $scope.loadAS = true;
        $http.get(base_url + '/assets/ajax_get_personal_assets?user_id=' + id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.assetsPersonal = r.data.data.data;
                $scope.isActiveSetOff = true;
                $scope.loadAS = false;
            } else toastr["error"]("Không thể lấy tài sản cá nhân! Vui lòng thử lại sau");
        });

    }

    function getOnlineAcounts(id) {
        $scope.isActiveOnlineAcounts = false;
        $scope.loadWebsite = true;
        $http.get(base_url + '/admin_users/ajax_get_online_acounts?id=' + id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.onlineAcounts = r.data.data;
                $scope.isActiveOnlineAcounts = true;
                $scope.loadWebsite = false;
            } else toastr["error"]("Không thể lấy tài khoản website! Vui lòng thử lại sau");
        });
    }

    $scope.viewDetail = (value) => {
        if (value.type == 4 || value.type == 6) {
            window.open(base_url + `staffs/add_order_quit/${value.id}`, '_blank');
        } else if (value.type == 1) {
            window.open(base_url + `staffs/add_order_off/${value.id}`, '_blank');
        } else if (value.type == 8) {
            window.open(base_url + `staffs/off_unlock_user/${value.id}`, '_blank');
        } else {
            window.open(base_url + `staffs/submit_order_off_work/${value.id}`, '_blank');
        }
    }

    $scope.renderExcel = () => {
        $http.get(base_url + 'staffs/createXLS/?filter=' + JSON.stringify($scope.filter)).then(r => {

            if (r && r.data.status == 1) {

                window.location.href = base_url + 'assets/uploads/order_excel/' + r.data.data;

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.searchByStatus = (tus) => {
        $scope.filter.status = tus;
        $scope.getDateOffByType();
    }

    $scope.openEditForm = (item) => {
        $('#editorderoff').modal('show');
        $scope.currentItem = angular.copy(item);

        $scope.currentItem.min_date_temp = moment($scope.currentItem.min_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        $scope.currentItem.max_date_temp = moment($scope.currentItem.max_date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        $scope.currentItem.late_minutes = parseInt($scope.currentItem.late_minutes);
        $scope.currentItem.soon_minutes = parseInt($scope.currentItem.soon_minutes);


        if ($scope.currentItem.date_session != 0) {
            $scope.currentItem.check = 1;
        }
        setTimeout(() => {
            $('#store_arrival_id').select2('val', $scope.currentItem.store_arrival_id);
        }, 10);
    }

    $scope.deleteImg = (name, idoff) => {
        var data = {
            name: name,
            id_off: idoff
        }
        $http.post(base_url + 'staffs/ajax_delete_img', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getDateOffByType();

                $scope.currentItem.file.forEach((element, index) => {
                    if (element.name_file == name) {
                        $scope.currentItem.file.splice(index, 1);
                    }
                });

                toastr["success"]("Xóa thành công!");

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.updateOrder = (crItem) => {

        $scope.order = $scope.currentItem;
        $scope.order.start = $scope.currentItem.min_date_temp;
        $scope.order.end = $scope.currentItem.max_date_temp;

        $scope.order.dataDate = [];
        if ($scope.order.type == 2) {
            if (!$scope.order.store_id) {
                toastr["error"]("Chọn chi nhánh công tác!");
                return false;

            }
        } else if ($scope.order.type == 4 || $scope.order.type == 3) {
            if (!$scope.order.start || $scope.order.start && $scope.order.start == '') {
                toastr["error"]("Chọn ngày thôi việc!");
                return false;
            }
            var ob = {
                "date": $scope.order.start
            }

            $scope.order.dataDate.push(ob);
        }

        if ($scope.order.type != 4 && $scope.order.type != 3) {

            if ((!$scope.order.start || ($scope.order.start && $scope.order.start == '')) || (!$scope.order.end || ($scope.order.end && $scope.order.end == ''))) {
                toastr["error"]("Chọn ngày!");
                return false;
            }

            var ar = getDates(moment($scope.order.start, 'YYYY-MM-DD'), moment($scope.order.end, 'YYYY-MM-DD'));
            ar.forEach(element => {
                var ob = {
                    'date': element
                }
                $scope.order.dataDate.push(ob);
            });
        }
        if ($scope.order.type == 3) {

            if (($scope.order.late_minutes == 0 && $scope.order.soon_minutes == 0) || $scope.order.late_minutes == null || $scope.order.soon_minutes == null) {
                toastr["error"]("Nhập phút!");
                return false;
            }
        }
        if ($scope.order.check == 1 && (!$scope.order.date_session || $scope.order.date_session == 0)) {
            toastr["error"]("Chọn buổi nghỉ!");
            return false;
        }
        if (!$scope.order.note) {
            toastr["error"]("Nhập ghi chú!");
            return false;

        }
        $scope.order.user_id = id_current_user;
        if (crItem == 1) {
            $scope.order.status = 1;
        }
        $http.post(base_url + 'staffs/ajax_update_order', JSON.stringify($scope.order)).then(r => {

            if (r && r.data.status == 1) {
                $('#editorderoff').modal('hide');

                $scope.uploadFile(r.data.data);
                $scope.getDateOffByType();


                $scope.order = {};
                if (crItem == 1) {
                    toastr["success"]("Xác nhận thành công!");

                } else {
                    toastr["success"]("Cập nhật thành công!");

                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.checkCheckbox = (vl) => {
        if (vl == 1) {
            $scope.currentItem.check = 0;
        } else {
            $scope.currentItem.check = 1;
        }
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.changeTypeSearch = (type) => {
        $scope.filter.type = type;


        $scope.getDateOffByType();
    }
    $scope.getDateOffByType = (is_go_page = false) => {
        if (!is_go_page) { // nếu không phải gọi từ hàm chuyển trang thì set lại limit trang 1
            $scope.pagingInfo = {
                itemsPerPage: 30,
                offset: 0,
                to: 0,
                currentPage: 1,
                totalPage: 1,
                total: 0
            };

            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = 0;
        }

        $('#home>.table-responsive').addClass('loading');
        $http.get(base_url + 'staffs/ajax_get_date_off_by_type/?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('#home>.table-responsive').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.table_type = $scope.filter.type;
                $scope.table_tus = $scope.filter.status;
                $scope.ajax_data = r.data.data;

                $scope.ajax_data.forEach(e => {
                    if (e.paid_leave != "'[]'") {
                        e.paid_leave = JSON.parse(e.paid_leave);
                    }

                    if (e.paid_leave_confirm != "'[]'") {
                        e.paid_leave_confirm = JSON.parse(e.paid_leave_confirm);
                    }
                });

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);

                if (r.data.status == 1) {
                    setTimeout(function () {
                        $scope.showBlock();
                    }, 500);
                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.showBlock = () => {
        $scope.ajax_data.forEach(function (row) {
            var el1 = document.getElementsByClassName('note-user' + row.id);
            if (typeof el1[0].scrollHeight !== 'undefined' && el1[0].scrollHeight > 72) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-user-' + row.id).css('display', 'block');
            }

            var el2 = document.getElementsByClassName('note-confirm-admin' + row.id);
            if (typeof el2[0] !== 'undefined' && el2[0].scrollHeight > 72) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-confirm-admin-' + row.id).css('display', 'block');
            }

            var el3 = document.getElementsByClassName('note-confirm' + row.id);
            if (typeof el3[0] !== 'undefined' && el3[0].scrollHeight > 72) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-confirm-' + row.id).css('display', 'block');
            }

            var el4 = document.getElementsByClassName('note-admin' + row.id);
            if (typeof el4[0] !== 'undefined' && el4[0].scrollHeight > 72) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-admin-' + row.id).css('display', 'block');
            }

            var el5 = document.getElementsByClassName('note-cancel' + row.id);
            if (typeof el5[0] !== 'undefined' && el5[0].scrollHeight > 72) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-cancel-' + row.id).css('display', 'block');
            }

        });
    }

    $scope.showMoreNote = (id, textClass) => {
        console.log('.showMoreNote' + textClass + id);
        $('.showMoreNote' + textClass + id).css('display', 'none');
        $('.note-' + textClass + id).css('-webkit-line-clamp', 'unset');
        $('.collapseNote' + textClass + id).css('display', 'block');
    }

    $scope.collapseNote = (id, textClass) => {
        $('.collapseNote' + textClass + id).css('display', 'none');
        $('.note-' + textClass + id).css('-webkit-line-clamp', '3');
        $('.showMoreNote' + textClass + id).css('display', 'block');
    }

    $scope.openAccept = (value) => {
        $scope.cr_id = value.id;
        $scope.cr_type = value.type;
        $scope.paid_leave = value.paid_leave;
        $scope.user_off = value;
        $scope.errorConfirmNote = 0;
        $scope.errorPercentSalary = 0;
        $scope.errorTextPercentSalary = "";
        $scope.confirm_note = "";
        $scope.percent_salary = "";
        $('#accept').modal('show');
    }
    $scope.openRemove = (value) => {
        if (!is_only_dev) {
            var left = moment().diff(moment(value.max_date, 'DD/MM/YYYY').add(2, "days"), 'days');
            if (left <= 0) {
                $scope.cr_id = value.id;
                $scope.cr_type = value.type;
                $('#remove').modal('show');
            } else {
                toastr["error"]("Quá ngày!");
            }
        } else {
            $scope.cr_id = value.id;
            $scope.cr_type = value.type;
            $('#remove').modal('show');
        }
    }

    $scope.openDenit = (value) => {
        $scope.cr_id = value.id;
        $scope.cr_type = value.type;
        $('#denit').modal('show');
    }
    $scope.openDelete = (value) => {
        $scope.cr_id = value.id;
        $scope.cr_type = value.type;
        $('#delete').modal('show');
    }

    $scope.delete = (id) => {
        $http.post(base_url + 'staffs/ajax_delete_order', id).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Xóa thành công!");
                $scope.getDateOffByType();
                $('#delete').modal('hide');

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.unset = (id) => {
        if (id == 1) {
            $scope.filter.store_id = undefined;
        } else if (id == 2) {
            $scope.filter.group_id = undefined;
        } else if (id == 3) {
            $scope.filter.date = undefined;
        } else if (id == 4) {
            $scope.filter.user_id = undefined;
        }
        $scope.getDateOffByType();
        $scope.select2();
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 10);
    }

    $scope.changeStatus = (status, id, type, event) => {
        if ($scope.confirm_note == '' || !$scope.confirm_note) {
            $scope.errorConfirmNote = 1;
            return false;
        } else {
            $scope.errorConfirmNote = 0;
        }

        if ($scope.user_off.type == 4 && ($scope.percent_salary == null || (typeof $scope.percent_salary == 'undefined'))) {
            $scope.errorPercentSalary = 1;
            $scope.errorTextPercentSalary = 'Vui lòng nhập phần %';
            return false;
        } else {
            $scope.errorPercentSalary = 0;
        }

        if ($scope.user_off.type == 4 && $scope.percent_salary) {
            if (Number($scope.percent_salary) < -1 || Number($scope.percent_salary) > 100) {
                $scope.errorPercentSalary = 1;
                $scope.errorTextPercentSalary = 'Phần trăm lương từ 0 đến 100';
                return false;
            }
        }

        $(event.target).css('pointer-events', 'none');
        var data = {
            type: type,
            confirm_note: $scope.confirm_note,
            percent_salary: $scope.percent_salary ? $scope.percent_salary : ""
        };

        $http.post(base_url + 'staffs/ajax_change_status_order/' + id + '/' + status, JSON.stringify(data)).then(r => {
            $(event.target).css('pointer-events', 'initial');
            if (r && r.data.status == 1) {
                $scope.getDateOffByType();
                if (status == 1) {
                    $('#accept').modal('hide');
                } else {
                    $('#denit').modal('hide');
                }
                $('#remove').modal('hide');
                toastr["success"]("Thành công!");
                $scope.confirm_note = "";
                $scope.percent_salary = "";
            } else if (r && r.data.status == 0) {
                toastr["error"]("Bạn không có quyền duyệt đơn này!");
            } else if (r && r.data.status == 2) {
                toastr["error"]("Chỉ có thể hủy đơn trong ngày!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    var getDates = function (startDate, endDate) {
        var now = startDate.clone(),
            dates = [],
            value = {
                date: String
            };
        while (now.isSameOrBefore(endDate)) {
            dates.push(now.format('YYYY-MM-DD'));
            now.add(1, 'days');
        }
        return dates;
    };

    $scope.selectUser = (item) => {
        $scope.filter.user_id = item.id;
        $scope.find_user = item.user_name;
        $scope.userFind = [];
        $('#menu_user').removeClass('close_');
    }

    $scope.clearSelect = () => {
        $scope.find_user = "";
        delete $scope.filter.user_id;
        $scope.userFind = [];
    }

    $scope.saveOrderOff = () => {
        $scope.order.dataDate = [];
        if ($scope.type == 2) {
            if (!$scope.order.store_id) {
                toastr["error"]("Chọn chi nhánh công tác!");
                return false;

            }
        } else if ($scope.type == 4 || $scope.type == 3) {
            if (!$scope.order.start || $scope.order.start && $scope.order.start == '') {
                toastr["error"]("Chọn ngày!");
                return false;
            }
            var ob = {
                "date": $scope.order.start
            }

            $scope.order.dataDate.push(ob);
        }

        if ($scope.type != 4 && $scope.type != 3) {
            if ((!$scope.order.start || ($scope.order.start && $scope.order.start == '')) || (!$scope.order.end || ($scope.order.end && $scope.order.end == ''))) {
                toastr["error"]("Chọn ngày!");
                return false;
            }
            var ar = getDates(moment($scope.order.start, 'YYYY-MM-DD'), moment($scope.order.end, 'YYYY-MM-DD'));
            ar.forEach(element => {
                var ob = {
                    'date': element
                }
                $scope.order.dataDate.push(ob);
            });
        }
        if ($scope.type == 3) {


            if (($scope.order.late_minutes == 0 && $scope.order.soon_minutes == 0) || $scope.order.late_minutes == null || !$scope.order.soon_minutes == null) {
                toastr["error"]("Nhập phút!");
                return false;
            }
        }
        if ($scope.order.check == 1 && !$scope.order.session) {
            toastr["error"]("Chọn buổi nghỉ!");
            return false;
        }
        if (!$scope.order.note) {
            toastr["error"]("Nhập ghi chú!");
            return false;

        }
        $scope.order.user_id = id_current_user;
        $scope.order.type = $scope.type;

        $http.post(base_url + 'staffs/ajax_save_day_off', JSON.stringify($scope.order)).then(r => {
            if (r && r.data.status == 1) {
                $scope.uploadFile(r.data.data);
                $scope.getDateOffByType();

                $scope.order = {};

                $('#orderoff').modal('hide');
                toastr["success"]("Tạo thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.uploadFile = (id) => {
        if (!$scope.uploadfiles || $scope.uploadfiles && $scope.uploadfiles.length == 0) {
            return false;
        }
        var fd = new FormData();
        angular.forEach($scope.uploadfiles, function (file) {
            fd.append('file_img[]', file);
        });

        $http({
            method: 'post',
            url: 'staffs/ajax_upload_file_off/' + id,
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(response) {
            $scope.response = response.data;
            $scope.getDateOffByType();

            if (response.data.status != 1) {
                toastr["error"]("Lỗi khi upload chứng từ!");
            }
        });
    }
    $scope.changeInputStart = (date, event) => {
        if ($scope.currentItem) {
            $scope.order.start = $scope.currentItem.min_date_temp;
            $scope.order.end = $scope.currentItem.max_date_temp;
        }
        if ($scope.order.start && $scope.order.start != '') {
            if (moment().diff($scope.order.start) > 0) {
                toastr["error"]("Vui lòng chọn ngày trong tương lai!");
                $scope.order.start = '';
                if ($scope.currentItem) {
                    $scope.currentItem.min_date_temp = ''
                }
            }
        }
        if ($scope.order.end && $scope.order.end != '') {
            if (moment().diff($scope.order.end) > 0) {
                toastr["error"]("Vui lòng chọn ngày trong tương lai!");
                $scope.order.end = '';
                if ($scope.currentItem) {
                    $scope.currentItem.max_date_temp = ''
                }
            }
        }

        if ($scope.order.start && $scope.order.start != '' && $scope.order.end && $scope.order.end != '') {
            if (moment($scope.order.start, 'YYYY-MM-DD').diff(moment($scope.order.end, 'YYYY-MM-DD')) > 0) {
                toastr["error"]("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
                $scope.order.end = '';
                if ($scope.currentItem) {
                    $scope.currentItem.max_date_temp = ''
                }
            }
        }

    }

    $scope.selectSession = (session, date) => {
        $scope.dataDateOff.dataDate.forEach(element => {
            if (moment(element.day).isSame(date.date)) {
                element.session = session;

            }
        });
    }
    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }
    $scope.checkSoonLate = () => {
        if ($scope.type == 3) {
            for (var i = $scope.dataDateOff.dataDate.length - 1; i >= 0; i--) {
                if ($scope.dataDateOff.dataDate[i].late_minutes == 0 && $scope.dataDateOff.dataDate[i].soon_minutes == 0) {
                    $scope.dataDateOff.dataDate.splice(i, 1);
                    $scope.dataDateOff.date.splice(i, 1);
                }
            }
        }
        $('#calendar').modal('hide');
    }
    $scope.changeMinute = (type, minute, date) => {
        $scope.dataDateOff.dataDate.forEach(element => {
            if (moment(element.day).isSame(date.date)) {
                if (type == 1) {
                    element.late_minutes = minute;
                } else {
                    element.soon_minutes = minute;
                }

            }
        });
    }


    $scope.dateInputInit = () => {
        if ($('.date').length) {
            //var start = $scope.start;
            //var end = $scope.end;
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            setTimeout(() => {
                $('.date').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    startDate: moment().startOf('month'),
                    endDate: moment().endOf('month'),
                    ranges: {
                        'Hôm nay': [moment(), moment()],
                        'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                        '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                        'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                        'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    }
                });
            }, 100);
        }
    }

    $scope.$watch('type', function (newValue, oldValue) {
        if (oldValue == newValue) {
            return false;
        }
        $scope.order = {};
        if ($scope.type == 3) {

            $scope.order.late_minutes = 0;
            $scope.order.soon_minutes = 0;
        }
    });




    $scope.openDateSelect = () => {
        //  $scope.buildMonth($scope.start, $scope.month);
        $scope.currentItem = undefined;
        $('#orderoff').modal('show');
    }


    $scope.checkIfDayOver = (date) => {
        if (moment().diff(date) > 0) {
            toastr["error"]("Không thể chọn ngày đã qua!");
            return false;
        }
        return true;
    }

    $scope.select = (day) => {
        var ob = {
            day: day.date,
            session: day.session,
            number_date: day.number,
            number_month: day.month,
            late_minutes: day.late_minutes,
            soon_minutes: day.soon_minutes
        }
        if ($scope.dataDateOff.date.indexOf(day.date) >= 0) {
            let index = $scope.dataDateOff.date.indexOf(day.date);

            $scope.dataDateOff.date.splice(index, 1);
            $scope.dataDateOff.dataDate.splice(index, 1);

            return false;
        }
        if ($scope.checkIfDayOver(day.date) == false) {
            return false;
        }

        // đơn nghỉ
        if ($scope.type == 1) {
            if (day.vailable == 0 && day.data.status != -1) {
                toastr["error"]("Ngày này đã xin!");
                return false;
            }



        }

        $scope.dataDateOff.date.push(day.date);
        $scope.dataDateOff.dataDate.push(ob);

    };

    $scope.checkSelected = (day) => {
        let result = false;
        $scope.dataDateOff.date.forEach(element => {
            if (moment(element).isSame(day.date)) {
                result = true;
            }
        });
        return result;
    }

    $scope.next = () => {
        var next = $scope.month.clone();
        $scope.removeTime(next.month(next.month() + 1).date(1));
        $scope.month.month($scope.month.month() + 1);
        $scope.buildMonth(next, $scope.month);
    };

    $scope.previous = () => {
        var previous = $scope.month.clone();
        $scope.removeTime(previous.month(previous.month() - 1).date(1));
        $scope.month.month($scope.month.month() - 1);
        $scope.buildMonth(previous, $scope.month);
    };


    $scope.removeTime = (date) => {
        return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }

    $scope.openCalendar = () => {
        $('#calendar').modal('show');
    }

    $scope.buildMonth = (start, month) => {

        var data = {
            user: id_current_user,
            month: moment(month).format('M'),
            year: moment(month).format('YYYY')
        }
        $http.get(base_url + 'staffs/ajax_get_day_off/?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {


                $scope.weeks = [];
                var done = false,
                    date = start.clone(),
                    monthIndex = date.month(),
                    count = 0;


                while (!done) {
                    $scope.date_data = $scope.buildWeek(date.clone(), month);

                    $scope.date_data.forEach(element => {
                        var vailable = 1,
                            data = {};

                        element.vailable = vailable;
                        element.session = '0';
                        r.data.data.forEach(element2 => {
                            if (element2.date_number == element.nb_date && element.month == element2.month_number && element2.status != -1) {
                                vailable = 0;
                                element.vailable = vailable;
                                element.session = element2.date_session;
                                element.data = element2;
                                element.soon_minutes = element2.soon_minutes;
                                element.late_minutes = element2.late_minutes
                            }
                        });
                    });
                    $scope.weeks.push({
                        days: $scope.date_data
                    });
                    date.add(1, "w");
                    done = count++ > 2 && monthIndex !== date.month();
                    monthIndex = date.month();

                }
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

    }

    $scope.buildWeek = (date, month) => {
        var days = [];
        for (var i = 0; i < 7; i++) {
            days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                month: moment(date).format('MM'),
                date: date,
                nb_date: moment(date).format('DD'),
                late_minutes: 0,
                soon_minutes: 0
            });
            date = date.clone();
            date.add(1, "d");
        }
        return days;
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getDateOffByType(true);
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page) {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = function (paging) {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }
})