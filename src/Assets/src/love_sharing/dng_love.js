app.controller('admin_user_dng_love', function ($scope, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.base_url = base_url;
        $scope.objectGeneration();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
    }
    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.category_id = '0';
        $scope.filter.active = '-1';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    function resetTheGift() {
        $scope.the_gift = {};
        $scope.the_gift.category_id = '0';
        $scope.the_gift.heart_type_exchange = '1';
        $scope.the_gift.spotlight = '0';
        $scope.the_gift.price = '10';
        $scope.the_gift.gift_type = '0';
        $scope.the_gift.branch_confirm_role = '0';
        $scope.the_gift.action_role = '0';
        $scope.the_gift.active = '1';
        $scope.select2();
        $('#inputFileEdit').val('').trigger('input');
    }
    $scope.openModal = (type, item = {}) => {
        $scope.modalType = type;
        $scope.modalType.category_id = 0;
        switch (type) {
            case 'create':
                resetTheGift();
                break;
            case 'detail':
                $scope.the_gift = item;
                $scope.select2();
                break;
            default:
                break;
        }
        $('#codeModal').modal('show');
    }

    $scope.giftAction = () => {
        if ($scope.the_gift.category_id == '0' || $scope.the_gift.gift_type == '0' || !$scope.the_gift.img_url || $scope.the_gift.img_url == '') {
            toastr["error"]('Vui lòng nhập đầy đủ các thông tin!');
            return false;
        }
        switch ($scope.modalType) {
            case 'create':
                $scope.the_gift.price = ($scope.the_gift.price + '').replace(/,/g, "");
                $scope.the_gift.max_real_price = ($scope.the_gift.max_real_price + '').replace(/,/g, "");
                $http.post(base_url + 'love_sharing/ajax_create_gift', $scope.the_gift).then(r => {
                    if (r && r.data.status == 1) {
                        toastr.success('Thêm mới thành công!!');
                        $scope.getAll();
                        resetTheGift();
                    } else toastr["error"](r.data.messages);
                })
                break;
            case 'detail':
                $scope.the_gift.price = ($scope.the_gift.price + '').replace(/,/g, "");
                $scope.the_gift.max_real_price = ($scope.the_gift.max_real_price + '').replace(/,/g, "");
                $http.post(base_url + 'love_sharing/ajax_update_gift', $scope.the_gift).then(r => {
                    if (r && r.data.status == 1) {
                        toastr.success('Chỉnh sửa thành công!!');
                        $scope.getAll();
                    } else toastr["error"](r.data.messages);
                })
                break;
            default:
                break;
        }
    }
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({ nameselectionTitleAttribute: false });
        }, 50);
    }
    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $http.get(base_url + 'love_sharing/get_all_love_gift?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }
    // paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(false);
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
    // end paging


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
            url: base_url + '/uploads/ajax_upload_to_filehost?func=love_sharing_dng_love',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            if (r.data.status == 1) {
                $scope.the_gift.img_url = r.data.data[0];
            } else {
                toastr["error"]('Tệp không hợp lệ!.')
            }
        })
    }


    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(6, 'days'),
            endDate: moment(),
            // maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            ranges: {
                'Hôm nay': [moment(), moment()],
                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1,
                    'days')],
                '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                'Tháng trước': [moment().subtract(1, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
                ]
            },
            locale: {
                format: 'DD/MM/YYYY',
            }
        });
    }

});