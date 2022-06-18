app.controller('confession_confirm', function ($scope, $http, $sce, $compile) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('.box').css('opacity', "1");
        $scope.confirm = {};

        $scope.filter = {};
        $scope.filter.nation_id = "0";
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.dem = 0;

        $scope.verify = {};


        let param_id = getParamsValue('id');
        if (param_id) {
            $scope.getPaymentsV(param_id);
        } else {
            $scope.getPaymentsV();
        }



    }
    $scope.refreshPaste = () => {
        $scope.newItem.paste_vl = '';
    }

    $scope.showZoomImg = (value) => {
        showZoomImg(value);
    }
    $scope.openModalA = () => {
        $('#addModal').modal('show')
    }
    $scope.openCreator = () => {
        $scope.newItem = {};
        $scope.newItem.is_web = "-1";
        $('#creatorModal').modal('show')
    }
    $scope.openDetailToEdit = (item) => {
        $scope.newItem = angular.copy(item);
        if ($scope.newItem.total && $scope.newItem.total != '') $scope.newItem.total = numberWithCommas($scope.newItem.total);
        $('#creatorModal').modal('show')
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    $scope.openDetail = (item) => {
        $scope.cr_item = item;
        $('#modalDetail').modal('show');
    }
    $scope.attachFile = () => {
        $('#inputFileEdit').click();
    }


    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = function (readerEvent) { }
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files[0])
    }
    $scope.genVerifi = () => {
        var phoneRe = /^[0-9]{10}$/;
        let test = phoneRe.test($scope.newItem.phone);
        if (!test) {
            toastr["error"]('Số điện thoại không hợp lệ!');
            return false;
        }

        let data = {};

        data.phone = $scope.newItem.phone;
        data.note = $scope.newItem.note;
        data.name = $scope.newItem.name;
        data.is_web = $scope.newItem.is_web;

        data.total = ($scope.newItem.total + '').replace(/,/g, "");
        if ($scope.newItem.id) {
            data.id = $scope.newItem.id;
        } else {
            data.image = $scope.newItem.image;
        }

        $http.post(base_url + 'verify_payment/create_verify_payment', data).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Thêm thành công!!');
                $scope.getPaymentsV();
                $('#creatorModal').modal('hide')
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.saveImage = (file) => {
        var formData = new FormData();
        formData.append('file', file);
        $scope.loading = true;
        $http({
            url: base_url + '/verify_payment/ajax_upload_image_license',
            method: "POST",
            data: formData,
            headers: { 'Content-Type': undefined }
        }).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                $scope.newItem.image = r.data.urlImage;
                console.log($scope.newItem);
                return true;
            } else {
                toastr["error"](r.data.message)
            }
        })
    }
    window.addEventListener("paste", function (e) {
        // Handle the event
        if ($scope.newItem && $scope.newItem.id) return false;

        retrieveImageFromClipboardAsBlob(e, function (imageBlob) {
            if (imageBlob) {
                $scope.saveImage(imageBlob);
            }
        });
    }, false);

    function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
        if (pasteEvent.clipboardData == false) {
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        var items = pasteEvent.clipboardData.items;

        if (items == undefined) {
            if (typeof (callback) == "function") {
                callback(undefined);
            }
        };

        for (var i = 0; i < items.length; i++) {
            // Skip content if not image
            if (items[i].type.indexOf("image") == -1) continue;
            // Retrieve image on clipboard as blob
            var blob = items[i].getAsFile();

            if (typeof (callback) == "function") {
                callback(blob);
            }
        }
    }

    $scope.updateOrder = (value) => {
        var data = {
            id: value.id,
            tvv_note: value.tvv_note
        };

        $http.post(base_url + '/online_order/update_order', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $('.excute').css('pointer-events', 'initial');

                toastr["success"]("Thành công!");
            } if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.getTable = (tus) => {
        $scope.filter.status = tus;
        $scope.go2Page(1);
    }

    $scope.openInforModal = (value, status) => {
        $scope.cr_item = value;
        if (status == 1) {
            $scope.confirm.text = "Bạn muốn xác nhận đơn";
        } else if (status == 2) {
            $scope.confirm.text = "Bạn muốn hủy đơn";
        } else if (status == 3) {
            $scope.confirm.text = "Bạn muốn hoàn thành đơn";
        }
        $scope.confirm.status = status;

        $('#confirm').modal('show');
    }

    $scope.confirm_ = (value, status) => {
        var data = {
            id: value.id,
            status: status,
            note: $scope.cancel_note
        };
        console.log($scope.cancel_note);
        if (status == 2 && !$scope.cancel_note) {
            toastr["error"]("Nhập lý do!");
            return;
        }
        $('.lb').css('pointer-events', 'none');
        $http.post(base_url + '/verify_payment/ajax_change_tus_order', JSON.stringify(data)).then(r => {
            $('.lb').css('pointer-events', 'initial');
            if (r && r.data.status == 1) {
                $('#confirm').modal('hide');
                $('#modalDetail').modal('hide');
                toastr["success"]("Thành công!");
                $scope.getPaymentsV();
                $scope.cancel_note = "";

            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
                $scope.getPaymentsV();
            } else {
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.getPaymentsV = (id = null) => {
        var data = angular.copy($scope.filter);


        $('table tbody').addClass('loading');
        $http.get(base_url + '/verify_payment/ajax_get_payment?filter=' + JSON.stringify(data)).then(r => {
            $('table tbody').removeClass('loading');

            if (r && r.data.status == 1) {
                $scope.orders = r.data.data;

                if ($scope.dem == 0) {
                    if (id) {
                        $scope.orders.forEach(element => {
                            if (element.id == id) {
                                $scope.openDetail(element);
                            }
                        });
                    }
                    dem = 2;
                } else {
                    window.history.pushState("", "", base_url + '/verify_payment/list');
                    console.log(window.history.pushState("", "", base_url + '/verify_payment/list'));
                }
                $scope.dem++;

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.openValue = (value) => {
        value.open = !value.open;
        if (value.open == false) {
            $scope.cr_item = value;
            $scope.save(value);
        }
    }


    $scope.totalMoney = (obs) => {
        var total = 0;
        obs.forEach(element => {
            total += parseInt(element.product_pr) * parseInt(element.quantity);
        });
        return formatNumber(total);
    }

    function formatNumber(num) {
        if (!num) {
            return 0;
        }
        num = parseInt(num);
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }

    $('input').on("keypress", function (e) {
        if (e.keyCode == 13) {
            console.log(123);

            $scope.cr_item.open = !$scope.cr_item.open;
            $scope.save($scope.cr_item);
        }
    });

    $scope.save = (value) => {
        if (!value.quantity) {
            value.quantity = 0;
        }
        $http.post(base_url + '/online_order/ajax_save_detail', JSON.stringify(value)).then(r => {
            console.log(r);
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
            } else {
                value.quantity = $scope.cr_item.quantity;
                toastr["error"]("Đã có lỗi xẩy ra!");
            }
        });
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getPaymentsV();
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

}).directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});