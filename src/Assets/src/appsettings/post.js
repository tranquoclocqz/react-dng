app.controller('bnCtrl', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getAll();
    }

    $scope.getAll = () => {
        $http.get(base_url + '/appsettings/ajax_get_news?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }

    $scope.openModel = (item) => {
        $('#fileBanner').val('');
        $scope.banner = item;
        $scope.banner.active = item.id ? item.active : '1';
        $scope.banner.display_order = Number($scope.banner.display_order);
        $('#bannerMD').modal('show');
    }

    $scope.saveStatus = (item) => {
        $scope.banner = item;
        $scope.saveNews();
    }

    $scope.saveNews = () => {
        let data = new FormData();
        data.append('file', $('#fileBanner')[0].files[0]);
        data.append('name', $scope.banner.name);
        data.append('desc_url', $scope.banner.desc_url);
        data.append('type', $scope.banner.type);
        data.append('display_order', $scope.banner.display_order);
        data.append('active', $scope.banner.active);
        if ($scope.banner.id) {
            data.append('id', $scope.banner.id);
            data.append('image_url', $scope.banner.image_url);
        }
        let check = $('#fileBanner')[0].files[0] || ($scope.banner.image_url && $scope.banner.image_url != '');

        if (check) {
            $('#bannerMD').modal('hide');
            $http({
                url: base_url + '/appsettings/ajax_created_new',
                method: "POST",
                data: data,
                headers: {
                    'Content-Type': undefined
                }
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    toastr['success']($scope.banner.id ? 'Cập nhật thành công!' : 'Tạo thành công!');
                    $scope.getAll();
                }
            })
        } else {
            toastr['error']('Bạn chưa thêm hình ảnh !');
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
        $scope.getAll();
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
})