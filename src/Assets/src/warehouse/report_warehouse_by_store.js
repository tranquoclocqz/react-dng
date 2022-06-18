app.controller('warehouseCtrl', function ($scope, $http, WarehouseSvc) {

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
        $scope.groups = groups;
        $scope.ls_Branch_WH =  ls_Branch_WH ;
        $scope.ls_Main_WH = ls_Main_WH;
        $scope.loadding = true;
        $scope.restFilter();
        $scope.filter.warehouse_id = ""+warehouse_id;
        d = new Date();
        $scope.filter.date = d.getDate() + '-' + (d.getMonth() + 1) +'-' +d.getFullYear();
        $scope.getAll();
    }

    $scope.restFilter = () => {
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.store_type = "3";
        $scope.filter.group_id = "";
        $scope.filter.product_type = "retail";
        $scope.filter.data_get_type = "0";
        $scope.filter.key_find = "";
    }

    $scope.getAll = () => {
        $scope.loadding = true;
        $scope.filter.export = 0;
        WarehouseSvc.getWarehouseIventoryProduct($scope.filter).then(r => {
            if (r.status == 1) {
                $scope.rows = r.data;
                $scope.pagingInfo.total = r.total;
                $scope.pagingInfo.totalPage = Math.ceil(r.total / pi.itemsPerPage);
                $('.content-header h1').html('Báo cáo kho '+$scope.filter.date);
                select2();
                $scope.loadding = false;
            } else {
                $scope.loadding = false;
                $('.content-header h1').html('Báo cáo kho '+$scope.filter.date);
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        }).catch(e => {
            $('.content-header h1').html('Báo cáo kho '+$scope.filter.date);
            $scope.loadding = false;
        });
    }

    $scope.changeStore = () => {
        let whid = $scope.filter.warehouse_id;

        let hasMain = $scope.ls_Main_WH.find(e => {
            return e.id == whid
        });
        let hasBra = $scope.ls_Branch_WH.find(e => {
            return e.id == whid
        });
        if (hasMain) $scope.filter.store_type = "3";
        if (hasBra) $scope.filter.store_type = "1";
        select2();
    }

    $scope.report_excel = () => {
        $scope.filter.export = 1;
        WarehouseSvc.getWarehouseIventoryProduct($scope.filter).then(r => {
            if (r.status == 1 ) {
                window.location = r.url;
                select2();
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    
    $scope.get_history_product = (item,e) => {
        e.target.parentNode.children[0].style.display = "inline-table";
        e.target.parentNode.disabled  = true;
        let data = {
            product_id: item.id,
            warehouse_id: $scope.filter.warehouse_id,
            date: $scope.filter.date,
            product_type: $scope.filter.product_type
        };
        $scope.list_row = {};
        WarehouseSvc.getWarehouseHistoryProduct(data).then(r => {
            if(r && r.status == 1){
                $scope.list_row = r.data;
                $('#ordernow').modal('show');
            }else{
                toastr["error"]('Chưa có lịch sử sản phẩm này');
            }
            e.target.parentNode.children[0].style.display = "none";
            e.target.parentNode.disabled  = false;
            $(".btn-xs").css('display','inline-block');
        });
    }

    $scope.viewPrice = (item) => {
        let val = item;
        val = val.replace(/,/g, "");
        val += '';
        x = val.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.getAll();
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 300);
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
