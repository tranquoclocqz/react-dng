app.controller('report_voucher', function ($scope, $http) {
    $scope.init = () => {
        $scope.pagingInfo = {
            itemsPerPage: 30,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.filter = {
            store_id: ['0'],
            date: date_bw,
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
            voucher_id: ['0'],
        }
        $scope.loading = false;
        $scope.listVoucher = [];
        $('.op-report').removeClass('op-report');
    }

    $scope.getAll = (is_export = 0) => {
        var data_rq = angular.copy($scope.filter);

        if (!data_rq.store_id.length) {
            showMessErr('Chi nhánh không được trống');
            return;
        }

        if (!data_rq.voucher_id.length) {
            showMessErr('Voucher không được trống');
            return;
        }

        data_rq.is_export = is_export;
        data_rq.start_date = getDateBw(data_rq.date);
        data_rq.end_date = getDateBw(data_rq.date, 0);
        $scope.loading = true;
        $http.get(base_url + 'statistics/ajax_get_list_report_voucher?' + $.param(data_rq)).then(r => {
            $scope.loading = false;
            if (r.data.status) {
                $("html, body").animate({
                    scrollTop: 0
                }, 0);
                var data = r.data.data,
                    list = data.list,
                    count = data.count;

                list.forEach(item => {
                    item.invoices = item.invoices ? JSON.parse(item.invoices) : [];
                });

                if (is_export) {
                    $scope.listExport = list;
                    setTimeout(() => {
                        exportExcelTable('#tb-reprot-voucher', 'id');
                    }, 500)
                    return;
                }

                $scope.listVoucher = list;
                $scope.pagingInfo.total = count;
                $scope.pagingInfo.totalPage = Math.ceil(count / $scope.pagingInfo.itemsPerPage);
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.formatDateToTime = (date, type = 'DD/MM/YYYY') => {
        return moment(date, 'YYYY-MM-DD').format(type)
    }

    $scope.go2Page = (page) => {
        if (page < 0) return;
        $scope.pagingInfo.currentPage = page;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
    }

    $scope.Previous = (page) => {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = (paging) => {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        return _.range(min, max);
    }
})
app.filter('formatCurrency', function () {
    return (value, nation_id, noname = false) => {
        if (!value) return 0;
        value = Number(value);
        if (nation_id == 1) {
            return parseNumber(value) + (noname ? '' : '');
        } else {
            return (Number(value) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + (noname ? '' : '');
        }
    };
});