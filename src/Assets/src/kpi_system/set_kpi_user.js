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
        $scope.new = {};

        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.store_id = [currStoreId+''];

        $scope.filter.date = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().endOf('month').format('DD/MM/YYYY');

        $scope.filter.month = moment().format('MM');
        $scope.filter.year = moment().format('YYYY');

        $scope.current_month = angular.copy($scope.filter.month);
        $scope.current_year = angular.copy($scope.filter.year);


        $scope.standar = {};
        $scope.getCriteriaUser();
        $scope.dateInputInit();
        $scope.getGroups();
        $scope.getStandards();
        
        $scope.getUser();
        $scope.select2();
    }

    $scope.openCfmodel = (item) => {
        if (item.criteria_user_id) {
            window.open('kpi_system/set_kpi_user_detail?id=' + item.criteria_user_id, '_blank');
            return;
        }
        $scope.current_item = item;
        $scope.new.group_id = item.group_id;
        $('#confirm').modal('show');
        setTimeout(() => {
            $scope.select2();
        }, 500);
    }

    $scope.goToLink = (group_id_sc, item) => {

        if (!Number(document.getElementById("sl_id").value)) {
            toastr["error"]("Chọn tiêu chí đánh giá!");
            return false;
        }




        var data = {
            data: item,
            group_id: $scope.new.group_id,
            start: moment('01/' + $scope.current_month + '/' + $scope.current_year, 'DD/MM/YYYY').startOf('month').format('YYYY/MM/DD'),
            end: moment('01/' + $scope.current_month + '/' + $scope.current_year, 'DD/MM/YYYY').endOf('month').format('YYYY/MM/DD'),
            coefficient: $scope.new.coefficient
        }
        $http.post(base_url + 'Kpi_system/to_link', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                window.open('kpi_system/set_kpi_user_detail?id=' + r.data.data.link_to, '_blank');

                $scope.getCriteriaUser();
                $scope.group_id_sc = {};
                $scope.select2();
                $('#confirm').modal('hide');

            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });

    }

    $scope.addMoreSub = (value) => {
        if (!value.obs) {
            value.obs = []
        }
        value.obs.push({
            name: '',
            vl: ''
        })
    }

    $scope.getUser = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_user').then(r => {
            if (r && r.data.status == 1) {
                $scope.users = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.getGr = () => {
        var data = {
            status: 1
        }

        $http.get(base_url + 'Kpi_system/ajax_get_group_st?filter=' + JSON.stringify(data)).then(r => {
            $('.group_').removeClass('loading');
            $scope.standard_gr = r.data.data;
            $scope.select2();
        })
    }


    $scope.getGroups = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_groups').then(r => {
            $scope.groups = r.data.data;
        })
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
    function isInt(n) {
        return n % 1 === 0;
    }


    $scope.getStandards = () => {


        $http.get(base_url + '/Kpi_system/ajax_get_standards').then(r => {

            $scope.standards = r.data.data;
        })
    }
    $('#confirm').on('shown.bs.modal', function (e) {
        $scope.getGr();
    })
    $("#confirm").on("hidden.bs.modal", function () {
        $('.group_').addClass('loading');
    });


    $scope.changeStandard = (id = null) => {

        $scope.standards_ = [];
        if ($scope.standar.standard_ids) {
            if (id) {
                var index = $scope.standar.standard_ids.indexOf(id);
                $scope.standar.standard_ids.splice(index, 1);
            }
            $scope.standards.forEach(element => {
                if ($scope.standar.standard_ids.indexOf(element.id) >= 0) {
                    $scope.standards_.push(element);
                }
            });
            console.log($scope.standards_);
        }
    }

    $scope.fresh = () => {
        $scope.standar = {};
        $scope.select2();
        $scope.changeStandard();
    }
    $scope.setUnDate = (value) => {
        delete $scope.filter[value];
        $scope.select2();
    }

     $scope.openDetail = (item) => {
        var e = angular.copy(item);

        $scope.standar.id = e.id;
        $scope.standar.name = e.name;
        $scope.standar.status = e.status;
        $scope.standar.main_group_id = e.main_group_id;
        $scope.standar.group_id = e.group_id;
        $scope.standar.obs = e.obs;
        $scope.standar.user_id = e.user_id;


        $scope.select2();
        $scope.changeStandard();
        $('#addBg').modal('show');
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
        }, 1);
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $scope.getCriteriaUser = () => {
        $('table').addClass('loading');
        $http.get(base_url + 'Kpi_system/ajax_get_user_criterias?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('table').removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.current_month = $scope.filter.month;
                $scope.current_year = $scope.filter.year;

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

    $scope.deleteCr = (value) => {
        swal({
            title: "Xác nhận xóa tiêu chí cá nhân",
            text: "Sẽ xoá hết dữ liệu đã đánh giá trong tháng " + $scope.current_month + " của " + value.user_name + " nếu có!",
            icon: "question",
            buttons: true,
            dangerMode: true,
            showCancelButton: true,
            confirmButtonText: 'Đồng ý!',
            cancelButtonText: 'Quay lại!',
            className: "swal-sm"
        }, function (rs) {
            if (rs) {
                var data = {
                    criteria_user_id: value.criteria_user_id
                }
                $http.post(base_url + 'Kpi_system/ajax_delete_cr', JSON.stringify(data)).then(r => {
                    if (r && r.data.status == 1) {
                        $scope.getCriteriaUser();
                        toastr["success"]("Thành công!");

                    } else if (r && r.data.status == 0) {
                        toastr["error"](r.data.message);
                    } else {
                        toastr["error"]("Đã có lỗi xẩy ra!");
                    }
                });
            }
        })
    }

    $scope.addNew = () => {

        // if (!$scope.standar.name) {
        //     toastr["error"]("Nhập tên!");
        //     return false;
        // }

        // if (!$scope.standar.main_group_id) {
        //     toastr["error"]("Chọn bộ phân!");
        //     return false;
        // }
        var data = {
            data: $scope.standar,
            start: moment('01/' + $scope.standar.month + '/' + $scope.standar.year, 'DD/MM/YYYY').startOf('month').format('YYYY/MM/DD'),
            end: moment('01/' + $scope.standar.month + '/' + $scope.standar.year, 'DD/MM/YYYY').endOf('month').format('YYYY/MM/DD')
        };
        console.log(data);

        $http.post(base_url + 'Kpi_system/ajax_add_new_c_user', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getCriteriaUser();
                $('#addBg').modal('hide');
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
        $scope.getCriteriaUser();
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