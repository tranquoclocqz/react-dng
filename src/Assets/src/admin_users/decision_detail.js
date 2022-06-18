app.controller('decision_detail', function ($scope, $http, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box-op').css('opacity', 1);
        $scope.current_id = current_id;
        $scope.types = [];
        $scope.currentStores = [];
        $scope.newStores = [];
        $scope.currentPositions = [];
        $scope.newPositions = [];
        $scope.disabledPositionNew = 1;
        $scope.disabledPosition = 1;
        $scope.disabledFromPosition = 1;
        $scope.decision_code = decision_code;
        $scope.decision = decision ? decision : {};
        $scope.allUsers = allUsers;
        $scope.allUsersPrint = allUsersPrint;
        $scope.decision.salary = decision ? $scope.numberWithCommas(decision.salary) : '';
        $scope.decision.salary_new = decision ? $scope.numberWithCommas(decision.salary_new) : '';
        $scope.decision.insurance_premium = decision ? $scope.numberWithCommas(decision.insurance_premium) : '';
        $scope.decision.subsidy = decision ? $scope.numberWithCommas(decision.subsidy) : '';
        $scope.decision.subsidy_new = decision ? $scope.numberWithCommas(decision.subsidy_new) : '';
        if ($scope.decision.position) {
            $scope.disabledPosition = 1;
        }

        if ($scope.decision.position_new) {
            $scope.disabledPositionNew = 1
        }

        if ($scope.decision.change_salary == 1) {
            $('.changeSalary').slideToggle(300);
        }

        if ($scope.decision.change_subsidy == 1) {
            $('.changeSubsidy').slideToggle(300);
        }

        $scope.decision.images = decision ? decision.images : [];

        if (!decision) {
            $scope.decision.salary_commitment_basic = 0
        }

        $scope.is_view = is_view;
        $scope.getTypeDecision();
        $scope.getAllPosition();
        $scope.getAllStores();
        $scope.loadLevel();
        $scope.decision.images.forEach(e => {
            e.type = e.type + '';
        });
        $scope.salary_id = '';
        if (salary_id) {
            $scope.salary_id = salary_id;
            $scope.disabledPositionNew = 1
            $scope.disabledPosition = 1;
            $scope.getSalary();
        }
        $scope.radioDateEnd = '';
        $scope.action_type = action_type;
        if ($scope.decision && $scope.decision.type_id == 6 && $scope.action_type) { // tạo mới HĐLĐ trên HĐLĐ củ
            $scope.decision.code = '';
            $scope.decision.salary_new = 0;
            $scope.decision.position_id_new = 0;
            $scope.decision.level_id_new = 0;
            $scope.decision.store_new_id = 0;
            $scope.decision.subsidy_new = 0;
            $scope.decision.change_salary = false;
            $scope.decision.change_subsidy = false;
            
            $scope.radioDateEnd = '1';
            // set ngày kết thúc mặc định là 1 năm
            let date_start = $scope.decision.date_start;
            let year = date_start.slice(6);
            let day = date_start.slice(0, 2);
            let month = date_start.slice(3, 5);
            let year_end = (parseInt(year) + 1) + '-' + month + '-' + day;

            // set bắt ngày bắt đầu là ngày tháng của ngày băt đầu và năm của ngày kết thúc
            $scope.decision.date_start = day + '-' + month + '-' + $scope.decision.date_end.slice(6);

            var tomorrow = new Date(year_end.toString());
            tomorrow.setDate(tomorrow.getDate() - 1); // thêm 1 ngày cho ngày kết thúc
            let monthEnd = (tomorrow.getMonth() + 1) + '';
            let dayEnd = tomorrow.getDate();
            let yearEnd = tomorrow.getFullYear() + 1;
            if (monthEnd.length == 1) {
                monthEnd = '0' + monthEnd;
            }

            let newdate = dayEnd + "-" + monthEnd + "-" + yearEnd;
            $scope.decision.date_end = newdate;

            // lấy lương, phụ cấp, chức danh, level mới nhất
            $scope.salaryUser();
        }

        if ($scope.decision.type_id == 6) {
            $('.changeSalary').css('display', 'block');
            $('.changeSubsidy').css('display', 'block');
        }

        select2();
    }

    // nếu tạo HĐLĐ mới từ HĐLĐ hết hạn
    $scope.salaryUser = () => {
        $http.get(base_url + '/request_salaries/ajax_get_salary_user?id=' + $scope.decision.user_id).then(r => {
            if (r.data.status == 1) {
                $scope.decision.salary = r.data.salary ? $scope.numberWithCommas(r.data.salary) : 0;
                $scope.decision.subsidy = r.data.subsidy ? $scope.numberWithCommas(r.data.subsidy) : 0;
                $scope.decision.position = r.data.position;
                $scope.decision.level_id = r.data.level_id_new;
                $scope.decision.store_id = r.data.main_store_id;
                $scope.getPositonId();
            }
        });
    }

    $scope.getPositonId = () => {
        $http.post(base_url + '/request_salaries/ajax_get_position_id', $scope.decision).then(r => {
            if (r.data.status == 1) {
                $scope.decision.position_id = r.data.data;
            }
        });
    }

    // End nếu tạo HĐLĐ mới từ HĐLĐ hết hạn

    $scope.getTypeDecision = () => {
        $http.get(base_url + '/admin_users/ajax_get_type_decisions').then(r => {
            if (r.data.status == 1) {
                $scope.types = r.data.data;
                select2();
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

    $scope.loadLevel = () => {
        $http.get(base_url + '/admin_users/ajax_get_level_users').then(r => {
            if (r.data.status == 1) {
                $scope.levels = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
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

    $scope.changeUser = (user_id) => {
        $http.get(base_url + '/admin_users/ajax_get_salary_user?id=' + user_id).then(r => {
            if (r.data.status == 1) {
                if (r.data.salary != '') {
                    $scope.decision.salary = $scope.numberWithCommas(r.data.salary);
                } else {
                    $scope.decision.salary = '';
                }
                if (r.data.subsidy != '') {
                    $scope.decision.subsidy = $scope.numberWithCommas(r.data.subsidy);
                } else {
                    $scope.decision.subsidy = '';
                }

                $scope.decision.nation_id = r.data.nation_id;
                $scope.decision.nation_new_id = r.data.nation_id;
                $scope.decision.position = r.data.position;
                $scope.decision.position_id = r.data.position_id;
                $scope.decision.level_id = r.data.level_id;
                $scope.decision.store_id = r.data.main_store_id;
                $scope.decision.store_new_id = r.data.main_store_id;
                select2();
            } else {
                $scope.decision.salary = '';
                $scope.decision.subsidy = '';
            }
        });
    }

    $scope.changeStore = (text) => {
        var store = '';
        if (text == 'OLD') {
            store = $scope.decision.store_id;
        } else {
            store = $scope.decision.store_new_id;
        }
        if (store != '') {
            $http.get(base_url + '/admin_users/ajax_get_nation_id_by_store?store_id=' + store).then(r => {
                if (r.data.status == 1) {
                    if (text == 'OLD') {
                        $scope.decision.nation_id = r.data.nation_id;
                    } else {
                        $scope.decision.nation_new_id = r.data.nation_id;
                    }
                } else {
                    toastr["error"](r.data.message);
                }
            });
        }
    }

    $scope.getInfoUser = (user_id) => {
        $http.get(base_url + '/admin_users/ajax_get_salary_user?id=' + user_id).then(r => {
            if (r.data.status == 1) {
                $scope.decision.position_id = r.data.position_id;
                $scope.decision.level_id = r.data.level_id;
                select2();
            }
        });
    }

    $scope.getSalary = () => {
        $http.get(base_url + '/request_salaries/ajax_get_user_salary?id=' + $scope.salary_id).then(r => {
            $scope.userSalary = r.data.data;
            $scope.salary_detail = angular.copy(r.data.data);
            delete $scope.userSalary.id;
            delete $scope.userSalary.created;
            delete $scope.userSalary.status;
            $scope.decision = $scope.userSalary;
            $scope.decision.salary = $scope.numberWithCommas($scope.userSalary.salary_old);
            $scope.decision.salary_new = $scope.numberWithCommas($scope.userSalary.salary_new);
            $scope.decision.subsidy = $scope.numberWithCommas($scope.userSalary.subsidy_old);
            $scope.decision.subsidy_new = $scope.numberWithCommas($scope.userSalary.subsidy_new);

            if ($scope.userSalary.type == 1 || $scope.userSalary.type == 2) {
                $scope.decision.type_id = '2';
            } else if ($scope.userSalary.type == 3) {
                $scope.decision.type_id = '1';
            } else if ($scope.userSalary.type == 4) {
                $scope.decision.type_id = '4';
            } else if ($scope.userSalary.type == 5) {
                $scope.decision.type_id = '3';
            } else if ($scope.userSalary.type == 6) {
                $scope.decision.type_id = '8';
            }

            if ($scope.decision.salary_new == 0) {
                $scope.decision.change_salary = 0;
            } else {
                $scope.decision.change_salary = 1;
                if ($scope.decision.change_salary == 1) {
                    $('.changeSalary').slideToggle(150);
                }
            }

            if ($scope.decision.subsidy_new == 0) {
                $scope.decision.change_subsidy = 0;
            } else {
                $scope.decision.change_subsidy = 1;
                if ($scope.decision.change_subsidy == 1) {
                    $('.changeSubsidy').slideToggle(150);
                }
            }

            $scope.decision.position_id = 0
            $scope.decision.position_id_new = 0
            $scope.newPositions.forEach(item => { // set position_id tạm khi nào nhân sự tạo position_id cho tất cả user trong bảng user_decisions thì sẽ chỉnh sửa lại
                if (item.name == $scope.decision.position) {
                    $scope.decision.position_id = item.id;
                }

                if (item.name == $scope.decision.position_new) {
                    $scope.decision.position_id_new = item.id;
                }
            });

            if ($scope.decision.store_new_id && $scope.decision.store_new_id != '0') {
                $http.get(base_url + '/admin_users/ajax_get_nation_id_by_store?store_id=' + $scope.decision.store_new_id).then(r => {
                    if (r.data.status == 1) {
                        $scope.decision.nation_new_id = r.data.nation_id;
                    } else {
                        toastr["error"](r.data.message);
                    }
                });
            } 

            if ($scope.decision.store_id && $scope.decision.store_id != '0') {
                $http.get(base_url + '/admin_users/ajax_get_nation_id_by_store?store_id=' + $scope.decision.store_id).then(r => {
                    if (r.data.status == 1) {
                        $scope.decision.nation_id = r.data.nation_id;
                    } else {
                        toastr["error"](r.data.message);
                    }

                    if ($scope.decision.store_new_id == '0') {
                        $scope.decision.nation_new_id = $scope.decision.nation_id;
                    }
                });
            }
            
            if ($scope.decision.position_id == 0) { // nếu tạo QĐ từ đề xuất mà không có level chức danh cũ thì sẽ lấy chức danh hiện tại của nhân sự
                $scope.getInfoUser($scope.decision.user_id);
            }

            $scope.decision.images = [];
            select2();
        });
    }

    $scope.changeSalary = (change_salary) => {
        if ($scope.decision.type_id != '6') {
            if (change_salary == true || change_salary == 1) {
                $scope.decision.change_salary = false;
                $('.changeSalary').css('display', 'none');
            } else {
                $scope.decision.change_salary = true;
                $('.changeSalary').css('display', 'block');
            }
        }
    }

    $scope.changeSalaryCommitmentBasic = (salary_commitment_basic) => {
        if (salary_commitment_basic == true || salary_commitment_basic == 1) {
            $scope.decision.salary_commitment_basic = false;
        } else {
            $scope.decision.salary_commitment_basic = true;
        }
    }

    $scope.changeSubsidy = (change_subsidy) => {
        if ($scope.decision.type_id != '6') {
            if (change_subsidy == true || change_subsidy == 1) {
                $scope.decision.change_subsidy = false;
                $('.changeSubsidy').css('display', 'none');
            } else {
                $scope.decision.change_subsidy = true;
                $('.changeSubsidy').css('display', 'block');
            }
        }
    }

    $scope.dzOptionsImage = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + '/admin_users/ajax_new_upload_image_user/',
        acceptedFiles: 'image/*',
        dictDefaultMessage: 'Thêm chứng từ'
    };

    $scope.dzOptionsPDF = {
        paramName: 'file',
        maxFilesize: '10',
        resizeWidth: 1200,
        url: base_url + '/admin_users/ajax_new_upload_image_user/',
        acceptedFiles: "image/*,application/pdf",
        dictDefaultMessage: 'Thêm chứng từ'
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

    $scope.addDecission = (status, text) => {
        if (!$scope.decision.user_id) {
            toastr["error"]("Vui lòng chọn nhân viên!");
            return false;
        }

        if (!$scope.decision.date_start) {
            toastr["error"]("Vui lòng nhập ngày áp dụng!");
            return false;
        }

        if ($scope.decision.type_id == 6) {
            if (!$scope.decision.date_end && $scope.radioDateEnd != '4') {
                toastr["error"]("Vui lòng chọn ngày kết thúc!");
                return false;
            }
        }

        if (!$scope.decision.type_id) {
            toastr["error"]("Vui lòng chọn hình thức!");
            return false;
        }

        if (!$scope.decision.code && $scope.decision.type_id != 5) {
            toastr["error"]("Vui lòng nhập Số HĐ - QĐ!");
            return false;
        }

        if ($scope.decision.type_id == 1 || $scope.decision.type_id == 4) {
            if (!$scope.decision.position_id) {
                toastr["error"]("Vui lòng nhập chức danh cũ!");
                return false;
            }

            if (!$scope.decision.level_id) {
                toastr["error"]("Vui lòng chọn level cũ!");
                return false;
            }

            if (!$scope.decision.position_id_new) {
                toastr["error"]("Vui lòng nhập chức danh mới!");
                return false;
            }

            if (!$scope.decision.level_id_new) {
                toastr["error"]("Vui lòng chọn level mới!");
                return false;
            }
        }

        // if ($scope.decision.type_id == 3) {
        if (!$scope.decision.store_id) {
            toastr["error"]("Vui lòng chọn chi nhánh cũ!");
            return false;
        }

        if (!$scope.decision.store_new_id) {
            toastr["error"]("Vui lòng chọn chi nhánh mới!");
            return false;
        }
        // }

        if ($scope.decision.type_id == 2 || $scope.decision.type_id == 5) {
            if ((!$scope.decision.change_salary || $scope.decision.change_salary == false) && !$scope.salary_id) {
                toastr["error"]("Vui lòng chọn cập nhật mức lương!");
                return false;
            }
        }

        if ($scope.decision.type_id != 6 && (!$scope.decision.salary_new || $scope.decision.salary_new == 0) && $scope.decision.change_salary == true && !$scope.salary_id) {
            toastr["error"]("Vui lòng nhập mức lương mới và phải khác 0!");
            return false;
        }

        if ($scope.decision.change_subsidy == true && !$scope.decision.subsidy) {
            toastr["error"]("Vui lòng nhập phụ cấp cũ!");
            return false;
        }

        if ($scope.decision.change_subsidy == true && !$scope.decision.subsidy_new) {
            toastr["error"]("Vui lòng nhập phụ cấp mới!");
            return false;
        }

        if ($scope.salary_id) {
            $scope.decision.salary_id = $scope.salary_id;
        }

        if (text == 'Cập nhật') {
            $scope.decision.status = status;
            $http.post(base_url + "/admin_users/ajax_add_decisions", $scope.decision).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    if (!$scope.decision.id) {
                        $scope.decision = {};
                        $scope.decision.images = [];
                        $scope.salary_id = '';
                        $('.changeSalary').css('display', 'none');
                    }

                    if ($scope.decision.change_salary == 0) {
                        $scope.decision.salary_commitment_basic = 0;
                        $scope.decision.salary_new = 0;
                    }

                    select2();
                } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
            })
        } else {
            if ($scope.action_type) {
                $scope.decision.id = '';
            }

            swal({
                title: text,
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: false,
                confirmButtonColor: '#f39c12',
                showLoaderOnConfirm: true
            }, function () {
                $scope.decision.status = status;
                $http.post(base_url + "/admin_users/ajax_add_decisions", $scope.decision).then(r => {
                    if (r.data && r.data.status == 1) {
                        swal("Thông báo", r.data.message, "success");
                        if (!$scope.decision.id) {
                            $scope.decision = {};
                            $scope.decision.images = [];
                            $scope.salary_id = '';
                            $('.changeSalary').css('display', 'none');
                        }

                        if (r.data.decision_id) {
                            location.replace(base_url + 'admin_users/decision_detail?id=' + r.data.decision_id)
                        }

                        select2();
                    } else swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                })
            });
        }
    }

    $scope.showCancelDecisionModal = (id) => {
        swal({
            title: "Bạn có chắc",
            text: "Bạn không thể hoàn nguyên điều này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Xác nhận",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            var data = {
                decision_id: id
            }
            $http.post(base_url + '/admin_users/ajax_cancel_decision/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $scope.decision.status = 3;
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.showPrintDecisionModal = () => {
        $scope.from_id = '';
        $scope.from_position = '';
        $scope.decision.type_print = '4';
        if (!$scope.decision.code && $scope.decision.type_id != 5) {
            toastr["error"]("Vui lòng nhập Số HĐ - QĐ!");
            return false;
        }
        $('#printDecisionModal').modal('show');
        select2();
    }

    $scope.changeFromId = () => {
        let user = $scope.allUsersPrint.find(r => { return r.id == $scope.from_id });

        $http.get(base_url + '/admin_users/ajax_get_user_position?id=' + user.id).then(r => {
            if (r.data.status == 1) {
                $scope.from_position = r.data.position;
                select2();
            }
        });
    }

    $scope.printDecision = () => {
        if (!$scope.from_id) {
            toastr["error"]("Vui lòng chọn đề xuất từ ai!");
            return false;
        }

        if (!$scope.from_position) {
            toastr["error"]("Vui lòng nhập chức danh người đề xuất!");
            return false;
        }

        if (!$scope.decision.type_print) {
            toastr["error"]("Vui lòng chọn mẫu!");
            return false;
        }

        let user = $scope.allUsersPrint.find(r => { return r.id == $scope.from_id });

        let link = base_url + 'admin_users/decision_detail_print?';
        link += 'user_id=' + $scope.decision.user_id;
        link += '&type_id=' + $scope.decision.type_id;
        link += '&code=' + $scope.decision.code;
        link += '&date_start=' + $scope.decision.date_start;
        link += '&date_end=' + $scope.decision.date_end;
        if ($scope.decision.position) {
            let position = $scope.decision.position.split(" ");
            for (let i = 0; i < position.length; i++) {
                position[i] = position[i][0].toUpperCase() + position[i].substr(1);
            }
            let text_position = position.toString();
            link += '&position=' + text_position.replaceAll(',', ' ');
        }

        if ($scope.decision.position_new) {
            let position_new = $scope.decision.position_new.split(" ");
            for (let i = 0; i < position_new.length; i++) {
                position_new[i] = position_new[i][0].toUpperCase() + position_new[i].substr(1);
            }
            let text_position_new = position_new.toString();
            link += '&position_new=' + text_position_new.replaceAll(',', ' ');
        }

        if ($scope.decision.store_id) {
            link += '&store_id=' + $scope.decision.store_id;
        }

        if ($scope.decision.store_new_id) {
            link += '&store_new_id=' + $scope.decision.store_new_id;
        }

        if ($scope.decision.salary) {
            link += '&salary=' + $scope.decision.salary.replaceAll(',', '.');
        }

        if ($scope.decision.salary_new) {
            link += '&salary_new=' + $scope.decision.salary_new.replaceAll(',', '.');
        }

        if ($scope.decision.subsidy) {
            link += '&subsidy=' + $scope.decision.subsidy.replaceAll(',', '.');
        }

        if ($scope.decision.subsidy_new) {
            link += '&subsidy_new=' + $scope.decision.subsidy_new.replaceAll(',', '.');
        }

        if ($scope.decision.change_salary) {
            link += '&change_salary=' + $scope.decision.change_salary;
        }

        if ($scope.decision.salary_commitment_basic == true) {
            link += '&commitmentBasic=1';
        }

        if ($scope.decision.type_id == 6) {
            link += '&insurance=' + $scope.decision.insurance;
            link += '&insurance_premium=' + $scope.decision.insurance_premium.replaceAll(',', '.');
        }

        if ($scope.decision.level_name) {
            link += '&level_name=' + $scope.decision.level_name;
        }

        if ($scope.decision.level_name_new) {
            link += '&level_name_new=' + $scope.decision.level_name_new;
        }

        if (user) {
            let from_position = $scope.from_position.split(" ");
            for (let i = 0; i < from_position.length; i++) {
                from_position[i] = from_position[i][0].toUpperCase() + from_position[i].substr(1);
            }
            let from_position_name = from_position.toString();
            link += '&from_name=' + user.user_name;
            link += '&from_position_name=' + from_position_name.replaceAll(',', ' ');
        }

        link += '&type_print=' + $scope.decision.type_print;
        window.open(link);
        $('#printDecisionModal').modal('hide');
    }

    $scope.changeRadioCode = () => {
        let current_year = new Date().getFullYear()
        var codeDNG = '';
        var codeCENTER = '';
        var codeSACA = '';
        var codeNTĐN = '';
        var codeTGLĐ = '';
        if ($scope.decision.type_id == 6) {
            codeDNG = "-" + current_year + "/HĐLĐ-DNG";
            codeCENTER = "-" + current_year + "/HĐLĐ-CENTER";
            codeSACA = "-" + current_year + "/HĐLĐ-SACA";
            codeNTĐN = "-" + current_year + "/HĐLĐ-NTĐN";
            codeTGLĐ = "-" + current_year + "/HĐLĐ-TGLĐ";
        } else {
            codeDNG = "-" + current_year + "/QĐ-DNG";
            codeCENTER = "-" + current_year + "/QĐ-CENTER";
            codeSACA = "-" + current_year + "/QĐ-SACA";
            codeNTĐN = "-" + current_year + "/QĐ-NTĐN";
            codeTGLĐ = "-" + current_year + "/QĐ-TGLĐ";
        }

        if ($scope.decision.code) {
            var code = "";
            code = $scope.decision.code.replace(codeDNG, "");
            code = code.replace(codeCENTER, "");
            code = code.replace(codeSACA, "");
            code = code.replace(codeNTĐN, "");
            code = code.replace(codeTGLĐ, "");

            switch ($scope.radioCode) {
                case ('1'):
                    $scope.decision.code = code + codeDNG;
                    break;
                case ('4'):
                    $scope.decision.code = code + codeDNG;
                    break;
                case '2':
                    $scope.decision.code = code + codeCENTER;
                    break;
                case '3':
                    $scope.decision.code = code + codeSACA;
                    break;
                case '5':
                    $scope.decision.code = code + codeNTĐN;
                    break;
                case '6':
                    $scope.decision.code = code + codeTGLĐ;
                    break;
            }
        } else {
            switch ($scope.radioCode) {
                case ('1'):
                    $scope.decision.code = codeDNG;
                    break;
                case ('4'):
                    $scope.decision.code = codeDNG;
                    break;
                case '2':
                    $scope.decision.code = codeCENTER;
                    break;
                case '3':
                    $scope.decision.code = codeSACA;
                    break;
                case '5':
                    $scope.decision.code = codeNTĐN;
                    break;
                case '6':
                    $scope.decision.code = codeTGLĐ;
                    break;
            }
        }

        let type_id = '';
        if ($scope.decision.type_id) {
            type_id = '&type_id=' + $scope.decision.type_id;
        }
        $http.get(base_url + '/admin_users/ajax_get_new_code_decision?radioCode=' + $scope.radioCode + type_id).then(r => {
            if (r.data.status == 1) {
                $scope.decision_code = r.data.data;
            }
        });
    }

    $scope.showSendProfile = (decision) => {
        $scope.imagesProfile = decision.images;
        $scope.selectedIdSendProfile = '';
        $scope.sendTypeName = decision.type_name;
        $scope.sendGroupName = decision.group_name;
        $scope.sendStoreName = decision.store_name;
        $scope.sendUserName = decision.user_name;
        $scope.sendUserId = decision.user_id;
        select2();
        $('#sendProfileModal').modal('show');
    }

    $scope.sendProfile = () => {
        if ($scope.selectedIdSendProfile.length == 0) {
            toastr["error"]("Vui lòng chọn người gửi!");
            return false;
        }

        if ($scope.imagesProfile.length == 0) {
            toastr["error"]("Chưa có chứng từ để gửi!");
            return false;
        }

        swal({
            title: "Bạn có chắc",
            text: "muốn gửi chứng từ cho những người đã chọn!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            confirmButtonText: "Xác nhận",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $scope.loadSubmit = true;
            var data = {
                listId: $scope.selectedIdSendProfile,
                listImg: $scope.imagesProfile,
                type_name: $scope.sendTypeName,
                group_name: $scope.sendGroupName,
                store_name: $scope.sendStoreName,
                user_name: $scope.sendUserName,
                user_id: $scope.sendUserId
            }
            $http.post(base_url + '/admin_users/ajax_send_profile/', data).then(r => {
                if (r.data && r.data.status == 1) {
                    swal("Thông báo", r.data.message, "success");
                    $('#sendProfileModal').modal('hide');
                } else {
                    swal("Thông báo", r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra. Vui lòng thử lại!", "error");
                }
                $scope.loadSubmit = false;
            });
        });
    }

    $scope.changeType = (id) => {
        let type = $scope.types.find(r => { return r.id == id });
        $scope.decision.title = type.name;
        $scope.decision.code = '';
        $scope.radioCode = '';
        if (id == 6) {
            $('.changeSalary').css('display', 'block');
        } else if ($scope.decision.change_salary == 1) {
            $('.changeSalary').css('display', 'block');
        } else {
            $('.changeSalary').css('display', 'none');
        }

        if (id == 6) {
            $('.changeSubsidy').css('display', 'block');
        } else if ($scope.decision.change_subsidy == 1) {
            $('.changeSubsidy').css('display', 'block');
        } else {
            $('.changeSubsidy').css('display', 'none');
        }
    }

    $scope.getImage = (img, type) => {
        if (type) {
            return base_url + '/assets/uploads/staffs/' + img;
        }
        return base_url + '/' + img;
    }

    $scope.viewImg = (imgs) => {
        // $scope.currentImageUrl = base_url + 'assets/uploads/staffs/' + imgs;
        $scope.currentImageUrl = imgs;
        $('#imagesview').modal('show');
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

    $scope.numberWithCommas = (x) => {
        x = x.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(x))
            x = x.replace(pattern, "$1,$2");
        return x;
    }

    $scope.changeDateStart = () => {
        if ($scope.radioDateEnd && $scope.radioDateEnd != '4') {
            let date_start = $scope.decision.date_start;

            let year = date_start.slice(6);
            let day = date_start.slice(0, 2);
            let month = date_start.slice(3, 5);

            let year_end = (parseInt(year) + parseInt($scope.radioDateEnd)) + '-' + month + '-' + day;

            var tomorrow = new Date(year_end.toString());
            tomorrow.setDate(tomorrow.getDate() - 1); // thêm 1 ngày cho ngày kết thúc

            let monthEnd = (tomorrow.getMonth() + 1) + '';
            let dayEnd = tomorrow.getDate();
            let yearEnd = tomorrow.getFullYear();

            if (monthEnd.length == 1) {
                monthEnd = '0' + monthEnd;
            }

            let newdate = dayEnd + "-" + monthEnd + "-" + yearEnd;

            $scope.decision.date_end = newdate;
        }
    }

    $scope.changeRadioDateEnd = () => {
        if ($scope.decision.date_start == undefined && $scope.radioDateEnd != '4') {
            toastr["error"]("Vui lòng chọn ngày áp dụng!");
        } else if ($scope.radioDateEnd != '4') {
            let date_start = $scope.decision.date_start;

            let year = date_start.slice(6);
            let day = date_start.slice(0, 2);
            let month = date_start.slice(3, 5);

            let year_end = (parseInt(year) + parseInt($scope.radioDateEnd)) + '-' + month + '-' + day;

            var tomorrow = new Date(year_end.toString());
            tomorrow.setDate(tomorrow.getDate() - 1); // thêm 1 ngày cho ngày kết thúc

            let monthEnd = (tomorrow.getMonth() + 1) + '';
            let dayEnd = tomorrow.getDate();
            let yearEnd = tomorrow.getFullYear();

            if (monthEnd.length == 1) {
                monthEnd = '0' + monthEnd;
            }

            let newdate = dayEnd + "-" + monthEnd + "-" + yearEnd;
            $scope.decision.date_end = newdate;
        } else if ($scope.radioDateEnd == '4') {
            $scope.decision.date_end = '';
        }
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 1000)
    }

    $scope.format_date = (date, type) => {
        return moment(date).format(type);
    }

    $scope.showPDF = (url) => {
        window.open(url, '_blank');
    }
})
