app.controller('voucherCtrl', function ($scope, $http, $sce) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $('#voucherCtrl').fadeIn(0);
        $scope.filter = {};
        $scope.filter.is_partner = 0;
        $scope.isAdmin = isAdmin;
        $scope.loadding = true;
        $scope.restFilter();
        $scope.getAll();
        $scope.ckeditor = CKEDITOR.replace('textboxNotesVoucher', {
            uiColor: '#f2f3f5',
            height: '200',
            toolbarGroups: [{
                    name: 'basicstyles',
                    groups: ['basicstyles', 'cleanup', 'styles']
                },
                {
                    name: 'links',
                    groups: ['links', 'undo', 'redo']
                },
                {
                    name: 'insert',
                    groups: ['Image', 'Table']
                },
                {
                    name: 'paragraph',
                    groups: ['list', 'align'],
                },
            ]
        });

        $scope.ckeditor.on("instanceReady", function (e) {
            var $frame = $(e.editor.container.$).find(".cke_wysiwyg_frame");
            if ($frame) $frame.attr("title", "");
        });
    }

    $scope.restFilter = () => {
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.type = "";
        $scope.filter.discount_type = "";
        $scope.filter.active = "";
        $scope.filter.key = "";
        $scope.filter.is_partner = 0;
    }

    $scope.resetUpdate = (item) => {
        $scope.objVoucher = {
            id: item.id,
            name: item.name,
            type: item.type,
            discount: $scope.viewPrice(String(item.discount)),
            discount_type: item.discount_type,
            max_use: parseInt(item.max_use),
            exp_date: (item.exp_date) ? $scope.formatDate(item.exp_date, 'DD-MM-YYYY') : "",
            status: item.status,
            description: item.description,
            type_campaign: item.type_campaign,
            url_partner: item.url ? item.url : '',
            img_voucher: item.img_url
        };
        CKEDITOR.instances.textboxNotesVoucher.setData(item.note);
    }

    $scope.resetvoucher = (item) => {
        $scope.voucher = {};
        $scope.voucher.id = item.id;
        $scope.voucher.name = item.name;
        $scope.voucher.discount = $scope.viewPrice(String(item.discount));
        $scope.voucher.discount_type = item.discount_type;
        $scope.voucher.code = "";
        $scope.voucher.quantily = "";
        if (item.discount_type == 1) {
            let number = "";
            let unit = "";
            if (item.discount >= 100000 && item.discount < 1000000) {
                number = item.discount / 100000;
                unit = "trăm";
            }

            if (item.discount >= 1000000 && item.discount < 1000000000) {
                number = item.discount / 1000000;
                unit = "triệu";
            }

            if (item.discount >= 1000000000) {
                number = item.discount / 1000000000;
                unit = "tỷ";
            }

            if (item.discount < 100000) {
                number = $scope.voucher.discount;
                unit = 'đ';
            }
            $scope.voucher.note = item.name + ' GIẢM ' + number + ' ' + unit;
        } else {

            $scope.voucher.note = item.name + ' GIẢM ' + item.discount + ' %';

        }
    }

    $scope.getAll = () => {
        $scope.loadding = true;
        $http.get(base_url + 'marketings/get_list_voucher?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loadding = false;
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                select2();
                $("html, body").animate({
                    scrollTop: 0
                }, 50);
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    $scope.openAdd = (item = null) => {
        if (!item) {
            $scope.objVoucher = {
                type: "1",
                max_use: 1,
                discount_type: "1",
                type_campaign: "0",
                description: "",
                url_partner: ""
            };
            CKEDITOR.instances.textboxNotesVoucher.setData('');
        } else {
            $scope.resetUpdate(angular.copy(item));
        }

        $('.datepickerDate').datepicker({
            dateFormat: "dd-mm-yy",
            minDate: 0,
        });
        $("#btn_submit").css('display', 'block');
        $(".detail-dis").css('display', 'none');
        showPopup('#openAdd')
        select2();
    }

    $scope.createListCode = () => {
        $(".detail-dis").css('display', 'block');
        $("#btn_submit").css('display', 'none');
    }

    $scope.addOrUpdateVoucher = () => {
        $scope.objVoucher.is_partner = $scope.filter.is_partner ? $scope.filter.is_partner : 0;
        $scope.objVoucher.user_manual = CKEDITOR.instances.textboxNotesVoucher.getData();
        const urlRegex = /^((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)/g;
        const isUrlCorrect = $scope.objVoucher.url_partner.match(urlRegex);

        if ($scope.objVoucher.discount_type == '2') {
            if ($scope.objVoucher.discount) {
                let price = Number($scope.objVoucher.discount.replace(/,/g, ""));
                if (price > 100) {
                    return toastr["error"]("Giá khuyến mãi không vượt quá 100%");
                }
            }
        }

        if ($scope.objVoucher.is_partner && !$scope.objVoucher.user_manual) {
            showMessErr('Vui lòng nhập hướng dẫn');
            return;
        }

        if ($scope.objVoucher.is_partner && !isUrlCorrect) {
            showMessErr('Đường dẫn đến voucher đối tác không đúng');
            return;
        }

        var data_rq = angular.copy($scope.objVoucher);
        $scope.loadInsert = true;
        $http.post(base_url + 'marketings/saveVoucher', JSON.stringify(data_rq)).then(r => {
            if (r.data.status == 1) {
                hidePopup('#openAdd')
                toastr["success"](r.data.message);
                $scope.getAll();
                select2();
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.updateVoucherActive = (value, e) => {
        e.preventDefault();
        swal({
            title: "Bạn có chắc?",
            text: "Bạn có chắc hành động chỉnh sửa này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }, function () {
            let data = {};
            data.id = value.id;
            data.active = (value.active == 1) ? 2 : 1;
            $http.post(base_url + 'marketings/updateVoucherActive', JSON.stringify(data)).then(r => {
                if (r.data.status == 1) {
                    value.active = data.active;
                    toastr["success"](r.data.message);
                } else toastr["error"](r.data.message);
            }).catch(e => {
                toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
            });
        });
    }

    $scope.openAddVoucher = (item) => {
        $scope.resetvoucher(angular.copy(item));
        $('#openAddVoucher').modal('show');
        select2();
    }

    $scope.insertDetailVoucher = () => {
        var regexSpace = /\s/g;
        if ($scope.voucher.code.match(regexSpace)) {
            showMessErr('Mã khuyến mãi không được chứa ký tự khoảng trắng');
            return;
        }
        $scope.loadInsert = true;
        $http.post(base_url + 'marketings/save_detail_voucher', JSON.stringify($scope.voucher)).then(r => {
            if (r.data.status == 1) {
                $('#openAddVoucher').modal('hide');
                toastr["success"](r.data.message);
                $scope.getAll();
                select2();
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.listVoucher = (item) => {
        $scope.loadInsert = true;
        $scope.listVoucherDetail(item);
        $scope.list = {};
        $('#listVoucher').modal('show');
    }

    $scope.listVoucherDetail = (item) => {
        let data = {
            'id': item.id,
            'name': item.name,
            'key': $scope.filter.key
        }

        $http.post(base_url + 'marketings/list_voucher_detail', JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                $scope.loadInsert = false;
                $scope.list = r.data.data;
            } else toastr["error"](r.data.message);
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.exportExcel = (item) => {
        let data = {
            'id': item.id,
            'name': item.name
        }

        $http.post(base_url + 'marketings/export_excel', JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                var $a = $("<a>");
                $a.attr("href", r.data.file);
                $a.attr("download", r.data.fileName);
                $("body").append($a);
                $a[0].click();
                $a.remove();
            } else toastr["error"](r.data.message);
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.exportExcelDetail = (item) => {
        let data = {
            'id': item.voucher_id,
            'name': item.name,
            'user_id': item.user_id,
            'created': item.created
        }
        $http.post(base_url + 'marketings/export_excel', JSON.stringify(data)).then(r => {
            if (r.data.status == 1) {
                var $a = $("<a>");
                $a.attr("href", r.data.file);
                $a.attr("download", r.data.fileName);
                $("body").append($a);
                $a[0].click();
                $a.remove();
            } else toastr["error"](r.data.message);
        }).catch(e => {
            $scope.loadInsert = false;
            toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
        });
    }

    $scope.updateDetailActive = (value, e) => {
        e.preventDefault();
        swal({
            title: "Bạn có chắc?",
            text: "Bạn có chắc hành động chỉnh sửa này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }, function () {
            let data = {};
            data.voucher_id = value.voucher_id;
            data.user_id = value.user_id;
            data.created = value.created;
            data.active = (value.active == 1) ? 0 : 1;
            $http.post(base_url + 'marketings/update_detail_active', JSON.stringify(data)).then(r => {
                if (r.data.status == 1) {
                    value.active = data.active;
                    toastr["success"](r.data.message);
                } else toastr["error"](r.data.message);
            }).catch(e => {
                toastr["error"]("Đã có lỗi xảy ra với máy chủ API");
            });
        });
    }

    $scope.getVoucherDetail = (item) => {
        window.open(base_url + 'marketings/voucher_details?id=' + item.id);
    }
    $scope.openSearch = (i) => {
        if (i == 1) {
            $('.col-search').css('display', 'block');
        } else {
            $('.col-search').css('display', 'none');
        }
    }

    $scope.viewPrice = (item) => {
        let val = item;
        val = val.replace(/,/g, "");
        val += '';
        x = val.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        let rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 300);
    }

    $scope.goToTab = (tab) => {
        $scope.restFilter();
        $scope.filter.is_partner = tab == 'partner' ? 1 : 0
        $scope.go2Page(1);
    }

    $scope.uploadImageVoucher = function (event) {
        $scope.loadUploadImage = true;
        var formData = new FormData();
        var files = event.target.files;
        if (files.length) {
            var arrType = [
                    'image/jpg',
                    'image/png',
                    'image/jpeg'
                ],
                file = files[0];

            if (!arrType.includes(file.type)) {
                showMessErr(`File ${file.name} sai định dạng`);
                $('#image-voucher-partner').val('');
                return;
            }
        }
        formData.append("file", files[0]);
        formData.append('resize_level', 1);

        $http({
            url: base_url + 'uploads/ajax_upload_to_filehost?folder=voucher_partner',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.loadUploadImage = false;
            $('#image-voucher-partner').val('');
            if (r.data.status == 1) {
                $scope.objVoucher.img_voucher = r.data.data[0];
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.showZoomImg = showZoomImg;

    $scope.attachFile = () => {
        $('#image-voucher-partner').click();
    }

    $scope.removeImageVoucher = (url) => {
        event.preventDefault();

        if ($scope.objVoucher.id) {
            $scope.objVoucher.img_voucher = null;
            return;
        }
        swal({
            title: "Thông báo",
            text: "Bạn có chắc chắn muốn xoá?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            confirmButtonColor: "#dc3741",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, function () {
            var data_rq = {
                url:url,
                func: 'removeImageVoucher'
            }
            $http.get(base_url + 'uploads/ajax_delete_file_by_url?' + $.param(data_rq)).then(r => {
                if (r.data.success) {
                    $scope.objVoucher.img_voucher = null;
                    swal("Thông báo", "Xóa thành công!", "success");
                } else {
                    showMessErr(r.data.message);
                }
            })
        });

    }

    //paging-----------------------------------

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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
$(document).on('input', '.input-vc-code', function(e) {
    var self = $(this);
    self.val(self.val().replace(/[^a-zA-Z0-9\-]/g, ''));
});