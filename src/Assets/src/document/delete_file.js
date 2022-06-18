
app.controller('delete', function ($scope, $http, $sce, $interval) {
    $scope.init = () => {
        $('.box').css('opacity', '1');
    };

    $scope.deleteFile = () => {
        $http.post(base_url + '/document/ajax_detete_file', $scope.file).then(r => {
            console.log(r);

            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

}).filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}])