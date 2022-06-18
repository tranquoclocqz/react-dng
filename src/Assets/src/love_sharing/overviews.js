app.controller('overviews', function ($scope, $http, $compile) {
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
        $scope.get_history_and_balance(0);
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.get_pie_chart_data();
        }, 10);
    }
    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.type = 'day';
        $scope.filter.store_id = '0';
        $scope.filter.store_id2 = '0';
        $scope.filter.group_id = '0';
        $scope.filter.user_id = '0';
        $scope.filter.group_id2 = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.count = 0;
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.get_pie_chart_data = () => {
        $scope.count++;
        if ($scope.count < 2) {
            return false;
        }
        $("#myfirstchart").removeClass('noitems');
        $http.get(base_url + 'love_sharing/get_line_chart_data?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.transData = r.data.data_tb;
                $scope.total_employees = r.data.total_employees;
                $('.chart-rp').removeClass('loading');
                $("#myfirstchart").empty();
                if (r.data.data.length == 0) {
                    $("#myfirstchart").addClass('noitems');
                }
                $scope.mr = new Morris.Line({
                    element: 'myfirstchart',
                    data: r.data.data,
                    xkey: 'time',
                    xLabels: 'time',
                    // yLabelFormat: function(y) {
                    //     return y != Math.round(y) ? '' : y;
                    // },
                    dataLabels: false,
                    resize: false,
                    xLabelAngle: 15,
                    ykeys: ['total', 'reports', 'gift_trans', 'share_love', 'gift_using', 'gift_return'],
                    parseTime: false,
                    labels: ['Tổng', 'Đổi quà', 'Trao yêu thương', 'Report', 'Sử dụng quà', 'Duyệt quà'],
                    lineColors: [
                        '#007bff', /* primary */
                        '#dc3545', /* danger */
                        '#ffc107', /* warning */
                        '#28a745', /* success */
                        '#17a2b8', /* info */
                    ],
                    // barColors: ['rgb(47, 125, 246)', 'rgb(40 167 69)', 'rgb(220 53 69)', ' rgb(246, 194, 68)', 'rgb(108, 117, 125)'],
                    hoverCallback: function (index, options, content, row) {
                        var str_hover = `
                                    <div class='morris-hover-row-label'>
                                    ${row.time}
                                    </div>
                                    <div class="morris-hover-point text-left text-primary" style="font-weight:500">
                                         Tổng: ${formatNumber(row.total)}
                                    </div>
                                    <div class="morris-hover-point text-left text-success">
                                        Trao yêu thương: ${formatNumber(row.share_love)}
                                    </div>
                                    <div class="morris-hover-point text-left text-dark">
                                        Report: ${formatNumber(row.reports)}
                                    </div>
                                    <div class="morris-hover-point text-left text-warning" style="color: #ffc107">
                                         Đổi quà: ${formatNumber(row.gift_trans)}
                                    </div>
                                    <div class="morris-hover-point text-left text-info" >
                                        Sử dụng quà: ${formatNumber(row.gift_using)}
                                    </div>
                                    </div>
                                 `;
                        return str_hover;
                    }
                });
            }
        })
    }
    document.addEventListener("click", function (event) {
        if (event.target.closest(".detail-rank-infor, .rank")) return;
        $scope.$apply(function () {
            angular.forEach($scope.rankingData, function (value, key) {
                value.detail = false;
            });
        });
    });
    $scope.getHeartRank = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $scope.rankLoading = true;
        $scope.showDateRank = true;
        $http.get(base_url + 'love_sharing/ajax_get_heart_rank?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                if ($scope.filter.rate_check) $scope.showRate = true;
                else $scope.showRate = false;

                $scope.rankingData = r.data.data;
                $scope.rankLoading = false;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            }
        })
    }
    $scope.getRankingDetail = (item) => {
        angular.forEach($scope.rankingData, function (value, key) {
            value.detail = false;
        });
        item.detail = true;
        $scope.filter.user_id = item.id;
        $http.get(base_url + 'love_sharing/get_ranking_detail?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.rankingDetails = r.data.data;
            }
        })
    }
    $scope.handleResultTb = () => {
        $scope.resultTbStatus = !$scope.resultTbStatus;
    }
    $scope.get_history_and_balance = (id) => {
        $scope.filter.user_id = id;
        $http.get(base_url + 'love_sharing/get_system_balance?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.allOfBalance = r.data.data;
        })
    }
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({ nameselectionTitleAttribute: false });
        }, 50);
    }
    // paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getHeartRank(false);
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

        $('.custom-daterange2').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            singleDatePicker: true,
            startDate: moment(),
            // maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            locale: {
                format: 'DD/MM/YYYY',
            }
        });
    }
});