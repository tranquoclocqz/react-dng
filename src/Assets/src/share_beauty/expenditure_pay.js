app.controller('expenditure_pay', function ($scope, $sce, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };
    $scope.init = () => {
        $scope.object_generating();
        $scope.getAll();
        $scope.getProvince();
    }
    $scope.object_generating = () => {
        $scope.chechboxStatus = true;;

        $scope.filter = {};
        $scope.filter.user = '0';
        $scope.filter.sort = 'newest';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.limit_view = 15;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.detail = {};
        $scope.districts = [];
        $scope.provinces = [];
    }
    $scope.handle_checkboxes = () => {
        $scope.chechboxStatus = !$scope.chechboxStatus;
        $scope.rows.forEach(element => {
            element.selection = $scope.chechboxStatus;
        });
    }
    $scope.exportData = () => {
        var table = $('.table-export');
        if (table && table.length) {
            var preserveColors = (table.hasClass('table2excel_with_colors') ? true : false);
            $(table).table2excel({
                exclude: ".noExl",
                name: "Excel Document Name",
                filename: "Thanh-toan-hoa-hong-ctv" + new Date().toISOString().replace(/[\-\:\.]/g, "") + ".xls",
                fileext: ".xls",
                exclude_img: true,
                exclude_links: true,
                exclude_inputs: true,
                preserveColors: preserveColors
            });
        }
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.countPrice = (val1, val2) => {
        return Number(val1) + Number(val2);
    }
    $scope.confirmRecurringPay = (month, year, type) => {
        $scope.data = {};
        $scope.data.month = month;
        $scope.data.year = year;
        $scope.data.type = type;

        $http.post(base_url + 'share_beauty/ajax_confirmRecurringPay', $scope.data).then(r => {
            if (r.data && r.data.status == 1) {
                window.location.reload();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.gender_convert = (htmlbd) => {

        switch (htmlbd) {
            case '0':
                htmlbd = 'Chưa cập nhật';
                break;
            case '1':
                htmlbd = 'Nữ';
                break;
            case '2':
                htmlbd = 'Nam';
                break;
            case '3':
                htmlbd = 'Khác';
                break;
            default:
                break;
        }
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.getAll = () => {
        $http.get(base_url + 'share_beauty/ajax_get_share_beautys_pay?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.recurringPay = () => {

        var can_go = true;
        for (var i = 0; i < $scope.rows.length; i++) {
            var element = $scope.rows[i];
            if ((element.selection) && (!element.bank_name || !element.bank || !element.bank_number)) {
                can_go = false;
                toastr["error"]("Chưa nhập đầy đủ thông tin chuyển khoản");
                return;
            }
        }
        $http.post(base_url + 'share_beauty/ajax_recurringPay', $scope.rows).then(r => {
            if (r.data && r.data.status == 1) {
                window.location.reload();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.getDistict = (province_id) => {
        $http.get(base_url + 'share_beauty/ajax_get_district/' + province_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.districts = r.data.data;
                setTimeout(() => {
                    select2_reset();
                }, 200);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    function select2_reset() {
        $('.select2').select2();
    }
    $scope.getProvince = () => {
        $http.get(base_url + 'share_beauty/ajax_get_province').then(r => {
            if (r && r.data.status == 1) {
                $scope.provinces = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.opendetail = (item) => {
        $scope.detail = item;
        $scope.detail.files = item.files;
        $scope.getDistict(item.province_id);
        $http.get(base_url + 'share_beauty/ajax_get_user_sb_information/' + item.id).then(r => {
            if (r && r.data.status == 1) {
                $scope.detail = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });

        setTimeout(() => {
            select2_reset();
        }, 200);

    }
    $scope.set_confirm = (id) => {
        $scope.cofirm_id = id;
    }
    $scope.confirmPartner = () => {
        $http.get(base_url + 'share_beauty/ajax_confirm_partner/' + $scope.cofirm_id).then(r => {
            if (r && r.data.status == 1) {
                $('#confirmModal').modal('hide');
                toastr["success"]("Đã duyệt!");
                $scope.request_list = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.refusePartner = () => {
        $http.get(base_url + 'share_beauty/ajax_refuse_partner/' + $scope.cofirm_id).then(r => {
            if (r && r.data.status == 1) {
                $('#refuseModal').modal('hide');
                $scope.request_list = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.attachFile = () => {
        $('#inputFileEdit').click();
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
            url: base_url + '/uploads/ajax_upload_to_filehost?func=share_beauty_expendture_pay',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data.status == 1) {
                if (type == 'create') {
                    $scope.itemAdd.files.push({ url_image: r.data.data[0], filename: r.data.data[0] });
                } else {
                    $scope.detail.files.push({ url_image: r.data.data[0], filename: r.data.data[0] });
                }
            } else {
                toastr["error"]('Tệp không hợp lệ!.')
            }
        })
    }
    $scope.deleteImg = (key, id, a) => {
        if (a == 'create') {
            $scope.itemAdd.files.splice(key, 1);
        } else {
            $scope.detail.files.splice(key, 1);
        }
    }
    $scope.editRequest = (item) => {
        $http.post(base_url + 'share_beauty/ajax_edit_request', item).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]('Đã cập nhật!.')
            } else toastr["error"](r.data.message);
        })
    }


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.loadLsRQAssets();
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
    $scope.openModel = (id, type) => {
        $http.get(base_url + 'share_beauty/ajax_get_partner_detail/' + id).then(r => {
            if (r && r.data.status == 1) {
                $scope.detail = r.data.data;
                $('#detailModal').modal('show');
            } else toastr["error"](r.data.message);
        })
    }
    $scope.setDefaultBonus = () => {
        $http.get(base_url + 'share_beauty/ajax_set_default_bonus/' + $scope.detail.customer_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.detail = r.data.data;
            } else toastr["error"](r.data.message);
        })
    }
});