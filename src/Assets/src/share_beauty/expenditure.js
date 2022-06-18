app.controller('exCtr', function ($scope, $http, $sce, $compile) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();

        $scope.newExpend = {};
        $scope.newExpend.customer_id = '0';
        $scope.newExpend.receipt_type = '0';
        select2();
        setTimeout(() => {
            $scope.filter.date = '';
        }, 200)
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
        $scope.filter.offset = 0;
        $scope.getAll();
    }
    $scope.get_banking_and_balance = (customer_id) => {
        $http.get(base_url + '/share_beauty/get_customer_banking_and_bonus/' + customer_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.newExpend = { ...$scope.newExpend, ...r.data.banks };
                $scope.balance = r.data.balance;
                select2();
            }
        })
    }
    $('#expen_request').on('hidden.bs.modal', function () {
        $scope.$apply(function () {
            $scope.newExpend = {};
            $scope.newExpend.customer_id = '0';
            $scope.newExpend.receipt_type = '0';
            select2();
        });
    })
    $scope.addExpenRequest = function () {
        if ($scope.newExpend.customer_id == 0 || $scope.newExpend.receipt_type == 0) {
            toastr["error"]("Thiếu dữ liệu!");
            return false;
        }

        if ($scope.newExpend.receipt_type == 1 && ($scope.newExpend.store_id == 0 || !$scope.newExpend.store_id)) {
            toastr["error"]("Thiếu dữ liệu!");
            return false;
        }
        if ($scope.newExpend.receipt_type == 2 && (!$scope.newExpend.bank_number || !$scope.newExpend.bank_id || !$scope.newExpend.bank_name)) {
            toastr["error"]("Thiếu dữ liệu!");
            return false;
        }
        $scope.newExpend.price = $scope.newExpend.price.replace(/,/g, "");
        $http.post(base_url + 'share_beauty/ajax_create_expend_request', $scope.newExpend).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]('Đã thêm mới!.');
                $('#expen_request').modal('hide');
                $scope.balance = r.data.balance;
                $scope.getAll();
            } else toastr["error"](r.data.message);
        })

    }

    function select2() {
        setTimeout(() => {
            $('select2').select2();
        }, 50);
    }
    $scope.getAll = () => {
        $http.get(base_url + '/share_beauty/ajax_get_share_beautys?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }

    $scope.openDetail = (item) => {
        window.open(base_url + '/share_beauty/expenditure_detail/' + item.id);
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
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

    $scope.openAddExpenditure = () => {
        window.open(base_url + '/share_beauty/expenditure_pay/0');
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
})