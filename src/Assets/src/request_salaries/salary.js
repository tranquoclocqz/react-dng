setTimeout(() => {
    $('#salary').css('display', 'block')
}, 500);

app.controller('SalariesCtrl', function ($scope, $http, $sce, $window) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.pointWork = [];
        $scope.isView = 1;
        $scope.selectedEmployee = [];
        $scope.currentStores = all_stores;
        $scope.newStores = all_stores;
        $scope.current_id = current_id;
        $scope.current_main_group_id = current_main_group_id;
        $scope.current_main_store_id = current_main_store_id;
        $scope.is_hr = is_hr;
        $scope.is_dev = is_dev;
        $scope.is_admin = is_admin;
        $scope.salary = {};
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.date = '';
        $scope.filter.date_start = '';
        $scope.load = true;
        $scope.month_current = moment($scope.date).format("M");
        $scope.year_current = moment().year();
        $scope.month_start = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        $scope.month_end = [];
        $scope.year_ends = [];
        $scope.getSalaries();
        $scope.get_year();
        $scope.getAllPosition();
        $scope.all_users = all_users;
        $scope.all_groups = all_groups;
        $scope.list_store = all_stores;
        $scope.all_companies = all_companies;
        $scope.chooseRange = 1;
        $scope.showHistory = 0;
        $scope.textSalary = 0;
        $scope.rangeDate = {};
        $scope.arrCheckSalary = [];
        setTimeout(function () {
            $scope.filter.date = '';
            $scope.filter.date_start = '';
        }, 200);

        $scope.disabledPosition = 0;
        $scope.base_url = base_url;
        $scope.date_synthetic = '';
        $scope.showExportSynthetic = 0;
        $scope.chooseSendToUser = 0;
        $scope.loadLevel();
        
        $scope.admin_salary = [];
    }

    $scope.chooseDate = () => {
        if ($scope.salary.user_id == '') {
            toastr["error"]("Vui lòng chọn nhân viên!");
            return false;
        }
        $('#dateft').modal('show');
    }

    $scope.getSalaries = (is_go_page = false) => {
        // filter tổng hợp đề xuất
        $scope.filter.date_synthetic = '';

        $scope.load = true
        if ($scope.filter.date && $scope.filter.date != '') {
            let date = $scope.filter.date.split('-');
            $scope.filter.from = moment(date[0]).format('YYYY-MM-DD');
            $scope.filter.to = moment(date[1]).format('YYYY-MM-DD');
        }

        if ($scope.filter.date_start && $scope.filter.date_start != '') {
            let date_start = $scope.filter.date_start.split('-');
            $scope.filter.from_date_start = moment(date_start[0]).format('YYYY-MM-DD');
            $scope.filter.to_date_start = moment(date_start[1]).format('YYYY-MM-DD');
        }

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

        $http.post(base_url + '/request_salaries/ajax_get_ls_salary?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            if ($scope.arrCheckSalary.length > 0) {
                $scope.arrCheckSalary.forEach((e) => {
                    $scope.rows.forEach((r) => {
                        if (String(r.id) == String(e)) {
                            r.isCheck = 1;
                        }
                    });
                });
            }
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            $scope.load = false;
            $('.dt-toolbar-footer').css('display', 'block');
            $scope.showExportSynthetic = 0;
            $scope.arrCheckSalary = [];
            if (r.data.status == 1) {
                setTimeout(function () {
                    $scope.showBlock();
                }, 500);
            }
        })
    }

    $scope.showBlock = () => {
        $scope.rows.forEach(function (row) {
            row.user_handle.forEach((e, key) => {
                var el1 = document.getElementsByClassName('note' + row.id + key);
                if (el1[0].scrollHeight >= 54) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                    $('.block-event-show-note-' + row.id + key).css('display', 'block');
                }
            });
        });
    }

    $scope.showMoreNote = (id, key) => {
        $('.showMoreNote' + id + key).css('display', 'none');
        $('.note' + id + key).css('-webkit-line-clamp', 'unset');
        $('.collapseNote' + id + key).css('display', 'block');
    }

    $scope.collapseNote = (id, key) => {
        $('.collapseNote' + id + key).css('display', 'none');
        $('.note' + id + key).css('-webkit-line-clamp', '3');
        $('.showMoreNote' + id + key).css('display', 'block');
    }

    $scope.changeView = (val) => {
        $scope.isView = val;
        $scope.rows = [];
        $scope.filter = {};
        $scope.filter.offset = 0;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        if (val == 2) {
            $scope.filter.isView = $scope.isView;
        }
        select2();
        $scope.getSalaries();
    };

    $scope.checkAll = (val) => {
        $scope.rows.forEach((e) => {
            if (e.status == '3' || e.status == '5') {
                e.isCheck = val ? 1 : 0;
            }

            if (val == 1 && (e.status == '3' || e.status == '5')) {
                $scope.arrCheckSalary.push(e.id);
            } else if (val == 0) {
                $scope.arrCheckSalary = $scope.arrCheckSalary.filter(e => e.isCheck == 0);
            }
        });
    };

    $scope.getQuantityCheck = () => {
        if ($scope.rows) {
            let assets = $scope.rows.filter((r) => {
                return r.isCheck == 1;
            });
            return assets.length;
        }
        return 0;
    };

    $scope.confirmSalaryMaster = (type) => {
        let lsChekedSalary = $scope.rows.filter((r) => {
            return r.isCheck == 1;
        });
        if (lsChekedSalary.length == 0) {
            toastr["error"]("Bạn chưa chọn đề xuất nào!");
            return;
        }
        swal({
            title: "Thông báo?",
            text: "Bạn có chắc muốn duyệt tất cả đề xuất được chọn!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + "/request_salaries/ajax_confirm_request_salary_master", lsChekedSalary).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $scope.getSalaries();
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            })
        });
    };

    $scope.showModalAddSalary = () => {
        $scope.list_user_request = [];
        $scope.isAction = 'ADD';
        $scope.salary = {};
        $scope.isStep = 1;
        $scope.textSalary = 0;
        $scope.salary.user_id = '';
        if ($scope.month_current == 6) {
            $scope.salary.month_start = 1 + "";
            $scope.salary.year_start = (moment().year() - 1) + "";
        } else if ($scope.month_current > 6) {
            $scope.salary.month_start = ($scope.month_current - 5) + "";
            $scope.salary.year_start = moment().year() + "";
        } else {
            $scope.salary.month_start = (12 + ($scope.month_current - 5)) + "";
            $scope.salary.year_start = (moment().year() - 1) + "";
        }

        $scope.salary.month_end = $scope.month_current;
        $scope.salary.year_end = moment().year() + "";
        $scope.salary.salary_old = 0;
        $scope.salary.subsidy_old = 0;

        $scope.salary.point_ladder = '';
        $scope.salary.percent = '';
        $scope.salary.point = '';
        $scope.salary.type = '';
        $scope.checkExistRequestSalary = 0;
        $scope.type_edit = '';

        $scope.reports = [];
        $scope.showHistory = 0;

        $scope.each_month = [];
        $scope.year.forEach(function (y, k) {
            if (k == 0) {
                for (i = $scope.month_current; i > 0; i--) {
                    $scope.each_month.push(i + "/" + y);
                }
            } else {
                for (i = 12; i > 0; i--) {
                    $scope.each_month.push(i + "/" + y);
                }
            }
        });

        $scope.get_list_user_request();

        $('#modalSalary').modal('show');
        $("#radio_1").attr('checked', 'checked');
        $scope.chooseRange = 1;

        $scope.month_end = $scope.month_start.filter(element => {
            return element >= $scope.salary.month_start;
        });

        $scope.year_ends = $scope.year.filter(element => {
            return element >= $scope.salary.year_start;
        });

        $scope.salary.each_month = [];
        $scope.errorUser = 0;
        $scope.errorType = 0;
        $scope.errorSendAdmin = 0;
        $scope.errorPosition = 0;
        $scope.errorPositionNew = 0;
        $scope.errorSalaryOld = 0;
        $scope.errorSalaryNew = 0;
        $scope.errorSubsidyNew = 0;
        $scope.errorDateStart = 0;
        $scope.errorNote = 0;

        setTimeout(() => {
            select2();
        }, 100);
    }

    // phân quyền

    $scope.get_list_user_request = () => {
        $http.get(base_url + '/request_salaries/ajax_get_list_user_request' + '?user_id=' + $scope.current_id + '&main_group_id=' + current_main_group_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.list_user_request = r.data.data;
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }

    $scope.get_list_user_permission_approve = (user_id, group_id) => { // lấy tất cả những người và nhóm có quyền duyệt đề xuất
        $http.get(base_url + '/request_salaries/get_list_user_permission_approve' + '?user_id=' + user_id + '&main_group_id=' + group_id + '&company_id=' + $scope.salary.company_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.admin_salary = r.data.data;
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }

    // phân quyền

    $scope.changeSelectedRange1 = () => {
        $scope.chooseRange = 1;
    }

    $scope.changeSelectedRange2 = () => {
        $scope.chooseRange = 2;
    }

    $scope.getReportSalaryUser = () => {
        if ($scope.salary.user_id == '') {
            toastr["error"]("Vui lòng chọn nhân viên!");
            return false;
        }
        $('#table_target, #table_penances, #table_evaluation, #table_complains').css('display', 'none');
        $scope.salary.chooseRange = $scope.chooseRange;
        if ($scope.chooseRange == 1) {
            var lastDay = new Date($scope.salary.year_end, $scope.salary.month_end, 0);
            $scope.rangeDate.date = "0" + $scope.salary.month_start + '/' + "01/" + $scope.salary.year_start + ' - 0' + $scope.salary.month_end + "/" + lastDay.getDate() + "/" + $scope.salary.year_end;
            $scope.rangeDate.chooseRange = 1;
        } else {
            if (!$scope.salary.each_month || $scope.salary.each_month.length == 0) {
                toastr["error"]("Vui lòng chọn khoảng thời gian!");
                return false;
            }
            $scope.rangeDate.each_month = $scope.salary.each_month;
        }
        $scope.showHistory = 1;

        

        if ($scope.salary.chooseRange == 2 || ($scope.isAction == 'EDIT' && $scope.salary.each_month)) {
            $scope.rangeDate.chooseRange = 2;
            $scope.rangeDate.each_month = $scope.salary.each_month;
        }

        if ($scope.salary.user_id) {
            $scope.loadSubmit = true;
            $http.get(base_url + '/request_salaries/ajax_get_report_salary_user/' + $scope.salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.userHistory = r.data.data_user;
                    $scope.salary.point = $scope.userHistory.medium_point;
                    $scope.salary.point_ladder = "";
                    if ($scope.salary.point < 7) {
                        $scope.salary.point_ladder = 'O - OUT';
                    }
                    if ($scope.salary.point >= 7 && $scope.salary.point <= 10) {
                        $scope.salary.point_ladder = 'B - BAD';
                    }
                    if ($scope.salary.point >= 11 && $scope.salary.point <= 15) {
                        $scope.salary.point_ladder = 'N - NORMAL';
                    }
                    if ($scope.salary.point >= 16 && $scope.salary.point <= 18) {
                        $scope.salary.point_ladder = 'G - GOOD';
                    }
                    if ($scope.salary.point >= 19 && $scope.salary.point <= 20) {
                        $scope.salary.point_ladder = 'E - EXCELLENT';
                    }
                    $scope.getTarget();
                    $scope.changePointLadder($scope.salary.point_ladder);
                }
                $scope.loadSubmit = false;
                select2();
            });
        }
    }

    $scope.getTarget = (open) => {
        $scope.total = {
            sale: 0,
            target: 0,
            count_rate: 0,
            total_invoice: 0,
            bonus: 0,
            countr: 0,
            rate: 0
        }
        if ($scope.isAction == 'EDIT' && $scope.salary.each_month) {
            $scope.salary.chooseRange = 2;
        }
        $scope.loadTarget = true;
        $http.get(base_url + 'staffs/ajax_get_report_sale_users?filter=' + JSON.stringify($scope.salary)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.reports = [];
                for (const p in r.data.data) {
                    $scope.reports.push(r.data.data[p]);
                    $scope.total.sale += Number(r.data.data[p].total_sale);
                    $scope.total.target += r.data.data[p].total_target ? Number(r.data.data[p].total_target) : 0;
                    if (r.data.data[p].rate) {
                        $scope.total.rate += Number(r.data.data[p].rate.rate);
                        $scope.total.total_invoice += Number(r.data.data[p].rate.total_invoice);
                        $scope.total.count_rate += Number(r.data.data[p].rate.count_rate);
                        $scope.total.countr++;
                    }
                }
            }
            $scope.loadTarget = false;
        });
        $scope.load_point_work();
    }

    $scope.openTarget = (open) => {
        if (open == "OPEN") {
            $('#table_penances, #table_complains, #table_evaluation').css('display', 'none');
            if ($('#table_target').css('display') == 'none') {
                $scope.table_active = 'openTarget';
            } else {
                $scope.table_active = '';
            }
            $('#table_target').slideToggle(300);
        }
    }

    $scope.openPenances = (open) => {
        if (open == "OPEN") {
            $('#table_target, #table_complains, #table_evaluation').css('display', 'none');
            if ($('#table_penances').css('display') == 'none') {
                $scope.table_active = 'openPenances';
            } else {
                $scope.table_active = '';
            }
            $('#table_penances').slideToggle(300);
        }
        $scope.loadTable = true;
        $scope.rangeDate.chooseRange = $scope.chooseRange;
        if ($scope.isAction == 'EDIT' && $scope.salary.each_month) {
            $scope.rangeDate.chooseRange = 2;
            $scope.rangeDate.each_month = $scope.salary.each_month;
        }
        $http.get(base_url + '/admin_users/ajax_get_penance/' + $scope.salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
            if (r.data.status == 1) {
                $scope.penances = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loadTable = false;
        });
    }

    $scope.openComplain = (open) => {
        if (open == "OPEN") {
            $('#table_target, #table_penances, #table_evaluation').css('display', 'none');
            if ($('#table_complains').css('display') == 'none') {
                $scope.table_active = 'openComplain';
            } else {
                $scope.table_active = '';
            }
            $('#table_complains').slideToggle(300);

            $scope.open_tabel = "openComplain";
        }
        $scope.loadTable = true;
        $scope.rangeDate.chooseRange = $scope.chooseRange;
        $http.get(base_url + '/admin_users/ajax_get_complains/' + $scope.salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
            if (r.data.status == 1) {
                $scope.complains = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loadTable = false;
        });
    }

    $scope.openEvaluation = (open) => {
        if (open == "OPEN") {
            $('#table_target, #table_penances, #table_complains').css('display', 'none');
            if ($('#table_evaluation').css('display') == 'none') {
                $scope.table_active = 'openEvaluation';
            } else {
                $scope.table_active = '';
            }
            $('#table_evaluation').slideToggle(300);

            $scope.open_tabel = "openEvaluation";
        }
        $scope.loadTable = true;
        $scope.rangeDate.chooseRange = $scope.chooseRange;
        if ($scope.isAction == 'EDIT' && $scope.salary.each_month) {
            $scope.rangeDate.chooseRange = 2;
            $scope.rangeDate.each_month = $scope.salary.each_month;
        }
        $http.get(base_url + '/admin_users/ajax_get_evaluation/' + $scope.salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
            if (r.data.status == 1) {
                $scope.reviews = r.data.data;
                $scope.reviews.forEach(function (review) {
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
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loadTable = false;
        });
    }

    $scope.changePointLadder = (point_ladder) => {
        if (!$scope.salary.user_id) {
            $scope.salary.point_ladder = '';
            toastr["error"]("Vui lòng chọn nhân viên!");
            return false;
        }
        // lấy phần trăm tăng lương theo từng bộ phận
        $scope.textPercent = "";
        if (point_ladder == "B - BAD") {
            if ($scope.salary.work_time_month >= 12) {
                $scope.salary.percent = 5;
                $scope.textPercent = "B - BAD: 5%";
            } else {
                $scope.salary.percent = 0;
                $scope.textPercent = "B - BAD: Không được tăng lương";
            }
        }

        if (point_ladder == "N - NORMAL") {
            switch ($scope.salary.group_id) {
                case "10":
                    $scope.salary.percent = 5;
                    $scope.textPercent = "N - NORMAL: 5%";
                    break;
                case "11":
                    $scope.salary.percent = 8;
                    $scope.textPercent = "N - NORMAL: 8%";
                    break;
                case "9":
                    $scope.salary.percent = 5;
                    $scope.textPercent = "N - NORMAL: 5%";
                    break;
                case "12":
                    $scope.salary.percent = 5;
                    $scope.textPercent = "N - NORMAL: 5%";
                    break;
                default:
                    $scope.salary.percent = 5;
                    if ($scope.salary.work_time_month >= 12) {
                        $scope.textPercent = "N - NORMAL: 5% - 10%";
                    } else {
                        $scope.textPercent = "N - NORMAL: 5%";
                    }
            }
        }

        if (point_ladder == "G - GOOD") {
            switch ($scope.salary.group_id) {
                case "10":
                    $scope.salary.percent = 8;
                    $scope.textPercent = "G - GOOD: 8%";
                    break;
                case "11":
                    $scope.salary.percent = 10;
                    $scope.textPercent = "G - GOOD: 10%";
                    break;
                case "9":
                    $scope.salary.percent = 10;
                    $scope.textPercent = "G - GOOD: 10%";
                    break;
                case "12":
                    $scope.salary.percent = 8;
                    $scope.textPercent = "G - GOOD: 8%";
                    break;
                default:
                    if ($scope.salary.work_time_month >= 12) {
                        $scope.salary.percent = 10;
                        $scope.textPercent = "G - GOOD: 15%";
                    } else {
                        $scope.salary.percent = 15;
                        $scope.textPercent = "G - GOOD: 10%";
                    }
            }
        };

        if (point_ladder == "E - EXCELLENT") {
            switch ($scope.salary.group_id) {
                case "10":
                    $scope.salary.percent = 10;
                    $scope.textPercent = "E - EXCELLENT: 10%";
                    break;
                case "11":
                    $scope.salary.percent = 15;
                    $scope.textPercent = "E - EXCELLENT: 15%";
                    break;
                case "9":
                    $scope.salary.percent = 10;
                    $scope.textPercent = "E - EXCELLENT: 10% - 15%";
                    break;
                case "12":
                    $scope.salary.percent = 10;
                    $scope.textPercent = "E - EXCELLENT: 10% - 15%";
                    break;
                default:
                    $scope.salary.percent = 10;
                    if ($scope.salary.work_time_month >= 12) {
                        $scope.textPercent = "E - EXCELLENT: 10% - 20%";
                    } else {
                        $scope.textPercent = "E - EXCELLENT: 10% - 15%";
                    }
            }
        };
        if (!$scope.salary.percent) {
            $scope.salary.percent = '';
        }
    }

    $scope.closeTable = (idText) => {
        $scope.table_active = '';
        $(idText).slideToggle(300);
    }

    $scope.load_point_work = () => {
        $scope.loadingPoint = true;

        $http.get(base_url + 'staffs/ajax_get_diligence_user?filter=' + JSON.stringify($scope.salary)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.pointWork = [];
                $scope.totalPoint = 0;

                $scope.loadingPoint = false;
                $scope.pointWork = r.data.data;
                $scope.pointWork.forEach(e => {
                    $scope.totalPoint += Number(e.diligence);
                });
            } else {
                toastr["error"]("Tính điểm chuyên cần đang có lỗi xẩy ra! Vui lòng thử lại sau.");
            }
        })
    }

    $scope.changemonthStart = (type) => {
        if ($scope.salary.year_start == $scope.salary.year_end) {
            $scope.salary.month_end = $scope.salary.month_start;
            $scope.month_end = $scope.month_start.filter(element => {
                return element >= $scope.salary.month_start;
            });
        } else $scope.month_end = $scope.month_start;

        if ($scope.salary.year_start > $scope.salary.year_end) {
            $scope.salary.year_end = $scope.salary.year_start;
        }

        $scope.year_ends = $scope.year.filter(element => {
            return element >= $scope.salary.year_start;
        });

        select2();
    }

    $scope.formatMoney = (amount, decimalCount = 0, decimal = ".", thousands = ",") => {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : " đ");
        } catch (e) {
            console.log(e)
        }
    };

    $scope.get_point = (d) => {
        let point = $scope.pointWork.find(r => { return r.month == d });
        return point ? point.diligence : 0;
    }

    $scope.get_year = () => {
        $scope.year = [];
        for (var i = 5; i > 0; i--) {
            $scope.year.push($scope.year_current--);
        }
    }

    $scope.doNext = (val) => {
        $scope.errorUser = $scope.salary.user_id ? 0 : 1;
        if (!$scope.salary.user_id) return false;

        if ($scope.salary.user_id) {
            if (val == 2) {
                $scope.errorType = $scope.salary.type ? 0 : 1;
                if (!$scope.salary.type) {
                    $scope.checkExistRequestSalary = 0;
                    return false
                };

                if ($scope.salary.type == 2) {
                    $scope.salary.salary_new = 0;
                }

                if ($scope.salary.point > 20) {
                    toastr["error"]("Điểm không vượt 20!");
                    return false;
                }

                if ($scope.salary.salary_old && $scope.salary.salary_old.length > 0 && $scope.salary.percent != 0) {
                    let salary_old = parseInt($scope.salary.salary_old.replaceAll(',', ''));
                    $scope.salary.salary_new = salary_old + ((salary_old * parseInt($scope.salary.percent)) / 100);
                    $scope.salary.salary_new = $scope.salary.salary_new ? $scope.numberWithCommas($scope.salary.salary_new) : 0;
                }

                if (!$scope.salary.id) {
                    $scope.salary.date_start = '';
                }

                if ($scope.salary.id && $scope.type_update != $scope.salary.type) {
                    $scope.salary.date_start = '';
                }
            }
            $scope.isStep = val;
        }
    }

    $scope.addSalary = () => {
        if ($scope.checkExistRequestSalary == 1) {
            toastr["error"]("Đã có tồn tại 1 đề xuất chưa hoàn thành!");
            return false;
        }

        $scope.errorSendAdmin = $scope.salary.send_admin_id ? 0 : 1;
        if (!$scope.salary.send_admin_id) return false;

        $scope.errorUser = $scope.salary.user_id ? 0 : 1;
        if (!$scope.salary.user_id) return false;

        if ($scope.salary.type == 3 || $scope.salary.type == 4) {
            $scope.errorPositionNew = $scope.salary.position_new ? 0 : 1;
            if (!$scope.salary.position_new) return false;

            $scope.errorLevelIdNew = $scope.salary.level_id_new ? 0 : 1;
            if (!$scope.salary.level_id_new) return false;
        }

        if ($scope.salary.type != 2 && $scope.salary.type != 6) {
            $scope.errorSalaryOld = $scope.salary.salary_old ? 0 : 1;
            if (!$scope.salary.salary_old) return false;
        }

        if ($scope.salary.type == 1) {
            $scope.errorSalaryNew = $scope.salary.salary_new ? 0 : 1;
            if (!$scope.salary.salary_new) return false;

            if ($scope.salary.salary_new == 0) {
                toastr["error"]("Mức lương mới phải khác 0!");
                return false;
            }
        }

        if ($scope.salary.type == 2) {
            $scope.salary.salary_new = 0;
        }

        $scope.errorSubsidyNew = String($scope.salary.subsidy_new) ? 0 : 1;
        if (!String($scope.salary.subsidy_new)) return false;

        // error chi nhánh
        if ($scope.salary.type == 5) {
            $scope.errorStore = $scope.salary.store_id ? 0 : 1;
            if (!$scope.salary.store_id) return false;

            $scope.errorStoreNew = $scope.salary.store_new_id ? 0 : 1;
            if (!$scope.salary.store_new_id) {
                $scope.errorTextStoreNew = 'Vui lòng chọn chi nhánh mới';
                return false;
            }

            if ($scope.salary.store_id == $scope.salary.store_new_id) {
                $scope.errorStoreNew = 1;
                $scope.errorTextStoreNew = 'Chi nhánh mới không được trùng chi nhánh cũ';
                return false;
            }
        }

        if ($scope.salary.type == 6) { // tạo phiếu để xuất level
            $scope.errorLevelIdNew = $scope.salary.level_id_new ? 0 : 1;
            if (!$scope.salary.level_id_new) return false;

            $scope.salary.salary_new = 0;
            $scope.salary.subsidy_new = 0;
            $scope.salary.position_new = '';
            $scope.salary.store_new_id = 0;
        }

        $scope.errorDateStart = $scope.salary.date_start ? 0 : 1;
        if (!$scope.salary.date_start) return false;


        $scope.errorNote = $scope.salary.note ? 0 : 1;
        if (!$scope.salary.note) return false;

        if ($scope.chooseRange == 2 && (!$scope.salary.each_month || $scope.salary.each_month.length == 0)) {
            toastr["error"]("Vui lòng chọn khoảng thời gian!");
            return false;
        }

        if ($scope.current_id == $scope.salary.send_admin_id) { // nếu người duyệt là chính mình thì tự gửi đến phòng nhân sự
            $scope.salary.chooseSendToUser = 1;
        } else {
            $scope.salary.chooseSendToUser = 0;
        }

        $scope.loadSubmit = true;
        $scope.salary.approx_start = $scope.salary.month_start + '/' + $scope.salary.year_start;
        $scope.salary.approx_end = $scope.salary.month_end + '/' + $scope.salary.year_end;
        $scope.salary.chooseRange = $scope.chooseRange;
        $http.post(base_url + '/request_salaries/ajax_create_salary', $scope.salary).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", "Tạo đề xuất tăng lương thành công!", "success");
                $('#modalSalary').modal('hide');
                $scope.getSalaries();
            } else swal("Thông báo", "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            $scope.loadSubmit = false;
        });
    }

    $scope.showModalEditSalary = (item) => {
        $scope.showHistory = 1;
        $scope.isStep = 2;
        $scope.isAction = 'EDIT';
        $scope.type_edit = item.type;
        $scope.each_month = [];
        $scope.year.forEach(function (y, k) {
            if (k == 0) {
                for (i = $scope.month_current; i > 0; i--) {
                    $scope.each_month.push(i + "/" + y);
                }
            } else {
                for (i = 12; i > 0; i--) {
                    $scope.each_month.push(i + "/" + y);
                }
            }
        });
        $scope.type_update = item.type;
        $scope.salary = angular.copy(item);
        $scope.salary.user_handle.forEach(function (y, k) {
            if (y.type == 1 && y.stt == 1) {
                $scope.salary.send_admin_id = y.usu_user_id;
            }
        });
        $scope.salary.salary_old = $scope.salary.salary_old ? $scope.numberWithCommas($scope.salary.salary_old) : 0;
        $scope.salary.salary_new = $scope.salary.salary_new ? $scope.numberWithCommas($scope.salary.salary_new) : 0;
        $scope.salary.subsidy_old = $scope.salary.subsidy_old ? $scope.numberWithCommas($scope.salary.subsidy_old) : 0;
        $scope.salary.subsidy_new = $scope.salary.subsidy_new ? $scope.numberWithCommas($scope.salary.subsidy_new) : 0;


        if ($scope.month_current == 6) {
            $scope.salary.month_start = 1 + "";
            $scope.salary.year_start = (moment().year() - 1) + "";
        } else if ($scope.month_current > 6) {
            $scope.salary.month_start = ($scope.month_current - 5) + "";
            $scope.salary.year_start = moment().year() + "";
        } else {
            $scope.salary.month_start = (12 + ($scope.month_current - 5)) + "";
            $scope.salary.year_start = (moment().year() - 1) + "";
        }

        $scope.salary.month_end = $scope.month_current;
        $scope.salary.year_end = moment().year() + "";


        if ($scope.salary.approx_start) {
            let approx_start = $scope.salary.approx_start.split("/");
            let approx_end = $scope.salary.approx_end.split("/");
            $scope.salary.month_start = approx_start[0];
            $scope.salary.month_end = approx_end[0];
            $scope.salary.year_start = approx_start[1];
            $scope.salary.year_end = approx_end[1];
            $scope.chooseRange = 1;
        } else {
            $scope.salary.each_month = JSON.parse($scope.salary.each_month);
            $scope.chooseRange = 2;
            setTimeout(() => {
                select2();
            }, 100);
        }

        $scope.changeSelectedUser();
        $scope.getReportSalaryUser();
        $scope.changemonthStart();
        $scope.getTarget();

        $http.get(base_url + '/request_salaries/ajax_get_decision_salary_old?id=' + $scope.salary.id_decision_salary).then(r => {
            $scope.salary.date_start_old = r.data.date_start_old ? r.data.date_start_old : "";
            $scope.salary.decision_code = r.data.decision_code ? r.data.decision_code : "";
        });

        $http.get(base_url + '/request_salaries/ajax_get_decision_subsidy_old?id=' + $scope.salary.id_decision_subsidy).then(r => {
            $scope.salary.date_start_subsidy = r.data.date_start_subsidy ? r.data.date_start_subsidy : "";
        });

        $scope.get_list_user_permission_approve($scope.salary.user_id, $scope.salary.group_id);

        // $scope.get_list_user_request();

        $('#modalSalary').modal('show');
        $scope.table_active = '';
        $scope.checkExistRequestSalary = 0;
        $scope.errorUser = 0;
        $scope.errorType = 0;
        $scope.errorSendAdmin = 0;
        $scope.errorPositionNew = 0;
        $scope.errorSalaryOld = 0;
        $scope.errorSalaryNew = 0;
        $scope.errorSubsidyNew = 0;
        $scope.errorDateStart = 0;
        $scope.errorNote = 0;
        select2();
    }

    $scope.editSalary = () => {
        if ($scope.checkExistRequestSalary == 1) {
            toastr["error"]("Đã có tồn tại 1 đề xuất chưa hoàn thành!");
            return false;
        }

        $scope.errorSendAdmin = $scope.salary.send_admin_id ? 0 : 1;
        if (!$scope.salary.send_admin_id) return false;

        if ($scope.salary.type == 3 || $scope.salary.type == 4) {
            $scope.errorPositionNew = $scope.salary.position_new ? 0 : 1;
            if (!$scope.salary.position_new) return false;
        }

        if ($scope.salary.type == 1) {
            $scope.errorSalaryOld = $scope.salary.salary_old ? 0 : 1;
            if (!$scope.salary.salary_old) return false;

            $scope.errorSalaryNew = $scope.salary.salary_new ? 0 : 1;
            if (!$scope.salary.salary_new) return false;

            if ($scope.salary.salary_new == 0) {
                toastr["error"]("Mức lương mới phải khác 0!");
                return false;
            }
        }

        if ($scope.salary.type == 2) {
            $scope.salary.salary_new = 0;
        }

        // error chi nhánh
        if ($scope.salary.type == 5) {
            $scope.errorStore = $scope.salary.store_id ? 0 : 1;
            if (!$scope.salary.store_id) return false;

            $scope.errorStoreNew = $scope.salary.store_new_id ? 0 : 1;
            if (!$scope.salary.store_new_id) {
                $scope.errorTextStoreNew = 'Vui lòng chọn chi nhánh mới';
                return false;
            }

            if ($scope.salary.store_id == $scope.salary.store_new_id) {
                $scope.errorStoreNew = 1;
                $scope.errorTextStoreNew = 'Chi nhánh mới không được trùng chi nhánh cũ';
                return false;
            }
        }

        if ($scope.salary.type == 6) { // tạo phiếu để xuất level
            $scope.errorLevelIdNew = ($scope.salary.level_id_new && $scope.salary.level_id_new != '0') ? 0 : 1;
            if (!$scope.salary.level_id_new || $scope.salary.level_id_new == '0') return false;

            $scope.salary.salary_new = 0;
            $scope.salary.subsidy_new = 0;
            $scope.salary.position_new = '';
            $scope.salary.store_new_id = 0;
        }

        $scope.errorDateStart = $scope.salary.date_start ? 0 : 1;
        if (!$scope.salary.date_start) return false;

        $scope.errorNote = $scope.salary.note ? 0 : 1;
        if (!$scope.salary.note) return false;

        $scope.loadSubmit = true;
        $scope.salary.approx_start = $scope.salary.month_start + '/' + $scope.salary.year_start;
        $scope.salary.approx_end = $scope.salary.month_end + '/' + $scope.salary.year_end;
        $scope.salary.chooseRange = $scope.chooseRange;

        if ($scope.chooseRange == 2 && (!$scope.salary.each_month || $scope.salary.each_month.length == 0)) {
            toastr["error"]("Vui lòng chọn khoảng thời gian!");
            return false;
        }

        $http.post(base_url + '/request_salaries/ajax_update_salary', $scope.salary).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", "Cập nhật thành công!", "success");
                $('#modalSalary').modal('hide');
                $scope.getSalaries();
            } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            $scope.loadSubmit = false;
        });
    }

    $scope.selectTypeUpdateDev = () => {
        $scope.loadSubmit = true;
        $http.get(base_url + '/request_salaries/ajax_get_salary_user?id=' + $scope.salary.user_id).then(r => {
            if (r.data && r.data.status == 1) {
                if ($scope.salary.type == 5) {
                    $scope.salary.store_id = r.data.main_store_id;
                }

                if ($scope.salary.type == 3 || $scope.salary.type == 4) {
                    $scope.salary.position = r.data.position;
                }
                select2();
            }
        });

        $scope.checkExitRequest();
    }

    $scope.loadLevel = () => {
        $http.get(base_url + '/admin_users/ajax_get_level_users').then(r => {
            if (r.data.status == 1) {
                $scope.levels = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.checkExitRequest = () => {
        $http.get(base_url + '/request_salaries/ajax_get_check_exit_request?user_id=' + $scope.salary.user_id + '&type=' + $scope.salary.type + '&type_current=' + $scope.typeUpdateDev).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.request_salary_update = r.data.data;
                if ($scope.request_salary_update) {
                    $scope.checkExistRequestUpdate = 1;
                    $scope.errorType = 0;
                    $scope.request_update_link = "request_salaries/salary_detail/" + $scope.request_salary_update.id;
                } else {
                    $scope.checkExistRequestUpdate = 0;
                    $scope.request_update_link = "#";
                }
                $scope.loadSubmit = false;
            }
        });
    }

    $scope.showModalEditSalaryDev = (item) => {
        $scope.typeUpdateDev = angular.copy(item.type);
        $scope.checkExistRequestUpdate = 0;
        $scope.request_update_link = "#";

        $scope.showHistory = 1;
        $scope.isStep = 2;
        $scope.isAction = 'EDIT';
        $scope.type_edit = item.type;
        $scope.each_month = [];
        $scope.year.forEach(function (y, k) {
            if (k == 0) {
                for (i = $scope.month_current; i > 0; i--) {
                    $scope.each_month.push(i + "/" + y);
                }
            } else {
                for (i = 12; i > 0; i--) {
                    $scope.each_month.push(i + "/" + y);
                }
            }
        });
        $scope.salary = angular.copy(item);
        $scope.salary.user_handle.forEach(function (y, k) {
            if (y.type == 1 && y.stt == 1) {
                $scope.salary.send_admin_id = y.usu_user_id;
            }
        });
        $scope.salary.salary_old = $scope.salary.salary_old ? $scope.numberWithCommas($scope.salary.salary_old) : 0;
        $scope.salary.salary_new = $scope.salary.salary_new ? $scope.numberWithCommas($scope.salary.salary_new) : 0;
        $scope.salary.subsidy_old = $scope.salary.subsidy_old ? $scope.numberWithCommas($scope.salary.subsidy_old) : 0;
        $scope.salary.subsidy_new = $scope.salary.subsidy_new ? $scope.numberWithCommas($scope.salary.subsidy_new) : 0;


        if ($scope.month_current == 6) {
            $scope.salary.month_start = 1 + "";
            $scope.salary.year_start = (moment().year() - 1) + "";
        } else if ($scope.month_current > 6) {
            $scope.salary.month_start = ($scope.month_current - 5) + "";
            $scope.salary.year_start = moment().year() + "";
        } else {
            $scope.salary.month_start = (12 + ($scope.month_current - 5)) + "";
            $scope.salary.year_start = (moment().year() - 1) + "";
        }

        $scope.salary.month_end = $scope.month_current;
        $scope.salary.year_end = moment().year() + "";


        if ($scope.salary.approx_start) {
            let approx_start = $scope.salary.approx_start.split("/");
            let approx_end = $scope.salary.approx_end.split("/");
            $scope.salary.month_start = approx_start[0];
            $scope.salary.month_end = approx_end[0];
            $scope.salary.year_start = approx_start[1];
            $scope.salary.year_end = approx_end[1];
            $scope.chooseRange = 1;
        } else {
            $scope.salary.each_month = JSON.parse($scope.salary.each_month);
            $scope.chooseRange = 2;
            setTimeout(() => {
                select2();
            }, 100);
        }

        $scope.get_list_user_permission_approve($scope.salary.user_id, $scope.salary.group_id);

        $scope.changeSelectedUser();
        $scope.getReportSalaryUser();

        $scope.month_end = $scope.month_start.filter(element => {
            return element >= $scope.salary.month_start;
        });

        $scope.year_ends = $scope.year.filter(element => {
            return element >= $scope.salary.year_start;
        });

        $scope.getTarget();

        $http.get(base_url + '/request_salaries/ajax_get_decision_salary_old?id=' + $scope.salary.id_decision_salary).then(r => {
            $scope.salary.date_start_old = r.data.date_start_old ? r.data.date_start_old : "";
            $scope.salary.decision_code = r.data.decision_code ? r.data.decision_code : "";
        });

        $http.get(base_url + '/request_salaries/ajax_get_decision_subsidy_old?id=' + $scope.salary.id_decision_subsidy).then(r => {
            $scope.salary.date_start_subsidy = r.data.date_start_subsidy ? r.data.date_start_subsidy : "";
        });

        $('#modalSalaryDev').modal('show');
        $scope.table_active = '';
        $scope.checkExistRequestSalary = 0;
        $scope.errorUser = 0;
        $scope.errorType = 0;
        $scope.errorSendAdmin = 0;
        $scope.errorPositionNew = 0;
        $scope.errorSalaryOld = 0;
        $scope.errorSalaryNew = 0;
        $scope.errorSubsidyNew = 0;
        $scope.errorDateStart = 0;
        $scope.errorNote = 0;
        select2();
    }

    $scope.showModalCancelSalaryDev = (item) => {
        $scope.request_type = item.type;
        $scope.request_id = item.id;
        $scope.request_user_id = item.user_id;
        $scope.note_cancel = '';
        $('#modalCancelRequest').modal('show');
    }

    $scope.cancelRequest = () => {
        $scope.errorNoteCancel = $scope.note_cancel ? 0 : 1;
        if (!$scope.note_cancel) return false;

        var data = {
            request_type: $scope.request_type,
            request_id: $scope.request_id,
            user_id: $scope.request_user_id,
            note: $scope.note_cancel
        }

        swal({
            title: "Thông báo?",
            text: "Bạn có chắc muốn thực hiện hành động này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + '/request_salaries/ajax_cancel_request/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    $('#modalCancelRequest').modal('hide');
                    swal("Thông báo", r.data.message, "success");
                    $scope.getSalaries();
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
            });
        });
    }

    $scope.showModalUpdateUserConfirm = (item) => {
        $scope.request_type = item.type;
        $scope.request_id = item.id;
        $scope.request_user_id = item.user_id;
        $scope.send_user_id = '';
        $scope.get_list_user_permission_approve(item.user_id, item.group_id);
        select2();
        $('#modalUpdateUserConfirm').modal('show');
    }
    
    $scope.updateUserConfirm = () => {
        $scope.errorSendUserId = $scope.send_user_id ? 0 : 1;
        if (!$scope.send_user_id) return false;

        var data = {
            request_id: $scope.request_id,
            send_user_id: $scope.send_user_id,
            request_type: $scope.request_type,
            request_user_id: $scope.request_user_id,
        }

        swal({
            title: "Thông báo?",
            text: "Bạn có chắc muốn thực hiện hành động này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + '/request_salaries/ajax_update_user_confirm/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    $('#modalUpdateUserConfirm').modal('hide');
                    swal("Thông báo", r.data.message, "success");
                    $scope.getSalaries();
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
            });
        });
    }

    $scope.showModalCanelUserCreate = (item) => {
        $scope.idCancel = item.id;
        $scope.noteCancel = '';
        $scope.errorCancelNote = 0;
        $('#modalCancelUserCreate').modal('show');
    }

    $scope.cancelUserCreate = () => { // Huỷ đề xuất của người tạo
        $scope.errorCancelNote = $scope.noteCancel ? 0 : 1;
        if (!$scope.noteCancel) return false;

        var data = {
            salary_id: $scope.idCancel,
            note: $scope.noteCancel
        }

        swal({
            title: "Thông báo?",
            text: "Bạn có chắc muốn thực hiện hành động này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            $http.post(base_url + 'request_salaries/ajax_cancel_user_create/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $('#modalCancelUserCreate').modal('hide');
                    $scope.getSalaries();
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
            });
        });
    }

    $scope.editSalaryDev = () => {
        if ($scope.checkExistRequestUpdate == 1) {
            toastr["error"]("Đã có tồn tại 1 đề xuất chưa hoàn thành!");
            return false;
        }

        if ($scope.salary.type == 3 || $scope.salary.type == 4) {
            $scope.errorPositionNew = $scope.salary.position_new ? 0 : 1;
            if (!$scope.salary.position_new) return false;
        }

        if ($scope.salary.type == 1) {
            $scope.errorSalaryOld = $scope.salary.salary_old ? 0 : 1;
            if (!$scope.salary.salary_old) return false;

            $scope.errorSalaryNew = $scope.salary.salary_new ? 0 : 1;
            if (!$scope.salary.salary_new) return false;

            if ($scope.salary.salary_new == 0) {
                toastr["error"]("Mức lương mới phải khác 0!");
                return false;
            }

            $scope.salary.position = '';
            $scope.salary.position_new = '';
        }

        if ($scope.salary.type == 2) {
            $scope.salary.salary_new = 0;
        }

        if ($scope.salary.type == 5) {
            $scope.salary.position = '';
            $scope.salary.position_new = '';

            $scope.errorStore = $scope.salary.store_id ? 0 : 1;
            if (!$scope.salary.store_id) return false;

            $scope.errorStoreNew = $scope.salary.store_new_id ? 0 : 1;
            if (!$scope.salary.store_new_id) {
                $scope.errorTextStoreNew = 'Vui lòng chọn chi nhánh mới';
                return false;
            }

            if ($scope.salary.store_id == $scope.salary.store_new_id) {
                $scope.errorStoreNew = 1;
                $scope.errorTextStoreNew = 'Chi nhánh mới không được trùng chi nhánh cũ';
                return false;
            }
        } else {
            $scope.salary.store_id = 0;
            $scope.salary.store_new_id = 0;
        }

        $scope.errorDateStart = $scope.salary.date_start ? 0 : 1;
        if (!$scope.salary.date_start) return false;

        $scope.errorNote = $scope.salary.note ? 0 : 1;
        if (!$scope.salary.note) return false;

        if ($scope.salary.type == 6) { // tạo phiếu để xuất level
            $scope.errorLevelIdNew = ($scope.salary.level_id_new && $scope.salary.level_id_new != '0') ? 0 : 1;
            if (!$scope.salary.level_id_new || $scope.salary.level_id_new == '0') return false;

            $scope.salary.salary_new = 0;
            $scope.salary.subsidy_new = 0;
            $scope.salary.position_new = '';
            $scope.salary.store_new_id = 0;
        }

        $scope.loadSubmit = true;
        $scope.salary.approx_start = $scope.salary.month_start + '/' + $scope.salary.year_start;
        $scope.salary.approx_end = $scope.salary.month_end + '/' + $scope.salary.year_end;
        $scope.salary.chooseRange = $scope.chooseRange;

        if ($scope.chooseRange == 2 && (!$scope.salary.each_month || $scope.salary.each_month.length == 0)) {
            toastr["error"]("Vui lòng chọn khoảng thời gian!");
            return false;
        }

        $http.post(base_url + '/request_salaries/ajax_update_salary_dev', $scope.salary).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", "Cập nhật thành công!", "success");
                $('#modalSalaryDev').modal('hide');
                $scope.getSalaries();
            } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            $scope.loadSubmit = false;
        });
    }

    $scope.showEvaluationDetail = (id, user_id) => {
        $http.get(base_url + '/admin_users/ajax_get_all_criteria?log_id=' + id + '&user_id=' + user_id).then(r => {
            if (r.data.status == 1) {
                $scope.history_evaluation = 0;
                $scope.criteries = r.data.data;
                $scope.list_manage_reviews = r.data.list_manage_reviews;
                $scope.manage_date = r.data.manage_date;
                $scope.list_user_reviews = r.data.list_user_reviews;
                $scope.user_date = r.data.user_date;
                $scope.user_evaluation = r.data.user_evaluation;

                for (var i = 0; i < $scope.criteries.length; i++) {
                    for (var j = 0; j < $scope.list_manage_reviews.length; j++) {
                        if ($scope.criteries[i].id == $scope.list_manage_reviews[j].id) {
                            $scope.criteries[i].selected_magnage = $scope.list_manage_reviews[j].selected;
                            $scope.criteries[i].note = $scope.list_manage_reviews[j].note;
                        }
                    }

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

                $scope.totalCheckedManage = 0;
                for (var i = 0; i < $scope.list_manage_reviews.length; i++) {
                    if ($scope.list_manage_reviews[i].selected == true) {
                        $scope.totalCheckedManage += 1;
                    }
                }
                $('#modalHisroryEvaluation').modal('show');
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.showModalCancelSalary = (cancel_id) => {
        $scope.cancel_note = '';
        $scope.cancel_id = cancel_id;
        $('#modalCancelSalary').modal('show');
    }

    $scope.handleCancelSalary = (id) => {
        if (!$scope.cancel_note) {
            toastr["error"]("Vui lòng nhập lý do!");
            return false;
        }

        var data = {
            id: $scope.cancel_id,
            note: $scope.cancel_note,
            current_id: $scope.current_id,
            status: 5
        }
        $http.post(base_url + '/request_salaries/ajax_handle_user_salary/', data).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", r.data.message, "success");
                $('#modalCancelSalary').modal('hide');
                $scope.getSalaries();
            } else {
                swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            }
        });
    }

    $scope.changeSelectedUser = () => {
        $scope.salary.percent = '';
        $scope.textSalary = 1;
        if ($scope.isStep == 1) {
            $scope.salaryUser();
        }
        
        $scope.getReportSalaryUser();
        if ($scope.salary.type && $scope.isAction != 'EDIT') {
            $scope.changeTypeRequestSalary();
        }
    }

    $scope.changeTypeRequestSalary = () => {
        if ($scope.isAction != "EDIT" || ($scope.isAction == "EDIT" && $scope.type_edit != $scope.salary.type)) {
            $http.get(base_url + '/request_salaries/ajax_get_validate_request_salary?user_id=' + $scope.salary.user_id + '&type=' + $scope.salary.type).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.request_salary = r.data.data;
                    if ($scope.request_salary) {
                        $scope.checkExistRequestSalary = 1;
                        $scope.errorType = 0;
                        $scope.request_salary_link = "request_salaries/salary_detail/" + $scope.request_salary.id;
                    } else {
                        $scope.checkExistRequestSalary = 0;
                        $scope.request_salary_link = "#";
                    }
                }
            });
        }

        if ($scope.isAction == "EDIT" && $scope.type_edit == $scope.salary.type) {
            $scope.checkExistRequestSalary = 0;
        }

        if ($scope.salary.type == 5) {
            $http.get(base_url + '/request_salaries/ajax_get_salary_user?id=' + $scope.salary.user_id).then(r => {
                if (r.data.status == 1) {
                    $scope.salary.store_id = r.data.main_store_id;
                    select2();
                }
            });
        }
    }

    $scope.salaryUser = () => {
        $http.get(base_url + '/request_salaries/ajax_get_salary_user?id=' + $scope.salary.user_id).then(r => {
            if (r.data.status == 1) {
                $scope.salary.date_start_old = r.data.date_start_old ? r.data.date_start_old : "";
                $scope.salary.date_start_subsidy = r.data.date_start_subsidy ? r.data.date_start_subsidy : "";
                $scope.salary.salary_old = r.data.salary ? $scope.numberWithCommas(r.data.salary) : 0;
                $scope.salary.salary_new = r.data.salary ? $scope.numberWithCommas(r.data.salary) : 0;
                $scope.salary.subsidy_old = r.data.subsidy ? $scope.numberWithCommas(r.data.subsidy) : 0;
                $scope.salary.subsidy_new = r.data.subsidy ? $scope.numberWithCommas(r.data.subsidy) : 0;
                $scope.salary.position = r.data.position;
                $scope.salary.level_id = r.data.level_id_new;
                $scope.salary.date_start_level_old = r.data.date_start_level_new;
                $scope.salary.id_decision_level = r.data.id_decision_level;
                $scope.salary.group_id = r.data.group_id;
                $scope.salary.store_id = r.data.main_store_id;
                $scope.salary.work_time = r.data.work_time;
                $scope.salary.work_time_month = r.data.work_time_month;
                $scope.salary.user_status_log = r.data.user_status_log;
                if (r.data.salary_decision_id) {
                    $scope.salary.id_decision_salary = r.data.salary_decision_id;
                    $scope.salary.decision_code = r.data.decision_code;
                } else {
                    $scope.salary.id_decision_salary = "";
                    $scope.salary.decision_code = '';
                }
                if (r.data.subsidy_decision_id) {
                    $scope.salary.id_decision_subsidy = r.data.subsidy_decision_id;
                } else {
                    $scope.salary.id_decision_subsidy = "";
                }
                $scope.salary.company_id = r.data.company_id;
                $scope.salary.main_store_id = r.data.main_store_id;

                $scope.get_list_user_permission_approve($scope.salary.user_id, $scope.salary.group_id);
            } else {
                $scope.salary.date_start_old = "";
                $scope.salary.salary_old = 0;
                $scope.salary.subsidy_old = 0;
                $scope.salary.subsidy_new = 0;
                $scope.salary.group_name = "";
                $scope.salary.group_id = "";
                $scope.salary.work_time = '';
                $scope.salary.work_time_month = '';
                $scope.salary.decision_code = '';
                $scope.salary.salary_new = 0;
                $scope.salary.user_status_log = 0;
                $scope.salary.company_id = 0;
                $scope.salary.main_store_id = 0;
            }
            $scope.salary.date_start = '';
        });

        select2();
    }

    $scope.checkInputPrint = (item) => {
        if (item.isCheck == 1) {
            $scope.arrCheckSalary.push(item.id);
        } else {
            $scope.arrCheckSalary = $scope.arrCheckSalary.filter(e => String(e) !== String(item.id));
        }
    }

    $scope.getAllPosition = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_positions').then(r => {
            if (r.data.status == 1) {
                $scope.currentPositions = r.data.data;
                $scope.newPositions = r.data.data;
            }
        });
    }

    $scope.showModalSyntheticRequestSalary = () => {
        $('#syntheticRequestSalary').modal('show');
    }

    $scope.exportSyntheticRequestSalary = () => {
        if ($scope.date_synthetic == '') {
            toastr["error"]("Vui lòng chọn tháng để tổng hợp!");
            return;
        } else {
            $scope.filter = {};
            $scope.filter.date_synthetic = $scope.date_synthetic;
            $http.post(base_url + '/request_salaries/ajax_get_ls_salary?filter=' + JSON.stringify($scope.filter)).then(r => {
                $scope.rows = r.data.data;
                $scope.showExportSynthetic = 1;
                $('.dt-toolbar-footer').css('display', 'none');
                $('#syntheticRequestSalary').modal('hide');
            })
        }
    }

    // Tổng hợp đề xuất
    $scope.exportListSyntheticRequestSalary = () => {
        if ($scope.rows.length == 0) {
            swal("Thông báo", "Hiện tại chưa có đề xuất nào!", "warning");
            return;
        }

        if ($scope.arrCheckSalary.length == 0) {
            swal("Thông báo", "Vui lòng chọn đề xuất!", "warning");
            return;
        }

        swal({
            title: "Thông báo?",
            text: "Bạn có chất muốn tổng hợp những đề xuất này!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.get(base_url + '/request_salaries/ajax_update_synthetic_request_salaries?ids=' + JSON.stringify($scope.arrCheckSalary) + '&date_synthetic=' + $scope.date_synthetic).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", "Tổng hợp thành công", "success");
                    window.open(base_url + '/request_salaries/synthetic_request_salary');
                } else swal("Thông báo", r.data && r.data.status != 1 ? "Tổng hợp thất bại!" : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            });
        });
    }

    $scope.format_date = (date, type) => {
        return date ? moment(date).format(type) : '';
    }

    $scope.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    $scope.converHtml = (index, htmlbd, obligatory) => {
        $span = '';
        if (obligatory == 1) {
            $span = '<span class="obligatory"> (*)</span>';
        }
        return $sce.trustAsHtml(index + '. ' + htmlbd + $span);
    }

    $scope.numberWithCommas = (x) => {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    }

    $scope.unset = (id) => {
        $scope.filter.date = undefined;
        $scope.filter.from = undefined;
        $scope.filter.to = undefined;
        $scope.select2();
    }

    $scope.unsetDateStart = () => {
        $scope.filter.date_start = undefined;
        $scope.filter.from_date_start = undefined;
        $scope.filter.to_date_start = undefined;
    }

    $scope.copyToClipboard = (id) => {
        copyToClipboard(document.getElementById(id));
    }

    function copyToClipboard(elem) {
        // create hidden text element, if it doesn't already exist
        var targetId = "_hiddenCopyText_";
        var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
        var origSelectionStart, origSelectionEnd;
        if (isInput) {
            // can just use the original source element for the selection and copy
            target = elem;
            origSelectionStart = elem.selectionStart;
            origSelectionEnd = elem.selectionEnd;
        } else {
            // must use a temporary form element for the selection and copy
            target = document.getElementById(targetId);
            if (!target) {
                var target = document.createElement("textarea");
                target.style.position = "fixed";
                // target.style.position = "absolute";
                // target.style.left = "-9999px";
                // target.style.top = "0";
                target.id = targetId;
                document.body.appendChild(target);
            }
            target.textContent = elem.textContent;
        }
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);

        // copy the selection
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch (e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }

        if (isInput) {
            // restore prior selection
            elem.setSelectionRange(origSelectionStart, origSelectionEnd);
        } else {
            // clear temporary content
            target.textContent = "";
        }
        return succeed;
    }

    $scope.activeChangeRequestSalary = (id) => {
        swal({
            title: "Thông báo?",
            text: "Bạn có chắc muốn mở khóa đề xuất này không!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + '/request_salaries/ajax_change_active_request_salary?id=' + id).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $scope.getSalaries();
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            });
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
        $scope.getSalaries(true);
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
