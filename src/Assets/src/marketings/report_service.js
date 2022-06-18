app.controller('rpsCtrl', function ($scope, $http) {

        var pi = $scope.pagingInfo = {
            itemsPerPage: 50,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.init = () => {
            $('.box1').css('opacity', 1);
            $scope.filter = {};
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
            $scope.filter.sort_type = 'ALL';
            $scope.filter.services = [];
            $scope.filter.groups = [];
            $scope.filter.group_products = [];
            $scope.filter.products = [];
            $scope.rows = [];
            $scope.getGroupService();
            $scope.getGroupProduct();
            $scope.getService();
            $scope.getProduct();
            $scope.isLoading = false;
            $scope.total = {
                total_hd1: 0,
                total_hd2: 0,
                total_price: 0
            };
        }


        $scope.getAll = () => {
            if ($scope.filter.services.length == 0 && $scope.filter.products.length == 0 && $scope.filter.groups.length == 0 && $scope.filter.group_products.length == 0) {
                toastr["error"]('Bạn chưa chọn dịch vụ hoặc sản phẩm!');
                return;
            }
            if ($scope.filter.sort_type == 'SERVICE' && ($scope.filter.services.length == 0 && $scope.filter.groups.length == 0)) {
                toastr["error"]('Bạn chưa chọn dịch vụ!');
                return;
            }
            if ($scope.filter.sort_type == 'PRODUCT' && ($scope.filter.products.length == 0 && $scope.filter.group_products.length == 0)) {
                toastr["error"]('Bạn chưa chọn sản phẩm!');
                return;
            }
            $scope.isLoading = true;
            if ($scope.filter.date) {
                $scope.filter.start_date = $scope.filter.date.split('-')[0].trim();
                $scope.filter.end_date = $scope.filter.date.split('-')[1].trim();
            }

            $http.get(base_url + '/marketings/ajax_get_report_service?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    $scope.isLoading = false;
                    $scope.rows = r.data.data;
                    $scope.total = r.data.total;
                    $scope.rows.forEach(e => {
                        e.units = JSON.parse(e.units);
                    });
                    $scope.pagingInfo.total = r.data.total.total_row;
                    $scope.pagingInfo.totalPage = Math.ceil(r.data.total.total_row / pi.itemsPerPage);
                } else {
                    toastr['error']('Có lỗi xẩy ra! Vui lòng thử lại sau')
                }
            })
        }

        $scope.getGroupService = () => {
            $http.get(base_url + '/mobile_settings/ajax_get_group_services').then(r => {
                if (r.data.status == 1) {
                    $scope.groups = r.data.data;
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        }

        $scope.getGroupProduct = () => {
            $http.get(base_url + '/mobile_settings/ajax_get_group_products').then(r => {
                if (r.data.status == 1) {
                    $scope.group_products = r.data.data;
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        }

        $scope.getService = () => {
            $scope.filter.store_types = [1, 2, 3];
            $scope.filter.nations = [1];
            $http.get(base_url + '/mobile_settings/ajax_get_services?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    $scope.services = r.data.data;
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        }

        $scope.getProduct = () => {
            $scope.filter.store_types = [1, 2, 3];
            $scope.filter.nations = [1];
            $http.get(base_url + '/mobile_settings/ajax_get_products?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    $scope.products = r.data.data;
                } else {
                    toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                }
            });
        }


        $scope.rdInvoice = (idInvoice) => {
            window.open(base_url + '/invoices/detail/' + idInvoice);
        }

        $scope.rdHistory = (idCustomer) => {
            window.open(base_url + '/customers/history/' + idCustomer);
        }


        //paging
        $scope.go2Page = function (page) {

            if (page < 0) return;
            $('#chart-bd').css('opacity', '0');
            $('#chart-st img').css('opacity', '1');
            $('.cover-tabel img').css('opacity', '1');
            var pi = $scope.pagingInfo;
            pi.currentPage = page;
            pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
            $scope.getAll();
            pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage
        }

        $scope.Previous = function (page) {
            $('#chart-bd').css('opacity', '0');
            $('#chart-st img').css('opacity', '1');
            $('.cover-tabel img').css('opacity', '1');
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
