setTimeout(() => {
    $('#evaluation_staff').css('display', 'block')
}, 500);

app.controller('EvaluationStaffCtrl', function ($scope, $http, $sce, $window) {

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
        $scope.current_id = current_id;
        $scope.evaluation = {};
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.date = '';
        $scope.load = true;
        $scope.getLsEvaluation();
        $scope.totalCheckedUser = 0;
        setTimeout(function () {
            $scope.filter.date = '';
        }, 200)
    }

    $scope.getLsEvaluation = (is_go_page = false) => {
        $scope.check_role();
        $scope.load = true
        if ($scope.filter.date && $scope.filter.date != '') {
            let date = $scope.filter.date.split('-');
            $scope.filter.from = moment(date[0]).format('YYYY-MM-DD');
            $scope.filter.to = moment(date[1]).format('YYYY-MM-DD');
        }

        $http.post(base_url + '/staffs/ajax_get_ls_evaluation_staff?filter=' + JSON.stringify($scope.filter)).then(r => {
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
        $scope.getLsEvaluation();
    }

    $scope.showModalEditEvaluation = (id, view) => {
        $scope.view = view;
        $scope.log_id = id;
        $http.get(base_url + '/admin_users/ajax_get_all_criteria?log_id=' + id).then(r => {
            if (r.data.status == 1) {
                $scope.criteries = r.data.data;
                $scope.user_evaluation = r.data.user_evaluation;
                console.log(r.data.user_evaluation);
                $('#modalEvaluation').modal('show');
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

    $scope.check_role = () => {
        $http.get(base_url + '/admin_users/ajax_check_role').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_store = r.data.data;
                select2();
            }
        })
    }

    $scope.showModalDetailEvaluation = (id, view) => {
        $scope.view = view;
        $http.get(base_url + '/admin_users/ajax_get_all_criteria?log_id=' + id).then(r => {
            if (r.data.status == 1) {
                $scope.criteries = r.data.data;
                $scope.user_evaluation = r.data.user_evaluation;
                $('#modalEvaluation').modal('show');
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

    $scope.updateEvaluation = () => {
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
            $http.post(base_url + '/admin_users/ajax_save_criteria_user_logs?id=' + $scope.log_id, data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", $scope.view == 'ADD' ? 'Đánh giá thành công' : "Cập nhật thành công!", "success");
                    $('#modalEvaluation').modal('hide');
                    $scope.getLsEvaluation();
                } else swal("Thông báo", "Đã có lỗi xẩy ra, xin vui lòng thử lại!", "error");
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.onCheckboxChange = (item) => {
        if (item.selected_user == true) {
            $scope.totalCheckedUser += 1;
        } else {
            $scope.totalCheckedUser -= 1;
        }
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

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
});