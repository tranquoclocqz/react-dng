var app = angular.module('app', ['chart.js']);

app.controller('salary_feedback', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.allow_edit = allow_edit;
        $scope.all_stores = all_stores;
        $scope.ls_regions = ls_regions;
        $scope.img_account_df = img_account_df;
        $scope.resetSearchUser();
        $scope.list_results = [];
        $scope.getResults();
        $scope.resetFillter();
        $scope.chooseTab(1);
        $('#salary_feedback').fadeIn(0);
    }

    $scope.loadChart = () => {
        $scope.dataChartType = {
            labels: [],
            data: [],
            colors: [],
            cusTypes: [],
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Tỉ lệ loại phản hồi'
                },
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0
                    }
                }
            }
        };
        var colorRv = getColor(true, $scope.report.types);
        $scope.report.types.forEach((e, key) => {
            $scope.dataChartType.data.push(e.percent);
            $scope.dataChartType.labels.push(e.name);
            $scope.dataChartType.colors.push(colorRv[key]);
        });

        $scope.dataChartResult = {
            labels: [],
            data: [],
            colors: [],
            cusTypes: [],
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Kết quả phản hồi (*)'
                },
                legend: {
                    display: false
                },
                layout: {
                    padding: {
                        left: 0
                    }
                }
            }
        };
        var colorRv = getColor(true, $scope.report.results);
        $scope.report.results.forEach((e, key) => {
            $scope.dataChartResult.data.push(e.total);
            $scope.dataChartResult.labels.push(e.name);
            $scope.dataChartResult.colors.push(colorRv[key]);
        });
    }

    function getColor(isReverse, data) {
        $scope.colorDefault = ["#EF4B20", "#00C0EF", "#FFC000", "#5ABB47", "#F02C61", "#B485B7", "#C1D7EF"];
        if (data.length > $scope.colorDefault.length) {
            $scope.colorDefault = $scope.colorDefault.concat(getRandomColor());
        }
        return $scope.colorDefault;
        // return isReverse ? $scope.colorDefault.reverse() : $scope.colorDefault;
    }

    $scope.chooseTab = (tap) => {
        $scope.obj_tab.current = tap;
        if (tap == 1) {
            $scope.go2Page(1);
        } else {
            $scope.getReport();
        }
        select2_img(0);
    }

    $scope.changeStatus = () => {
        select2_img(0);
    }

    $scope.changeStore = () => {
        if ($scope.filter.store_id.length && !$scope.filter.store_id.includes('0')) {
            $scope.getListUserByRule();
        } else {
            $scope.filter.user_id = '0';
            select2_img(0, '.select2-user');
        }
    }

    $scope.getResults = () => {
        $scope.load = true;
        $http.get(base_url + 'salary_feedback/ajax_get_salary_feedback_results').then(r => {
            $scope.load = false;
            if (r.data.status == 1) {
                $scope.list_results = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            select2_img();
        });
    }

    $scope.getListUserByRule = () => {
        $scope.filter_user_load = true;
        $http.get(base_url + 'admin_users/ajax_get_user_by_rule?filter=' + JSON.stringify({
            store_id: $scope.filter.store_id
        })).then(r => {
            $scope.filter_user_load = false;
            if (r.data.status) {
                $scope.list_user = r.data.data;
                select2_img();
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.resetSearchUser = () => {
        $scope.obj_search_user = {
            choose: {
                id: 0
            },
            show_rs: false,
            key: '',
            list: [],
        };
    }

    $scope.chooseUser = (user) => {
        $scope.resetSearchUser();
        $scope.obj_search_user.choose = angular.copy(user);
    }

    $scope.hideRsFilterUser = () => {
        setTimeout(() => {
            $scope.obj_search_user.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $(document).on('focus', '#search-user', function () {
        setTimeout(() => {
            $scope.obj_search_user.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $scope.searchUser = () => {
        var key = $scope.obj_search_user.key;
        if (key.length < 3) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchUser();
        }, 350);
    }

    $scope._searchUser = () => {
        $scope.obj_search_user.load = true;
        $http.get(base_url + 'admin_users/ajax_search_user_by_key?key=' + $scope.obj_search_user.key).then(r => {
            if (r.data.status) {
                var data = r.data.data;
                $scope.obj_search_user.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_search_user.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.getListStoreByRegion = () => {
        $scope.filter_temp = $scope.obj_tab.current == 1 ? $scope.filter : $scope.filter_report;
        if ($scope.filter_temp.region_id.length && !$scope.filter_temp.region_id.includes('0')) {
            var store = $scope.filter_temp.all_stores.filter(x => $scope.filter_temp.region_id.includes(x.admin_region_id));
            $scope.filter_temp.store_id = store.map(x => x.id);
        } else {
            $scope.filter_temp.store_id = ['0'];
        }
        select2_img();
        $scope.changeStore();
    }

    $scope.resetFillter = () => {
        $scope.pagingInfo = {
            itemsPerPage: 50,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0,
        };

        $scope.filter = {
            month: (current_month > 1 ? current_month - 1 : current_month) + '',
            year: current_year,
            region_id: ['0'],
            result_id: ['0'],
            store_id: ['0'],
            user_id: 0,
            status: '0',
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
            all_stores: all_stores,
            allow_edit: allow_edit,
        }

        $scope.filter_report = {
            month: (current_month > 1 ? current_month - 1 : current_month) + '',
            year: current_year,
            region_id: ['0'],
            store_id: ['0'],
            group_id: ['0'],
            all_stores: all_stores
        }

        $scope.obj_tab = {
            current: 1
        }
    }

    $scope.getReport = () => {
        var obj_search = angular.copy($scope.filter_report);
        if (obj_search.store_id.length) {
            if (obj_search.store_id.includes('0')) { // chọn tất cả
                obj_search.store_id = [];
            }
        } else {
            showMessErr('Vui lòng chọn chi nhánh');
            return;
        }
        if (obj_search.group_id.length) {
            if (obj_search.group_id.includes('0')) { // chọn tất cả
                obj_search.group_id = [];
            }
        } else {
            showMessErr('Vui lòng chọn bộ phận');
            return;
        }

        obj_search.all_stores = [];
        $scope.load_list = true;
        $http.get(base_url + 'salary_feedback/ajax_get_report?' + $.param(obj_search)).then(r => {
            $scope.load_list = false;
            if (r.data && r.data.status) {
                $scope.report = r.data.data;
                $scope.loadChart();
                select2_img();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getList = (is_excel = 0) => {
        $("html, body").animate({
            scrollTop: 0
        }, 0);
        var obj_search = angular.copy($scope.filter);
        obj_search.user_id = $scope.obj_search_user.choose.id;
        obj_search.is_excel = is_excel;
        if (obj_search.store_id.length) {
            if (obj_search.store_id.includes('0')) { // chọn tất cả
                obj_search.store_id = $scope.filter.all_stores.map(x => x.id);
            }
        } else {
            showMessErr('Vui lòng chọn chi nhánh');
            return;
        }
        obj_search.result_ids = [];
        if (['0', '3'].includes(obj_search.status)) {
            if (!obj_search.result_id.includes('0')) {
                obj_search.result_ids = obj_search.result_id;
            }
        }

        obj_search.all_stores = [];
        $scope.load_list = true;
        $http.get(base_url + 'salary_feedback/ajax_get_list?' + $.param(obj_search)).then(r => {
            $scope.load_list = false;
            if (r.data && r.data.status) {
                var data = r.data.data,
                    list = data.list,
                    count = data.count;

                $.each(list, function (index, value) {
                    if (value.finish_time) {
                        value.hanlde_diff_date = $scope.diffDate(value.processing_time, value.finish_time);
                    }
                    value.note_short = value.note.length > 50 ? value.note.slice(0, 50) + '...' : value.note;
                    value.obj_type = JSON.parse(value.obj_type);
                    value.obj_user_join = value.obj_user_join ? JSON.parse(value.obj_user_join) : [];
                    value.obj_user_handler = value.obj_user_join.filter(x => x.type == 1);
                    value.obj_user_follower = value.obj_user_join.filter(x => x.type == 2);
                });

                if (is_excel) {
                    $scope.list_excels = list;
                    setTimeout(() => {
                        exportExcelTable('#table_excel', 'id', 'Danh sách phản hồi lương - Tháng ' + $scope.filter.month + '_' + $scope.filter.year);
                    }, 100);
                } else {
                    $scope.lists = list;
                    $scope.pagingInfo.total = count;
                    $scope.pagingInfo.totalPage = Math.ceil(count / $scope.pagingInfo.itemsPerPage);
                }
                select2_img();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.diffDate = (start, end) => {
        var obj = moment.utc(moment(end, "YYYY-MM-DD HH:mm:ss").diff(moment(start, "YYYY-MM-DD HH:mm:ss"))),
            day = obj.format("DD"),
            str_day = '';
        if (day > 1) {
            str_day = day;
        } else {
            str_day = 0;
        }
        return str_day + ' ngày ' + obj.format("HH:mm") + ' phút';
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getList();
        pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage;
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
})

app.filter('momentFormat', function () {
    return (value, format = 'DD/MM/YYYY HH:mm') => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});