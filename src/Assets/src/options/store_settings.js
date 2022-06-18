app.controller('store_settings', function ($scope, $http, $compile, $filter) {
    var orderBy = $filter('orderBy');
    var pi = $scope.pagingInfo = {
        itemsPerPage: 40,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.pagingInfo.currentPage = page;
        $scope.get_list_stores();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page) {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }



    $scope.init = () => {
        $scope.province_id = '';
        $scope.nation_id = '';
        $scope.get_list_nations();
        $scope.get_list_provinces('');
        $scope.get_list_system_provinces('');
        $scope.get_list_stores();
        $scope.get_group_name();
        $scope.get_list_region();
        $scope.open = 1;
        $scope.disabled_btn_ = false;
        $scope.disabled_btn1_ = false;
        $scope.btn_show_back = false;
        // $scope.check_user_edit_store();
        $('.list-stores-tb').css('opacity', '1');
        $scope.base_url = base_url;

    }

    $scope.getRange = function (paging) {
        $scope.style_name = ["", "Spa", "Thẩm mỹ", "Spa và Thẩm mỹ"];
        $scope.cap_quyen_user = '';
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }

    $scope.get_warehouses = () => {
        $http.post(base_url + '/options/get_warehouses_by_id', JSON.stringify({
            'store_id': $scope.val_edit_store.id
        })).then(r => {
            if (r && r.data.status == 1) {
                $scope.warehouse = r.data.data;
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.delete_store_group = (item) => {
        var index = $scope.warehouse.indexOf(item);
        $scope.warehouse.splice(index, 1);
    }

    $scope.them_kho_chichanh = () => {
        event.preventDefault();
        let data = {
            'name': $scope.val_edit_store.description,
            'phone': '',
            'address': $scope.val_edit_store.address,
            'active': 1,
            'store_id': $scope.val_edit_store.id ? $scope.val_edit_store.id : 0,
            'type': 'BRANCH'
        };
        swal({
            title: "Bạn có chắc",
            text: "Bạn không thể Xóa kho sau khi thêm!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            setTimeout(() => {
                if ($scope.val_edit_store.id > 0) {
                    $http.post(base_url + '/options/insert_warehouses', JSON.stringify(data)).then(r => {
                        if (r && r.data.status == 1) {
                            toastr['success'](r.data.message);
                            $scope.get_warehouses();
                        } else toastr["error"](r.data.message);
                    });

                } else {
                    // $scope.inset_warehouse(data);
                    $scope.warehouse = [...$scope.warehouse, data];
                    $scope.$apply();
                }
                swal("Thông báo!", 'Thêm thành công!', "success");

            }, 100);
        });

    }

    $scope.inset_warehouse = data => {
        $http.post(base_url + '/options/insert_warehouses', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr['success'](r.data.message);
                // $scope.get_list_stores();
            } else toastr["error"](r.data.message);
        });
    }

    $scope.chang_active_st_switch = (val) => {
        val.active = val.active == '0' ? 1 : 0;
    }

    $scope.changeView = (val, state) => {
        $scope.open = val;
    }

    $scope.chechk_tyle = (i, item) => {
        if (($scope.val_edit_store.appointment_percent_allow) > 100 && i == 3) {
            $scope.val_edit_store.appointment_percent_allow = 100;
            toastr["error"]("Tỷ lệ đặt lịch phải Nhỏ hơn 100");
        }
        if (($scope.val_edit_store.home_per_day) > 20 && i == 2) {
            $scope.val_edit_store.home_per_day = 20;
            toastr["error"]("Số người Được nghỉ quá lớn");
        }

        if (i == 4 && item.minutes > 1000) {
            item.minutes = 1000;
            toastr["error"]("Thời gian về sớm vượt quá quy định");
        }
        if ((item.home_per_week) > 25 && i == 5) {
            item.home_per_week = 25;
            toastr["error"]("Số lân về sớm vượt quá quy định");
        }
    }

    $scope.decode_json_ = (data) => {
        $scope.schedule = JSON.parse('[' + data + ']')
    }

    $scope.delete_user_group = (item) => {
        var index = $scope.schedule.indexOf(item);
        $scope.schedule.splice(index, 1);
    }

    $scope.add_group_id = () => {
        event.preventDefault();
        if (($scope.id_groups_user) == '' || !$scope.id_groups_user) {
            toastr["error"]("Cần chọn bộ phận!");
            return;
        } else {
            var flag = true;
            angular.forEach($scope.schedule, function (value, key) {
                if (value.group_id == $scope.id_groups_user) {
                    toastr["error"]("Đã tồn tại!");
                    flag = false;
                    return false;
                }
            });
            if (flag) {
                $scope.add_time_group = {
                    'group_id': parseInt($scope.id_groups_user),
                    'minutes': 90,
                    'home_per_week': 2,
                    'description_grop': $scope.list_groups[$scope.id_groups_user],
                }
                $scope.schedule.push($scope.add_time_group);
            }
        }
    }

    $scope.add_idaddres = function () {
        if ($scope.new_idaddress)
            $scope.list_idaddres.push($scope.new_idaddress);
        $scope.new_idaddress = ''
    }

    $scope.delete_idaddres = (index) => {
        $scope.list_idaddres.splice(index, 1);
    }

    $scope.get_list_stores_byna = () => {
        $scope.province_id = '';
        $scope.get_list_stores();
        select2();
    }

    $scope.backtoaddstore = () => {
        $scope.open = 1;
        $scope.disabled_btn_ = false;
        $scope.disabled_btn1_ = true;
        $scope.btn_show_back = false;
        $scope.btn_submit.text = 'Tiếp tục';
    }

    $scope.btn_add_stores = () => {
        $scope.changeView(1, true);
        $scope.schedule = [];
        $scope.warehouse = []
        $scope.btn_submit = {
            'id': 0,
            'btn': 'add-store',
            'text': 'Tiếp tục'
        }
        $scope.backtoaddstore();
        $scope.list_idaddres = [];
        $scope.data_local = [];
        $scope.val_edit_store = {
            'active': 1,
            'appointment_percent_allow': 70,
            'home_per_day': 1,
            'under_construction': 0,
            'closed_from': '',
            'closed_to': '',
            'closed_note': '',
            'start_hour': '00',
            'start_minute': '00',
            'end_hour': '00',
            'end_minute': '00',
            'closed_type': '0',
            'admin_region_id': '0'
        };
        $('.datepickerDate').datepicker({
            dateFormat: "dd-mm-yy"
        });
        select2();
        $('#modalstores').modal('show');
    }
    $scope.edit_store = (val) => {
        $scope.disabled_btn_ = false;
        $scope.disabled_btn1_ = false;
        event.preventDefault();
        // $scope.changeView(2, true);
        $scope.disabled_btn_ = false;

        $scope.decode_json_(val.schedule);
        $scope.btn_submit = {
            'id': 1,
            'btn': 'update-store',
            'text': 'Cập nhật Store'
        }
        $scope.provinces1 = angular.copy($scope.provinces);
        $scope.val_edit_store = angular.copy(val);
        $scope.get_warehouses();
        select2();
        $('.datepickerDate').datepicker({
            dateFormat: "dd-mm-yy"
        });
        $scope.list_idaddres = $scope.val_edit_store.ipaddress.split(",");
        $('#modalstores').modal('show');
        // $scope.get_longitude_latitude($scope.val_edit_store.map_url);
    }

    $scope.saveInformationSchedule = () => {
        if ($scope.val_edit_store.closed_type != '0') {
            if ($scope.val_edit_store.closed_from == '') {
                return toastr["error"]('Vui lòng chọn ngày bắt đầu đóng cửa');
            }
            if ($scope.val_edit_store.closed_to == '') {
                return toastr["error"]('Vui lòng chọn ngày mở cửa lại');
            }
            if ($scope.val_edit_store.closed_note == '' || $scope.val_edit_store.closed_note == null) {
                return toastr["error"]('Lý do đóng cửa');
            }
        }

        if ($scope.btn_submit.id == 0)
            $('.submit_tab_1').click();
        else {
            $scope.update_store($scope.get_data_store());
        }
    }

    $scope.val_date = () => {
        if ($scope.val_edit_store.closed_type == '0') {
            $scope.val_edit_store.closed_from = '';
            $scope.val_edit_store.closed_to = '';
            $scope.val_edit_store.start_hour = '00';
            $scope.val_edit_store.start_minute = '00';
            $scope.val_edit_store.end_hour = '00';
            $scope.val_edit_store.end_minute = '00';
        }
    }

    $scope.saveInformationStore = () => {
        if ($scope.open == 2) {
            $('.submit_tab_2').click();
        } else {
            $scope.open = 2;
            $scope.disabled_btn_ = true;
            $scope.disabled_btn1_ = false;
            $scope.btn_submit.text = 'Lưu Store';
            $scope.btn_show_back = true;
        }
    }

    $scope.saveInformationSchedule_ = () => {
        var data = $scope.get_data_store();
        $scope.add_store(data);
    }

    $scope.get_data_store = () => {
        $scope.data = {
            arr1: {
                'id': $scope.val_edit_store.id,
                'name': $scope.val_edit_store.name,
                'description': $scope.val_edit_store.description,
                'fullname': $scope.val_edit_store.fullname,
                'address': $scope.val_edit_store.address,
                'latitude_gps': $scope.val_edit_store.latitude_gps,
                'longitude_gps': $scope.val_edit_store.longitude_gps,
                'ipaddress': $scope.list_idaddres.toString(),
                'map_url': $scope.val_edit_store.map_url,
                'area_id': $scope.val_edit_store.provinces,
                'province_id': $scope.val_edit_store.provinces_id1,
                'nation_id': $scope.val_edit_store.nation_id,
                'under_construction': $scope.val_edit_store.under_construction,
                'store_image': $scope.val_edit_store.store_image,
                'appointment_percent_allow': $scope.val_edit_store.appointment_percent_allow,
                'home_per_day': $scope.val_edit_store.home_per_day,
                'active': $scope.val_edit_store.active,
                'store_type': $scope.val_edit_store.store_type,
                'admin_region_id': $scope.val_edit_store.admin_region_id
            },
            arr2: $scope.schedule,
            arr3: angular.copy($scope.warehouse),
            arr4: {
                'closed_from': $scope.val_edit_store.closed_from,
                'closed_to': $scope.val_edit_store.closed_to,
                'start_hour': $scope.val_edit_store.start_hour,
                'start_minute': $scope.val_edit_store.start_minute,
                'end_hour': $scope.val_edit_store.end_hour,
                'end_minute': $scope.val_edit_store.end_minute,
                'closed_type': $scope.val_edit_store.closed_type,
                'closed_note': $scope.val_edit_store.closed_note
            }
        }
        return $scope.data;
    }

    $scope.update_schedule = (data) => {
        $http.post(base_url + '/options/update_schedule2', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr['success'](r.data.message);
                $scope.get_list_stores();
            } else toastr["error"](r.data.message);
        });
    }

    $scope.add_store = (data) => {
        swal({
            title: "Bạn có chắc",
            text: "Bạn không thể hoàn nguyên điều này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + '/options/add_stores', JSON.stringify(data)).then(r => {
                if (r && r.data.status == 1) {
                    $scope.disabled_btn_ = false;
                    $scope.val_edit_store.id = r.data.data;
                    $scope.changeView(2, true);
                    $('#modalstores').modal('hide');
                    $scope.get_list_stores();
                    swal("Thông báo!", 'Thành công!', "success");
                    toastr["success"](r.data.messeger);
                } else toastr["error"](r.data.messeger);
            });
        });

    };

    $scope.update_store = (data) => {
        $http.post(base_url + '/options/update_stores', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.rs = r.data;
                toastr["success"]($scope.rs.messeger);
                $scope.get_list_stores();
                // $('#modalstores').modal('hide');
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    };

    $scope.chang_active_switch = (val) => {
        $scope.val_edit_store.active = val == '0' ? 1 : 0;
    }

    $scope.chang_under_construction_switch = (val) => {
        $scope.val_edit_store.under_construction = val == '0' ? 1 : 0;
    }

    $scope.get_name_kodau = (val) => {
        if (!$scope.val_edit_store.name || $scope.val_edit_store.name == '')
            $scope.val_edit_store.name = $scope.convertViToEn(val);
        if (!$scope.val_edit_store.fullname || $scope.val_edit_store.fullname == '')
            $scope.val_edit_store.fullname = val;
    }

    $scope.update_stores_active = (data) => {
        if (data.id == 0) {}
        var data = {
            'id': data.id,
            'active': data.active == '0' ? 1 : 0
        }
        event.preventDefault();
        swal({
            title: "Bạn có chắc",
            text: "Bạn không thể hoàn nguyên điều này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $http.post(base_url + '/options/update_stores_active', JSON.stringify(data)).then(r => {
                if (r && r.data.status == 1) {
                    $scope.rs = r.data;
                    toastr["success"]($scope.rs.messeger);
                    $scope.get_list_stores();
                    swal("Thông báo!", 'Thành công!', "success");
                    $('#idstores-' + data.id).prop('checked', !$('#idstores-' + data.id).prop('checked'));
                } else {
                    toastr["error"]("Đã có lỗi xảy ra!!!");
                }
            });
        });
    }

    $scope.get_list_nations = () => {
        $http.get(base_url + '/options/get_list_admin_nations', ).then(r => {
            if (r && r.data.status == 1) {
                $scope.nations = r.data.data;
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.get_list_stores = () => {
        var data = {
            nation: $scope.nation_id,
            province: $scope.province_id,
            limit: $scope.pagingInfo.itemsPerPage,
            offset: ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage,
        }
        $http.post(base_url + '/options/get_list_store', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.$watch('nation_id', function (newValues, oldValues) {
        if (oldValues == newValues)
            return false;
        $scope.get_list_provinces($scope.nation_id);
    });

    $scope.chang_provinces_by_na = (id) => {
        if (id == '' || !id) id = '';

        var data = {
            nation_id: id
        };

        $http.post(base_url + '/options/get_list_provinces', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.val_edit_store.provinces = '';
                $scope.provinces1 = r.data.data;
                // toastr["success"]("Đã thay đổi!!!");
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.get_list_provinces = (id) => {
        var data = {
            nation_id: id
        };
        $http.post(base_url + '/options/get_list_provinces', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        });
    }

    $scope.get_list_by_provinces = () => {
        $http.get(base_url + '/options/get_list_stores_sortby_provinces').then(r => {
            if (r.data.status == 1) {
                $scope.list_stores = r.data.data;
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        })
    }

    $scope.get_group_name = () => {
        $http.get(base_url + '/options/get_list_admin_groups').then(r => {
            $scope.list_groups = r.data.data;
        })
    }

    $scope.get_list_system_provinces = () => {
        $http.get(base_url + '/options/get_list_system_provinces').then(r => {
            $scope.system_province = r.data.data;
        })
    }


    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }

    $scope.imageUpload = function (element, type) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files, type)
    }
    $scope.saveImage = (files, type) => {
        var formData = new FormData();
        formData.append('file', files[0]);
        $http({
            url: base_url + 'uploads/ajax_upload_to_filehost?folder=store_setting',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            if (r.data.status == 1) {
                $scope.val_edit_store.store_image = r.data.data[0];
            } else {
                toastr["error"]('T?p không h?p l?!.')
            }
        })
    }

    $scope.clear_img = () => {
        $scope.val_edit_store.store_image = '';
    }

    $scope.convertViToEn = (str, toUpperCase = false) => {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        // Some system encode vietnamese combining accent as individual utf-8 characters
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
        str = str.replaceAll(' ', '')
        return toUpperCase ? str.toUpperCase() : str;
    }

    $scope.get_list_region = () => {
        $http.get(base_url + '/options/ajax_get_list_region').then(r => {
            if (r && r.data.status) {
                $scope.regions = r.data.data;
            } else showMessErr(r.data.message);
        });
    }

});