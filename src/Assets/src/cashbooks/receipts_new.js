app.controller('receipts_new', function ($scope, $http, $sce) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        objectHandle();
    }

    function objectHandle() {
        $scope.filter = {};
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
    }


    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }
    $scope.resetCbsForm = (type = 0) => {
        $scope.filter = {};
        delete $scope.academy_iv_list;
        $scope.cbsObject = {};
        if (type === 1) {
            $scope.cbsObject.formality = "0";
            $scope.cbsObject.price = "0";
            $scope.cbsObject.title = "Doanh thu công nợ nhà vận chuyển";
            $http.get(base_url + 'cashbooks/get_cashbook_online_receipt_data').then(r => {
                if (r && r.data.status == 1) {
                    $scope.shiper_list = r.data.data.warehouse_shipers;
                    $scope.cbsObject.shiper_id = "0";
                    select2();
                } else toastr["error"](r.data.messages);
            })
        }
    }
    $scope.get_receipt_inv_fun = () => {
        $http.get(base_url + 'cashbooks/get_receipt_inv_fun').then(r => {
            if (r && r.data.status == 1) {
                $scope.list_transaction_func = r.data.data.list_trans;
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.selectTrans = (item) => {
        if (item.total_linked > 0) return false;
        item.selected_item = !item.selected_item;
        $scope.cbsObject.link_functions = [];
        $scope.max_price = 0;
        angular.forEach($scope.list_transaction_func, function (value, key) {
            if (value.selected_item) {
                $scope.cbsObject.link_functions.push(value.id);
                if (value.max_real_price) $scope.max_price += Number(value.max_real_price);
            }
        });
    }
    $scope.findAcaInv = () => {
        if ($scope.filter.phone.length < 5) {
            toastr["error"]('Vui lòng nhập đầy đủ Số điện thoại');
            return false;
        }
        delete $scope.cbsObject;
        $http.get(base_url + 'cashbooks/ajax_get_academy_invoice_byphone/' + $scope.filter.phone).then(r => {
            if (r && r.data.status == 1) {
                $scope.academy_iv_list = r.data.data;
                angular.forEach($scope.academy_iv_list, function (value, key) {
                    $scope.academy_iv_list[key].amount = Number(value.amount);
                    $scope.academy_iv_list[key].visa = Number(value.visa);
                });
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.sendToCreating = (item) => {
        $http.get(base_url + 'cashbooks/ajax_get_academy_invoice_by_id/' + item.id).then(r => {
            if (r && r.data.status == 1) {
                $scope.cbsObject = r.data.data;
                $scope.cbsObject.amount = Number($scope.cbsObject.amount);
                $scope.cbsObject.visa = Number($scope.cbsObject.visa);
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.createdcbs = (type = 0) => {
        $scope.loading = true;
        let dt = $scope.cbsObject;
        if (type === 1) {
            dt = {};
            if ($scope.cbsObject.formality == 0) {
                toastr["error"]("Vui lòng chọn hình thức");
                return false;
            }
            if ($scope.cbsObject.formality == "transfer") {
                if (!$scope.cbsObject.file) {
                    toastr["error"]("Vui lòng nhập chứng từ");
                    return false;
                }
                dt.file = $scope.cbsObject.file;
            }
            if (!$scope.cbsObject.price || $scope.cbsObject.price == 0) {
                toastr["error"]("Vui lòng nhập số tiền");
                return false;
            }
            if ($scope.cbsObject.shiper_id == 0) {
                toastr["error"]("Vui lòng chọn shiper");
                return false;
            }

            dt.title = $scope.cbsObject.title;
            dt.price = ($scope.cbsObject.price + '').replace(/,/g, "");
            dt.shiper_id = $scope.cbsObject.shiper_id;
            dt.formality = $scope.cbsObject.formality;
            dt.note = $scope.cbsObject.note;
            if ($scope.cbsObject.link_functions && $scope.cbsObject.link_functions.length > 0) {
                dt.link_functions = $scope.cbsObject.link_functions;
            }

            $http.post(base_url + 'cashbooks/create_cbs', dt).then(r => {
                if (r && r.data.status == 1) {
                    toastr.success('Đã tạo thành công!');
                    location.reload();
                } else toastr["error"](r.data.messages);
            })
            return;
        }

        $http.post(base_url + 'cashbooks/ajax_create_academy_retail_cbs', dt).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã tạo thành công!');
                location.reload();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.detailItem = (item) => {
        $scope.cbs_detail = item;
        $('#detail-modal').modal('show');
    }
    $scope.update_cbs = () => {
        $http.post(base_url + 'cashbooks/ajax_update_retail_cbs', $scope.cbs_detail).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã cập nhật!');
                location.reload();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.showAlert = () => {
        // alert('Không thể tạo phiếu thu sau 19h, vui lòng quay lại sau!');
    }

    $scope.attachFile = () => {
        $('#inputFileEdit').click();
    }
    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function (readerEvent) {
                var avatarImg = new Image();
                var src = reader.result;
                avatarImg.src = src;
                document.getElementById("dataUrl").innerText = src;
                avatarImg.onload = function () {
                    var c = document.getElementById("myCanvas");
                    var ctx = c.getContext("2d");
                    ctx.canvas.width = avatarImg.width;
                    ctx.canvas.height = avatarImg.height;
                    ctx.drawImage(avatarImg, 0, 0);
                };
            }
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files)
    }
    $scope.saveImage = (files) => {
        var formData = new FormData();
        formData.append('resize_level', 3);
        formData.append('file', files[0]);
        $scope.loading = true;
        $http({
            url: base_url + '/uploads/ajax_upload_to_filehost?func=cashbook_receipt_new',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                $scope.cbsObject.file = r.data.data[0];
            } else {
                toastr["error"](r.data.message)
            }
        })
    }
});