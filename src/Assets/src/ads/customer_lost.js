app.controller('packages_index', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        $('.box').css('opacity', '1');
        $scope.filter = {};
        $scope.customer_id = 0;
        $scope.customer = {};

        $scope.filter.price_f = 0;

        $scope.filter.search_category = '0';
        $scope.filter.search_type = '0';

        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        // $scope.dateInputInit();

        $scope.load = {}
        $scope.load.modal = false;
        $scope.check = false;


        $scope.end = moment().subtract(1, 'month').startOf('month').format('MM/DD/YYYY');
        $scope.start = moment($scope.end).subtract(15, "days").format('MM/DD/YYYY');

        // $scope.filter.date = $scope.start + ' - ' + $scope.end;
        // console.log($scope.filter.date);

        $scope.getAllCustomerLost();

        setTimeout(() => {
            $('.datesingle').daterangepicker({
                singleDatePicker: true,
                showDropdowns: true,
                minYear: 1901,
                maxYear: parseInt(moment().format('YYYY'), 10)
            });
        }, 100);
    }

    $scope.linkToDetail = (id) => {
        window.open(base_url + '/customers/history/' + id);
    }

    $scope.shoform = (cus) => {
        $scope.tab = 1;
        if (cus.id == $scope.customer_id) {
            $scope.customer_id = 0;
        } else {
            $scope.customer_id = cus.id;
        }
    }

    $scope.changeTab = (val) => {
        $scope.tab = val;
        if (val == 1) getCareHistory();
    }

    function getCareHistory() {
        let data = {

        }
        $http.post(base_url + '/ads/api_get_care_customer_history', data).then(r => {

        })
    }

    $scope.getComplain = (cusIs) => {
        $('#myModal').modal('show');
        $scope.load.modal = false;
        let data = {
            customer_id: cusIs
        }
        $http.post(base_url + '/ads/api_get_complain_by_customer_id', data).then(r => {

            if (r && r.data.status == 1) {
                $scope.complain = r.data.data;
                $scope.load.modal = true;

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.dateInputInit = () => {
        var fisrt = moment().subtract(4, 'month').startOf('month').format('MM/DD/YYYY');
        var end = moment().subtract(2, 'month').format('MM/DD/YYYY');
        $scope.filter.date = fisrt + ' - ' + end;
        if ($('.date').length) {

            $('.date').daterangepicker({
                opens: 'right',
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                startDate: fisrt,
                endDate: end,
                ranges: {
                    'Hôm nay': [moment(), moment()],
                    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                    '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            });


        }
    }

    $scope.formatCr = ($number, $nation_id) => {
        if ($ == 0) return $nation_id == 1 ? '0 đ ' : '0 $ ';
        return $nation_id == 1 ? $scope.formatNumber($number) +
            ' đ ' : $number +
        ' $ ';
    }

    $scope.formatNumber = (num) => {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }


    $scope.getAllCustomerLost = () => {


        $('.cus').addClass('opacity');

        $('.box').css('cursor', 'wait');
        $scope.check = false;
        $scope.filter.price = parseFloat(($scope.filter.price_f.toString().replace(/,/g, "")));
        if (!$scope.filter.price || $scope.filter.price < 0) {
            $scope.filter.price_f = 0;
        }
        $scope.filter.date = $scope.start + ' - ' + $scope.end;

        $http.get(base_url + '/ads/ajax_get_all_customer_lost?filter=' + JSON.stringify($scope.filter)).then(r => {

            if (r && r.data.status == 1) {
                $scope.customer_lost = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $('.cus').removeClass('opacity');
                $scope.check = true;
                $('.box').css('cursor', 'auto');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAllCustomerLost();
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

function FormatCurrency(ctrl) {
    //Check if arrow keys are pressed - we want to allow navigation around textbox using arrow keys
    if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) {
        return;
    }

    var val = ctrl.value;

    val = val.replace(/,/g, "")
    ctrl.value = "";
    val += '';
    x = val.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';

    var rgx = /(\d+)(\d{3})/;

    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    ctrl.value = x1 + x2;
}

function CheckNumeric() {
    return event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode == 46;
}