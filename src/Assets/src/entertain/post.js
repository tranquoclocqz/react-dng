app.controller('category', function ($scope, $http) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 10,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.post = {};
        $scope.filter = {};

        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        var id_ctgr = location.pathname.split('/entertain/post/');
        if (id_ctgr[1] && id_ctgr[1].length > 0) {
            $scope.filter.category_id = [id_ctgr[1]]
        }
        $scope.getPost();
        //$scope.getPost();
        setTimeout(() => {
            $scope.ckeditor = CKEDITOR.replace('textboxMessage', {
                uiColor: '#f2f3f5',
                // removePlugins: 'toolbar',
                height: '100',
                toolbarGroups: [
                    { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                    { name: 'paragraph', groups: ['list'] },
                    { name: 'links', groups: ['links'] },
                    { name: 'colors', groups: ['TextColor', 'BGColor'] },
                    { name: 'insert' },
                    { name: 'colors' },
                ]
            });
        }, 100);
    }

    $scope.getPost = () => {
        $http.get(base_url + '/entertain/ajax_get_post?filter=' + JSON.stringify($scope.filter)).then(r => {
            console.log(r);

            if (r && r.data.status == 1) {
                $scope.post_rs = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.searchPost = () => {

        if ($scope.filter.category_id.length != 0) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
        }

        $scope.getPost();
    }

    $scope.updatePost = () => {
        $('.load img').css('opacity', '1');
        $scope.post.content = CKEDITOR.instances.textboxMessage.getData();
        if ($scope.post.name == '' || !$scope.post.name) {
            toastr["error"]("Tên không thể để trống!");
            return false;
        } else if (!$scope.post.id_category) {
            toastr["error"]("Chọn chuyên mục!");
            return false;
        } else if ($scope.post.content == '' || !$scope.post.content) {
            toastr["error"]("Nội dung không thể để trống!");
            return false;
        }
        $http.post(base_url + '/entertain/ajax_update_post', $scope.post).then(r => {
            if (r && r.data.status == 1) {
                $('.load img').css('opacity', '0');
                toastr['success']("Đã gửi yêu cầu thành công!");

                $('#modal-add').modal('hide');
                $scope.post.name = '';
                CKEDITOR.instances.textboxMessage.setData('');
                $scope.getPost();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.deletePost = (id) => {

        $http.delete(base_url + '/entertain/ajax_delete_post?id=' + id).then(r => {
            if (r && r.data.status == 1) {
                toastr['success']("Xoá thành công!");
                $scope.getPost();
                //$scope.post_rs = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getPost();
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