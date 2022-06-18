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
        $scope.search = {};

        $scope.getStandardGroup();
        $scope.dateInputInit();
        $scope.getGroups();
        $scope.getStandards();
        $scope.getUser();
        $scope.selected_user = [];
    }

    $scope.myFunction = () => {
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById("search-input");
        filter = input.value.toUpperCase();
        ul = document.getElementById("myUL");
        li = ul.getElementsByTagName("tr");
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("td")[0];
            txtValue = a.textContent || a.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }
    $scope.addAll = () => {
        $scope.selected_user = [];
        $scope.users.forEach(element => {
            $scope.selected_user.push(element);
        });
    }

    $scope.addToUsers = (item) => {
        if (!$scope.selected_user) {
            $scope.selected_user = [];
        }
        $user = $scope.checkIn(item.id);
        if ($user >= 0) {
            $scope.selected_user.splice($user, 1);
        } else {
            $scope.selected_user.push(item);
        }
    }

    $scope.checkIn = (id) => {
        var check = 0,
            index = -1;

        if ($scope.selected_user)
            $scope.selected_user.forEach((element, i) => {
                if (element.id == id) {
                    check = true;
                    index = i
                }
            });
        return index;
    }

    $scope.addTemp = () => {
        var data = {
            users: $scope.selected_user,
            group: $scope.cr_selected.id
        };
        $http.post(base_url + 'Kpi_system/ajax_add_temp', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getStandardGroup();
                $('#addUser').modal('hide');
                $scope.selected_user = [];
                toastr["success"]("Thành công!");
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.getUser = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_user?filter=' + JSON.stringify($scope.search)).then(r => {
            if (r && r.data.status == 1) {
                $scope.users = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.openAddUser = (item) => {
        var vl = angular.copy(item);
        $scope.cr_selected = vl;

        $scope.selected_user = vl.obs_clipboards;
        delete vl;

        $scope.search = {};
        $scope.select2();
        $scope.getUser();

        $('#search-input').val('').trigger('input');
        $scope.myFunction();
        $('#addUser').modal('show');
    }



    $scope.getGroups = () => {
        $http.get(base_url + 'Kpi_system/ajax_get_groups').then(r => {
            $scope.groups = r.data.data;
        })
    }


    $scope.getStandards = () => {
        $http.get(base_url + '/Kpi_system/ajax_get_standards').then(r => {
            $scope.standards = r.data.data;
        })
    }

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
        $scope.standar.standard_ids = e.ids;



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

    $scope.getStandardGroup = () => {
        $('table').addClass('loading');
        $http.get(base_url + 'Kpi_system/ajax_get_standard_group?filter=' + JSON.stringify($scope.filter)).then(r => {
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


    $scope.addNewStandardGroup = () => {

        if (!$scope.standar.name) {
            toastr["error"]("Nhập tên!");
            return false;
        }

        if (!$scope.standar.main_group_id) {
            toastr["error"]("Chọn bộ phân!");
            return false;
        }

        $http.post(base_url + 'Kpi_system/ajax_add_new_standard_group', JSON.stringify($scope.standar)).then(r => {
            if (r && r.data.status == 1) {
                $scope.getStandardGroup();
                $('#addBg').modal('hide');
                $scope.standar = {};
                toastr["success"]("Thành công!");
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
        $scope.getStandardGroup();
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