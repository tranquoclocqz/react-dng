app.controller('addUserCtrl', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.user = {};
        $scope.user.images = [];
        $scope.isStep = 1;
        $scope.groups = [];
        $scope.images = [];
        $scope.getStatusUser();
        $scope.positions = [];
        $scope.getAllPosition();
        $scope.userId = userId;
        $scope.ls_company = ls_company;
        $scope.admin_stores = {};
        $scope.interviewId = interviewId;
        $scope.loadLevel();
        $scope.loadDegrees();
        if ($scope.interviewId > 0 && $scope.userId == 0) getInterview();
        if ($scope.userId > 0 && $scope.interviewId == 0) getUser();
        $scope.is_loading = true;
    }

    function getInterview() {
        $http.get(base_url + '/user_interviews/ajax_get_interview_detail?id=' + $scope.interviewId).then(r => {
            if (r.data.status == 1) {
                $scope.is_loading = false;
                $scope.user = r.data.data;
                $scope.user.images.forEach((e, key) => {
                   $scope.user.images[key].file = e.url;
                });
                $scope.user.status = $scope.user.type_id;
                $scope.user.groups = [$scope.user.group_id];
                $scope.user.stores = [$scope.user.store_id];
                $scope.user.main_group_id = $scope.user.group_id;
                $scope.user.main_store_id = $scope.user.store_id;
                $scope.user.username = $scope.user.phone;
                $scope.user.birthday = $scope.user.birthday && $scope.user.birthday != "0000-00-00" ? moment($scope.user.birthday).format("DD-MM-YYYY") : '';
                $scope.user.id_date = $scope.user.id_date && $scope.user.id_date != "0000-00-00" ? moment($scope.user.id_date).format("DD-MM-YYYY") : '';
                $scope.user.date_start = $scope.user.date_start && $scope.user.date_start != "0000-00-00" ? $scope.user.date_start : '';
                $scope.user.date_expires = $scope.user.date_expires && $scope.user.date_expires != "0000-00-00" ? moment($scope.user.date_expires).format("DD-MM-YYYY") : '';
                $scope.user.salary = formatCurrency($scope.user.salary);
                $scope.user.subsidy = formatCurrency($scope.user.subsidy);
                $scope.user.level_id = '1';
                $scope.changeGroups();
                $scope.changeNation();
                $scope.changeProvice();
                $scope.changeCompany($scope.user.company_id);
                setTimeout(() => {
                    $('.select2').select2();
                }, 1000);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    function getUser() {
        $http.get(base_url + '/admin_users/ajax_get_user_detail?id=' + $scope.userId).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.is_loading = false;
                $scope.user = r.data.data;
                $scope.changeNation();
                $scope.changeProvice();
                $scope.changeGroups();
                setTimeout(() => {
                    $('.select2').select2();
                }, 2000);
            }
        })
    }

    $scope.doNext = (val) => {
        $scope.isStep = val;
    }

    $scope.doChange = (val) => {
        if ($scope.isStep > val) {
            $scope.isStep = val;
        }
    }

    $scope.changeNation = () => {
        $http.get(base_url + '/admin_users/ajax_get_provinces?nation_id=' + $scope.user.nation_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
                setTimeout(() => {
                    $('.select2').select2();
                }, 200);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.changeProvice = () => {
        $http.get(base_url + '/admin_users/ajax_get_district/?province_id=' + $scope.user.province_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.districts = r.data.data;
                setTimeout(() => {
                    $('.select2').select2();
                }, 200);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.changeGroups = () => {
        $http.get(base_url + '/admin_users/ajax_get_groups?filter=' + JSON.stringify($scope.user.groups)).then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                $('.select2').select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStatusUser = () => {
        $http.get(base_url + '/admin_users/ajax_get_status_user?type=2').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.userStatus = r.data.data;
            }
        })
    }

    $scope.getAllPosition = () => {
        $http.get(base_url + '/admin_users/ajax_get_all_positions').then(r => {
            if (r.data.status == 1) {
                $scope.positions = r.data.data;
            }
        });
    }

    $scope.saveUser = () => {
        $scope.isLoad = true;
        $scope.user.interview_id = $scope.interviewId;
        $http.post(base_url + '/admin_users/ajax_create_user', $scope.user).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.isLoad = false;
                $scope.doChange(1);
                $scope.user = {};
                $scope.user.images = [];
                toastr["success"]("Tạo thành công!");
                $('.select2').select2();
                $('#addInterview').modal('hide');
            } else {
                toastr["error"](r.data && r.data.status != 1 ? r.data.message : "Đã có lỗi xẩy ra!")
                $scope.isLoad = false;
            };
        });
    }

    $scope.changeCompany = (id) => {
        $http.get(base_url + '/user_interviews/get_list_store_by_company_id?id=' + id).then(r => {
            if (r.data.status == 1) {
                $scope.admin_stores = r.data.data;
                select2();
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    ///----IMAGE ---------------

    $scope.attachFile = () => {
        $('#inputImgOrder').click();
    }

    $scope.showImg = (url) => {
        $scope.currImg = url;
    }

    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files)

    }

    $scope.imageIsLoaded = function (e) {
        if ($scope.images.length == 0) {
            $scope.images.push(e.target.result);
        } else {
            $scope.images[0] = e.target.result;
        }
    }

    $scope.saveImage = (files) => {
        for (var x = 0; x < files.length; x++) {
            var formData = new FormData();
            formData.append('file', files[x]);
            $http({
                url: base_url + '/admin_users/ajax_new_upload_image_user',
                method: "POST",
                data: formData,
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data.status == 1) {
                    $scope.user.images.push({
                        file: r.data.data.file,
                        url: r.data.data.url,
                        type: 1,
                        name: 'Chứng từ ' + ($scope.user.images.length + 1)
                    });
                    console.log($scope.user);

                } else {
                    toastr["error"](r.data.message)
                }
            })
        }
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

    $scope.loadDegrees = () => {
        $http.get(base_url + '/admin_users/ajax_get_degree_users').then(r => {
            if (r.data.status == 1) {
                $scope.degrees = r.data.data;
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.openFile = (url) => {
        window.open(base_url + url, '_blank')
    }

    $scope.removeImage = (url, index) => {
        $scope.user.images.splice(index, 1);
    }

    $scope.getImg = (img) => {
        return base_url + img;
    }

    $scope.checkkey = (event) => {
        var keys = {
            'up': 38,
            'right': 39,
            'down': 40,
            'left': 37,
            'escape': 27,
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'del': 46,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'dash': 189,
            'subtract': 109
        };

        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    }

    function formatCurrency(val) {
        if (val && val != '') {
            val = val + '';
            val = val.replace(/,/g, "")
            val += '';
            let x = val.split('.');
            let x1 = x[0];
            let x2 = x.length > 1 ? '.' + x[1] : '';

            var rgx = /(\d+)(\d{3})/;

            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;

        } else {
            return '';
        }
    }

    function formatNumber(value) {
        if (value && value != '') {
            return Number((value + '').replace(/,/g, ""));
        } else {
            return 0;
        }
    }

    $scope.formatSalary = () => {
        if ($scope.user.salary && $scope.user.salary != '') {
            $scope.user.salary = formatCurrency($scope.user.salary);
        } else {
            $scope.user.salary = '';
        }
    }

    $scope.formatSubsidy = () => {
        if ($scope.user.subsidy && $scope.user.subsidy != '') {
            $scope.user.subsidy = formatCurrency($scope.user.subsidy);
        } else {
            $scope.user.subsidy = '';
        }
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }
    
    $scope.getCheckNumber = (e) => {
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            e.preventDefault();
        }
    }
})