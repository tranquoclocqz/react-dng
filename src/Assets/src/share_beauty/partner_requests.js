app.controller('partner_requests', function ($scope, $sce, $http, $compile) {
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
        $scope.get_request_list();
        $scope.getProvince();
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
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
        $scope.filter.is_partner = '0';
        $scope.filter.sort = 'newest';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.limit_view = 15;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.detail = {};
        $scope.districts = [];
        $scope.provinces = [];

        $scope.require = true;
    }
    $scope.get_request_list = (reload = 0) => {
        if (reload == 0) {
            $scope.pagingInfo.currentPage = 1;
            $scope.pagingInfo.offset = 0;
            $scope.filter.offset = 0;
        }
        $('.table-responsive').addClass('loading');
        $http.get(base_url + 'share_beauty/ajax_get_request_list?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.table-responsive').removeClass('loading');

                $scope.request_list = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
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
        $scope.detail.files = ($scope.detail.files) ? $scope.detail.files : [];

        delete $scope.detail.password;

        $scope.getDistict(item.province_id);
        setTimeout(() => {
            select2_reset();
            resetDatePicker();
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
                $scope.get_request_list();
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
            url: base_url + '/uploads/ajax_upload_to_filehost?func=share_beauty_partner_rq',
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
                toastr["success"]('Đã cập nhật!.');
                $('#detailModal').modal('hide');
            } else toastr["error"](r.data.message);
        })
    }


    //paging
    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.get_request_list(1);
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

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
    }
});