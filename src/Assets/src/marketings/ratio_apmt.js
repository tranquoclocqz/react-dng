app.controller('apmtCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.selectReportTime = [
            { key: 1, value: 'Tuần này' },
            { key: 2, value: 'Tuần trước' },
            { key: 3, value: 'tháng này' },
            { key: 4, value: 'tháng trước' },
            { key: 5, value: '3 tháng gần đây' },
            { key: 6, value: '6 tháng gần đây' },
            { key: 7, value: 'Năm nay' },
            { key: 8, value: 'Năm trước' },
            { key: 9, value: '2 năm' },
            { key: 10, value: '3 năm' },
        ];
        $scope.filterByDate = {};
        $scope.get_statictis_aptm();
        $scope.filter = {};
        $scope.filter.timeKey = 7;
        $scope.loadStaticsApmt();
        $('#chart-bar').css('display', 'none');
        $('#chart-line').css('display', 'none');
        $scope.isLoadChart = true;
        $scope.totalApmt = 0;
        $scope.toalApmtOk = 0;

    }

    $scope.get_statictis_aptm = () => {
        if ($scope.filterByDate.dateFilter) {
            $scope.filterByDate.start_date = moment($scope.filterByDate.dateFilter.split(" - ")[0]).format("YYYY-MM-DD");
            $scope.filterByDate.end_date = moment($scope.filterByDate.dateFilter.split(" - ")[1]).format("YYYY-MM-DD");
        }
        $scope.isLoading = true;
        $http.get(base_url + '/marketings/ajax_get_ratio_apmt?filter=' + JSON.stringify($scope.filterByDate)).then(r => {
            $scope.statictis = r.data;
            $scope.totalApmt = $scope.totalApmtOk = $scope.total_cus_old = $scope.total_cus_new = 0;
            $scope.totalApmt_cus = $scope.totalApmtOk_cus = $scope.total_cus_old_cus = $scope.total_cus_new_cus = 0;
            $scope.statictis.forEach(element => {
                $scope.totalApmt += Number(element.total);
                $scope.totalApmtOk += Number(element.ok);
                $scope.total_cus_old += Number(element.cus_old);
                $scope.total_cus_new += Number(element.cus_new);

                $scope.totalApmt_cus += Number(element.total_cus_app);
                $scope.totalApmtOk_cus += Number(element.total_cus_oke);
                $scope.total_cus_old_cus += Number(element.total_cus_old);
                $scope.total_cus_new_cus += Number(element.total_cus_new);

            });
            //Number(r.data.app)+Number(r.data.cskh)+Number(r.data.tvv)+Number(r.data.letan)+Number(r.data.web);
            //$scope.totalApmtOk = Number(r.data.app_ok)+Number(r.data.cskh_ok)+Number(r.data.tvv_ok)+Number(r.data.letan_ok)+Number(r.data.web_ok);
            $scope.isLoading = false;
        });
    }
    $scope.str2int = (value) => {
        return Number(value)
    }
    $scope.caculator = (value, total) => {
        if (Number(total) <= 0) {
            return 0;
        } else {
            let rs = (Number(value) * 100) / Number(total);
            return rs.toFixed(2);
        }
    }
    $scope.caculator_total = (value, value2) => {
        if (Number(value) <= 0) {
            return 0;
        } else {
            let rs = (Number(value) * 100) / (Number(value) + Number(value2));
            return rs.toFixed(2);
        }
    }
    $scope.checkValue = (value) => {
        return !value ? 0 : value;
    }

    $scope.optionChoosed = () => {
        let time = $scope.selectReportTime.find(e => { return e.key == $scope.filter.timeKey });
        return time.value + '!';
    }

    $scope.handelOptionReport = () => {
        $scope.isLoadChart = true;
        $scope.loadStaticsApmt();
        $('#chart-bar').css('display', 'none');
        $('#chart-line').css('display', 'none');
    }

    $scope.checkTypeDate = () => {
        return ($scope.filter.timeKey == 1 || $scope.filter.timeKey == 2 || $scope.filter.timeKey == 3 || $scope.filter.timeKey == 4) ? true : false;
    }


    $scope.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.loadStaticsApmt = () => {
        $scope.dataChart = [];
        $("#myfirstchart").empty();
        $("#bar-example").empty();
        $http.get(base_url + '/marketings/api_get_chart_report_apmt?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.dataChart = r.data.data;
            $scope.isLoadChart = false;


            if (r.data.data && $scope.dataChart.length > 0) {
                $('#chart-bar').css('display', 'block');
                $('#chart-line').css('display', 'block');
                let showChart = $scope.checkTypeDate() ? 'dateMonth' : 'monthYear';

                $scope.dataChart = r.data.data;
                $scope.dataChart.forEach(element => {
                    element.monthYear = element.month + ' / ' + element.year;
                    element.dateMonth = element.day + ' / ' + element.month;
                    element.total = Number(element.web) + Number(element.tvv) + Number(element.cskh) + Number(element.app) + Number(element.letan);
                    element.total_ok = Number(element.web_ok) + Number(element.tvv_ok) + Number(element.cskh_ok) + Number(element.app_ok) + Number(element.letan_ok);
                    element.total_sub = element.total - element.total_ok;
                });

                $scope.moris = new Morris.Line({
                    element: 'myfirstchart',
                    data: $scope.dataChart,
                    xkey: showChart,
                    ykeys: ['web_ok', 'tvv_ok', 'app_ok', 'cskh_ok', 'letan_ok'],
                    parseTime: false,
                    labels: ['web', 'Tư vấn viên', 'Mobile', 'Chăm sóc khách hàng', 'Lể tân'],
                    lineColors: ['#B64645', '#1caf9a', '#05B75D', '#95B75D', '#FEA223'],
                    hoverCallback: function (index, options, content, row) {
                        $hover = `<div class='morris-hover-row-label'>${showChart == 'dateMonth' ? 'Ngày ' + row.dateMonth : 'Tháng ' + row.monthYear}</div><div class='morris-hover-point' style='color: #B64645'>
                                        web: ${$scope.formatNumber(row.web_ok) + ' / ' + $scope.formatNumber(row.web) + ' (' + $scope.caculator(row.web_ok, row.web) + ' %)'} 
                                    </div><div class='morris-hover-point' style='color: #1caf9a'>
                                        TVV: ${$scope.formatNumber(row.tvv_ok) + ' / ' + $scope.formatNumber(row.tvv) + ' (' + $scope.caculator(row.tvv_ok, row.tvv) + ' %)'} 
                                    </div><div class='morris-hover-point' style='color: #05B75D'>
                                        Mobile:
                                        ${$scope.formatNumber(row.app_ok) + ' / ' + $scope.formatNumber(row.app) + ' (' + $scope.caculator(row.app_ok, row.app) + ' %)'}
                                    </div><div class='morris-hover-point' style='color: #95B75D'>
                                        CSKH:
                                        ${$scope.formatNumber(row.cskh_ok) + ' / ' + $scope.formatNumber(row.cskh) + ' (' + $scope.caculator(row.cskh_ok, row.cskh) + ' %)'}
                                    </div><div class='morris-hover-point' style='color: #FEA223'>
                                        Lể tân:
                                        ${$scope.formatNumber(row.letan_ok) + ' / ' + $scope.formatNumber(row.letan) + ' (' + $scope.caculator(row.letan_ok, row.letan) + ' %)'}
                                    </div>
                                    <div class='morris-hover-point' style='color: #dbdbdb'>
                                        Tổng cộng:
                                        ${$scope.formatNumber(row.total_ok) + ' / ' + $scope.formatNumber(row.total) + ' (' + $scope.caculator(row.total_ok, row.total) + ' %)'}
                                    </div>`;
                        return $hover;
                    }
                });


                $scope.moris_bar = new Morris.Bar({
                    element: 'bar-example',
                    data: $scope.dataChart,
                    xkey: showChart,
                    parseTime: false,
                    ykeys: ['total_ok', 'total_sub'],
                    labels: ['Thành công', 'Tổng'],
                    barColors: ['#FEA223', '#05B75D'],
                    resize: true,
                    stacked: true,
                    hoverCallback: function (index, options, content, row) {
                        var str_hover = `
                                <div class='morris-hover-row-label'>${showChart == 'dateMonth' ? 'Ngày ' + row[showChart] : 'Tháng ' + row[showChart]}</div>
                                <div class='morris-hover-point' >
                                    <span style='color: #05B75D'>Thành công</span> / <span  style='color: #FEA223'>Tổng cộng</span>
                                   
                                </div>
                                <div class='morris-hover-point' >
                                    <span style='color: #05B75D'>${$scope.formatNumber(row.total_ok)}</span> / <span style='color: #FEA223'>${$scope.formatNumber(row.total)}</span>
                                </div>
                                <div class='morris-hover-point' style='color: #dbdbdb'>
                                    Tỉ lệ:
                                    ${(row.total > 0 ? (row.total_ok / row.total) * 100 : 0).toFixed(2)} %
                                </div>
                            `;
                        return str_hover;

                    }
                });
            } else {
                $scope.message = 'Không có dữ liệu!'
                $('#chart-line').css('display', 'none');
                $('#chart-bar').css('display', 'none');
            }
        })

    }
});