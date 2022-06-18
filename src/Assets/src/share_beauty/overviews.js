app.controller('overviews', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 14,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    var pi2 = $scope.pagingInfo2 = {
        itemsPerPage: 14,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.flag = 0;
        $scope.flag2 = 0;
        $scope.object_generating();
        $scope.get_voucher_rp();
        $('.counter').counterUp({
            delay: 10,
            time: 1000
        });
    }
    $scope.object_generating = () => {
        $scope.filter = {};
        $scope.filter.start_date = getOneYearAgo();
        $scope.filter.end_date = getCurrentDate();
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.filter2 = {};
        $scope.filter2.start_date = getOneYearAgo();
        $scope.filter2.cus_type = '0';
        $scope.filter2.tvv_id = '0';
        $scope.filter2.end_date = getCurrentDate();
        $scope.filter2.limit = $scope.pagingInfo2.itemsPerPage;
        $scope.filter2.offset = $scope.pagingInfo2.offset;

        $scope.chart_filter = {};
        $scope.chart_filter.type = 'day'
        select2();
        setTimeout(() => {
            $scope.dateInputInit();
        }, 50);
    }

    function select2() {
        setTimeout(() => {
            $('select2').select2();
        }, 50);
    }
    $scope.dateInputInit = () => {
        $('input[name="daterange"]').daterangepicker({
            singleDatePicker: true,
            showDropdowns: true,
            minYear: 2000,
            maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            locale: {
                format: 'DD/MM/YYYY',
            }
        });

        $('.custom-daterange').daterangepicker({
            opens: 'left',
            alwaysShowCalendars: true,
            startDate: moment().subtract(2, 'month').startOf('month'),
            endDate: moment(),
            maxDate: moment(),
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
    document.addEventListener("click", function (event) {
        // If user clicks inside the element, do nothing
        if (event.target.closest(".click-box, .view-detail")) return;
        // If user clicks outside the element, hide it!
        $scope.$apply(function () {
            $scope.viewDetail = false;
        });
        // $('.bg-dark').css('display', 'none');
    });

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
    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        // $scope.getReportData(1);
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

    // paging 2

    $scope.go2Page2 = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo2;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter2.limit = $scope.pagingInfo2.itemsPerPage;
        $scope.filter2.offset = ($scope.pagingInfo2.currentPage - 1) * $scope.pagingInfo2.itemsPerPage;
        $scope.getReportData2(1);
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page) {
        if (page - 1 > 0) $scope.go2Page2(page - 1);
        if (page - 1 == 0) $scope.go2Page2(page);
    }

    $scope.getRange2 = function (paging) {
        var max = paging.currentPage + 3;
        var total = paging.totalPage + 1;
        if (max > total) max = total;
        var min = paging.currentPage - 2;
        if (min <= 0) min = 1;
        var tmp = [];
        return _.range(min, max);
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.getlinechartData = () => {
        $scope.countChartReload++;
        if ($scope.countChartReload < 2) return;
        $http.get(base_url + 'share_beauty/get_line_chart_data?filter=' + JSON.stringify($scope.chart_filter)).then(r => {
            if (r.data.status == 1) {
                $scope.chartData = r.data.data;
            }
        })
    }

    $scope.get_voucher_rp = () => {
        $http.get(base_url + 'share_beauty/ajax_get_sb_voucher_rp?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.voucher_rp = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

});