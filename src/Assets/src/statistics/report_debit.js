app.controller('report_debit', function ($scope, $http) {

    $scope.init = () => {
        $scope.month_start = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        $scope.month_end = [];
        $scope.year_ends = [];
        $scope.year = [];
        let cr_y = Number(moment().format('YYYY'));
        for (var i = 5; i > 0; i--) {
            $scope.year.push(cr_y--);
        }
        $scope.filter = {
            month_start: Number(moment().format('MM')) + '',
            month_end: Number(moment().format('MM')) + '',
            year_start: moment().format('YYYY'),
            year_end: moment().format('YYYY'),
            store_id: store_id + '',
            invoice_type: 0 + ''
        }
        $scope.changemonthStart();
        $scope.get_store();
        $scope.get_debits();

        select2();

    }
    $scope.chooseDate = () => {
        $('#dateft').modal('show');
    }

    $scope.get_debits = () => {
        $scope.loading = true;
        $scope.filter.from = $scope.filter.year_start + '-' + $scope.filter.month_start + '-01';
        $scope.filter.to = $scope.filter.year_end + '-' + $scope.filter.month_end + '-31';
        $scope.sumTotal = {
            number_package: 0,
            number_package_debit: 0,
            total_debit: 0,
            total_price: 0,
            total_pay: 0,
            total_pay_debit: 0,
            count_debit: 0,
        };
        $http.get(base_url + 'statistics/ajax_get_debit_package?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                let resut = r.data.data;
                $scope.pkgs = resut.data;
                $scope.pkgs.forEach(e => {
                    $scope.sumTotal.number_package += Number(e.number_package);
                    $scope.sumTotal.number_package_debit += Number(e.number_package_debit);
                    $scope.sumTotal.total_debit += Number(e.total_debit);
                    $scope.sumTotal.total_price += Number(e.total_price);
                    $scope.sumTotal.total_pay += Number(e.total_pay);
                    $scope.sumTotal.total_pay_debit += Number(e.total_pay_debit);
                    $scope.sumTotal.count_debit += Number(e.count_debit);
                });
                $scope.total = resut.total;

                let data = [];
                Object.keys($scope.total).forEach(function (key) {
                    let val = {
                        count_debit: 0,
                        m: moment(key).format('MM-YYYY'),
                        number_package: 0,
                        number_package_debit: 0,
                        total_debit: 0,
                        total_pay: 0,
                        total_pay_debit: 0,
                        total_price: 0,
                        has_debit: 0
                    }
                    $scope.total[key].forEach(e => {
                        val.count_debit += Number(e.count_debit);
                        val.number_package += Number(e.number_package);
                        val.number_package_debit += Number(e.number_package_debit);
                        val.total_debit += Number(e.total_debit);
                        val.total_pay += Number(e.total_pay);
                        val.total_pay_debit += Number(e.total_pay_debit);
                        val.total_price += Number(e.total_price);
                    });
                    val.has_debit = val.total_debit - val.total_pay_debit;
                    data.push(val);
                });
                if (data.length > 0) {
                    $("#myfirstchart").empty();
                    $scope.mr = new Morris.Bar({
                        element: 'myfirstchart',
                        data: data,
                        xkey: 'm',
                        xLabels: 'm',
                        dataLabels: false,
                        ykeys: ['has_debit', 'total_pay_debit', 'total_debit', 'total_pay', 'total_price'],
                        parseTime: false,
                        hideHover: true,
                        labels: ['Còn Nợ', 'Đã Thu Nợ', 'Tổng Nợ', 'Đã Thanh Toán', 'Tổng Tiền Gói'],
                        barColors: ['#f13c20', '#f39c12', '#116466', '#D1E8E2', '#57bb24'],
                        hoverCallback: function (index, options, content, row) {
                            var str_hover = `
                                    <div>
                                        <div class='morris-hover-row-label text-center'>
                                        Tháng ${row.m}
                                        </div>
                                        <div class="morris-hover-point text-left " style="color: #f13c20">
                                            Còn Nợ: ${formatNumber(row.has_debit)} đ
                                        </div>
                                        <div class="morris-hover-point text-left " style="color: #f39c12">
                                            Đã Thu Nợ: ${formatNumber(row.total_pay_debit)} đ
                                        </div>
                                        <div class="morris-hover-point text-left " style="color: #116466">
                                            Tổng Nợ: ${formatNumber(row.total_debit)} đ
                                        </div>
                                        <div class="morris-hover-point text-left " style="color: #D1E8E2">
                                            Đã Thanh Toán: ${formatNumber(row.total_pay)} đ
                                        </div>
                                        <div class="morris-hover-point text-left " style="color:  #57bb24">
                                            Tổng Tiền Gói: ${formatNumber(row.total_price)} đ
                                        </div>
                                    </div>
                                `;
                            return str_hover;
                        }
                    })

                    function parseSVG(s) {
                        var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
                        div.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
                        var frag = document.createDocumentFragment();
                        while (div.firstChild.firstChild)
                            frag.appendChild(div.firstChild.firstChild);
                        return frag;
                    }

                    var items = $("#myfirstchart").find("svg").find("circle");
                }
                $scope.loading = false;
            }
        })
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
    $scope.get_store = () => {
        $http.get(base_url + 'admin_users/ajax_check_role').then(r => {
            if (r.data.data) {
                $scope.store_ls = r.data.data;
                select2();
            }
        })
    }

    $scope.countPercent = (t, d) => {
        if (d == 0) d = 1;
        let val = (t / d) * 100;
        return val.toFixed(2);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2()
        }, 100)
    }

    $scope.changemonthStart = (type) => {

        if ($scope.filter.year_start == $scope.filter.year_end) {
            $scope.filter.month_end = $scope.filter.month_start;
            $scope.month_end = $scope.month_start.filter(element => {
                return element >= $scope.filter.month_start;
            });
        } else $scope.month_end = $scope.month_start;

        if ($scope.filter.year_start > $scope.filter.year_end) {
            $scope.filter.year_end = $scope.filter.year_start;
        }

        $scope.year_ends = $scope.year.filter(element => {
            return element >= $scope.filter.year_start;
        });

        select2();
    }

});