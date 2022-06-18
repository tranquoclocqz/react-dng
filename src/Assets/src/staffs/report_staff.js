app.controller('report_staff', function ($scope, $http) {
    $scope.init = () => {
        $('.box1').css('display', 'block');
        $scope.pointWork = [];
        $scope.totalPoint = 0;
        $scope.month_current = moment($scope.date).format("M");
        $scope.year_current = moment().year();
        $scope.is_beauty = is_beauty ? 1 : 0;
        $scope.is_technician = is_technician ? 1 : 0;
        $scope.is_manager = is_manager ? 1 : 0;
        $scope.type_name = '';
        $scope.total = 0;
        $scope.target = 0;
        $scope.ratio = 0;
        $scope.bonus = 0;
        $scope.rate = 0;
        $scope.count_rate = 0;
        $scope.total_invoice = 0;
        $scope.count_rated = 0;
        $scope.staff = [];
        $scope.rows = {};
        $scope.loading = true;
        $scope.loadingPoint = false;
        $scope.month_start = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        $scope.month_end = [];
        $scope.year_ends = [];

        $http.get(base_url + 'staffs/ajax_get_user_stores').then(r => {
            $scope.staff = r.data.data_staff;
            $scope.filter = {
                month_start: $scope.month_current,
                month_end: $scope.month_current,
                year_start: $scope.year_current + "",
                year_end: $scope.year_current + "",
                user_id: $scope.is_manager == 1 ? $scope.staff[0].id : user_id
            }
            select2();
            $scope.get_year();
            $scope.changemonthStart();
            $scope.getCurent();
        })

    }

    $scope.chooseDate = () => {
        $('#dateft').modal('show');
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2()
        }, 200)
    }

    $scope.getCurent = () => {
        $scope.total = {
            sale: 0,
            target: 0,
            count_rate: 0,
            total_invoice: 0,
            bonus: 0,
            countr: 0,
            rate: 0
        }
        $scope.loading = true;
        $http.get(base_url + 'staffs/ajax_get_report_sale_users?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.loading = false;
                $scope.rows = [];
                for (const p in r.data.data) {
                    $scope.rows.push(r.data.data[p]);
                    $scope.total.sale += Number(r.data.data[p].total_sale);
                    $scope.total.target += r.data.data[p].total_target ? Number(r.data.data[p].total_target) : 0;
                    $scope.total.bonus += r.data.data[p].target ? Number(r.data.data[p].target.bonus) : 0;
                    if (r.data.data[p].rate) {
                        $scope.total.rate += Number(r.data.data[p].rate.rate);
                        $scope.total.total_invoice += Number(r.data.data[p].rate.total_invoice);
                        $scope.total.count_rate += Number(r.data.data[p].rate.count_rate);
                        $scope.total.countr++;
                    }
                }
                $("#myfirstchart").empty();
                $scope.mr = new Morris.Bar({
                    element: 'myfirstchart',
                    data: $scope.rows,
                    xkey: 'month',
                    xLabels: 'month',
                    dataLabels: false,
                    ykeys: ['total_target', 'total_sale'],
                    parseTime: false,
                    hideHover: true,
                    labels: ['Target', 'Doanh số'],
                    barColors: ['#f39c12', '#57bb24'],
                    hoverCallback: function (index, options, content, row) {
                        var str_hover = `
                                <div>
                                    <div class='morris-hover-row-label text-center'>
                                    Tháng ${row.month}
                                    </div>
                                    <div class="morris-hover-point text-left " style="color: #f39c12">
                                        Target: ${formatNumber(row.total_target)} đ
                                    </div>
                                    <div class="morris-hover-point text-left " style="color: #57bb24">
                                        Doanh Số: ${formatNumber(row.total_sale)} đ
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
        });

        load_point_work();
    }

    function load_point_work() {
        $scope.loadingPoint = true;

        $http.get(base_url + 'staffs/ajax_get_diligence_user?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.pointWork = [];
                $scope.totalPoint = 0;

                $scope.loadingPoint = false;
                $scope.pointWork = r.data.data;
                $scope.pointWork.forEach(e => {
                    $scope.totalPoint += Number(e.diligence);
                    console.log(e.diligence);
                });
                console.log($scope.totalPoint);
            } else {
                toastr["error"]("Tính điểm chuyên cần đang có lỗi xẩy ra! Vui lòng thử lại sau.");
            }
        })
    }

    $scope.get_point = (d) => {
        let point = $scope.pointWork.find(r => { return r.month == d });
        return point ? point.diligence : 0;
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
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

    $scope.get_year = () => {
        $scope.year = [];
        for (var i = 5; i > 0; i--) {
            $scope.year.push($scope.year_current--);
        }
    }

    $scope.formatMoney = (amount, decimalCount = 0, decimal = ".", thousands = ",") => {
        try {
            decimalCount = Math.abs(decimalCount);
            decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

            const negativeSign = amount < 0 ? "-" : "";

            let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
            let j = (i.length > 3) ? i.length % 3 : 0;

            return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : " đ");
        } catch (e) {
            console.log(e)
        }
    };

});