app.controller('questions', function (Excel, $scope, $http, $compile, $filter) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.pagingInfo.currentPage = page;
        $scope.get_question();
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

    $scope.init = () => {
        $('.list-stores-tb').css('opacity', '1');
        $scope.get_question();
    }

    $scope.get_question = () => {
        var data = {
            limit: $scope.pagingInfo.itemsPerPage,
            offset: ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage,
        }
        $http.post(base_url + '/Training_questions/get_question', JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                $scope.questions = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xảy ra!!!");
        })
    }

});