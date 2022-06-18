app.controller('partner_list', function ($scope, $sce, $http, $compile) {
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
        $scope.dateInputInit();
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.countPrice = (val1, val2) => {
        return Number(val1) + Number(val2);
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
    $scope.object_generating = () => {
        $scope.filter = {};
        $scope.filter.user = '0';
        $scope.filter.ctv_type = '0';
        $scope.filter.care_status = '0';
        $scope.filter.ref = '0';
        $scope.filter.sort = 'newest';
        $scope.filter.limit_view = 15;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.detail = {};
        $scope.districts = [];
        $scope.provinces = [];
        $scope.filter.consultant = '0';
        $scope.customSearch = false;

        $scope.new_partner_note = {}
        $scope.new_partner_note.source = '0';
    }

    $scope.create_partner_before_note = () => {
        $http.post(base_url + 'share_beauty/api_create_partner_before_note', $scope.new_partner_note).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"](r.data.messages);
                $scope.new_partner_note = {}
                $scope.new_partner_note.source = '0';
            } else toastr["error"](r.data.messages);
        })
    }

    $scope.getAll = (reload = 0) => {
        if (reload == 0) {
            $scope.pagingInfo.currentPage = 1;
            $scope.pagingInfo.offset = 0;
            $scope.filter.offset = 0;
        }
        $('.table-responsive').addClass('loading');
        $http.get(base_url + 'share_beauty/ajax_get_partner_list?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $('.table-responsive').removeClass('loading');
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                setTimeout(() => {
                    select2_reset();
                }, 50);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    document.addEventListener("click", function (event) {
        if (event.target.closest(".customSearch")) return;
        $scope.$apply(function () {
            $scope.customSearch = false;
        });
    });


    $scope.set_sb_telesale_partners = (customer, telesales) => {
        var data = {
            'customer_id': customer,
            'telesales': telesales
        }
        $http.post(base_url + 'share_beauty/api_set_telesale_partners', data).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Đã thay đổi!");
            } else toastr["error"](r.data.messages);
        })
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
                // $scope.detail.birthday = new Date(r.data.data.birthday);
                // $scope.detail.cmnd_provide_date = new Date(r.data.data.cmnd_provide_date);
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
            url: base_url + '/uploads/ajax_upload_to_filehost?func=sharebeauty_partner_list',
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
        $http.post(base_url + 'share_beauty/editCustomers', item).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]('Đã cập nhật!.');
                $('#detailModal').modal('hide');
            } else toastr["error"](r.data.message);
        })
    }

    function resetDatePicker() {
        $('input.date-range-picker').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            minYear: 1901,
            maxYear: parseInt(moment().format('YYYY'), 10),
            locale: {
                format: 'DD/MM/YYYY'
            }
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
        $scope.getAll(1);
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

                $scope.detail.files = (r.data.data.files) ? r.data.data.files : [];

                delete $scope.detail.password;
                $scope.getDistict(r.data.data.province_id);


                $('#detailModal').modal('show');
                setTimeout(() => {
                    $('.select2').select2();
                    resetDatePicker();
                }, 200);
            } else toastr["error"](r.data.message);
        })
    }
    $scope.edit_sb_care_note = (id, sb_care_note) => {
        var data = {};
        data.id = id;
        data.sb_care_note = sb_care_note;
        $http.post(base_url + 'share_beauty/ajax_edit_sb_care_note', data).then(r => {
            if (r && r.data.status == 1) {
                console.log('Edited');
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
    $scope.invoicesDetail = (customer_id) => {
        $http.get(base_url + 'share_beauty/ajax_get_invoice_detail/' + customer_id).then(r => {
            if (r && r.data.status == 1) {
                $scope.invoice_detail = r.data.data;
            } else toastr["error"](r.data.message);
        })
    }
    $scope.customSearchReset = () => {
        delete $scope.filter.start_date;
        delete $scope.filter.end_date;
        $scope.filter.ref = '0';

        setTimeout(() => {
            select2_reset();
        }, 50);
    }
    $scope.dateInputInit = () => {
        $('input[name="daterange"]').daterangepicker({
            singleDatePicker: true,
            // showDropdowns: true,
            // autoUpdateInput: false,
            minYear: 2000,
            maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            locale: {
                format: 'DD/MM/YYYY',
                cancelLabel: 'Clear'
            }
        });
    }

    function getCurrentDate() {
        var currentDate = new Date()
        var day = currentDate.getDate()
        var month = currentDate.getMonth() + 1
        var year = currentDate.getFullYear()
        return day + "/" + month + "/" + year;
    }

    function getOneYearAgo() {
        var currentDate = new Date()
        var day = currentDate.getDate()
        var month = currentDate.getMonth() + 1
        var year = currentDate.getFullYear() - 1
        return day + "/" + month + "/" + year;
    }

    $scope.loginAccess = (item) => {
        var data = {
            'id': item.id,
            'phone': item.phone
        }
        $http.post(base_url + 'share_beauty/api_partner_login_access', data).then(r => {
            if (r && r.data.status == 1) {
                window.open(r.data.url, '_blank');
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.change_care_status = (item) => {
        var data = {
            'customer_id': item.id,
            'no_answer_status': item.no_answer_status
        }
        $http.post(base_url + 'share_beauty/api_change_care_status', data).then(r => {
            if (r && r.data.status == 1) {
                console.log(r.data.message);
            } else toastr["error"](r.data.messages);
        })
    }
});