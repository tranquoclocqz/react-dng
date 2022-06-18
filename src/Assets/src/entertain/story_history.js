app.controller('story_history', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 15,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {

        $scope.filter = {};

        $scope.start = moment().format('MM/DD/YYYY');
        $scope.end = moment().format('MM/DD/YYYY');
        $scope.filter.date = moment().format('MM/DD/YYYY') + ' - ' + moment().format('MM/DD/YYYY');
        $scope.filter.formatdate = moment().format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
        $scope.getStorySent();
        $scope.dateInputInit();
        $scope.getCategory();
        $scope.getPostByCate();

    }

    $scope.dateInputInit = () => {
        if ($('.date').length) {
            var start = $scope.start;
            var end = $scope.end;

            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            $('.date').daterangepicker({
                opens: 'right',
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                startDate: start,
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

            $('.date').on('apply.daterangepicker', function (ev, picker) {
                $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
                $scope.filter.date = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
                $scope.filter.formatdate = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');
            });
        }
    }
    $scope.searchData = () => {
        console.log($scope.filter);
    }

    $scope.getCategory = () => {
        $http.get(base_url + '/entertain/ajax_get_category/').then(r => {
            if (r && r.data.status == 1) {
                $scope.categorys = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getPostByCate = () => {
        $http.get(base_url + '/entertain/ajax_get_post_by_array_cate?filter=' + JSON.stringify($scope.filter.category_id)).then(r => {
            if (r && r.data.status == 1) {
                $scope.posts = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getStorySent = () => {
        $('.load img').css('opacity', '1');
        $http.get(base_url + '/entertain/ajax_get_story_sent?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.load img').css('opacity', '0');
                $scope.storys = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.showModal = (data) => {
        $scope.sent = data;
        $('#modal').modal('show');
        $http.get(base_url + '/entertain/ajax_get_employee_option?filter=' + JSON.stringify(JSON.parse('[' + $scope.sent.sentuser + ']'))).then(r => {
            if (r && r.data.status == 1) {
                $scope.usersent = r.data.data;
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
        $scope.getEmployee();
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
    //end paging
});