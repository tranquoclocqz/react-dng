app.controller('commentCtrl', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.getAll();
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
    }

    $scope.viewImg = (img) => {
        $('#image').modal('show');
        console.log(img);

        $scope.image = img;
    }

    $scope.showModal = (val) => {
        $scope.isResult = val;
        $('#modalConfỉm').modal('show');
        $scope.titleModal = val == 1 ? 'Bạn muốn bật chức năng trả lời góp ý?' : 'Bạn muốn tắt chức năng trả lời góp ý?';
    }
    $scope.handleChangeResultComment = () => {
        let data = {
            is_result: $scope.isResult
        }
        $http.post(base_url + '/admin_users/ajax_change_state_result_comment', data).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']('Thay đổi thành công!');
                $scope.getAll();
            } else {
                toastr['error']('Có lổi xẩy ra. Vui lòng thử lại!');
            }
            $('#modalConfỉm').modal('hide');
        });
    }

    $scope.getAll = () => {

        // if ($scope.filter.date) {
        //     $scope.filter.start_date = $scope.filter.date.split('-')[0].trim();
        //     $scope.filter.end_date = $scope.filter.date.split('-')[1].trim();
        // }

        $http.get(base_url + '/admin_users/ajax_get_comment_hide?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $scope.isResultComment = r.data.is_result;
                $scope.rows.forEach(element => {
                    element.images = JSON.parse(element.images);
                });
                console.log($scope.rows);

            } else {
                toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        });
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
    }

    $scope.redictToDetail = (id) => {
        window.open(base_url + 'admin_users/comment_hide_detail/' + id);
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

});