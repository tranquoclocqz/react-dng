app.config(function (dropzoneOpsProvider) {
    dropzoneOpsProvider.setOptions({
        url: base_url + '/admin_users/ajax_upload_image_user/',
        acceptedFiles: 'image/jpeg, images/jpg, image/png',
        dictDefaultMessage: 'Thêm chứng từ'
    });
});

app.controller('SalaryDetailCtrl', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.userDetail = user_detail;
        $scope.user_salary_id = user_salary_id;
        $scope.is_hr = is_hr;
        $scope.loadingPage = true;

        $scope.getUserHandleSalary();
        $scope.note = '';
        $scope.current_id = current_id;
        $scope.user_salary = {};
        $scope.lsUser = [];
        $scope.followers = [];
        $scope.lsUserRelate = admin.concat(manager);
        $scope.selectedRelate = [];
        $scope.lsUserTag = [];
        $scope.newMessage = {};
        $scope.lsMessage = [];
        $scope.getMessage();
        $scope.images = [];
        $scope.files = [];
        $scope.ls_images = [];
        $scope.decision = {};
        $scope.decision.images = [];
        $scope.pointWork = [];
        $scope.getAllPosition();
        $scope.chooseSendToUser = 1;
        $scope.chooseRange = 1;
        $scope.month_current = moment($scope.date).format("M");
        $scope.year_current = moment().year();
        $scope.month_start = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        $scope.month_end = [];
        $scope.year_ends = [];
        $scope.admin_salary = [];

        $scope.currentStores = all_stores;
        $scope.newStores = all_stores;
        $scope.confirmStores = all_stores;
        $scope.loadLevel();

        $scope.get_year();

        setTimeout(() => {
            $scope.ckeditor = CKEDITOR.replace('textboxMessage', {
                uiColor: '#f2f3f5',
                height: '100',
                toolbarGroups: [
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list'] },
                    { name: 'links', groups: ['links'] }
                ]
            });
        }, 100);
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

    $scope.loadLevel = () => {
        $http.get(base_url + '/admin_users/ajax_get_level_users').then(r => {
            if (r.data.status == 1) {
                $scope.levels = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.format_date = (date, type) => {
        return moment(date).format(type);
    }

    $scope.getUserHandleSalary = () => {
        $http.get(base_url + '/request_salaries/ajax_get_handle_user_salary/' + $scope.user_salary_id).then(r => {
            $scope.user_handle = r.data.data;
            $scope.showUserHandle = 0;
            $scope.showCancelHandle = 0;
            $scope.showCancelUserCreate = 0;
            $scope.user_handle.forEach(function (e) {
                if (e.user_id == $scope.current_id && e.status == 0 && e.type == 1) { // người duyệt tiếp theo 
                    $scope.showUserHandle = 1;

                }
                if (e.user_id == $scope.current_id && e.status == 0 && e.type != 3 && e.type != 4 && e.type != 0) { // hr
                    $scope.showCancelHandle = 1;
                }

                // xác định đề xuất chưa được duyệt
                if (e.type == 1 && e.status == 0) {
                    $scope.UserConfirm = e;
                }
            });
            $scope.getStatusSalary();
            $scope.getUserJoinSalary();
        });
    }

    $scope.getStatusSalary = () => {
        $scope.loadingPage = true;
        $http.get(base_url + '/request_salaries/ajax_get_user_salary?id=' + $scope.user_salary_id).then(r => {
            $scope.user_salary = r.data.data;
            $scope.rangeDate = {};
            if ($scope.user_salary.approx_start) {
                let approx_start = $scope.user_salary.approx_start.split("/");
                let approx_end = $scope.user_salary.approx_end.split("/");
                $scope.user_salary.month_start = approx_start[0];
                $scope.user_salary.month_end = approx_end[0];
                $scope.user_salary.year_start = approx_start[1];
                $scope.user_salary.year_end = approx_end[1];
                let textMonthStart = $scope.user_salary.month_start.length == 1 ? "0" : "";
                let textMonthEnd = $scope.user_salary.month_end.length == 1 ? "0" : "";
                let lastDay = new Date($scope.user_salary.year_end, $scope.user_salary.month_end, 0);
                $scope.rangeDate.date = textMonthStart + $scope.user_salary.month_start + '/' + "01/" + $scope.user_salary.year_start + ' - ' + textMonthEnd + $scope.user_salary.month_end + "/" + lastDay.getDate() + "/" + $scope.user_salary.year_end;
                $scope.rangeDate.chooseRange = 1;
            } else {
                $scope.rangeDate.each_month = JSON.parse($scope.user_salary.each_month);
                $scope.rangeDate.chooseRange = 2;
            }

            if ($scope.user_salary.images) {
                $scope.user_salary.images.forEach(function (img) {
                    if (img.file) {
                        img.file = base_url + 'assets/uploads/staffs/' + img.file;
                    }
                });
            }

            // xác định đề xuất đã hết hạn và bị khóa chưa, nếu hết hạn thì ẩn nút duyệt, cập nhật và hủy đề xuất
            $scope.disableHandle = 0; // được phép duyệt đề xuất
            if ($scope.UserConfirm) { // nếu đề xuất chưa được duyệt
                if ($scope.user_salary.active == 1 && $scope.user_salary.active_hr == 0) {
                    $scope.disableHandle = 1;
                }
            }

            $scope.loadingPage = false;
            $scope.getReportSalaryUser();

            $scope.get_list_user_permission_approve($scope.user_salary.user_id, $scope.user_salary.main_group_id, $scope.user_salary.company_id);

            $scope.user_handle.forEach(function (e) {
                if (e.user_id == $scope.current_id && e.type == 0 && $scope.user_salary.status == 0) { // là người tạo
                    $scope.showCancelUserCreate = 1;
                }
            });
        });
    }

    $scope.get_list_user_permission_approve = (user_id, group_id, company_id) => { // lấy tất cả những người và nhóm có quyền duyệt đề xuất
        $http.get(base_url + '/request_salaries/get_list_user_permission_approve' + '?user_id=' + user_id + '&main_group_id=' + group_id + '&company_id=' + company_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.admin_salary = r.data.data;
            } else toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!");
        });
    }

    $scope.getReportSalaryUser = () => {
        $scope.loadSubmit = true;
        $('#table_target, #table_penances, #table_evaluation, #table_complains').css('display', 'none');
        $http.get(base_url + '/request_salaries/ajax_get_report_salary_user/' + $scope.user_salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.userHistory = r.data.data_user;
                $scope.getTarget();
            }
            $scope.loadSubmit = false;
        });
        select2();
    }

    $scope.changeSelectedRange = (val) => {
        $scope.chooseRange = val;
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

    $scope.updateRangeDate = () => {
        $scope.updateDate.approx_start = $scope.updateDate.month_start + '/' + $scope.updateDate.year_start;
        $scope.updateDate.approx_end = $scope.updateDate.month_end + '/' + $scope.updateDate.year_end;
        $scope.updateDate.chooseRange = $scope.chooseRange;
        $http.post(base_url + '/request_salaries/ajax_update_salary', $scope.updateDate).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", "Cập nhật thành công!", "success");
                $('#modalUpdateDate').modal('hide');
                $scope.getStatusSalary();
            } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            $scope.loadSubmit = false;
        });
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
        $http.get(base_url + '/admin_users/ajax_get_penance/' + $scope.user_salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
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
        $http.get(base_url + '/admin_users/ajax_get_complains/' + $scope.user_salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
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
        $http.get(base_url + '/admin_users/ajax_get_evaluation/' + $scope.user_salary.user_id + '?filter=' + JSON.stringify($scope.rangeDate)).then(r => {
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

    $scope.closeTable = (idText) => {
        $scope.table_active = '';
        $(idText).slideToggle(300);
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

        if ($scope.user_salary.approx_start) {
            $scope.user_salary.chooseRange = 1;
        } else {
            $scope.user_salary.each_month = JSON.parse($scope.user_salary.each_month);
            $scope.user_salary.chooseRange = 2;
        }

        $http.get(base_url + 'staffs/ajax_get_report_sale_users?filter=' + JSON.stringify($scope.user_salary)).then(r => {
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
            $scope.loadSubmit = false;
        });
        $scope.load_point_work();
    }

    $scope.load_point_work = () => {
        $scope.loadingPoint = true;
        $http.get(base_url + 'staffs/ajax_get_diligence_user?filter=' + JSON.stringify($scope.user_salary)).then(r => {
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

    $scope.get_point = (d) => {
        let point = $scope.pointWork.find(r => { return r.month == d });
        return point ? point.diligence : 0;
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

    $scope.getUserJoinSalary = () => {
        $http.get(base_url + '/request_salaries/ajax_get_user_join_salary?id=' + $scope.user_salary_id).then(r => {
            $scope.lsUser = r.data.data;
            $scope.followers = r.data.followers;
            $scope.totalUserRelate = $scope.followers.length;
            $scope.isSendMess = false;
            $scope.existHR = false;
            $scope.isAction = false;
            $scope.lsUser.forEach(function (user) {
                if (user.user_id == $scope.current_id) {
                    $scope.isSendMess = true;
                    if (user.type != 3 && user.type != 4) $scope.isAction = true;
                }
                if (user.type == 4) $scope.existHR = true;
            });

            if ($scope.isSendMess || $scope.is_hr) $('#send-mess').css('display', 'block');
        });
    }

    $scope.showModalHandleUser = (status) => {
        $scope.note = '';
        $scope.send_admin_id = '';
        $scope.status = status;

        $scope.user_handle.forEach(e => { // lọc những user đã được thêm vào đề xuất
            $scope.admin_salary = $scope.admin_salary.filter(el =>
                el.id != e.user_id
            );
        });

        select2();
        if ($scope.disableHandle == 0 || status == 5) {
            $('#modalHandleUser').modal('show');
        }
    }

    $scope.showModalCanelUserCreate = () => {
        $scope.noteCancel = '';
        $scope.errorCancelNote = 0;
        $('#modalCancelUserCreate').modal('show');
    }

    $scope.cancelUserCreate = () => { // Huỷ đề xuất của người tạo
        $scope.errorCancelNote = $scope.noteCancel ? 0 : 1;
        if (!$scope.noteCancel) return false;

        var data = {
            salary_id: $scope.user_salary_id,
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
            $http.post(base_url + '/request_salaries/ajax_cancel_user_create/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $('#modalCancelUserCreate').modal('hide');
                    $scope.getUserHandleSalary();
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
            });
        });
    }

    $scope.handleUser = () => {
        if ($scope.status == 1 && $scope.chooseSendToUser == 1) {
            $scope.errorSendAdmin = $scope.send_admin_id ? 0 : 1;
            if (!$scope.send_admin_id) return false;
        }

        if ($scope.status == 4 || $scope.status == 5) {
            $scope.errorNote = $scope.note ? 0 : 1;
            if (!$scope.note) return false;
        }

        if ($scope.status == 3) {
            if (!$scope.decision.code) {
                toastr["error"]("Vui lòng nhập số HĐ - QĐ!");
                return false;
            }

            $scope.note = "";
        }

        $scope.infoConfirm = {};
        $scope.infoConfirm.salary_new = $scope.user_salary.salary_request ? $scope.numberWithCommas($scope.user_salary.salary_request) : 0;
        $scope.infoConfirm.subsidy_new = $scope.user_salary.subsidy_request ? $scope.numberWithCommas($scope.user_salary.subsidy_request) : 0;

        $scope.infoConfirm.position_new = $scope.user_salary.position_request ? $scope.user_salary.position_request : '';
        $scope.infoConfirm.date_start = $scope.user_salary.date_start_request;
        $scope.infoConfirm.store_new_id = $scope.user_salary.store_new_id;

        var data = {
            salary_id: $scope.user_salary_id,
            user_id: $scope.user_salary.user_id,
            note: $scope.note,
            current_id: $scope.current_id,
            status: $scope.status,
            send_admin_id: $scope.send_admin_id,
            decision: $scope.decision,
            chooseSendToUser: $scope.chooseSendToUser,
            infoConfirm: $scope.infoConfirm
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
            $http.post(base_url + '/request_salaries/ajax_handle_user_salary/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    if ($scope.status != 3) {
                        $('#modalHandleUser').modal('hide');
                    } else {
                        $scope.decision.id = r.data.decision_id;
                        $scope.user_salary.decision_id = r.data.decision_id;
                    }
                    $scope.loadSubmit = false;
                    $scope.getUserHandleSalary();
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
            });
        });
    }

    $scope.printDecision = () => {
        if (!$scope.decision_code) {
            toastr["error"]("Vui lòng nhập Số HĐ - QĐ!");
            return false;
        }

        if (!$scope.decision.type_print) {
            toastr["error"]("Vui lòng chọn quyết định điều chỉnh lương của!");
            return false;
        }
        window.open(base_url + `request_salaries/salary_detail_print/` + $scope.user_salary.id + '?code=' + $scope.decision_code + '&type=' + $scope.decision.type_print);
    }

    $scope.chooseUser = () => {
        var data = {
            id: $scope.user_salary_id,
            user_id: $scope.selectedRelate[0],
            type: 5
        }
        var existLsUser = false;
        $scope.lsUser.forEach(e => {
            if ($scope.selectedRelate[0] == e.user_id) {
                existLsUser = true;
            };
        })

        if (existLsUser == true) {
            toastr['error']("Nhân viên đã tồn tại!");
            $scope.selectedRelate = [];
            return false;
        }

        var existFollowers = false;
        $scope.followers.forEach(e => {
            if ($scope.selectedRelate[0] == e.user_id) {
                existFollowers = true;
            };
        })

        if (existFollowers == true) {
            toastr['error']("Nhân viên đã tồn tại!");
            $scope.selectedRelate = [];
            return false;
        }

        $scope.selectedRelate = [];

        $scope.loadingChooseUser = true;
        $http.post(base_url + '/request_salaries/ajax_join_user_to_salary/', data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.loadingChooseUser = false;
                toastr['success']("Thêm thành công!");
                $scope.getUserJoinSalary();
            } else {
                toastr['error']("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
        });
    }

    $scope.handleTagName = (item) => {
        var newElement = CKEDITOR.dom.element.createFromHtml(`<span style="color: #1479fb;" value="${item.id}" >@${item.user_name}</span>`, $scope.ckeditor.document);
        CKEDITOR.instances.textboxMessage.insertElement(newElement);
        $scope.lsUserTag.push(item);
        $scope.selectedName = [];
    }

    $scope.sendMessage = () => {
        if ($scope.isSendMess || $scope.is_hr) {
            $scope.newMessage.note = CKEDITOR.instances.textboxMessage.getData();
            let tag = [];
            $scope.lsUserTag.forEach(e => {
                $scope.newMessage.note = $scope.newMessage.note + '';
                if ($scope.newMessage.note.search(`value="${e.id}"`) >= 0) {
                    tag.push(e);
                };
            })
            if (($scope.newMessage.note && $scope.newMessage.note != '') || ($scope.files.length > 0)) {
                $scope.newMessage.user_id = $scope.current_id;
                $scope.newMessage.user_salary_id = $scope.user_salary_id;
                $scope.newMessage.ls_user_tag = tag;

                $scope.lsUserTag = [];
                var formData = new FormData();
                angular.forEach($scope.files, function (file) {
                    formData.append('files[]', file);
                });
                $scope.newMessage.user_id = $scope.current_id;
                $scope.newMessage.user_salary_id = $scope.user_salary_id;
                $scope.newMessage.ls_user_tag = tag;
                var data = JSON.stringify($scope.newMessage);
                formData.append('data', data);
                $http({
                    url: base_url + '/request_salaries/ajax_send_message',
                    method: "POST",
                    data: formData,
                    headers: { 'Content-Type': undefined }
                }).then(r => {
                    if (r && r.data.status == 1) {
                        $scope.getMessage();
                        $scope.remove_image();
                        $scope.newMessage.note = '';
                    } else if (r && r.data.status == 0) {
                        toastr["error"](r.data.message);
                    } else toastr["error"]("Đã có lỗi xẩy ra, xin vui lòng thử lại!");
                })
            }
            CKEDITOR.instances.textboxMessage.setData('');
        }
    }

    $scope.changeRadioRange = (val) => {
        $scope.chooseSendToUser = val;
    }

    $scope.getMessage = () => {
        $http.get(base_url + '/request_salaries/ajax_get_message?id=' + $scope.user_salary_id).then(r => {
            $scope.lsMessage = r.data ? r.data : [];
            if ($scope.lsMessage) {
                setTimeout(function () {
                    let d = $('.content');
                    d.scrollTop(d.prop("scrollHeight"));
                }, 500);
            }
            $scope.lsMessage.forEach(function (message) {
                if (message.image_url) {
                    let arr_url = JSON.parse(message.image_url);
                    arr_url.forEach(function (url) {
                        $scope.ls_images.push(url);
                    });
                }
            });
        });
    }

    $scope.trustAsHtml = (value) => {
        return $sce.trustAsHtml(value.note);
    }

    $scope.attachFile = () => {
        $('#ip-img').click();
    }

    $scope.imageUpload = function (element) {
        var files = event.target.files; // FileList object
        $scope.files.push(files[0]);

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
    }

    $scope.imageIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.images.push(e.target.result);
        });
    }

    $scope.remove_image = () => {
        $scope.images = [];
        $scope.files = [];
    }

    $scope.jsonPartArrURL = (image_url) => {
        return JSON.parse(image_url);
    }

    $scope.showImg = (img) => {
        $scope.currImg = img;
    }

    $scope.showProfileImg = (img) => {
        $scope.currImg = img;
        $('#modalImg').modal('show');
    }

    $scope.showModalEditSalary = (item) => {
        $scope.salary = angular.copy(item);
        $scope.salary.salary_old = $scope.salary.salary_old ? $scope.numberWithCommas($scope.salary.salary_old) : 0;
        $scope.salary.subsidy_old = $scope.salary.subsidy_old ? $scope.numberWithCommas($scope.salary.subsidy_old) : 0;

        $scope.salary.salary_new = $scope.user_salary.salary_request ? $scope.numberWithCommas($scope.user_salary.salary_request) : 0;
        $scope.salary.subsidy_new = $scope.user_salary.subsidy_request ? $scope.numberWithCommas($scope.user_salary.subsidy_request) : 0;

        $scope.salary.position_new = $scope.user_salary.position_request ? $scope.user_salary.position_request : '';
        $scope.salary.date_start = $scope.user_salary.date_start_request;
        $scope.salary.store_new_id = $scope.user_salary.store_new_id;

        $scope.salary.salary_confirm = $scope.user_salary.salary_new ? $scope.numberWithCommas($scope.user_salary.salary_new) : 0;
        $scope.salary.subsidy_confirm = $scope.user_salary.subsidy_new ? $scope.numberWithCommas($scope.user_salary.subsidy_new) : 0;
        $scope.salary.position_confirm = $scope.user_salary.position_new;
        $scope.salary.level_id_confirm = $scope.user_salary.level_id_new;
        $scope.salary.date_start_confirm = $scope.user_salary.date_start

        $scope.salary.store_confirm_id = $scope.user_salary.store_new_id;

        $scope.salary.group_id = $scope.userDetail.group_id;
        $scope.salary.work_time_month = $scope.userDetail.work_time_month;

        if ($scope.salary.approx_start) {
            let approx_start = $scope.salary.approx_start.split("/");
            let approx_end = $scope.salary.approx_end.split("/");
            $scope.salary.month_start = approx_start[0];
            $scope.salary.month_end = approx_end[0];
            $scope.salary.year_start = approx_start[1];
            $scope.salary.year_end = approx_end[1];
            $scope.salary.chooseRange = 1;
        } else if ($scope.salary.each_month) {
            $scope.salary.each_month = JSON.parse($scope.salary.each_month);
            $scope.salary.chooseRange = 2;
        }

        $scope.errorSalaryNew = 0;
        $scope.errorPosition = 0;
        $scope.errorPositionNew = 0;
        $scope.errorDateStart = 0;
        $scope.errorNoteUpdate = 0;

        if ($scope.disableHandle == 0) {
            $('#modalSalary').modal('show');
        }
        select2();
    }

    $scope.formatDateToTime = (date, type) => {
        return moment(date).format(type)
    }

    $scope.editSalary = () => {
        if ($scope.salary.type == 1) {
            $scope.errorSalaryNew = $scope.salary.salary_new ? 0 : 1;
            if (!$scope.salary.salary_new) return false;

            if ($scope.salary.salary_new == 0) {
                toastr["error"]("Mức lương mới phải khác 0!");
                return false;
            }
        }

        if ($scope.salary.type == 3 || $scope.salary.type == 4) {
            // $scope.errorPosition = $scope.salary.position ? 0 : 1;
            // if (!$scope.salary.position) return false;

            $scope.errorPositionConfirm = $scope.salary.position_confirm ? 0 : 1;
            if (!$scope.salary.position_confirm) return false;
        }

        $scope.errorDateStartConfirm = $scope.salary.date_start_confirm ? 0 : 1;
        if (!$scope.salary.date_start_confirm) return false;

        $scope.errorNoteUpdate = $scope.salary.note ? 0 : 1;
        if (!$scope.salary.note) return false;

        $scope.loadSubmit = true;
        $http.post(base_url + '/request_salaries/ajax_update_salary_detail', $scope.salary).then(r => {
            if (r.data && r.data.status == 1) {
                swal("Thông báo", "Cập nhật thành công!", "success");
                $('#modalSalary').modal('hide');
                $scope.getStatusSalary();
            } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            $scope.loadSubmit = false;
        });
    }

    $scope.changePointLadder = (point_ladder) => {
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

        if ($scope.salary.salary_old && $scope.salary.percent != 0) {
            let salary_old = parseInt($scope.salary.salary_old.replaceAll(',', ''));
            $scope.salary.salary_new = salary_old + ((salary_old * parseInt($scope.salary.percent)) / 100);
            $scope.salary.salary_new = $scope.salary.salary_new ? $scope.numberWithCommas($scope.salary.salary_new) : 0;
        }
    }

    $scope.showModalUpdateDate = () => {
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

        $scope.updateDate = angular.copy($scope.user_salary);
        if ($scope.month_current == 6) {
            $scope.updateDate.month_start = 1 + "";
            $scope.updateDate.year_start = (moment().year() - 1) + "";
        } else if ($scope.month_current > 6) {
            $scope.updateDate.month_start = ($scope.month_current - 5) + "";
            $scope.updateDate.year_start = moment().year() + "";
        } else {
            $scope.updateDate.month_start = (12 + ($scope.month_current - 5)) + "";
            $scope.updateDate.year_start = (moment().year() - 1) + "";
        }

        if ($scope.updateDate.approx_start) {
            let approx_start = $scope.updateDate.approx_start.split("/");
            let approx_end = $scope.updateDate.approx_end.split("/");
            $scope.updateDate.month_start = approx_start[0];
            $scope.updateDate.month_end = approx_end[0];
            $scope.updateDate.year_start = approx_start[1];
            $scope.updateDate.year_end = approx_end[1];
            $scope.chooseRange = 1;
        } else {
            $scope.updateDate.each_month = $scope.updateDate.each_month;
            $scope.chooseRange = 2;
            setTimeout(() => {
                select2();
            }, 100);
        }
        $scope.changemonthStart();
        $('#modalUpdateDate').modal('show');
    }

    $scope.chooseDate = () => {
        $('#dateft').modal('show');
    }

    $scope.getAllPosition = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_positions').then(r => {
            if (r.data.status == 1) {
                $scope.currentPositions = r.data.data;
                $scope.newPositions = r.data.data;
            }
        });
    }

    $scope.converHtml = (index, htmlbd, obligatory) => {
        $span = '';
        if (obligatory == 1) {
            $span = '<span class="obligatory"> (*)</span>';
        }
        return $sce.trustAsHtml(index + '. ' + htmlbd + $span);
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

    $scope.formatNumber = (num) => {
        if (typeof (num) != "undefined") {
            return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
    }

    $scope.formatDoubleNumber = (num) => {
        if (typeof (num) != "undefined") {
            return num.toString().replace(/\.00$/, '');
        }
    }

    $scope.deleteUserInSalary = (value, type) => {
        if (value.user_id == $scope.current_id) {
            return toastr['error']('Bạn không thể xóa chính mình');
        }
        $http.post(base_url + 'request_salaries/ajax_delete_user_salary_users', value).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']("Xóa thành công!");
                $scope.getUserJoinSalary();
            } else {
                toastr['error']("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
        })
    }

    $scope.changemonthStart = (type) => {
        if ($scope.updateDate.year_start == $scope.updateDate.year_end) {
            $scope.updateDate.month_end = $scope.updateDate.month_start;
            $scope.month_end = $scope.month_start.filter(element => {
                return element >= $scope.updateDate.month_start;
            });
        } else $scope.month_end = $scope.month_start;

        if ($scope.updateDate.year_start > $scope.updateDate.year_end) {
            $scope.updateDate.year_end = $scope.updateDate.year_start;
        }

        $scope.year_ends = $scope.year.filter(element => {
            return element >= $scope.updateDate.year_start;
        });

        select2();
    }

    $scope.get_year = () => {
        $scope.year = [];
        for (var i = 5; i > 0; i--) {
            $scope.year.push($scope.year_current--);
        }
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
                    $scope.getStatusSalary();
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            });
        });
    }

    $scope.numberWithCommas = (x) => {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
});