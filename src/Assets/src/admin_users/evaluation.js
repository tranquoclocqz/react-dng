setTimeout(() => {
    $('#evaluation').css('display', 'block')
}, 500);

app.controller('EvaluationCtrl', function ($scope, $http, $sce, $window) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        $scope.selectedEmployee = [];
        $scope.is_admin = is_admin;
        $scope.is_manager = is_manager;
        $scope.is_only_dev = is_only_dev;
        $scope.is_only_hr = is_only_hr;
        $scope.is_lead = is_lead;
        $scope.current_id = current_id;
        $scope.evaluation = {};
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.find = MTD;
        $scope.filter.date = '';
        $scope.load = true;
        $scope.getLsEvaluation();
        $scope.getAllStores();
        $scope.list_employees = list_employees;
        $scope.all_groups = all_groups;
        $scope.totalCheckedUser = 0;
        $scope.totalCheckedManage = 0;
        $scope.all_users_by_store_and_group = [];
        setTimeout(function () {
            $scope.filter.date = '';
        }, 200)
        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $scope.showModalManegerEvaluation(preview_id, 'SELF', 0);
        } else console.log('no value was found!');
    }

    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }
    $scope.getLsEvaluation = (is_go_page = false) => {
        $scope.load = true
        if ($scope.filter.date && $scope.filter.date != '') {
            let date = $scope.filter.date.split('-');
            $scope.filter.from = moment(date[0]).format('YYYY-MM-DD');
            $scope.filter.to = moment(date[1]).format('YYYY-MM-DD');
        }

        $http.post(base_url + '/admin_users/ajax_get_ls_evaluation?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;

            $scope.rows.forEach(function (review) {
                if (review.manage_reviews) {
                    let arr_manage_reviews = JSON.parse(review.manage_reviews);
                    review.total_manager = 0;
                    arr_manage_reviews.forEach(function (manage) {
                        if (manage.selected == true) {
                            review.total_manager++;
                        }
                    });
                }

                if (review.user_reviews) {
                    let arr_user_reviews = JSON.parse(review.user_reviews);
                    review.total_user = 0;
                    arr_user_reviews.forEach(function (user) {
                        if (user.selected == true) {
                            review.total_user++;
                        }
                    });
                }
            });

            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            $scope.load = false
        })
    }

    $scope.handleFilter = (firstCall) => {
        $scope.filter.offset = 0;
        $scope.pagingInfo.currentPage = 1;
        $scope.filter.find = !firstCall ? $scope.filter.find : '';
        $scope.getLsEvaluation();
    }

    $scope.showModalAddSalary = () => {
        $scope.evaluation = {};
        $scope.all_users_by_store_and_group = $scope.list_employees;
        select2();

        let dateCurrent = new Date();
        startMonth = dateCurrent.getMonth();
        startYear = dateCurrent.getFullYear();
        endMonth = dateCurrent.getMonth();
        endYear = dateCurrent.getFullYear();
        if (startMonth.toString().length == 1) {
            startMonth = '0' + startMonth;
        }

        if (endMonth.toString().length == 1) {
            endMonth = '0' + endMonth;
        }

        $('.mrp-monthdisplay .mrp-lowerMonth').html(startMonth + '/' + startYear);
        $('.mrp-monthdisplay .mrp-upperMonth').html(endMonth + '/' + endYear);
        $('#modalNewEvaluation').modal('show');
    }

    $scope.addEvaluation = () => {
        // if (!$scope.evaluation.store_id) {
        //     $('.created-evaluation-store').addClass('has-error');
        //     $('.error-store').html('Vui lòng chọn chi nhánh!');
        //     return false;
        // } else {
        //     $('.created-evaluation-store').removeClass('has-error');
        //     $('.error-store').html('');
        // }

        // if (!$scope.evaluation.group_id) {
        //     $('.created-evaluation-group').addClass('has-error');
        //     $('.error-group').html('Vui lòng chọn bộ phận!');
        //     return false;
        // } else {
        //     $('.created-evaluation-group').removeClass('has-error');
        //     $('.error-group').html('');
        // }

        if (!$scope.evaluation.user_ids) {
            $('.created-evaluation-user').addClass('has-error');
            $('.error-user').html('Vui lòng chọn nhân viên!');
            return false;
        } else {
            $('.created-evaluation-user').removeClass('has-error');
            $('.error-user').html('');
        }

        swal({
            title: "Thông báo?",
            text: "Bạn có chắc muốn tạo phiếu cho nhân viên đã chọn!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $scope.evaluation.date_start = $('.mrp-monthdisplay .mrp-lowerMonth').html();
            $scope.evaluation.date_end = $('.mrp-monthdisplay .mrp-upperMonth').html();

            $http.post(base_url + '/admin_users/ajax_create_evaluation', $scope.evaluation).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", "Tạo phiếu đánh giá thành công!", "success");
                    $('#modalNewEvaluation').modal('hide');

                    // Gửi wp sau khi đã tạo phiếu thành công
                    $http.post(base_url + '/admin_users/send_create_evaluation_to_wp', r.data.arr_user_id).then(r => { });

                    $scope.getLsEvaluation();
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.checkDate = (item) => {
        if (item.manage_date) {
            let current_date = new Date();
            let date = new Date(item.manage_date);

            let one_day = 1000 * 60 * 60 * 24

            let Result = Math.round(current_date.getTime() - date.getTime()) / (one_day);

            let range = Result.toFixed(0);
            if (range > 2) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    $scope.showModalManegerEvaluation = (id, view, user_id) => {
        $scope.view = view;
        $scope.log_id = id;
        $scope.changeCheckboxChangeManage = 0;
        $http.get(base_url + '/admin_users/ajax_get_all_criteria?log_id=' + id + '&user_id=' + user_id).then(r => {
            if (r.data.status == 1) {
                $scope.criteries = r.data.data;
                $scope.user_evaluation = r.data.user_evaluation;
                $('#modalManagerEvaluation').modal('show');
                $scope.manage_date = r.data.manage_date;
                $scope.user_date = r.data.user_date;
                $scope.list_user_reviews = r.data.list_user_reviews;
                $scope.list_manage_reviews = r.data.list_manage_reviews;

                for (var i = 0; i < $scope.criteries.length; i++) {
                    for (var k = 0; k < $scope.list_user_reviews.length; k++) {
                        if ($scope.criteries[i].id == $scope.list_user_reviews[k].id) {
                            $scope.criteries[i].selected_user = $scope.list_user_reviews[k].selected;
                        }
                    }

                    for (var j = 0; j < $scope.list_manage_reviews.length; j++) {
                        if ($scope.criteries[i].id == $scope.list_manage_reviews[j].id) {
                            $scope.criteries[i].selected_magnage = $scope.list_manage_reviews[j].selected;
                            $scope.criteries[i].note = $scope.list_manage_reviews[j].note;
                        }
                    }
                }

                $scope.totalCheckedManage = 0;
                for (var i = 0; i < $scope.list_manage_reviews.length; i++) {
                    if ($scope.list_manage_reviews[i].selected == true) {
                        $scope.totalCheckedManage += 1;
                    }
                }

                $scope.totalCheckedUser = 0;
                for (var i = 0; i < $scope.list_user_reviews.length; i++) {
                    if ($scope.list_user_reviews[i].selected == true) {
                        $scope.totalCheckedUser += 1;
                    }
                }
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.showModalDetailEvaluation = (id, view, user_id) => {
        $scope.view = view;
        $http.get(base_url + '/admin_users/ajax_get_all_criteria?log_id=' + id + '&user_id=' + user_id).then(r => {
            if (r.data.status == 1) {
                $scope.criteries = r.data.data;
                $scope.user_evaluation = r.data.user_evaluation;
                $('#modalManagerEvaluation').modal('show');
                $scope.manage_date = r.data.manage_date;
                $scope.user_date = r.data.user_date;
                $scope.list_user_reviews = r.data.list_user_reviews;
                $scope.list_manage_reviews = r.data.list_manage_reviews;

                for (var i = 0; i < $scope.criteries.length; i++) {
                    for (var k = 0; k < $scope.list_user_reviews.length; k++) {
                        if ($scope.criteries[i].id == $scope.list_user_reviews[k].id) {
                            $scope.criteries[i].selected_user = $scope.list_user_reviews[k].selected;
                        }
                    }

                    for (var j = 0; j < $scope.list_manage_reviews.length; j++) {
                        if ($scope.criteries[i].id == $scope.list_manage_reviews[j].id) {
                            $scope.criteries[i].selected_magnage = $scope.list_manage_reviews[j].selected;
                            $scope.criteries[i].note = $scope.list_manage_reviews[j].note;
                        }
                    }
                }

                $scope.totalCheckedManage = 0;
                for (var i = 0; i < $scope.list_manage_reviews.length; i++) {
                    if ($scope.list_manage_reviews[i].selected == true) {
                        $scope.totalCheckedManage += 1;
                    }
                }

                $scope.totalCheckedUser = 0;
                for (var i = 0; i < $scope.list_user_reviews.length; i++) {
                    if ($scope.list_user_reviews[i].selected == true) {
                        $scope.totalCheckedUser += 1;
                    }
                }
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.updateEvaluation = (type) => {
        var data = [];
        for (var i = 0; i < $scope.criteries.length; i++) {
            let selected = false;
            if ($scope.criteries[i].selected_user && $scope.criteries[i].selected_user == true) {
                selected = true;
            }
            data[i] = { id: $scope.criteries[i].id, selected: selected }
        }

        swal({
            title: "Thông báo?",
            text: "Bạn đã chắc chắn với đánh giá của mình chưa!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#f39c12',
            cancelButtonColor: '#d33',
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/admin_users/ajax_save_criteria_user_logs?id=' + $scope.log_id + '&type=' + type, data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", $scope.view == 'SELF' ? 'Đánh giá thành công' : "Cập nhật thành công!", "success");
                    $('#modalManagerEvaluation').modal('hide');
                    $scope.getLsEvaluation();
                } else swal("Thông báo", "Đã có lỗi xẩy ra, xin vui lòng thử lại!", "error");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.updateManagerEvaluation = () => {
        var data = [];
        for (var i = 0; i < $scope.criteries.length; i++) {
            let selected = false;
            if ($scope.criteries[i].selected_magnage && $scope.criteries[i].selected_magnage == true) {
                selected = true;
            }
            let noted = '';
            if ($scope.criteries[i].note && $scope.criteries[i].note != '') {
                noted = $scope.criteries[i].note;
            }
            data[i] = { id: $scope.criteries[i].id, selected: selected, note: noted }
        }

        swal({
            title: "Thông báo?",
            text: "Bạn đã chắc chắn muốn cập nhật phiếu đánh giá này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#f39c12',
            cancelButtonColor: '#d33',
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/admin_users/ajax_manager_update_criteria_user_logs?id=' + $scope.log_id, data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", $scope.view == 'SELF' ? 'Đánh giá thành công' : "Cập nhật thành công!", "success");
                    $('#modalManagerEvaluation').modal('hide');
                    $scope.getLsEvaluation();
                } else swal("Thông báo", "Đã có lỗi xẩy ra, xin vui lòng thử lại!", "error");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.onCheckboxChangeManage = (item) => {
        $scope.changeCheckboxChangeManage = 1; // nếu có sự thay đổi
        if (item) {
            if (item.selected_magnage == true) {
                $scope.totalCheckedManage += 1;
            } else {
                $scope.totalCheckedManage -= 1;
            }
        }

        // lưu tạm thời những tiêu chí vào db khi quản lý đánh giá
        let data = [];
        for (let i = 0; i < $scope.criteries.length; i++) {
            let selected = false;
            if ($scope.criteries[i].selected_magnage && $scope.criteries[i].selected_magnage == true) {
                selected = true;
            }
            let noted = '';
            if ($scope.criteries[i].note && $scope.criteries[i].note != '') {
                noted = $scope.criteries[i].note;
            }
            data[i] = { id: $scope.criteries[i].id, selected: selected, note: noted }
        }
        $http.post(base_url + '/admin_users/ajax_save_temporary_criteria_user_logs?id=' + $scope.log_id, data).then(r => { });
    }

    $scope.closeNote = () => {
        $scope.changeCheckboxChangeManage = 1;
        if ($scope.view != 'EDIT_MANAGER') {
            $scope.onCheckboxChangeManage();
        }
    }

    $scope.closeModalManagerEvaluation = () => {
        if ($scope.changeCheckboxChangeManage == 1 && $scope.view != 'EDIT_MANAGER') {
            $scope.getLsEvaluation();
        }
    }

    $scope.onEditManage = (item) => {
        if (item) {
            if (item.selected_magnage == true) {
                $scope.totalCheckedManage += 1;
            } else {
                $scope.totalCheckedManage -= 1;
            }
        }
    }

    $scope.onCheckboxChangeUser = (item) => {
        if (item.selected_user == true) {
            $scope.totalCheckedUser += 1;
        } else {
            $scope.totalCheckedUser -= 1;
        }
    }

    $scope.showModalNote = (item) => {
        $scope.criteria = item;
        $('#modalNote').modal('show');
    }

    $scope.saveManagerEvaluation = () => {
        var data = [];
        for (var i = 0; i < $scope.criteries.length; i++) {
            let selected = false;
            if ($scope.criteries[i].selected_magnage && $scope.criteries[i].selected_magnage == true) {
                selected = true;
            }
            let noted = '';
            if ($scope.criteries[i].note && $scope.criteries[i].note != '') {
                noted = $scope.criteries[i].note;
            }
            data[i] = { id: $scope.criteries[i].id, selected: selected, note: noted }
        }

        swal({
            title: "Thông báo?",
            text: "Bạn đã chắc chắn với đánh giá của mình chưa!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#f39c12',
            cancelButtonColor: '#d33',
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + '/admin_users/ajax_save_criteria_user_logs?id=' + $scope.log_id + '&is_manager=' + 1, data).then(r => {
                if (r.data && r.data.status == 1) {
                    $('#modalManagerEvaluation').modal('hide');
                    swal("Thông báo", "Đánh giá thành công!", "success");
                    $scope.log_id = '';
                    $scope.getLsEvaluation();
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra!", "error");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.showModalCancelEvaluation = (cancel_id) => {
        swal({
            title: "Thông báo?",
            text: "Bạn không thể hoàn nguyên điều này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#f39c12',
            cancelButtonColor: '#d33',
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: true
        }, function () {
            $http.post(base_url + '/admin_users/ajax_cancel_criteria_user_logs?id=' + cancel_id).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $scope.getLsEvaluation();
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra!", "error");
                }
            });
        });
    }

    $scope.changeStoreCreatedEvaluation = () => {
        $scope.evaluation.group_id = "";
        select2();
        if ($scope.evaluation.store_id) {
            $http.get(base_url + '/admin_users/ajax_get_user_by_store_and_group?store_id=' + $scope.evaluation.store_id).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.all_users_by_store_and_group = r.data.data;
                    select2();
                }
            })
        }
    }

    $scope.changeGroupCreatedEvaluation = () => {
        if (!$scope.evaluation.store_id) {
            $('.created-evaluation-group').addClass('has-error');
            $('.error-group').html('Vui lòng chọn chi nhánh');
            $scope.evaluation.group_id = "";
            select2();
        } else {
            $('.created-evaluation-group').removeClass('has-error');
            $('.error-group').html('');
        }

        if ($scope.evaluation.store_id && $scope.evaluation.group_id) {
            $http.get(base_url + '/admin_users/ajax_get_user_by_store_and_group?store_id=' + $scope.evaluation.store_id + '&group_id=' + $scope.evaluation.group_id).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.all_users_by_store_and_group = r.data.data;
                    select2();
                }
            })
        }
    }

    $scope.format_date = (date, type) => {
        return moment(date).format(type);
    }

    $scope.converHtml = (index, htmlbd, obligatory) => {
        $span = '';
        if (obligatory == 1) {
            $span = '<span class="obligatory"> (*)</span>';
        }
        return $sce.trustAsHtml(index + '. ' + htmlbd + $span);
    }

    $scope.getAllStores = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_stores').then(r => {
            if (r.data.status == 1) {
                $scope.currentStores = r.data.data;
                $scope.newStores = r.data.data;
                select2();
            }
            $('#loading').removeClass('loading');
        });
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getLsEvaluation(true);
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
    //end paging

    $scope.unset = () => {
        $scope.filter.date = undefined;
        $scope.select2();
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
});