
app.controller('domains', function ($scope, $http, $sce, $compile) {
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
        $scope.dataSourceCare();
        $scope.getDomain();
    }

    $scope.check = (item) => {
        if (!item.name || item.name == "") {
            toastr["error"]("Tên không được để trống");
            return false
        }
        if (!item.nation_id) {
            toastr["error"]("Chọn quốc gia");
            return false;
        }
        if (!item.type) {
            toastr["error"]("Chọn loại");
            return false;
        }
        return true;
    }

    $scope.changeCamp = (value) => {
        if (!$scope.check(value))
            return false
        $http.post(base_url + 'sale_care/ajax_save_domain', JSON.stringify(value)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getDomain();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.dataSourceCare = () => {
        $http.get(base_url + 'sale_care/ajax_get_data_source_care').then(r => {
            if (r && r.data.status == 1) {
                $scope.sourceCare = r.data.data;
                $scope.sourceCare.push({
                    id: 0,
                    name: 'Chưa xác định',
                    description: 'Chưa xác định'
                })
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    function select2(){
        setTimeout(() => {
            $('.select2').select2({ selectionTitleAttribute: false });
        }, 100);
    }

    $scope.getDomain = () => {
        $('#home table').addClass('loading');
        $http.get(base_url + 'sale_care/ajax_get_domains?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $scope.domains = r.data.data;
                $('#home table').removeClass('loading');
                select2();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.delete = (value) => {
        $http.post(base_url + 'sale_care/ajax_delete_domain', JSON.stringify(value)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getDomain();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.addDomain = () => {
        if (!$scope.check($scope.domain))
            return false

        $('.add_btn').css('pointer-events', 'none');

        $http.post(base_url + 'sale_care/ajax_add_domains', JSON.stringify($scope.domain)).then(r => {
            if (r && r.data.status == 1) {

                toastr["success"]("Thành công!");
                $scope.domain = {};
                $scope.getDomain();

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