app.controller('report_booking', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 10,
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
        $scope.filter.date = moment().startOf('month').format('MM/DD/YYYY') + ' - ' + moment().format('MM/DD/YYYY');

        // $scope.start=moment().format('MM-DD-YYYY').toString();
        // $scope.end=moment().format('YYYY-MM-DD').toString();
        $scope.dateInputInit();
        $scope.getBooking();
        $scope.getTvvBooning();
        $scope.getStoreBooning();
        $scope.data = [
            { date: '1', total: 0, activetotal: 0 },
            { date: '2', total: 0, activetotal: 0 },
            { date: '3', total: 0, activetotal: 0 },
            { date: '4', total: 0, activetotal: 0 },
            { date: '5', total: 0, activetotal: 0 },
            { date: '6', total: 0, activetotal: 0 },
            { date: '7', total: 0, activetotal: 0 },
            { date: '8', total: 0, activetotal: 0 },
            { date: '9', total: 0, activetotal: 0 },
            { date: '10', total: 0, activetotal: 0 },
            { date: '11', total: 0, activetotal: 0 },
            { date: '12', total: 0, activetotal: 0 },
        ];

        $scope.mr = new Morris.Line({
            element: 'myfirstchart',
            data: $scope.data,
            xkey: 'date',
            xLabels: 'date',
            yLabelFormat: function (y) { return y != Math.round(y) ? '' : y; },
            ykeys: ['total', 'activetotal'],
            parseTime: false,
            labels: ['Tông số lịch hẹn', 'Lịch hẹn thành công'],

            // hoverCallback: function (index, options, content, row) {
            //     var str_hover = `
            //          <div class='morris-hover-row-label'>
            //           Tháng ${ row.month + ' / ' + $scope.year}
            //          </div>
            //          <div class="morris-hover-point" style="color: #0b62a4">
            //                 Số khách hàng sử dụng:${formatNumber(row.value)}
            //          </div>
            //      `;
            //     return str_hover;
            // }


        });

    }

    $scope.dateInputInit = () => {


        if ($('.daterage').length) {
            var start = $('.daterage').data('start');
            var end = $('.daterage').data('end');
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            $('.daterage').daterangepicker({
                opens: 'right',
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                startDate: moment().startOf('month'),
                endDate: moment(),
                ranges: {
                    'Hôm nay': [moment(), moment()],
                    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                    '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                    'Năm nay': [moment().startOf('year'), moment().endOf('year')],
                    'Năm trước': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
                }
            });
        }
    }

    var getMonths = function (startDate, endDate) {
        var now = startDate.clone(), dates = [], value = {
            date: String
        };

        while (endDate > now || now.format('M') === endDate.format('M')) {
            dates.push(now.format('MM/YYYY'));
            now.add(1, 'month');
        }
        return dates;
    };

    var getDates = function (startDate, endDate) {
        var now = startDate.clone(), dates = [], value = {
            date: String
        };

        while (now.isSameOrBefore(endDate)) {
            dates.push(now.format('DD/MM/YYYY'));
            now.add(1, 'days');
        }
        return dates;
    };

    $scope.getTwoFc = () => {
        $scope.getTvvBooning();
        $scope.getBooking();
        $scope.getStoreBooning();
    }

    $scope.getTvvBooning = () => {
        $('.cover-tabel img').css('opacity', '1');

        $http.get(base_url + '/marketings/ajax_get_tvv_booking?filter=' + JSON.stringify($scope.filter)).then(r => {

            if (r && r.data.status == 1) {
                $scope.tvv = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $('#chart-bd').css('opacity', '1');
                $('.cover-tabel img').css('opacity', '0');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }


    $scope.getStoreBooning = () => {

        $http.get(base_url + '/marketings/ajax_get_store_booking?filter=' + JSON.stringify($scope.filter)).then(r => {

            if (r && r.data.status == 1) {
                $scope.store = r.data.data;
                $('#chart-st img').css('opacity', '0');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getBooking = () => {
        $('.load').css('opacity', '1');

        if ($scope.filter.date) {
            var date = $scope.filter.date.split(' - ');
            array_date2 = getDates(moment(date[0]), moment(date[1]));
            $scope.filter.number_date = array_date2.length;
            if ($scope.filter.number_date > 31) {
                array_date2 = getMonths(moment(date[0]), moment(date[1]));
            }

            $scope.searchDate = 'Dữ liệu từ: ' + moment(date[0]).format('DD-MM-YYYY') + ' đến ' + moment(date[1]).format('DD-MM-YYYY');
        } else {
            array_date2 = getDates(moment(moment().startOf('month').format('YYYY-MM-DD')), moment(moment().format('YYYY-MM-DD')));
            $scope.filter.number_date = array_date2.length;
            $scope.searchDate = 'Dữ liệu từ: ' + moment().startOf('month').format('DD-MM-YYYY') + ' đến ' + moment().format('DD-MM-YYYY');
        }
        $http.get(base_url + '/marketings/ajax_get_booking?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {

                $scope.bookings = r.data.data;

                var big_data = [];
                array_date2.forEach(element => {
                    value = {};
                    value.date = element;
                    value.total = 0;
                    value.activetotal = 0;
                    big_data.push(value);
                });
                r.data.data.forEach(element2 => {
                    big_data.forEach(element => {
                        if (element.date == element2.date) {
                            element.total = parseInt(element2.total);
                            element.activetotal = parseInt(element2.activetotal);
                        }
                    });
                });

                $scope.mr.setData(big_data);

                if ($scope.filter.number_date > 10 && $scope.filter.number_date <= 31) {
                    $scope.mr.options.xLabelAngle = 90;
                    $scope.mr.redraw();
                } else {
                    $scope.mr.options.xLabelAngle = 0;
                    $scope.mr.redraw();
                }
                $('.load').css('opacity', '0')

            }
            else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    //paging
    $scope.go2Page = function (page) {

        if (page < 0) return;
        $('#chart-bd').css('opacity', '0');
        $('#chart-st img').css('opacity', '1');
        $('.cover-tabel img').css('opacity', '1');
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getTvvBooning();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function (page) {
        $('#chart-bd').css('opacity', '0');
        $('#chart-st img').css('opacity', '1');
        $('.cover-tabel img').css('opacity', '1');
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