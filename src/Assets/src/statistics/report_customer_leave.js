app.controller('reportCtrl', function($scope, $http, AppointmentSvc) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {

        $('#reportrangeCustome').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            showCustomRangeLabel: false,
            ranges: {
                //'Hôm nay': [moment(), moment()],
                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '7 ngày trước': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                '30 ngày trước': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                'Tháng này': [moment().startOf('month'),  (moment() <= moment().endOf('month'))?moment().subtract(1, 'days'):moment().endOf('month').subtract(1, 'days')],
                'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            "locale": {
                "format": 'DD/MM/YYYY',
                "customRangeLabel": "Custom",
                "applyLabel": "Gắn",
                "cancelLabel": "Hủy",
                "daysOfWeek": ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
                "monthNames": ["Tháng một", "Tháng hai", "Tháng ba", "Tháng tư", "Tháng năm", "Tháng sáu", "Tháng bảy", "Tháng tám", "Tháng chín", "Tháng mười", "Tháng mười một", "Tháng mười hai"],
            }

        });

        $('.box-hide').css('opacity', 1);
        $scope.filter = {
            date: moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().subtract(1, 'days').format('DD/MM/YYYY'),
            store_ids: ['0'],
            customer_region: ['0'],
        };
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        select2();
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }

    $scope.handleFilter = () => {
        $scope.filter.offset = 0;
        $scope.pagingInfo.currentPage = 1;
        $scope.getAll();
    }

    $scope.getAll = () => {
        $scope.loading = true;
        if ($scope.filter.date && $scope.filter.date != '') {
            let ar = $scope.filter.date.split(' - ');
            let st = ar[0].split('/');
            let end = ar[1].split('/');
            $scope.filter.start_date = st[2] + '-' + st[1] + '-' + st[0];
            $scope.filter.end_date = end[2] + '-' + end[1] + '-' + end[0];
        }
        AppointmentSvc.getReportCustomerLeave($scope.filter).then(r => {
            $scope.loading = false;
            $scope.rows = r.data;
            $scope.total = r.total;
            $scope.pagingInfo.total = r.total.total;
            $scope.pagingInfo.totalPage = Math.ceil(r.total.total / pi.itemsPerPage);
        });

    }

    $scope.openHistoryApp = (phone) => {
        let val = {
            phone: phone,
            start_date: $scope.filter.start_date,
            end_date: $scope.filter.end_date
        }
        $('#appHistory').modal('show');
        $scope.loadApp = true;
        AppointmentSvc.getAppointmentHistory(val).then(r => {
            $scope.loadApp = false;
            $scope.appHis = r;
        })
    }

    $scope.openHistory = (id) => {
        window.open(base_url + `/customers/history/${id}`, '_blank');
    }

    //paging
    $scope.go2Page = function(page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
    }

    $scope.Previous = function(page) {
        if (page - 1 > 0) $scope.go2Page(page - 1);
        if (page - 1 == 0) $scope.go2Page(page);
    }

    $scope.getRange = function(paging) {
            var max = paging.currentPage + 3;
            var total = paging.totalPage + 1;
            if (max > total) max = total;
            var min = paging.currentPage - 2;
            if (min <= 0) min = 1;
            var tmp = [];
            return _.range(min, max);
        }
        //end paging
    $scope.getListStoreByRegion = () => {
        $scope.filter.store_ids = [];
        if ($scope.filter.customer_region.length && $scope.filter.customer_region.indexOf('0') == -1) {
            $scope.filter.customer_region.forEach(function(item) {
                ls_stores.forEach(function(store) {
                    if (store.admin_region_id == item) {
                        $scope.filter.store_ids.push(store.id);
                    }
                });
            })
        } else {
            $scope.filter.store_ids.push('0');
        }
        select2();
    }
})