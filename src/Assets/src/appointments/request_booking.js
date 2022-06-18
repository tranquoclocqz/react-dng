app.controller('request_booking', function ($scope, $http) {
    $scope.init = () => {
        $scope.allow_edit = is_leader_tvv || is_only_dev;
        $scope.allow_re_edit = sales_manager_id || is_only_dev;
        $scope.pagingInfo = {
            itemsPerPage: 20,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.filter = {
            key: '',
            date: date_bw,
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
            status: '-2',
            load: false,
            allow_all: $scope.allow_edit ||  $scope.allow_re_edit
        }

        $scope.reSet();
        $scope.is_leader_tvv = is_leader_tvv;
        $scope.is_only_dev = is_only_dev;
        $scope.lists = [];
        $scope.getData();
        $scope.getListUserByRule();
        $('#request_booking').fadeIn('fast');
    }

    $scope.reSet = () => {
        $scope.obj_search_app = {
            show_rs: false,
            key: '',
            list: [],
            load: false
        };

        $scope.obj_insert = {
            choose: {},
            after_user_id: id_current_user + '',
            note: '',
            load: false
        }
    }

    $scope.getData = () => {
        var data_rq = angular.copy($scope.filter);
        data_rq.start_date = getDateBw(data_rq.date);
        data_rq.end_date = getDateBw(data_rq.date, 0);

        $scope.filter.load = true;
        $http.get(base_url + 'appointments/ajax_get_request_bookings?' + $.param(data_rq)).then(r => {
            $scope.filter.load = false;
            if (r.data.status) {
                $("html, body").animate({
                    scrollTop: 0
                }, 0);

                var list = r.data.data.list,
                    count = r.data.data.count;

                $scope.lists = list;
                $scope.pagingInfo.total = count;
                $scope.pagingInfo.totalPage = Math.ceil(count / $scope.pagingInfo.itemsPerPage);

                $scope.lists.forEach(item => {
                    if (item.status == 0) {
                        if ($scope.allow_edit) {
                            item.allow_confirm = true;
                        }
                        if (item.created_user_id == id_current_user) {
                            item.allow_cancel = true;
                        }
                    }
                    if((item.status == 1 ) && $scope.allow_re_edit && item.re_confirm_user_id == 0){
                        item.allow_re_confirm = true;
                    }
                });
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.getListUserByRule = () => {
        $scope.list_user = [];

        $http.get(base_url + 'admin_users/ajax_get_user_by_rule?filter=' + JSON.stringify({
            group_id: [5],
            or_user_id: id_current_user,
            store_id: 8
        })).then(r => {
            if (r.data.status) {
                $scope.list_user = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            select2_img();
        });
    }

    $scope.saveData = () => {
        var data_rq = angular.copy($scope.obj_insert);
        data_rq.appointment_id = data_rq.choose.app_id;
        data_rq.before_user_id = data_rq.choose.import_id;

        if (!data_rq.appointment_id) {
            showMessErr('Vui lòng chọn Lịch hẹn cần thay đổi');
            return;
        }

        if (data_rq.before_user_id == data_rq.after_user_id) {
            showMessErr('Người được thay đổi phải khác người đặt lịch');
            return;
        }

        if (!data_rq.note) {
            showMessErr('Vui lòng nhập ghi chú!');
            return false;
        }

        $scope.obj_insert.load = true;
        $http.get(base_url + 'appointments/ajax_save_appointment_requests?' + $.param(data_rq)).then(r => {
            $scope.obj_insert.load = false;
            if (r.data.status) {
                showMessSuccess('Thành công!');
                $('#modal_add').modal('hide');
                $scope.getData();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.showPopup = () => {
        $scope.reSet();
        select2_img();
        $('#modal_add').modal('show');
        setTimeout(() => {
            $('#search-app').trigger('focus');
        }, 300);
    }

    $scope.searchApp = () => {
        var key = $scope.obj_search_app.key;
        if (key.length < 4) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchApp(key);
        }, 350);
    }

    $scope._searchApp = (key) => {
        $scope.obj_search_app.load = true;
        $http.get(base_url + 'appointments/ajax_search_appointments_by_phone?key=' + key).then(r => {
            if (r.data.status) {
                var data = r.data.data;
                $scope.obj_search_app.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_search_app.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.hideRsFilterUser = () => {
        setTimeout(() => {
            $scope.obj_search_app.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $(document).on('focus', '#search-app', function () {
        setTimeout(() => {
            $scope.obj_search_app.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $scope.changeStatus = (item, status) => {
        var data_rq = {
            'id': item.id,
            'status': status,
            'invoice_id': item.invoice_id,
            'after_id': item.after_id,
            'confirm_user_id': item.confirm_user_id
        }
        swal({
            title: "Bạn có chắc",
            text: "Bạn không thể hoàn tác điều này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Xác nhận",
            closeOnConfirm: false,
            confirmButtonColor: '#00a65a',
            showLoaderOnConfirm: true
        }, function () {
            $http.get(base_url + 'appointments/ajax_update_status_appointment_requests?' + $.param(data_rq)).then(r => {
                if (r.data.status) {
                    swal("Thông báo", "Cập nhật thành công !", "success");
                    $scope.getData();
                } else {
                    showMessErr(r.data.message);
                }
            }, function (data, status, headers, config) {
                showMessErrSystem()
            });
        });
    }

    $scope.chooseApp = (data) => {
        if(data.invoice_id == 0){
            return showMessErr('Không thể chọn lịch hẹn chưa phát sinh hóa đơn !');
        }
        $scope.obj_search_app.key = '';
        $scope.obj_insert.choose = angular.copy(data);
    }

    $scope.remveChooseApp = () => {
        $scope.obj_insert.choose = {};
        setTimeout(() => {
            $('#search-app').trigger('focus');
        }, 100);
    }

    $scope.formatDateToTime = (date, type = 'DD/MM/YYYY') => {
        return moment(date, 'YYYY-MM-DD').format(type)
    }

    $scope.go2Page = (page) => {
        if (page < 0) return;
        $scope.pagingInfo.currentPage = page;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getData();
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
})

app.filter('momentFormat', function () {
    return (value, format = 'HH:mm DD/MM/YYYY') => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});