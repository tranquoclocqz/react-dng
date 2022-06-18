 app.controller('bg_user', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.content').css('opacity', 1);
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.filter.date = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().endOf('month').format('DD/MM/YYYY');

        $scope.standar = {};
        $scope.getStand();
        $scope.dateInputInit();
        $scope.getGr();
    }


    $scope.getGr = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_group_st').then(r => {
            $scope.standard_gr = r.data.data;
        })
    }

    $scope.openPoint = (item) => {
        $scope.cr_item = item;
        $scope.score = {};
        $scope.score.year = moment().format('YYYY');
        $scope.score.month = "";
        $scope.cr_status = 1;
        $scope.dateTime();
        $scope.getScores();
        $('.fr_cl').addClass('active');
        $('.fr_cl').next().removeClass('active');

        $('#addScore').modal('show');
    }


    $('#addScore').on('hidden.bs.modal', function (e) {
        $scope.getStand();
    })


    $scope.changeCheck = (item) => {
        $('#table').addClass('loading');

        setTimeout(() => {
            $scope.$apply();
            $scope.addScore(item);
        }, 50);
    }
    $scope.addScore = (check = null) => {
        //$scope.score =
        if (!check) {
            if (!$scope.score.max_point) {
                toastr["error"]("Nhập điểm!");
                return false;
            }

            if (!$scope.score.month) {
                toastr["error"]("Chọn tháng bắt đầu!");
                return false;
            }
            if (!$scope.score.year) {
                toastr["error"]("Chọn năm bắt đầu!");
                return false;
            }
            $('#addScore button').addClass('loading');

            var data = {
                criteria_id: $scope.cr_item.id,
                start_date: moment('01-' + $scope.score.month + '-' + $scope.score.year, 'DD-MM-YYYY').startOf('month').format('DD-MM-YYYY'),
                point: $scope.score.max_point
            };
        } else {
            var data = {
                id: check.id,
                status: check.status,
                criteria_id: check.criteria_id,
                start_date: check.date
            };
        }



        $http.post(base_url + 'Kpi_system/ajax_add_score', data).then(r => {
            $('#addScore button').removeClass('loading');
            $('#table').removeClass('loading');

            if (r && r.data.status == 1) {

                $scope.getScores();
                toastr["success"]("Thành công!");
                $scope.score = {};
            } else if (r && r.data.status == 0) {
                if (check)
                    if (check.status == 1) {
                        check.status = 0;
                    } else {
                        check.status = 1;
                    }
                toastr["error"](r.data.message);
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.getScores = () => {
        var data = {
            criteria_id: $scope.cr_item.id
        }

        $http.get(base_url + 'Kpi_system/ajax_get_score?filter=' + JSON.stringify(data)).then(r => {
            $('#table').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.scores = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.dateTime = () => {
        setTimeout(() => {
            $(".date_").datepicker({
                dateFormat: "dd-mm-yy"
            });
        }, 1);
    }

    $scope.openDetail = (item) => {
        var e = angular.copy(item);
        $scope.standar.id = e.id;
        $scope.standar.name = e.name;
        $scope.standar.note = e.note;
        $scope.standar.active = e.active;
        $scope.standar.max_point = e.max_point;


        $('#addBg').modal('show');

    }




    $scope.setUnDate = (value) => {
        delete $scope.filter[value];
        $scope.select2();
    }
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();

        }, 1);
    }
    $scope.freshForm = () => {
        $scope.standar = {};
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.getStand = () => {
        $('table').addClass('loading');
        $http.get(base_url + 'Kpi_system/ajax_get_standar?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('table').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.data_ajax = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.getVouchers = () => {
        $http.get(base_url + '/statistics/ajax_get_voucher').then(r => {
            $scope.vouchers = r.data.data;
        })
    }


    $scope.addNewStandar = () => {

        if (!$scope.standar.name) {
            toastr["error"]("Nhập tên!");
            return false;
        }

        // if (!$scope.standar.max_point) {
        //     toastr["error"]("Nhập điểm!");
        //     return false;
        // }

        $http.post(base_url + 'Kpi_system/ajax_add_new_standar', JSON.stringify($scope.standar)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getStand();
                $('#addBg').modal('hide');
                toastr["success"]("Thành công!");

                $scope.standar = {};
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });

    }

    $scope.dateInputInit = () => {
        if ($('.date').length) {
            //var start = $scope.start;
            //var end = $scope.end;
            if (typeof start === "undefined") {
                start = end = moment().subtract(1, 'days').format("MM/DD/YYYY");
            }
            if ($scope.filter.date) {
                var date = $scope.filter.date.split(' - '),
                    start = moment(date[0], 'DD/MM/YYYY'),
                    end = moment(date[1], 'DD/MM/YYYY');
            } else {
                var
                    start = moment(),
                    end = moment();
            }


            setTimeout(() => {
                $('.date').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    startDate: start,
                    endDate: end,
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
                        format: 'DD/MM/YYYY'
                    }
                });
            }, 100);
        }
    }


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getStand();
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

}); app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
})

app.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);