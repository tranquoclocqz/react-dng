
app.controller('user_groups', function ($scope, $http, $sce, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.opacity').css('opacity', '1');

        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.group = {};
        $scope.group.parent_id = '0';

        $scope.dem = 0;


        $scope.getGroup();
        $scope.getUsers();
        $scope.getDomains();
        $scope.getStore();
        $scope.getGroupSc();

    }


    $scope.getGroupSc = () => {
        $http.get(base_url + 'sale_care/get_group_sc').then(r => {
            if (r && r.data.status == 1) {
                $scope.groupsc = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStore = () => {
        $http.get(base_url + 'sale_care/ajax_get_stores').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
                $scope.stores.push({
                    id: -1,
                    name: 'Hồ Chí Minh'
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.getGroup = () => {
        $('#home table.table-hovered').addClass('loading');
        $http.get(base_url + 'sale_care/ajax_get_groups?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.groups = r.data.data;
                $scope.dem++;

                angular.element(document).ready(function () {
                    setTimeout(() => {
                        $('#home table.table-hovered').removeClass('loading');
                        $scope.select2();
                        $scope.select3();
                    }, 500);
                });

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.$watch('dem', function (newValues, oldValues) {
        // console.log($scope.pasteObs);
        if (oldValues == newValues)
            return false;

        // if ($scope.dem % 2 == 0)
        //     $scope.setGroup();

    });

    $scope.setGroup = () => {
        var a = [];
        $scope.domains.filter(x => {
            $scope.groups.forEach(element => {
                if (x)
                    if (x.id.indexOf(element.obs_domain) < 0) {
                        a.push(x);
                    }
            })
        });
        $scope.domains = a;
    }


    $scope.getUsers = () => {
        $http.get(base_url + 'sale_care/ajax_get_sale').then(r => {
            if (r && r.data.status == 1) {
                $scope.users = r.data.data;



            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.getDomains = () => {
        $http.get(base_url + 'sale_care/ajax_get_domains_').then(r => {
            if (r && r.data.status == 1) {
                $scope.domains = r.data.data;
                $scope.dem++;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.changeGroup = (value) => {
        $http.post(base_url + 'sale_care/ajax_save_group', JSON.stringify(value)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getGroup();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2();
            $scope.$apply();
        }, 0);
    }
    $scope.select3 = () => {
        setTimeout(() => {
            $('.select3').select2();
            $scope.$apply();
        }, 0);
    }


    $scope.addGroup = () => {

        $('.add_btn').css('pointer-events', 'none');

        $http.post(base_url + 'sale_care/ajax_add_groups', JSON.stringify($scope.group)).then(r => {
            if (r && r.data.status == 1) {

                toastr["success"]("Thành công!");
                $scope.group = {};
                $scope.getGroup();

            } else toastr["error"]("Đã có lỗi xẩy ra!");

            $('.add_btn').css('pointer-events', 'initial');
        });

    }






    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getCamp();
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
})



