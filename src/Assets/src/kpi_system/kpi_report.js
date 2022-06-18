 app.controller('report', function ($scope, $http) {
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
        $scope.filter.month = moment().format('MM');
        $scope.filter.year = moment().format('YYYY');
        $scope.filter.user = '0'
        $scope.normalUser = normal_user;
        $scope.is_send = '';
        $scope.ob = {};
        $scope.standar = {};
        $scope.img_account_df = base_url + 'assets/images/acount-df.png';
        $scope.dateInputInit();
        $scope.getStore();
        if ($scope.normalUser && month && year) {
            $scope.filter.store_id = store_id.toString();
            $scope.filter.month = moment(month, 'MM').format('MM');
            $scope.filter.year = moment(year, 'YYYY').format('YYYY');
            $scope.getKpiReport();
        }

    }

    $scope.fortmat_ = (number) => {
        if (!number || number == 0) {
            return 0;
        }
        if (isInt(number)) {
            return number;
        } else {
            return parseFloat(number).toFixed(2);
        }

    }
    $scope.openModalA = () => {
        $('#changeA').modal('show');

        setTimeout(() => {
            $scope.select2();
        }, 100);
    }

    $scope.changeA = () => {
        if (!$scope.ob.number_days) {
            toastr["error"]("Nhập ngày số làm việc!");
            return;
        };

        var data = {
            id: $scope.data_report.id_store_d,
            number_days: $scope.ob.number_days
        };
        $http.post(base_url + 'Kpi_system/changeNumberD', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getKpiReport();
                toastr["success"]("Thành công!");
                $('#changeA').modal('hide');
                delete $scope.ob.number_days;
                $scope.select2();
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.renderExcel = () => {
        if (!$scope.filter.store_id) {
            toastr["error"]("Chọn chi nhánh!");
            return;
        }
        if (!$scope.filter.month) {
            toastr["error"]("Chọn tháng!");
            return;
        }
        var data = {
            "store_id": $scope.filter.store_id,
            "month_start": $scope.filter.month,
            "month_end": $scope.filter.month,
            "year_start": $scope.filter.year,
            "year_end": $scope.filter.year

        }
        $http.get(base_url + 'Kpi_system/createXLS/?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                var $a = $("<a>");
                $a.attr("href", r.data.data);
                $a.attr("download", "Excel" + moment().format('YYYYMMDDHHIISS') + '.xlsx');
                $("body").append($a);
                $a[0].click();
                $a.remove();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    function isInt(n) {
        return n % 1 === 0;
    }

    $scope.getKpiReport = () => {

        if (!$scope.filter.store_id) {
            toastr["error"]("Chọn chi nhánh!");
            return;
        }
        if (!$scope.filter.month) {
            toastr["error"]("Chọn tháng!");
            return;
        }
        var data = {
            "store_id": $scope.filter.store_id,
            "month_start": $scope.filter.month,
            "month_end": $scope.filter.month,
            "year_start": $scope.filter.year,
            "year_end": $scope.filter.year,
            "user_id": $scope.filter.user,
            "normol_user_id": $scope.normalUser
        }
        $('.body_').addClass('loading');
        $http.get(base_url + 'Kpi_system/ajax_get_kpi_report?filter=' + JSON.stringify(data)).then(r => {
            $('.body_').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.data_report = r.data.data;
                $scope.is_send = $scope.data_report.send_at;
            } else if (r && r.data.status == 0) {
                delete $scope.data_report;
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStore = () => {
        $scope.stores = all_stores;
        return;
        $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }




    $('#addScore').on('hidden.bs.modal', function (e) {
        $scope.getStand();
    })


    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();

        }, 1);
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

    $scope.sendMessage = () => {
        swal({
            title: "Thông báo",
            text: "Bạn có chắc muốn gửi thông báo !",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            closeOnConfirm: false,
            showLoaderOnConfirm: false
        },
        function () {
            const data_rp = $scope.data_report ? angular.copy($scope.data_report) : '';
            
            if(!data_rp || data_rp.data.length == 0) {
                swal("Thông báo", "Danh sách đánh giá KPI trống", "error");
                return;
            }

            const data_report = data_rp.data;
            const list_user_report = data_report.filter(item => item.criteria_user_id);
            const is_complete = list_user_report.every(item => item.status == 2);

            if (data_rp.send_at) {
                swal("Thông báo", "Bạn không thể gửi lại tin nhắn", "error");
                return;
            }
            if(!list_user_report.length) {
                swal("Thông báo", "Danh sách đánh giá KPI trống", "error");
                return;
            }

            if (!is_complete) {
                swal("Thông báo", "Vui lòng hoàn tất đánh giá KPI trước khi gửi", "error");
                return;
            }

            var data_rq = {
                'list_user_report': list_user_report,
                'criteria_store_id': data_rp.id_store_d,
                'is_send': data_rp.send_at,
                'month': data_rp.month,
                'year': data_rp.year
                
            }
            $http.post(base_url + 'Kpi_system/send_message_to_user',JSON.stringify(data_rq)).then(r => {
                if (r.data.status) {
                    $scope.is_send = true;
                    swal("Thông báo", r.data.message, "success");
                } else {
                    swal("Thông báo", r.data.message, "error");
                }
            })
        });
    }

    $scope.getListUser = () => {
        var store_id = angular.copy($scope.filter.store_id);
        $('.ls-user .select2-container').addClass('loadingv2');
        if (store_id) {
            $http.get(base_url + 'Kpi_system/ajax_get_list_user_of_store?id=' + store_id).then(r => {
                if (r.data.status) {
                    $('.ls-user .select2-container').removeClass('loadingv2');
                   $scope.listUser = r.data.data;
                   $scope.filter.user = '0';
                   select2_img();
                } else {
                    showMessErr(r.data.message);
                }
            })
        } else {
            $('.ls-user .select2-container').removeClass('loadingv2')
            $scope.listUser = [];
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

});
app.directive('ngEnter', function () {
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