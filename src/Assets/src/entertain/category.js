app.controller('category', function ($scope, $http) {
    $scope.init = () => {
        $scope.category = {};
        $scope.getCategory();
        $scope.editCategoryVa = {};
    }
    $scope.getCategory = () => {
        $http.get(base_url + '/entertain/ajax_get_category').then(r => {
            if (r && r.data.status == 1) {
                $scope.category_rs = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.updateCategory = () => {
        if ($scope.category.name == '' || !$scope.category.name) {
            toastr["error"]("Tên không thể để trống!");
            return false;
        }
        $http.post(base_url + '/entertain/ajax_update_category', $scope.category).then(r => {
            if (r && r.data.status == 1) {
                $scope.getCategory();
                toastr['success']("Đã gửi yêu cầu thành công!");
                $('#modal-add').modal('hide');
                $scope.category.name = '';
                $scope.category.note = '';
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.openModalEdit = (object) => {
        $scope.editCategoryVa = object;
        $('#modal-update').modal('show');
    }

    $scope.editCategory = () => {
        $http.post(base_url + '/entertain/ajax_edit_category', $scope.editCategoryVa).then(r => {
            if (r && r.data.status == 1) {
                $scope.getCategory();
                toastr['success']("Đã gửi cập nhật thành công!");
                $('#modal-update').modal('hide');
                $scope.editCategoryVa = {};
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }
});