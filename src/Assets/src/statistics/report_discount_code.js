app.controller('report_discount_code', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.sort_by = "1";
        $scope.start = moment().format('DD-MM-YYYY');
        $scope.end = moment().format('DD-MM-YYYY');
        $scope.dateInputInit();
        $scope.getReportDiscountCode();
        $scope.getStore();
        $scope.getVouchers();
        $scope.show = false;
        $scope.show2 = false;
        $scope.show3 = false;


        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    $scope.getReportDiscountCode = (vl) => {
        $scope.getReportDiscountByDate(vl);
        $scope.getReportDiscountByDateByInvoice(vl);
        delete $scope.detail_;
        $('.load img').css('opacity', '1');
        $http.get(base_url + '/statistics/ajax_report_discount_code?filter=' + JSON.stringify($scope.filter)).then(r => {
            r.data.data.forEach(element => {
                element.total_price = formatNumber(Math.floor(parseFloat(element.total_price)) || 0);
            });
            $scope.store_dt = r.data.stores;
            $scope.report_app_user = r.data.data;
            $('.load img').css('opacity', '0');
        })
    }

    $scope.getTotal = function (name) {
        var total = 0;
        if ($scope.store_dt)
            for (var i = 0; i < $scope.store_dt.length; i++) {
                var product = $scope.store_dt[i];
                total += parseInt(product[name]);
            }
        return total;
    }

    $scope.getReportDiscountTypeCode = (active) => {
        $scope.show = false;
        $scope.active = false;
        $('#modal').modal('show');
        $http.get(base_url + '/statistics/ajax_report_discount_type_code/' + active + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            r.data.data.forEach(element => {
                element.total_price = formatNumber(Math.floor(parseFloat(element.total_price)) || 0);
            });
            $scope.report_discout_type = r.data.data;
            if (active == -1) {
                $scope.name = 'mã giảm giá đã tạo';
            } else if (active == 1) {
                $scope.name = 'mã giảm giá chưa sử dụng';
            } else if (active == 2) {
                $scope.name = 'mã giảm giá đã sử dụng';
                $scope.active = true;
            }
            $scope.show = true;
        })
    }

    $scope.getDetail = () => {
        $http.get(base_url + '/statistics/ajax_get_detail_discout_detail?filter=' + JSON.stringify($scope.filter)).then(r => {
            r.data.data.forEach(element => {
                element.total_price = formatNumber(Math.floor(parseFloat(element.total_price)) || 0);
                if ($scope.stores)
                    $scope.stores.forEach(e => {
                        if (element.store_id == e.id)
                            element.store_name = e.description;
                    });
                if ($scope.vouchers)
                    $scope.vouchers.forEach(e => {
                        if (element.voucher_id == e.id)
                            element.voucher_name = e.name;
                    });
            });
            $scope.detail_ = r.data.data;

            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })

    }

    $scope.getStore = () => {
        $http.get(base_url + '/statistics/ajax_get_store').then(r => {
            $scope.stores = r.data.data;
        })
    }

    $scope.getVouchers = () => {
        $http.get(base_url + '/statistics/ajax_get_voucher').then(r => {
            $scope.vouchers = r.data.data;
        })
    }


    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.dateInputInit = () => {
        if ($('.daterage').length) {
            var start = moment().format('DD-MM-YYYY');
            var end = moment().format('DD-MM-YYYY');
            $('.daterage').daterangepicker({
                opens: 'right',
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                autoUpdateInput: false,
                startDate: start,
                endDate: end,
                ranges: {
                    'Hôm nay': [moment(), moment()],
                    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                    '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                locale: {
                    format: 'DD/MM/YYYY'
                }
            });
            $('.daterage').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
                $scope.filter.date = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
            });

        }
    }

    var getDates = function (startDate, endDate) {
        var now = startDate.clone(),
            dates = [],
            value = {
                date: String
            };

        while (now.isSameOrBefore(endDate)) {
            dates.push(now.format('DD/MM/YYYY'));
            now.add(1, 'days');
        }
        return dates;
    };

    var getMonths = function (startDate, endDate) {
        var now = startDate.clone(),
            dates = [],
            value = {
                date: String
            };

        while (endDate > now || now.format('M') === endDate.format('M')) {
            dates.push(now.format('MM/YYYY'));
            now.add(1, 'month');
        }
        return dates;
    };

    function parseSVG(s) {
        var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
        var frag = document.createDocumentFragment();
        while (div.firstChild.firstChild)
            frag.appendChild(div.firstChild.firstChild);
        return frag;
    }

    function addNumberToChart() {
        var items = $("#myfirstchart").find("svg").find("circle");
        $.each(items, function (index, v) {
            var value = parseInt(data[index].total_number);
            var newY = parseFloat($(this).attr('cy') - 20);
            var newX = parseFloat($(this).attr('cx'));
            var output = '<text style="text-anchor: middle; font: 12px sans-serif;" x="' + newX + '" y="' + newY + '" text-anchor="middle" font="10px &quot;Arial&quot;" stroke="none" fill="#000000" font-size="12px" font-family="sans-serif" font-weight="normal" transform="matrix(1,0,0,1,0,6.875)"><tspan dy="3.75">' + value + '</tspan></text>';
            $("#myfirstchart").find("svg").append(parseSVG(output));
        });
    }

    function addNumberToChart2() {
        var items = $("#chartUsed").find("svg").find("circle");
        count = 0;

        $.each(items, function (index, v) {
            if (index % 2 == 0) {
                var value = parseInt(data2[count].total_number);
                var newY = parseFloat($(this).attr('cy') - 20);
                var newX = parseFloat($(this).attr('cx'));
                var output = '<text style="text-anchor: middle; font: 12px sans-serif;" x="' + newX + '" y="' + newY + '" text-anchor="middle" font="10px &quot;Arial&quot;" stroke="none" fill="#000000" font-size="12px" font-family="sans-serif" font-weight="normal" transform="matrix(1,0,0,1,0,6.875)"><tspan dy="3.75">' + value + '</tspan></text>';
                $("#chartUsed").find("svg").append(parseSVG(output));
                count++;
            }

        });

    }
    $scope.getReportDiscountByDate = (vl) => {
        $scope.show2 = false;
        $('.load2 img').css('opacity', '1');
        $('.cover-chart').css('opacity', '0');
        if ($scope.filter.date) {
            var date = $scope.filter.date.split(' - ');
            array_date = getDates(moment(date[0], 'DD/MM/YYYY'), moment(date[1]), 'DD/MM/YYYY');
            $scope.filter.number_date = array_date.length;
        }
        $http.get(base_url + '/statistics/ajax_report_discount_by_date?filter=' + JSON.stringify($scope.filter)).then(r => {
            var array_date = [];
            var big_data = [];
            if ($scope.filter.date && $scope.filter.number_date <= 31) {
                var date = $scope.filter.date.split(' - ');
                array_date = getDates(moment(date[0]), moment(date[1]));
                array_date.forEach(element => {
                    value = {};
                    value.date = element;
                    value.total_all = [];
                    value.total_number = 0;
                    big_data.push(value);
                });
                r.data.data.forEach(element2 => {
                    big_data.forEach(element => {
                        if (element.date == element2.date) {
                            element.total_number = element.total_number + parseInt(element2.total_all);
                            element.total_all.push(element2);
                        }
                    });
                });
            } else if ($scope.filter.number_date > 31) {
                var date = $scope.filter.date.split(' - ');
                array_date = getMonths(moment(date[0]), moment(date[1]));
                array_date.forEach(element => {
                    value = {};
                    value.date = element;
                    value.total_all = [];
                    value.total_number = 0;
                    big_data.push(value);
                });
                r.data.data.forEach(element2 => {
                    big_data.forEach(element => {
                        if (element.date == element2.date) {
                            element.total_number = element.total_number + parseInt(element2.total_all);
                            element.total_all.push(element2);
                        }
                    });
                });
            }
            if (big_data.length != 0) {
                data = big_data
            } else {
                data = [
                    { date: 1, total_all: [], total_number: 0 },
                    { date: 2, total_all: [], total_number: 0 },
                    { date: 3, total_all: [], total_number: 0 },
                    { date: 4, total_all: [], total_number: 0 },
                    { date: 5, total_all: [], total_number: 0 },
                    { date: 6, total_all: [], total_number: 0 },
                    { date: 7, total_all: [], total_number: 0 },
                    { date: 8, total_all: [], total_number: 0 },
                    { date: 9, total_all: [], total_number: 0 },
                    { date: 10, total_all: [], total_number: 0 },
                    { date: 11, total_all: [], total_number: 0 },
                    { date: 12, total_all: [], total_number: 0 }
                ]
                r.data.data.forEach(element2 => {
                    data.forEach(element => {
                        if (element.date == element2.date) {
                            element.total_number = element.total_number + parseInt(element2.total_all);
                            element.total_all.push(element2);
                        }
                    });
                });
            }
            if (vl == 2) {
                $scope.ar.setData(data);
                $('.load2 img').css('opacity', '0');
                $('.cover-chart').css('opacity', '1');

                if ($scope.filter.number_date > 10 && $scope.filter.number_date <= 31) {
                    $scope.ar.options.xLabelAngle = 90;
                    $scope.ar.redraw();
                } else {
                    $scope.ar.options.xLabelAngle = 0;
                    $scope.ar.redraw();
                }
                addNumberToChart();
                $scope.show2 = true;
                return false;
            }

            $scope.ar = new Morris.Line({
                element: 'myfirstchart',
                data: data,
                xkey: 'date',
                parseTime: false,
                xLabels: 'date',
                ykeys: ['total_number'],
                dataLabels: true,
                barColors: ['#2f7df6'],
                labels: ['Tạo mới'],
                xLabelAngle: 0,
                hoverCallback: function (index, options, content, row) {
                    var str_hover = `
                            <div class='morris-hover-row-label'>
                            Thời gian: ${row.date}
                            </div>
                            <div class="morris-hover-point" style="color: #2f7df6">
                             Tổng số mã: ${parseInt(row.total_number)}   
                            </div>
                            <div class="morris-hover-point" style="color: #ebebeb">
                            ${row.total_all.length > 0 ? '<span style="color:#f39c12" >*Tên</span>: <span  style="color:">Số lượng</span>' : ''} <br>
                            ${row.total_all.length > 0 ? listArray(row.total_all) : ''}
                            ${row.total_all.length > 3 ? '<span class="click">[...]<span>' : ''}
                            </div>
                         `;
                    return str_hover;
                }
            }).on('click', function (i, row) {
                if (row.total_all.length > 0) {
                    $scope.$apply(function () {
                        $scope.datachart = row;
                    })
                    $('#modalchart').modal('show');
                }
            })
            addNumberToChart();
            $('.load2 img').css('opacity', '0');
            $('.cover-chart').css('opacity', '1');
            $scope.show2 = true;
        })

    }

    function listArray(array) {
        string = '';
        array.forEach((element, index) => {
            if (index <= 2) {
                string += '<span style="color:#f39c12" >' + element.name + '</span> : ' + element.total_all + '<br>';
            }
        });
        return string
    }

    function listArray2(array) {
        string = '';
        array.forEach((element, index) => {
            if (index <= 2) {
                string += '<span style="color:#f39c12" >' + element.name + '</span> : ' + element.total_all + ' - <span style="color:#00a65a">' + formatNumber(parseInt(element.total_price)) + ' VNĐ</span>' + '<br>';
            }
        });
        return string
    }
    $scope.getReportDiscountByDateByInvoice = (vl) => {
        $('.load2 img').css('opacity', '1');
        $('.cover-chart').css('opacity', '0');
        $scope.show3 = false;
        if ($scope.filter.date) {
            var date2 = $scope.filter.date.split(' - ');
            array_date2 = getDates(moment(date2[0], 'DD/MM/YYYY'), moment(date2[1], 'DD/MM/YYYY'));
            $scope.filter.number_date = array_date2.length;
        }
        $http.get(base_url + '/statistics/ajax_report_discount_by_date_by_invoice?filter=' + JSON.stringify($scope.filter)).then(r => {

            var array_date2 = [];
            var big_data2 = [];
            if ($scope.filter.date && $scope.filter.number_date <= 31) {
                var date = $scope.filter.date.split(' - ');
                array_date2 = getDates(moment(date2[0], 'DD/MM/YYYY'), moment(date2[1], 'DD/MM/YYYY'));
                array_date2.forEach(element => {
                    value = {};
                    value.date = element;
                    value.total_all = [];
                    value.total_number = 0;
                    value.total_price_number = 0;
                    big_data2.push(value);
                });
                r.data.data.forEach(element2 => {
                    big_data2.forEach(element => {
                        if (element.date == element2.date) {
                            element.total_number = element.total_number + parseInt(element2.total_all);
                            element.total_price_number = element.total_price_number + parseInt(element2.total_price);
                            element.total_all.push(element2)
                        }
                    });
                });
            } else if ($scope.filter.number_date > 31) {
                var date = $scope.filter.date.split(' - ');
                array_date2 = getMonths(moment(date[0], 'DD/MM/YYYY'), moment(date[1], 'DD/MM/YYYY'));
                array_date2.forEach(element => {
                    value = {};
                    value.date = element;
                    value.total_all = [];
                    value.total_number = 0;
                    value.total_price_number = 0;
                    big_data2.push(value);
                });
                r.data.data.forEach(element2 => {
                    big_data2.forEach(element => {
                        if (element.date == element2.date) {
                            element.total_number = element.total_number + parseInt(element2.total_all);
                            element.total_price_number = element.total_price_number + parseInt(element2.total_price);
                            element.total_all.push(element2)
                        }
                    });
                });
            }
            if (big_data2.length != 0) {
                data2 = big_data2
            } else {
                data2 = [
                    { date: 1, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 2, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 3, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 4, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 5, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 6, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 7, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 8, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 9, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 10, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 11, total_all: [], total_number: 0, total_price_number: 0 },
                    { date: 12, total_all: [], total_number: 0, total_price_number: 0 }
                ]
                r.data.data.forEach(element2 => {
                    data2.forEach(element => {
                        if (element.date == element2.date) {
                            element.total_number = element.total_number + parseInt(element2.total_all);
                            element.total_price_number = element.total_price_number + parseInt(element2.total_price);
                            element.total_all.push(element2)
                        }
                    });
                });
            }
            data2.forEach(element => {
                element.total_price_number = parseInt(element.total_price_number);
                element.total_price_number_pie = (parseInt(element.total_price_number) / 1000000) || 0;

            });


            if (vl == 2) {
                $scope.ar2.setData(data2);
                $('.load2 img').css('opacity', '0');
                $('.cover-chart').css('opacity', '1');
                if ($scope.filter.number_date > 10 && $scope.filter.number_date <= 31) {
                    $scope.ar2.options.xLabelAngle = 90;
                    $scope.ar2.redraw();
                } else {
                    $scope.ar2.options.xLabelAngle = 0;
                    $scope.ar2.redraw();
                }
                //   addNumberToChart2();
                $scope.show3 = true;
                return false;
            }
            $scope.ar2 = new Morris.Line({
                element: 'chartUsed',
                data: data2,
                xkey: 'date',
                parseTime: false,
                xLabels: 'date',
                ykeys: ['total_number', 'total_price_number_pie'],
                dataLabels: true,
                lineColors: ['#2f7df6', '#00a65a'],
                labels: ['Đã sử dụng'],
                xLabelAngle: 0,
                hoverCallback: function (index, options, content, row) {
                    var str_hover = `
                            <div class='morris-hover-row-label'>
                              Thời gian: ${row.date}
                            </div>
                            <div class="morris-hover-point" style="color: #2f7df6">
                              Tổng số mã đã sử dụng : ${row.total_number} 
                            </div>
                            <div class="morris-hover-point" style="color: #00a65a">
                              Tổng tiền thu được : ${formatNumber(row.total_price_number)} VNĐ
                            </div>
                            <div class="morris-hover-point" style="color: #ebebeb">
                            ${row.total_all.length > 0 ? '<span style="color:#f39c12" >*Tên</span>: <span  style="color:">Số lượng</span> - <span style="color:#00a65a">Số tiền thu được</span>' : ''} <br>
                            ${row.total_all.length > 0 ? listArray2(row.total_all) : ''}
                            ${row.total_all.length > 3 ? '<span class="click">[...]<span>' : ''}
                            </div>
                         `;
                    return str_hover;
                }
            }).on('click', function (i, row) {
                row.total_price_number = formatNumber(row.total_price_number);
                row.total_all.forEach(element => {
                    element.total_price = formatNumber(parseInt(element.total_price));
                });
                if (row.total_all.length > 0) {
                    $scope.$apply(function () {
                        $scope.datachart = row;
                    })
                    $('#modalchart2').modal('show');
                }
            });
            // addNumberToChart2();
            $('.load2 img').css('opacity', '0');
            $('.cover-chart').css('opacity', '1');
            $scope.show3 = true;
        })

    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getDetail();
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
});