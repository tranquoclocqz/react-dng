setTimeout(() => {
    $('#SyntheticSalaries').css('display', 'block');
    $("body").addClass("sidebar-collapse");
}, 500);

app.controller('SyntheticSalariesCtrl', function ($scope, $http, $sce, $window) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.load = true;
        $scope.isAll = 0;
        $scope.arrCheckSalary = [];
        $scope.arrDateSynthetic = arrDateSynthetic;
        $scope.arrRankSynthetic = arrRankSynthetic;
        $scope.current_user_id = current_user_id;
        $scope.is_hr = is_hr;
        $scope.is_dev = is_dev;
        $scope.all_store = all_store;
        $scope.all_groups = all_groups;
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        if ($scope.arrDateSynthetic.length > 0) {
            $scope.filter.date_synthetic = $scope.arrDateSynthetic[0];
        }
        if ($scope.arrRankSynthetic.length > 0) {
            $scope.filter.rank_synthetic = $scope.arrRankSynthetic[0];
        }

        $scope.month = month;
        $scope.rank = rank;
        if ($scope.month != 0 && $scope.rank != 0) {
            $scope.filter.date_synthetic = $scope.month;
            $scope.filter.rank_synthetic = $scope.rank.toString();
        }

        $scope.getSalaries();
        $scope.getAllPosition();
        $scope.loadLevel();
        setTimeout(() => {
            select2();
        }, 100);
        $scope.disableConfirm = 0;
        $scope.isConfirmAll = 0;
    }

    $scope.getAllPosition = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_positions').then(r => {
            if (r.data.status == 1) {
                $scope.positions = r.data.data;
            }
        });
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

    $scope.getAll = () => {
        $scope.filter.type = '';
        $scope.filter.store = '';
        $scope.filter.group = '';
        $scope.filter.position = '';
        $scope.filter.level_id = '';
        $scope.filter.manager_confirm = '';
        $scope.getSalaries();
    }

    $scope.actionConfirmAll = (status) => {
        let text = 'Xác nhận';
        if (status == 1) {
            text += ' duyệt ';
        } else {
            text += ' từ chối ';
        }

        text += $scope.arrCheckSalary.length + " đề xuất"

        swal({
            title: "Thông báo?",
            text: text,
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + "/request_salaries/ajax_manager_confirm_all?array_id=" + JSON.stringify($scope.arrCheckSalary) + "&status=" + status).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $scope.getSalaries();
                    $scope.arrCheckSalary = [];
                    $scope.isAll = false;
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error"); 
            });
        });
    }

    $scope.filterRow = (manager_confirm) => {
        $scope.filter.manager_confirm = manager_confirm;
        $scope.arrCheckSalary = [];
        $scope.isAll = false;
        $scope.getSalaries();
    }

    $scope.getSalaries = (is_go_page = false, getAll = '') => {
        if (getAll) {
            $scope.filter.manager_confirm = '';
            $scope.arrCheckSalary = [];
            $scope.isAll = false;
        }

        if (!$scope.filter.rank_synthetic) {
            toastr["error"]("Vui lòng chọn lần tổng hợp của tháng " + $scope.filter.date_synthetic);
            return;
        } else {
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

            $scope.load = true;
            $http.post(base_url + '/request_salaries/ajax_get_synthetic_request_salary?filter=' + JSON.stringify($scope.filter)).then(r => {
                $scope.rows = r.data.data;
                $scope.salary_statistics = r.data.salary_statistics;
                $scope.array_salary_id = r.data.array_salary_id;
                $scope.load = false;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);

                if ($scope.rows.length > 0 && $scope.rows[0].manager_confirm_date != null) { // nếu TGĐ đã xác nhận rồi và sao 15 ngày thì ẩn nút xác nhận
                    const dates = [];
                    $scope.rows.forEach(e => {
                        if (e.manager_confirm_date != null) {
                            dates.push(new Date(e.manager_confirm_date));
                        }
                    });
                    const minDate = new Date(Math.min.apply(null, dates));
        
                    const date1 = new Date(formatDate(minDate));
        
                    var currentDate = new Date();
                    var month = currentDate.getMonth() + 1;
                    var day = currentDate.getDate();
                    var output = currentDate.getFullYear() + '-' +
                        (month < 10 ? '0' : '') + month + '-' +
                        (day < 10 ? '0' : '') + day;
                    const date2 = new Date(output);
                    const diffTime = Math.abs(date2 - date1);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 15) {
                        $scope.disableConfirm = 1;
                    }
                } else { // nếu TGĐ chưa duyệt đề xuất nào thì hiện nút xác nhận
                    $scope.disableConfirm = 1;
                }

                $scope.rows.forEach(function (row) {
                    if (row.manager_confirm == 0) {
                        $scope.isConfirmAll = 1;
                        return;
                    }
                });

                $scope.getTotalRequest();
                setTimeout(function () {
                    $scope.showBlock();
                }, 500);

                $scope.rows.forEach(function (row) {
                    if ($scope.arrCheckSalary.includes(row.id)) {
                        row.checkedInput = true;
                    }
                });
            });

            $scope.getRowConfirm();

            select2();
        }
    }

    $scope.getTotalRequest = () => {
        $http.post(base_url + '/request_salaries/ajax_get_total_request?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.total_request = r.data.data;
        });
    }

    $scope.getRowConfirm = () => {
        $http.post(base_url + '/request_salaries/ajax_get_synthetic_request_salary_confrim?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.total_pending        = r.data.total_pending;
            $scope.total_confirm        = r.data.total_confirm;
            $scope.total_not_confirm    = r.data.total_not_confirm;
        });
    }

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    $scope.format_date = (d, fm) => {
        return moment(d).format(fm);
    }

    $scope.showBlock = () => {
        $scope.rows.forEach(function (row) {
            var el = document.getElementsByClassName('note-' + row.id);
            if (el[0].scrollHeight > 72) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-note-' + row.id).css('display', 'block');
            }

            var el = document.getElementsByClassName('manager-confirm-note-' + row.id);
            if (el[0].scrollHeight > 72) { // nếu chiều cao lớn hơn 3 (mỗi dòng 18) dòng thì show (xem thêm)
                $('.block-event-show-manager-confirm-note-' + row.id).css('display', 'block');
            }
        });
    }

    $scope.actionConfirmManager = (item, status, key) => {
        if (status == 2 && (!item.manager_confirm_note || item.manager_confirm_note == '')) {
            $scope.errorNote = 0;

            $scope.statusValitate = 2;

            $scope.confirm = {
                key: key,
                id: item.id,
                fullname: item.fullname,
                manager_confirm_note: item.manager_confirm_note
            };

            if ($scope.current_user_id == 2) {
                $('#modalNote').modal('show');
            }

            return;
        }

        $http.post(base_url + "/request_salaries/ajax_manager_confirm_synthetic?id=" + item.id + "&status=" + status).then(r => {
            if (r.data && r.data.status == 1) {
                item.manager_confirm = status;
                $scope.getRowConfirm();
                toastr["success"](r.data.message);
            } else toastr["error"](r.data.message);
        });
    }

    $scope.showMoreNote = (id) => {
        $('.showMoreNote' + id).css('display', 'none');
        $('.note-' + id).css('-webkit-line-clamp', 'unset');
        $('.collapseNote' + id).css('display', 'block');
    }

    $scope.collapseNote = (id) => {
        $('.collapseNote' + id).css('display', 'none');
        $('.note-' + id).css('-webkit-line-clamp', '3');
        $('.showMoreNote' + id).css('display', 'block');
    }

    $scope.showMoreManagerConfirmNote = (id) => {
        $('.showMoreManagerConfirmNote' + id).css('display', 'none');
        $('.manager-confirm-note-' + id).css('-webkit-line-clamp', 'unset');
        $('.collapseManagerConfirmNote' + id).css('display', 'block');
    }

    $scope.collapseManagerConfirmNote = (id) => {
        $('.collapseManagerConfirmNote' + id).css('display', 'none');
        $('.manager-confirm-note-' + id).css('-webkit-line-clamp', '3');
        $('.showMoreManagerConfirmNote' + id).css('display', 'block');
    }

    $scope.changeFilterDateSynthetic = () => {
        $scope.filter.rank_synthetic = '';
        $http.get(base_url + '/request_salaries/ajax_get_rank_synthetic?date_synthetic=' + $scope.filter.date_synthetic).then(r => {
            $('#rankSynthetic .select2-container').addClass('loading');
            if (r.data && r.data.status == 1) {
                $scope.arrRankSynthetic = r.data.data;
                if ($scope.arrRankSynthetic.length > 0) {
                    $scope.filter.rank_synthetic = $scope.arrRankSynthetic[0];
                    select2();
                }
            }
        });
    }

    $scope.managerConfirm = () => {
        if ($scope.total_request == 0) {
            swal("Thông báo", 'Chưa có đề xuất quyết định nào trong tháng ' + $scope.filter.date_synthetic, "warning");
            return;
        }

        if ($scope.total_confirm == 0) {
            swal("Thông báo", 'Chưa có đề xuất nào được duyệt ', "warning");
            return;
        }

        swal({
            title: "Thông báo?",
            text: "Xác nhận gửi đến phòng nhân sự!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + "/request_salaries/ajax_manager_confirm_synthetic_request_salary?month=" + $scope.filter.date_synthetic + "&rank=" + $scope.filter.rank_synthetic).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            });
        });
    }

    $scope.showModalNote = (key, item) => {
        $scope.errorNote = 0;

        $scope.statusValitate = item.manager_confirm;

        $scope.confirm = {
            key: key,
            id: item.id,
            fullname: item.fullname,
            manager_confirm_note: item.manager_confirm_note
        };

        if ($scope.current_user_id == 2) {
            $('#modalNote').modal('show');
        }
    }

    $scope.saveNote = () => {
        if ($scope.statusValitate == 2 && (!$scope.confirm.manager_confirm_note || $scope.confirm.manager_confirm_note == '')) {
            $scope.errorNote = 1;
            return;
        } else {
            $scope.errorNote = 0;
        }

        $http.post(base_url + "/request_salaries/ajax_manager_confirm_synthetic_note?id=" + $scope.confirm.id + "&note=" + $scope.confirm.manager_confirm_note).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.rows[$scope.confirm.key].manager_confirm_note = $scope.confirm.manager_confirm_note;
                toastr["success"](r.data.message);
                $('#modalNote').modal('hide');

                $http.post(base_url + "/request_salaries/ajax_manager_confirm_synthetic?id=" + $scope.confirm.id + "&status=" + $scope.statusValitate).then(r => {
                    if (r.data && r.data.status == 1) {
                        $scope.rows[$scope.confirm.key].manager_confirm = $scope.statusValitate;
                        $scope.getRowConfirm();
                        toastr["success"](r.data.message);
                    } else toastr["error"](r.data.message);
                });

            } else toastr["error"](r.data.message);
        });
    }

    $scope.closeNote = () => {
        $('#modalNote').modal('hide');
    }

    $scope.exportExcelSynthetic = () => {
        var arrId = [];
        if (!$scope.filterStatus || $scope.filterStatus == 1) {
            arrId = arrayColumn($scope.rows, 'id');
        } else if ($scope.filterStatus == 2) {
            $scope.rows.forEach(e => {
                if (e.manager_confirm_date != null && e.manager_confirm == true) {
                    arrId.push(e.id);
                }
            });
        } else if ($scope.filterStatus == 3) {
            $scope.rows.forEach(e => {
                if (e.manager_confirm_date != null && e.manager_confirm == false) {
                    arrId.push(e.id);
                }
            });
        } else if ($scope.filterStatus == 4) {
            $scope.rows.forEach(e => {
                if (e.manager_confirm_date == null && e.manager_confirm == false) {
                    arrId.push(e.id);
                }
            });
        }

        if (arrId.length == 0) {
            swal("Thông báo", "Hiện tại chưa có đề xuất nào!", "error");
            return;
        }

        $http.get(base_url + '/request_salaries/ajax_export_synthetic?filter=' + JSON.stringify($scope.filter)).then(r => {
            var $a = $("<a>");
            $a.attr("href", r.data.file);
            $a.attr("download", r.data.fileName);
            $("body").append($a);
            $a[0].click();
            $a.remove();
        });
    }

    $scope.createDecisions = () => {
        if ($scope.total_confirm == 0) {
            swal("Thông báo", "Chưa có đề xuất nào được duyệt!", "warning");
            return false;
        }

        swal({
            title: "Thông báo?",
            text: "Bạn có chắc muốn tạo quyết định cho tất cả đề xuất đã duyệt!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + "/request_salaries/ajax_create_decisions?filter=" + JSON.stringify($scope.filter)).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $scope.getSalaries();
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            });
        });
    }

    $scope.sendListSyntheticToWebmaster = () => {
        swal({
            title: "Thông báo?",
            text: "Bạn có chất muốn gửi đề xuất này đến Tổng giám đốc!",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.get(base_url + '/request_salaries/ajax_send_synthetic_to_webmaster?date_synthetic=' + $scope.filter.date_synthetic + '&rank_synthetic=' + $scope.filter.rank_synthetic).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", "Gửi tổng hợp thành công", "success");
                } else swal("Thông báo", r.data && r.data.status != 1 ? "Tổng hợp thất bại!" : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            });
        });
    }

    $scope.deleteSyntheticRequestSalaryc = (id, fullname) => {
        swal({
            title: "",
            text: "Xác nhận xóa đề xuất " + fullname + " khỏi danh sách",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.get(base_url + '/request_salaries/ajax_delete_synthetic_request_salary?id=' + id).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", "Tổng hợp thành công", "success");
                    $scope.getSalaries();
                } else swal("Thông báo", r.data && r.data.status != 1 ? "Tổng hợp thất bại!" : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            });
        });
    }

    $scope.checkAll = (val) => {
        $scope.rows.forEach((e) => {
            e.checkedInput = val;
            if (val == true) {
                $scope.arrCheckSalary = $scope.array_salary_id;
            } else {
                $scope.arrCheckSalary = [];
            }
        });
    };

    $scope.checkInput = (item) => {
        if (item.checkedInput == true) {
            $scope.arrCheckSalary.push(item.id);
        } else {
            $scope.arrCheckSalary = $scope.arrCheckSalary.filter(e => String(e) !== String(item.id));
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

    function arrayColumn(array, columnName) {
        return array.map(function (value, index) {
            return value[columnName];
        })
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
});