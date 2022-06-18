app.controller('voucherCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.voucher = {};
        $scope.filter = {};
        $scope.voucherChoose = {};
        $scope.isShowVoucher = 0;
        $scope.voucherDetail = {};
        $scope.voucherNew = {};
        $scope.isShowAlert = 0;
        $scope.selectVoucher = 0;
    }

    var pi = $scope.pagingInfo = {
        itemsPerPage: 15,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.handelVoucher = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.getVoucherDetail();
    }
    $scope.getVoucherDetail = () => {
        $scope.filter = {
            limit: $scope.pagingInfo.itemsPerPage,
            offset: ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage
        }
        $scope.isload = true;
        $http.get(base_url + 'hotlines/ajax_get_voucher_detail?id=' + $scope.selectVoucher + '&&filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                r.data.data.forEach(element => {
                    element['created'] = moment(element['created']).format('DD/MM/YYYY');
                });
                $scope.rows = r.data.data;
                $scope.isload = false;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                console.log('đã có lỗi xẩy ra!');
            }
        })
    }


    $scope.createCode = () => {
        if (!$scope.voucher.uid_db) {
            $('.error-uidre').slideDown();
        } else {
            $('.error-uidre').css('display', 'none');
        }
        if (!$scope.voucher.voucher_id) {
            $('.error-idre').slideDown();
        } else {
            $('.error-idre').css('display', 'none');
        }

        if ($scope.voucher && $scope.voucher.voucher_id && $scope.voucher.uid_db && $scope.voucher.uid_db != '') {
            $http.post(base_url + 'hotlines/ajax_create_code_voucher', $scope.voucher).then(r => {
                if (r.data.status == 1) {
                    $scope.voucherNew = r.data.data
                    $scope.isShowAlert = $scope.voucherNew.id;
                    $scope.selectVoucher = $scope.voucher.voucher_id;
                    $('#selectVc').val($scope.voucher.voucher_id);
                    $('#selectVc').select2();
                    $scope.pagingInfo.currentPage = 1;
                    $scope.getVoucherDetail();
                    $('.error-uid').css('display', 'none');
                    $('#addNew').modal('hide');
                    $('.uid').val('');
                } else {
                    $('.error-uid').slideDown();
                }
            })

        } else { }

    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.getVoucherDetail();
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

});