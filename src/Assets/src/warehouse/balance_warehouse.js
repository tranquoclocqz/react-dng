app.controller('balanceWHCtrl', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0,
    };

    $scope.init = () => {
        $scope.transaction = {
            date: moment().format('YYYY/MM/DD HH:mm:ss')
        }
        $scope.warehouses = [];
        $scope.branchWarehousesFilter = [{ id: 0, name: 'tất cả' }];
        $scope.getWarehouse();
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.getBalanceWH();
        $scope.fileName = '';
        $('input[name="reportrange1"]').daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            timePicker24Hour: true,
            locale: {
                format: 'YYYY/MM/DD HH:mm:ss'
            }
        });

    };

    $scope.filterTran = () => {
        $scope.filter.offset = 0;
        $scope.getBalanceWH();
    }

    $scope.updateQuantity = (item) => {
        let data = {
            products: []
        }
        data.products.push(item);
        $http.post(base_url + '/warehouse/api_update_quantity_tran_detail', $scope.transaction).then(r => {
            if (r.data.status == 1) {
                toastr["success"](r.data.message);
            } else {
                toastr["error"]('Có lổi xẩy ra. Vui lòng thử lại!');
            }
        });
    }

    $scope.getWarehouse = () => {
        $http.get(base_url + '/warehouse/api_get_ls_warehouse').then(r => {
            let data = r.data;
            if (data && data.status == 1) {
                $scope.warehouses = r.data.data;
                $scope.branchWarehousesFilter = [...$scope.branchWarehousesFilter, ...data.data];
                $scope.filter.dest_id = 0;
            }
        });
    }

    $scope.getBalanceWH = () => {
        $http.get(base_url + '/warehouse/ajax_get_balance_warehouse?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }

    $scope.deleteTrans = (id) => {
        $scope.deleteId = id;
        $('#confirmModal').modal('show');
    }

    $scope.confirmModal = (val) => {
        if (val) {
            $scope.deletedTranById($scope.deleteId);
        }
        $('#confirmModal').modal('hide');
    }

    $scope.deletedTranById = (id) => {
        $http.post(base_url + '/warehouse/deleteTranById?id=' + id).then(r => {
            if (r.data) {
                $scope.getBalanceWH();
                toastr["success"]('Xóa thành công!');
            } else {
                toastr["error"]('Đã có lỗi xẩy ra!');
            }

        })
    }

    $scope.openModalImport = () => {
        $('#import').modal('show');
        $scope.isInput = false;
        $scope.fileName = '';
        $scope.file = null;

        // $scope.transaction = {
        // date: moment().format('YYYY/MM/DD HH:mm:ss')
        // }
    }

    $scope.attachFile = () => {
        $('#inputImgOrder').click();
    }

    $scope.fileUpload = function (element) {
        var files = event.target.files; //FileList object

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.fileIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.file = files[0];
    }

    $scope.fileIsLoaded = function (e) {
        $scope.$apply(function () {
            $scope.fileName = $scope.file.name;
        });
    }

    $scope.deleteImg = () => {
        $scope.fileName = '';
        $scope.file = null;
    }

    $scope.uploadFile = () => {
        if ($scope.transaction.type && $scope.transaction.dest_id) {
            $scope.isInput = false;

            var formData = new FormData();
            formData.append('file', $scope.file);
            formData.append('created', $scope.transaction.date);
            formData.append('dest_id', $scope.transaction.dest_id);
            formData.append('type', $scope.transaction.type);

            $http({
                url: base_url + '/warehouse/api_upload_balance_wh',
                method: "POST",
                data: formData,
                headers: { 'Content-Type': undefined }
            }).then(r => {
                if (r.data.status == 1) {
                    toastr["success"]('Nhập thành công!');
                    $scope.getBalanceWH();
                    $('#import').modal('hide');
                } else {
                    toastr["error"](r.data.message);
                }
            })
        } else {
            $scope.isInput = true;
        }
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
    }

    //get wh transaction by id
    $scope.getTransById = ($id) => {
        $http.get(base_url + '/warehouse/api_get_whtransaction_by_id?id=' + $id).then(r => {
            if (r.data) {
                $('#modaladdoredit').modal('show');
                $scope.isInventory = false;
                $scope.transaction = r.data.data;
            }
        });
    }

    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getBalanceWH();
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