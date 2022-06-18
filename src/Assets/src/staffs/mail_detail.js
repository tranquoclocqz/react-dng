app.controller('mail_detail', function ($scope, $http) {
    $('.box').css('opacity', '1');


    $scope.init = () => {
        var id_ctgr = location.pathname.split('entertain/post_detail/');
        id_mail = id_ctgr[1] ? id_ctgr[1] : '';
    }

    $scope.getMailDetail = () => {
        $http.get(base_url + '/entertain/ajax_get_post_detail/' + id_post).then(r => {
            if (r && r.data.status == 1) {

                //r.data.data.content=JSON.parse(r.data.data.content);
                $scope.post_detail_rs = r.data.data;
            }
            else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
});