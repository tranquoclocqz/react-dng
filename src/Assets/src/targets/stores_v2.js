app.controller('stores_v2', function ($scope, $http, $compile, TargetStoreSvc) {

    $scope.init = () => {
        $scope.filter = {
            date_filter: '',
            store_id: ['0'],
            sector: ['0']
        }
        $scope.load = false;
        $scope.getManyStore();
    }

    $scope.ajaxDeleteTargetStore = (id) => {
        swal({
                title: "Thông báo",
                text: "Bạn có chắc hành động này!",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },
            function () {
                TargetStoreSvc.deleteTargetStore(id).then(r => {
                    if (r.status == 1) {
                        swal("Thông báo", "Xóa thành công!", "success");
                        $scope.getManyStore();
                    } else {
                        swal("Thông báo", "Lỗi hệ thống. Không thể xóa target store!", "error");
                    }
                }).catch(e => {
                    swal("Thông báo", "Lỗi hệ thống. Không thể xóa target store!", "error");
                });
            });
    }

    $scope.ajaxUnduTargetStore = (id) => {
        swal({
                title: "Thông báo",
                text: "Bạn có chắc hành động này!",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Xác nhận",
                cancelButtonText: "Đóng",
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            },
            function () {
                TargetStoreSvc.unduTargetStore(id).then(r => {
                    if (r.status == 1) {
                        swal("Thông báo", "Khôi phục thành công!", "success");
                        $scope.getManyStore();
                    } else {
                        swal("Thông báo", "Lỗi hệ thống. Không thể Khôi phục target store!", "error");
                    }
                }).catch(e => {
                    swal("Thông báo", "Lỗi hệ thống. Không thể Khôi phục target store!", "error");
                });
            });
    }

    $scope.getManyStore = () => {
        event.preventDefault();
        $scope.load = true;
        TargetStoreSvc.getListStoreByDate($scope.filter).then(r => {
            $scope.load = false;
            if (r && r.status == 1) {
                $('#all_store_box').empty();
                var $el = $(r.data).appendTo('#all_store_box');
                $compile($el)($scope);
                $('.content-header h1').html('Target chi nhánh tháng ' + r.title);
            } else {
                showMessErr(r.message);
            }
        }).catch(e => {
            $scope.load = false;
        });
    }

    $scope.getListStoreByRegion = () => {
        $scope.filter.store_id = [];
        if ($scope.filter.sector.length && $scope.filter.sector.indexOf('0') == -1) {
            $scope.filter.sector.forEach(function (item) {
                ls_stores.forEach(function (store) {
                    if (store.admin_region_id == item) {
                        $scope.filter.store_id.push(store.id);
                    }
                });
            })
        } else {
            $scope.filter.store_id.push('0');
        }
        select2();
    }
});

function select2(timeout = 100, selector = '.content-wrapper .select2') {
    setTimeout(() => {
        jQuery(selector).select2();
    }, timeout);
}