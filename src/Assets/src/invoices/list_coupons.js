app.controller('couponsCtrl', function ($scope, $http, $sce) {

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
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();

    }

    $scope.getAll = () => {
        $http.get(base_url + '/invoices/ajax_get_list_coupons?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                let data = r.data.data;

                /* $.each(r.data.data, function (i, value) {
                    var list_detail = JSON.parse(value.list_detail);

                    value.list_pro = list_detail.filter((item) => {
                        return item.type === "pro";
                    });
                    value.list_pro_package = list_detail.filter((item) => {
                        return item.type === "pro_in_invoice";
                    });
                    value.list_notuse_pro_package = list_detail.filter((item) => {
                        return item.type === "pro_not_use";
                    });

                    value.list_ser = list_detail.filter((item) => {
                        return item.type === "ser";
                    });
                    value.list_ser_package = list_detail.filter((item) => {
                        return item.type === "ser_in_invoice";
                    });
                    value.list_notuse_ser_package = list_detail.filter((item) => {
                        return item.type === "ser_not_use";
                    }); 
                    
                    value.list_ser_package_full = value.list_notuse_ser_package.concat(value.list_ser_package);

                    $.each(value.list_ser_package_full, function (i, v) {
                        v.remain = (value.list_ser_package_full.filter((item) => {
                            return item.pk_id == v.pk_id && item.cpu_unit_id == v.cpu_unit_id && item.type == 'ser_not_use';
                        })).length;
                        
                        v.total = (value.list_ser_package_full.filter((item) => {
                            return item.pk_id == v.pk_id && item.cpu_unit_id == v.cpu_unit_id;
                        })).length;
                    });

                    value.list_pro_package_full = value.list_notuse_pro_package.concat(value.list_pro_package);

                    $.each(value.list_pro_package_full, function (i, v) {
                        v.remain = (value.list_pro_package_full.filter((item) => {
                            return item.pk_id == v.pk_id && item.cpu_unit_id == v.cpu_unit_id && item.type == 'pro_not_use';
                        })).length;

                        v.total = (value.list_pro_package_full.filter((item) => {
                            return item.pk_id == v.pk_id && item.cpu_unit_id == v.cpu_unit_id;
                        })).length;
                    });
                }); */

                $scope.rows = data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.viewDetail = (id) => {
        window.open(base_url + `invoices/coupon_detail/${id}`);
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.getAll();
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

});