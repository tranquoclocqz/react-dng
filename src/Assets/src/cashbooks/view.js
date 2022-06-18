app.directive('copyToClipboard', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.click(function () {
                if (attrs.copyToClipboard) {
                    var $temp_input = $("<input>");
                    $("body").append($temp_input);
                    $temp_input.val(attrs.copyToClipboard).select();
                    document.execCommand("copy");
                    $temp_input.remove();
                    toastr["warning"]('Đã sao chép liên kết vào bộ nhớ tạm!');
                }
            });
        }
    };
});
app.directive("whenScrolled", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            // we get a list of elements of size 1 and need the first element
            raw = elem[0];
            // we load more elements when scrolled past a limit
            elem.bind("scroll", function () {
                if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});
app.controller('view', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.base_url = base_url;
        $scope.current_user = CURRENT_USER_ID;
        $scope.is_admin = IS_ADMIN;
        $scope.current_store_id = CURRENT_STORE_ID;
        $scope.cbsObject = JSON.parse(DATA);
        $scope.linkeds = JSON.parse(LINKED);
        $scope.modalType = 'view_detail';
    }

    $scope.openMdConfirm = (type, item) => {
        $scope.modalType = type;
        if (type == 'create_cbs') {
            $scope.cbsObject_edit = angular.copy($scope.cbsObject);
        }
    }
    $scope.openModal = (type, item = null) => {
        $scope.modalType_IND = type;
        switch (type) {
            case 'file':
                $scope.detail_file = item.file;
                break;
            default:
                break;
        }
        $('#showModal').modal('show');
    }
    $scope.update_cbs = () => {
        $scope.cbsObject_edit.price = ($scope.cbsObject_edit.price + '').replace(/,/g, "");
        $http.post(base_url + 'cashbooks/ajax_update_retail_cbs', $scope.cbsObject_edit).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã cập nhật!');
                $scope.modalType = 'view_detail';
                $scope.cbsObject = angular.copy($scope.cbsObject_edit);
                delete $scope.error_messages;
            } else $scope.error_messages = (r.data.messages);
        })
    }
    $scope.remove_cbs = () => {
        $http.post(base_url + 'cashbooks/retail_delete/' + $scope.cbsObject.id).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã xóa thành công, chuyến hướng trong 2s!');
                setTimeout(() => {
                    window.location.replace(base_url + 'cashbooks/receipts_new');
                }, 2000);
            } else $scope.error_messages = (r.data.messages);
        })
    }

    $scope.confirm_receipt = (status) => {
        $scope.cbsObject.status_update = status;
        $http.post(base_url + 'cashbooks/retail_update', $scope.cbsObject).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('cập nhật thành công, chuyến hướng trong 2s!');
                setTimeout(() => {
                    window.location.replace(base_url + 'cashbooks/receipts_new');
                }, 2000);
            } else {
                $scope.error_messages = (r.data.messages);
                $('#updatemModal').modal('hide');
                $("html, body").animate({ scrollTop: 0 }, "slow");
            }
        })
    }
});