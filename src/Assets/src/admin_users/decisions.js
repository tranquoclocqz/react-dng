app.config(function (dropzoneOpsProvider) {
    dropzoneOpsProvider.setOptions({
        url: base_url + '/admin_users/ajax_upload_image_user/',
        acceptedFiles: 'image/jpeg, images/jpg, image/png',
        dictDefaultMessage: 'Thêm chứng từ'
    });
});

app.controller('decisionCtrl', function ($scope, $http, $sce) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        $('.box1').css('opacity', '1');
        $scope.types = [];
        $scope.currentStores = [];
        $scope.newStores = [];
        $scope.currentPositions = [];
        $scope.newPositions = [];
        $scope.decision = {};
        $scope.decision.images = [];
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.ft_userId = ft_userId ? ft_userId : '';
        if ($scope.ft_userId && $scope.ft_userId > 0) {
            $scope.filter.user_id = $scope.ft_userId + '';
        }
        $scope.all_employees = all_employees;
        $scope.all_companies = all_companies;
        $scope.getUserByGroupId();
        $scope.getAll();
        $scope.getTypeDecision();
        $scope.getAllPosition();
        $scope.getAllStores();
        $scope.getAllUser();
        $scope.reportExpiredContract(); // thống kê HĐLĐ hết hạn
        setTimeout(function () {
            $scope.filter.date_start = '';
        }, 200);
        $scope.newContract = 0;
    }

    $scope.dzOptions = {
        paramName: 'file',
        maxFilesize: '10'
    };

    $scope.dzCallbacks = {
        'addedfile': function (file) {
            $scope.newFile = file;
        },
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            res.data.type = '6';
            $scope.decision.images.push(res.data);
            $('.dz-image').remove();
            $scope.getAll();
        }
    };

    $scope.getImage = (img, type) => {
        if (type) {
            return base_url + '/assets/uploads/staffs/' + img;
        }
        return base_url + '/' + img;
    }

    $scope.viewImg = (imgs) => {
        $scope.currentImageUrl = base_url + 'assets/uploads/staffs/' + imgs;
        $('#imagesview').modal('show');
    }

    $scope.getAll = () => {
        if ($scope.filter.date_start && $scope.filter.date_start != '') {
            let date_start = $scope.filter.date_start.split('-');
            $scope.filter.from_date_start = moment(date_start[0]).format('YYYY-MM-DD');
            $scope.filter.to_date_start = moment(date_start[1]).format('YYYY-MM-DD');
        }

        $scope.loadingTable = true;
        $http.get(base_url + '/admin_users/ajax_get_decisions?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.rows.forEach(row => {
                    row.images = JSON.parse(row.images);
                });
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $('.dt-toolbar-footer').css('display', 'block');
                $scope.newContract = 0; // hiển thị button tạo HĐLĐ mới = 1
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loadingTable = false;
        });
    }

    $scope.createNewContract = (id) => {
        window.open(base_url + `admin_users/decision_detail?id=${id}&action_type=newContract`);
    }

    $scope.getAllUser = () => {
        let url = base_url + "/admin_users/ajax_get_users";
        $http.get(url).then((r) => {
            if (r.data && r.data.status == 1) {
                $scope.allUsers = r.data.data;
            }
        });
    }

    $scope.changeUser = (user_id) => {
        let user = $scope.allUsers.find(r => { return r.id == user_id });
        $scope.nation_id = user.nation_id;
        $scope.decision.nation_id = user.nation_id;
        $scope.decision.position = user.position_name;
        $scope.decision.store_id = user.main_store_id;

        if ($scope.decision.type_id == 2 || $scope.decision.type_id == 4) {
            $http.get(base_url + '/admin_users/ajax_get_salary_user?id=' + user_id).then(r => {
                if (r.data.status == 1) {
                    if (r.data.salary != '') {
                        $scope.decision.salary = r.data.salary;
                    } else {
                        $scope.decision.salary = '';
                    }
                    if (r.data.subsidy != '') {
                        $scope.decision.subsidy = r.data.subsidy;
                    } else {
                        $scope.decision.subsidy = '';
                    }
                } else {
                    $scope.decision.salary = '';
                    $scope.decision.subsidy = '';
                }
            });
        } else {
            $scope.decision.salary = '';
            $scope.decision.subsidy = '';
        }

        select2();
    }

    $scope.disabledSelectPosition = () => {
        $scope.disabledPosition = 1;
    }

    $scope.disabledInputPosition = () => {
        $scope.disabledPosition = 0;
    }

    $scope.disabledSelectPositionNew = () => {
        $scope.disabledPositionNew = 1;
    }

    $scope.disabledInputPositionNew = () => {
        $scope.disabledPositionNew = 0;
    }

    $scope.changeType = (user_id) => {
        if (($scope.decision.type_id == 2 || $scope.decision.type_id == 4) && $scope.decision.user_id) {
            $http.get(base_url + '/admin_users/ajax_get_salary_user?id=' + user_id).then(r => {
                if (r.data.status == 1) {
                    if (r.data.salary != '') {
                        $scope.decision.salary = r.data.salary;
                    } else {
                        $scope.decision.salary = '';
                    }
                    if (r.data.subsidy != '') {
                        $scope.decision.subsidy = r.data.subsidy;
                    } else {
                        $scope.decision.subsidy = '';
                    }
                } else {
                    $scope.decision.salary = '';
                    $scope.decision.subsidy = '';
                }
            });
        } else {
            $scope.decision.salary = '';
            $scope.decision.subsidy = '';
        }

        select2();
    }

    $scope.handleFilter = () => {
        $scope.filter.offset = 0;
        $scope.filter.currentPage = 1;
        $scope.getAll();
    }

    $scope.getUserByGroupId = () => {
        let url = base_url + "/admin_users/ajax_get_users?gr_id=" + ($scope.filter.group_id ? $scope.filter.group_id : 0);
        url = url + '&store_id=' + ($scope.filter.store_id ? $scope.filter.store_id : 0);
        $http.get(url).then((r) => {
            if (r.data && r.data.status == 1) {
                select2();
                $scope.users = r.data.data;
            }
        });
    };

    $scope.addDecission = () => {
        $scope.loading = true;
        if ($scope.decision.code == '') {
            toastr["error"]("Vui lòng nhập Số HĐ - QĐ!");
            $scope.loading = false;
            return false;
        }

        if ($scope.decision.type_id == 1 || $scope.decision.type_id == 4) {
            if ($scope.decision.position == '') {
                toastr["error"]("Vui lòng nhập chức danh cũ!");
                $scope.loading = false;
                return false;
            }

            if ($scope.decision.position_new == '') {
                toastr["error"]("Vui lòng nhập chức danh cũ!");
                $scope.loading = false;
                return false;
            }
        }

        if ($scope.decision.type_id == 3) {
            if ($scope.decision.store_new_id == '') {
                toastr["error"]("Vui lòng chọn chi nhánh mới!");
                $scope.loading = false;
                return false;
            }
        }

        if ($scope.decision.type_id == 2) {
            if ($scope.decision.salary_new == '' || $scope.decision.salary_new == 0) {
                toastr["error"]("Vui lòng nhập mức lương mới!");
                $scope.loading = false;
                return false;
            }
        }

        // $scope.decision.date_start = $scope.decision.date_start ? moment($scope.decision.date_start).format('YYYY-MM-DD') : '';
        // $scope.decision.date_end = $scope.decision.date_end ? moment($scope.decision.date_end).format('YYYY-MM-DD') : '';
        $http.post(base_url + "/admin_users/ajax_add_decisions", $scope.decision).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']($scope.decision.id ? 'Cập nhật thành công' : 'Tạo thành công!');
                $('#decisionModal').modal('hide');
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
            $scope.loading = false;
        })
    }

    $scope.showCancelDecisionModal = (id) => {
        $scope.cancel_id = id;
        $('#cancelDecisionModal').modal('show');
    }

    $scope.cancelDecision = () => {
        if (!$scope.note_cancel) {
            toastr["error"]("Vui lòng nhập lý do!");
            return false;
        }

        $scope.loadSubmit = true;

        var data = {
            decision_id: $scope.cancel_id,
            note: $scope.note_cancel,
        }

        $http.post(base_url + '/admin_users/ajax_cancel_decision/', data).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", r.data.message, "success");
                $scope.getAll();
                $('#cancelDecisionModal').modal('hide');
            } else {
                swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            }
            $scope.loadSubmit = false;
        });
    }

    $scope.sendNotification = (data) => {
        $http.post(base_url + "/admin_users/ajax_send_notification_decision", data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Gửi thành công!');
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
        })
    }

    $scope.showSendProfile = () => {
        $scope.selectedIdSendProfile = [];
        $scope.lsChekedDecision = [];
        $scope.lsChekedDecision = $scope.rows.filter((r) => {
            return r.isCheck == 1;
        });

        if ($scope.lsChekedDecision.length == 0) {
            toastr["error"]("Vui lòng chọn quyết định!");
            return;
        }
        select2();
        $('#sendProfileModal').modal('show');
    }

    $scope.sendLsProfile = () => {
        if ($scope.selectedIdSendProfile.length == 0) {
            toastr["error"]("Vui lòng chọn người gửi!");
            return false;
        }

        swal({
            title: "Thông báo",
            text: "Bạn có chắc muốn gửi quyết định cho người được chọn?",
            type: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            var data = {
                listId: $scope.selectedIdSendProfile,
                lsChekedDecision: $scope.lsChekedDecision,
            }
            $http.post(base_url + '/admin_users/ajax_send_ls_profile/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $('#sendProfileModal').modal('hide');
                    $scope.lsChekedDecision = [];
                    $scope.getAll();
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
            });
        });
    }

    $scope.viewDetailDe = (id) => {
        window.open(base_url + `admin_users/decision_detail?id=${id}`);
    }

    $scope.openModalDelete = (decision) => {
        $('#confirmDelete').modal('show');
        $scope.decision = decision;
    }

    $scope.removeDecision = () => {
        $('#confirmDelete').modal('hide');
        $http.post(base_url + "/admin_users/ajax_remove_desition", $scope.decision).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Xóa thành công!');
                $scope.getAll();
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Có lổi xẩy ra. Vui lòng thử lại!");
        })
    }

    $scope.formatDate = (date, fm) => {
        return moment(date).format(fm);
    }

    $scope.getTypeDecision = () => {
        $http.get(base_url + '/admin_users/ajax_get_type_decisions').then(r => {
            if (r.data.status == 1) {
                $scope.types = r.data.data;
            }
        });
    }

    $scope.getAllPosition = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_positions').then(r => {
            if (r.data.status == 1) {
                $scope.currentPositions = r.data.data;
                $scope.newPositions = r.data.data;
            }
        });
    }

    $scope.getAllStores = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_stores').then(r => {
            if (r.data.status == 1) {
                $scope.currentStores = r.data.data;
                $scope.newStores = r.data.data;
            }
        });
    }

    $scope.unsetDateStart = () => {
        $scope.filter.date_start = '';
    }

    $scope.reportExpiredContract = () => {
        // $scope.filter = {};
        $scope.countExpiredContract = 0;
        $scope.countExpiredAboutContract = 0;
        $http.get(base_url + '/admin_users/ajax_get_report_expired_contract').then(r => {
            if (r.data.status == 1) {
                $scope.expiredContract = r.data.expires_contract;
                $scope.countExpiredContract = $scope.expiredContract.length;
                $scope.expiredAboutContract = r.data.expires_about_contract;
                $scope.countExpiredAboutContract = $scope.expiredAboutContract.length;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.showExpiredContract = () => { // hiển thị danh sách HĐLĐ sắp hết hạn
        if ($scope.expiredContract) {
            $scope.rows = $scope.expiredContract;
            $scope.newContract = 1; // hiển thị button tạo HĐLĐ mới = 1
            $('.dt-toolbar-footer').css('display', 'none');
        }
    }

    $scope.showExpiredAboutContract = () => { // hiển thị danh sách HĐLĐ sắp hết hạn
        if ($scope.expiredContract) {
            $scope.rows = $scope.expiredAboutContract;
            $scope.newContract = 1; // hiển thị button tạo HĐLĐ mới = 1
            $('.dt-toolbar-footer').css('display', 'none');
        }
    }

    $scope.exportExcelDecisions = () => {
        $http.get(base_url + '/admin_users/ajax_get_export_excel?filter=' + JSON.stringify($scope.filter)).then(r => {
            var $a = $("<a>");
            $a.attr("href", r.data.file);
            $a.attr("download", r.data.fileName);
            $("body").append($a);
            $a[0].click();
            $a.remove();
        });
    }

    $scope.exportExcelSalary = () => {
        $scope.filter.is_excel_salary = true;
        if (typeof $scope.filter.group_id == 'undefined') {
            toastr["error"]('Vui lòng chọn nhóm quản trị!');
            return false;
        }

        window.open(base_url + '/admin_users/ajax_get_export_salary_users?filter=' + JSON.stringify($scope.filter));
        $scope.filter.is_excel_salary = false;
        return;
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200)
    }

    $scope.openModal = (item) => {
        $scope.decision = {};
        $scope.decision.images = [];
        if (item) {
            window.open(base_url + `admin_users/decision_detail?id=${item.id}`);
        } else {
            window.open(base_url + `admin_users/decision_detail`);
        }
        select2();
    }

    //paging-----------------------------------

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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

})