app.controller('marketing_data_reports', function ($scope, $http, $sce, $compile) {
    $scope.init = () => {
        $('body').addClass('sidebar-collapse');
        $scope.object_generating();
        setTimeout(() => {
            $scope.dateInputInit();
        }, 50);
    }

    $scope.getAllData = () => {
        $scope.getReportData();
        $scope.get_report_by_store_id();
        $scope.getReportDataBySources();
        $scope.get_marketing_budgets();
        runDrag_to_scroll();
    }
    // drag to scroll

    function runDrag_to_scroll() {
        const slider = document.querySelector('.outside-tablecustom');
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('moving');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('moving');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('moving');
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 3; //scroll-fast
            slider.scrollLeft = scrollLeft - walk;

        });
    }

    // end drag to scroll

    $scope.object_generating = () => {
        $scope.filter = {};
        $scope.filter.source_id = '0';
        $scope.filter.store_id = '0';
        $scope.filter.camp_id = '0';
        select2();
    }

    $scope.get_marketing_budgets = () => {
        $http.get(base_url + 'sale_care/get_mkt_budgets_report?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.budgets = r.data.data;
            }
        })
    }
    $scope.converHtmlStatus = (ts, ms) => {

        var a = '';
        if (ts == 0 || ms == 0) {
            a = '<div class="badge badge-primary">•</div>';
        } else {
            var temp = ts / ms;
            if (temp < 0.2) {
                a = '<div class="badge badge-success">G</div>';
            } else if (temp < 0.25) {
                a = '<div class="badge badge-warning">N</div>';
            } else {
                a = '<div class="badge badge-danger">B</div>';
            }
        }
        return $sce.trustAsHtml(a);
    }
    $scope.converHtmlKPI = (ts, ms) => {
        var a = '';
        if (ts == 0 || ms == 0) {
            a = '<div class="badge badge-primary">•</div>';
        } else {
            var temp = ts / ms;
            if ((temp / $scope.kpi_tl) < 0.75) {
                a = '<div class="badge badge-dark">SOS</div>';
            } else if ((temp / $scope.kpi_tl) < 0.95) {
                a = '<div class="badge badge-danger">B</div>';
            } else if ((temp / $scope.kpi_tl) < 1) {
                a = '<div class="badge badge-warning">N</div>';
            } else {
                a = '<div class="badge badge-success">G</div>';
            }
        }
        return $sce.trustAsHtml(a);
    }

    $scope.getReportData = () => {
        $http.get(base_url + 'sale_care/ajax_get_marketing_data_reports?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.on-blur').removeClass('on-blur');
                $scope.overviews_data = r.data.data;
            } else toastr["error"]("Đã có lỗi xảy ra!");
        });
    }

    $scope.getReportDataBySources = () => {
        $('.chil-tr').remove();
        $('.highlight').removeClass('highlight');
        $http.get(base_url + 'sale_care/ajax_get_marketing_data_report_by_sources?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.invoice_rp = r.data.data;
            } else toastr["error"]("Đã có lỗi xảy ra!");
        });
    }
    $scope.get_report_by_store_id = () => {
        $http.get(base_url + 'sale_care/get_marketing_data_report_by_store?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.stores_rp = r.data.data;
                $scope.kpi_tl = r.data.kpi_tl;
                $scope.today_during = r.data.today_during;

                var newItem = {};
                newItem.description = 'Tổng SPA';
                newItem.id = -2;
                newItem.total_cost = 0;
                newItem.total_interactive = 0;
                newItem.total_phone = 0;
                newItem.total_revenue = 0;
                newItem.total_source_cost = 0;
                newItem.total_target = 0;
                angular.forEach($scope.stores_rp, function (element, index) {
                    if (element.id != 0) {
                        newItem.total_cost += parseInt(element.total_cost);
                        newItem.total_interactive += parseInt(element.total_interactive);
                        newItem.total_phone += parseInt(element.total_phone);
                        newItem.total_revenue += parseInt(element.total_revenue);
                        newItem.total_source_cost += parseInt(element.total_source_cost);
                        newItem.total_target += parseInt(element.total_target);
                    }
                })
                $scope.stores_rp.push(newItem);
            } else toastr["error"]("Đã có lỗi xảy ra!");
        });
    }

    function formatNumber(num) {
        if (isNaN(num) || isFinite(num)) {
            num = 0;
        }
        if (num % 1 > 0) {
            num = parseFloat(num).toFixed(2);
        }
        console.log(num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'));
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.get_marketing_data_source_by_store = (event, store_id) => {
        $http.get(base_url + 'sale_care/ajax_get_marketing_data_source_by_store/' + store_id + '?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.chil-tr').remove();
                $('.highlight').removeClass('highlight');
                var html = (``);
                r.data.data.forEach(item => {
                    html += (`
                            <tr class="chil-tr">
                                <td>
                                    <div class="d-flex ai-c">
                                    ${(item.name)}<span class="badge badge-primary" style="display: inline-block; margin-left: 5px;">${item.total_num}</span>
                                    </div>
                                </td>
                                <td style="text-align:right;">${(item.total_cost)}đ</td>
                                <td style="text-align:right;">${(item.total_interactive)} Lượt</span></td>
                                <td style="text-align:right;">${(item.total_phone_import)} Số</span></td>
                                <td style="text-align:right;">${(item.total_num)} - <span style="text-decoration: underline;" title="Tỉ lệ so với số đã nhập">${formatNumber((item.total_num / item.total_phone_import) * 100)}%</span></td>
                                <td style="text-align:right;">${(item.booked)} - <span style="text-decoration: underline;">${formatNumber((item.booked / item.total_num) * 100)}%</span></td>
                                <td style="text-align:right;">${(item.ived)} - <span style="text-decoration: underline;">${formatNumber((item.ived / item.booked) * 100)}%</span></td>
                                <td style="text-align:right;"><span class="badge badge-success" style="display: inline-block">${formatNumber((item.total) ? item.total : 0)}đ</span></td>
                            </tr>`)
                });
                $(event.target).parents('tr').after(html);
                $(event.target).parents('tr').addClass('highlight');
            } else toastr["error"]("Đã có lỗi xảy ra!");
        });
    }
    $scope.setbgcolor = (color) => {
        return { "background-color": color };
    }

    function select2() {
        setTimeout(() => {
            $('select2').select2();
        }, 50);
    }
    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'left',
            alwaysShowCalendars: true,
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month'),
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
    }
})