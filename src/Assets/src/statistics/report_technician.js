app.controller('report_tech', function ($scope, $http) {
    $scope.init = () => {
        $('.box1').css('display', 'block');
        $scope.month_current = moment($scope.date).format("M");
        $scope.year_current = moment().year();
        $scope.loading = false;
        $scope.month_start = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        $scope.month_end = [];
        $scope.year_ends = [];

        $scope.filter = {
            month_start: $scope.month_current,
            year_start: $scope.year_current + '',
            month_end: $scope.month_current + '',
            year_end: $scope.year_current + '',
        }
        select2();
        $scope.get_year();
        $scope.changemonthStart();
    }

    $scope.getCurent = () => {
        if ($scope.filter.store_id && $scope.filter.store_id > 0) {

            $scope.loading = true;
            $http.get(base_url + 'statistics/ajax_get_report_tech?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data && r.data.status == 1) {
                    $scope.loading = false;
                    $scope.randDate = r.data.date;
                    $scope.rows = r.data.data;
                    $scope.rows.forEach(us => {
                        let item = [];
                        for (const p in us.data) {
                            let tmp = us.data[p];
                            tmp.date = p;
                            item.push(tmp);
                        }
                        us.reports = item;
                    });
                }
            });
        } else {
            toastr['error']('Bạn chưa chọn chi nhánh!');
        }

    }

    $scope.chooseDate = () => {
        $('#dateft').modal('show');
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2()
        }, 200)
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

    $scope.getClassColor = (percent) => {
        if (percent < 50) {
            return "label-danger";
        } else if (percent >= 50 && percent < 80) {
            return "label-warning";
        } else {
            return "label-success";
        }
    }

    $scope.caPercent = (first, last) => {
        let per = 0;
        if (last == 0) {
            per = 100;
        } else {
            per = (first / last) * 100;
        }
        return $scope.formatMoney(per, 2);

    }

});