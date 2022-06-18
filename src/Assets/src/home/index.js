app = angular.module('app', []);
app.directive("whenScrolled", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            // we get a list of elements of size 1 and need the first element
            raw = elem[0];
            // we load more elements when scrolled past a limit
            elem.bind("scroll", function () {
                if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});
app.controller('index', function ($scope, $http, $sce, $window) {
    $scope.init = () => {
        $scope.warning_text = $('section.alert').html();
        object_Gen();
        $scope.target_data();
        $scope.get_notifications();
        $scope.get_home_tabs();
    }
    $scope.get_home_tabs = () => {
        $http.get(base_url + 'home/get_home_tab_by_current_user').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.home_tabs = r.data.data;
                $scope.loadData(r.data.data[0]);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.openfile = (arr) => {
        $scope.file_list = arr;
        $('#fileModal').modal('show');
    }
    $scope.loadData = (item) => {
        if (item) {
            $scope.current_tab = item;
            $scope.lv_loading = true;
            $http.get(base_url + 'home/get_data_tab?name=' + item.name).then(r => {
                $scope.lv_loading = false;
                if (r.data && r.data.status == 1) {
                    $scope.tab_content = r.data.data;
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            })
        }
    }
    $scope.showZoomImg = (value) => {
        showZoomImg(value)
    }
    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    function object_Gen() {
        $scope.filter = {};
        $scope.filter.is_hr = IS_HR;
        $scope.filter.current_month = '1';
        $scope.filter.salary_limit = 5;
    }

    $scope.get_criteria_user = () => {
        $http.get(base_url + 'home/get_criteria_user?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.criteria_list = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }


    $scope.get_salary_request = () => {
        $http.get(base_url + 'home/get_requset_salary?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.salarie_rqs = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.get_warehouse_cf = () => {
        $http.get(base_url + 'home/get_warehouse_cf?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.warehouse_cf = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.get_user_interview = () => {
        $http.get(base_url + 'home/get_user_interviews?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope._user_interviews = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.get_complain = () => {
        $scope.cl_loading = true;
        $http.get(base_url + 'home/get_complains?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.cl_loading = false;
            if (r.data && r.data.status == 1) {
                $scope.complains = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.get_love_sharing = () => {
        $scope.lv_loading = true;
        $http.get(base_url + 'home/get_lovesharing?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.lv_loading = false;
            if (r.data && r.data.status == 1) {
                $scope.lovesharing = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.get_cashbook_stores = () => {
        $scope.cb_loading = true;
        $http.get(base_url + 'home/get_cashbook_stores?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.cb_loading = false;
            if (r.data && r.data.status == 1) {
                $scope.cashbook_stores = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.get_notifications = (salarylimit = false) => {
        if (salarylimit) {
            $scope.filter.salary_limit += 5;
        }
        $http.get(base_url + 'home/get_notifications?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.notifies = r.data.data.notifies;
                $scope.salaries = r.data.data.salaries;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.get_admin_user_off = () => {
        $scope.off_loading = true;
        $http.get(base_url + 'home/get_admin_user_off?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.off_loading = false;
            if (r.data && r.data.status == 1) {
                $scope.adus = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.get_task_request = () => {
        $scope.tr_loading = true;
        $http.get(base_url + 'home/get_taskrequest?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.tr_loading = false;
            if (r.data && r.data.status == 1) {
                $scope.task_requests = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.target_data = () => {
        $http.get(base_url + 'home/get_target_data?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.target_results = r.data.data;
                $scope.target_html_bind = r.data.process_html;
                $scope.target_user_html_bind = r.data.process_user_html;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }
    $scope.set_class_process = ($val) => {
        if ($val > 100)
            $class = 'progress-100';
        else if ($val > 90)
            $class = 'progress-90';
        else if ($val > 70)
            $class = 'progress-71';
        else
            $class = 'progress-70';
        return $class;
    }

    $scope.setWithProcess = (t, m) => {
        let percent = (t / m) * 100;
        return "width:" + percent + "%";
    }
});