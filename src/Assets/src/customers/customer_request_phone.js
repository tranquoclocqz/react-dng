app.controller('rqPhoneCtrl', function ($scope, $http, $sce, $window) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box-1').css('opacity', '1');
        $scope.filter = {};
        $scope.filter.status = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.image_default = base_url + 'assets/images/acount-df.png';
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
    }

    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $http.post(base_url + 'customers/ajax_customer_phone?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }
    $scope.confirm_request_phone = (item, status_cus) => {

        $scope.dataChange = {
            id: item.id,
            id_customer: item.customer_id,
            status: status_cus,
            phone_old: item.phone_old,
            phone_new: item.phone_new,
            id_user: item.user_id
        };

        $('#modal_id').modal('show');
        // $http.post(base_url + 'customers/confirm_request_phone',data).then(r => {
        //     if (r.data && r.data.status == 1) {
        //         toastr['success'](r.data.message);
        //         $scope.getAll();
        //     }
        //     else{
        //         toastr['error'](r.data.message);
        //     }
        // });
        // debugger;
        // if(item.status == 2){
        //     $http.get(base_url + 'customers/api_fix_phone/'+item.phone_old+'?filter=' + item.phone_new).then(r => {
        //         if (r) {
        //             toastr['success']('Đã duyệt !');
        //         }
        //         else{  toastr['error']('Xảy ra lỗi !');}
        //     })
        //  }
    }

    $scope.send_request_phone = () => {
        $('#modal_id').modal('hide');
        if ($scope.dataChange) {
            $http.post(base_url + 'customers/confirm_request_phone', $scope.dataChange).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr['success'](r.data.message);
                    $scope.getAll();
                } else {
                    toastr['error'](r.data.message);
                }
            });
        }

    }

    $scope.formatDate = (date, fm) => {
        return moment(date).format(fm);
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(false);
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


    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(3, 'month').startOf('month'),
            endDate: moment(),
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
});