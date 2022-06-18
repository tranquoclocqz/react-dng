app.controller('cusCtrl', function ($scope, $http, $sce, $window) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box1').css('opacity', 1);
        $scope.ls_regions = ls_regions;
        $scope.ls_stores = ls_stores;
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.stores = ['0'];
        $scope.filter.invoice_type_sale = '1';
        $scope.filter.region_id = ['0'];
        
        $scope.getAll();
        $scope.select2();
    }

    $scope.getListStoreByRegion = () => {
        $scope.filter.stores = [];
        if ($scope.filter.region_id.length && $scope.filter.region_id.indexOf('0') == -1) {
            $scope.filter.region_id.forEach(function (item) {
                ls_stores.forEach(function (store) {
                    if (store.admin_region_id == item) {
                        $scope.filter.stores.push(store.id);
                    }
                });
            })
        } else {
            $scope.filter.stores.push('0');
        }
        select2_img();
    }

    $scope.caculaterRatio = (on, bot) => {
        on = on ? on : 0;
        bot = bot && bot > 0 ? bot : 1;
        return Math.round(on / bot, 2);
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.slelect2').select2();
        }, 200);
    }

    $scope.excel = () => {
        let filter = angular.copy($scope.filter);
        if ($scope.filter.stores.find(r => { return r == 0 })) {
            filter.stores = [];
        }
        window.open(base_url + 'statistics/excel_report_customer_old_new?filter=' + JSON.stringify(filter))
    }

    $scope.getAll = () => {
        let filter = angular.copy($scope.filter);
        if ($scope.filter.stores.find(r => { return r == 0 })) {
            filter.stores = [];
        }
        $scope.isLoading = true;
        $http.get(base_url + 'statistics/ajax_report_customer_old_new?filter=' + JSON.stringify(filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.total.count_customer;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.total.count_customer / pi.itemsPerPage);
                $scope.total = r.data.total;
                $scope.isLoading = false;
            }
        })
    }

    $scope.openHistory = (id) => {
        window.open(base_url + 'customers/history/' + id);
    }


    //paging
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