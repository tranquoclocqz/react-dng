app.controller('orderCtrl', function ($scope, $http, $filter) {
    $scope.all_nations = all_nations;
    $scope.company_id = company_id;

    $scope.init = () => {
        $scope.initSearchProduct();
        $scope.id = id;
        $scope.order = {
            products: []
        };
        $scope.product = {};
        if ($scope.id > 0) {
            $scope.getOrder();
        }
        $scope.list_category = [];
        $scope.isBarcode = false;
        $scope.valSearch = '';
        $scope.isCanCancel = isCancel == 1 ? true : false;
        $scope.total_product = 0;
        $scope.countTotalProduct();
        // $scope.getListProductTag(); ko có data
        $scope.getProductGroup();
        $scope.getProductUnits();
        $scope.getProductAttributes();
        $scope.loadProvider();
        // $scope.getAttributeDetail();
        // $scope.getlistUnit();

    }
    $scope.getProductAttributes = () => {
        $scope.loadding = true;
        $http.get(base_url + 'products/get_product_attributes').then(r => {
            if (r.data.status == 1) {
                $scope.list_product_attributes = r.data.data;
                select2();
                $scope.loadding = false;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    $scope.getProductUnits = () => {
        $scope.loadding = true;
        $http.get(base_url + 'products/get_product_units').then(r => {
            if (r.data.status == 1) {
                $scope.list_product_units = r.data.data;
                select2();
                $scope.loadding = false;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }
    $scope.sendtoWarehousing = () => {
        window.open('warehouse/warehousing?type=create&data=' + $scope.id, '_blank');
    }
    $scope.getProductGroup = () => {
        $scope.loadding = true;
        $http.get(base_url + 'products/get_product_group').then(r => {
            if (r.data.status == 1) {
                $scope.list_product_groups = r.data.data;
                select2();
                $scope.loadding = false;
            } else toastr["error"]('Không thể lấy dữ liệu. Vui lòng thử lại sau!');
        });
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 50);
    }

    $scope.getListProductTag = async () => {
        $http.get('products/product_tag_root_list').then(r => {
            $scope.loadingPage = false;
            if (r.data && r.data.status == 1) {
                $scope.list_product_tag = r.data.data;
                select2();
            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        })
    }

    $scope.setValSearch = (val) => {
        $scope.valSearch = val;
    }

    $scope.openModel = (id) => {
        $scope.insert = {};
        $scope.insert.nation_id = "1";
        $scope.insert.parent_id = '0';
        $scope.insert.group_id = '0';

        $scope.insert.type = "retail";
        $scope.insert.store_type = "3";
        jQuery('#' + id).modal('show');

        select2();
    }
    $scope.insertProduct = () => {
        $scope.loadInsert = true;
        let item = angular.copy($scope.insert)
        item.image_url = $('.product-image-url').val();

        let price, price_web;
        if (item.price && item.price.indexOf(',')) {
            price = new Number(item.price.split(',').join(''));
        } else {
            price = new Number(item.price);
        }
        if (item.price_web && item.price_web.indexOf(',')) {
            price_web = new Number(item.price_web.split(',').join(''));
        } else {
            price_web = new Number(item.price_web);
        }
        let err = false;
        if (item.description.length > 255) err = 'Tên sản phẩm không được quá 255 ký tự';
        else if (price >= price_web && item.price_web != 0) err = 'Giá thị trường phải lớn hơn giá bán';
        if (item.description_usa && item.description_usa.length > 255) err = 'Tên sản phẩm tiếng anh không được quá 255 ký tự';
        if (err) {
            toastr["error"](err);
            $scope.loadInsert = false;
            return false;
        }

        $http.post(base_url + 'products/save_new', JSON.stringify(item)).then(r => {
            if (r.data.status == 1) {
                $('#addProduct').modal('hide');
                toastr["success"](r.data.message);
                let temp = {
                    id: r.data.insert_id,
                    description: item.description,
                    barcode: item.barcode,
                    received_quantity: 1
                }
                $scope.updateOrAddProduct(temp);
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        });

    }

    $scope.checkExistProduct = (id) => {
        let product = $scope.order.products.find(r => {
            return r.product_id == id
        });
        return product ? true : false;
    }

    $scope.loadProvider = () => {
        $http.get('partner/ajax_get_suppliers').then(r => {
            $scope.loadingPage = false;
            if (r.data && r.data.status == 1) {
                $scope.providers = r.data.data;
            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
        })
    }

    $scope.insert_new = (type = 1) => {
        if (!$scope.order.type) {
            toastr["error"]('Bạn chưa chọn loại sản phẩm!');
            return;
        }

        if (!$scope.order.provider_id) {
            toastr["error"]('Bạn chưa chọn nhà cung cấp!');
            return;
        }

        let hasOrr = $scope.order.products.find(r => {
            return isNull(r.order_quantity) || isNull(r.price_input);
        });

        if (hasOrr) {
            toastr["error"]('Số lượng hoặc giá nhập không hợp lệ!');
            return;
        }
        // $scope.loading = true;
        if (type == 2 || type == 3) {
            let hasErr = $scope.order.products.find(r => {
                return isNull(r.received_quantity)
            });
            if (hasErr) {
                toastr["error"]('Số lượng nhận không hợp lệ');
                return;
            }
            let data = angular.copy($scope.order);
            if (type == 3) data.status = 2;


            $http.post(base_url + 'warehouse/confirm_warehouse_order', JSON.stringify(data)).then(r => {
                $scope.loading = false;
                if (r.data.status == 1) {
                    toastr["success"](r.data.message);
                    window.location.replace('warehouse/warehouse_order_detail/' + r.data.insert_id);
                } else toastr["error"](r.data.message);
                $scope.loadInsert = false;
            });
            return true;
        }
        $http.post(base_url + 'warehouse/insertOrder', JSON.stringify($scope.order)).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                toastr["success"](r.data.message);
                window.location.replace('warehouse/warehouse_order_detail/' + r.data.insert_id);
            } else toastr["error"](r.data.message);
            $scope.loadInsert = false;
        });
    }

    $scope.changeBarcode = () => {
        $scope.isBarcode = !$scope.isBarcode;
        $scope.valSearch = '';
    }

    $scope.countTotalProduct = () => {
        $scope.total = {
            totalProduct: 0,
            totalNumber: 0,
            totalPrice: 0
        }
        $scope.order.products.forEach(e => {
            $scope.total.totalProduct += 1;

            e.order_quantity = e.order_quantity + '';
            e.price_input = e.price_input + '';

            let totalNumber = formatNumber(e.order_quantity);
            let totalPrice = formatNumber(e.price_input);

            $scope.total.totalNumber += totalNumber;
            $scope.total.totalPrice += (totalNumber * totalPrice);

            e.totaltPrice = (totalNumber * totalPrice);
            e.order_quantity = $filter('number')(totalNumber);
            e.price_input = $filter('number')(totalPrice);
        });
    }

    function formatNumber(value) {
        return (value && value != '') ? Number((value + '').replace(/,/g, "")) : 0;
    }

    $scope.loadKeyword = () => {
        document.addEventListener("keydown", e => {
            var seft = $(e.target);
            if (e.key == 'Enter') {
                if (barcode.length > 5) {
                    var flag_repace = true;

                    if (seft.val() && flag_repace) {
                        var str_ = (seft.val() + '').replace(barcode, '').trim();
                        seft.val(str_).trigger('input');
                    }
                    angular.element(document.getElementById('invoiceCtrl')).scope().searchScanner(barcode);
                    barcode = "";
                }
            } else {
                if (e.key != 'Shift') {
                    barcode += e.key;
                }
            }

            if (!reading) {
                reading = true;
                setTimeout(() => {
                    barcode = "";
                    reading = false;
                }, 200);
            }
        }, true)
    }

    $scope.viewTranNotAccept = () => {
        $('#viewTranNotAccept').modal('show');
    }

    $scope.getOrder = () => {
        $http.get('warehouse/get_order_detail/' + $scope.id).then(r => {
            $scope.loadingPage = false;
            if (r.data && r.data.status == 1) {
                console.log(r.data);
                $scope.order = r.data.data;
                $scope.countTotalProduct();
            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loading = false;
        })
    }

    $scope.initSearchProduct = () => {
        var typingTimer;
        var doneTypingInterval = 200;
        var input = jQuery('.product_search_input');
        //on keyup, start the countdown
        input.on('keyup', function (e) {
            if (!$scope.isBarcode) {
                clearTimeout(typingTimer);
                var currentInput = jQuery(this);
                var keyword = currentInput.val();

                // Clear all input if have # symbol
                if (keyword.includes('#') && e.key === 'Backspace') {
                    currentInput.val('');
                    return;
                }

                if (!keyword || keyword.includes('#')) {
                    jQuery('.product-search').removeClass('showed');
                    return false;
                }
                typingTimer = setTimeout(async function () {

                    var param = {
                        key: keyword,
                        type: $scope.order.type,
                        provider_id: $scope.order.provider_id
                    };

                    currentInput.parent().find('.loader-in-row').fadeIn('fast');
                    currentInput.parent().find('.product-search').addClass('showed');

                    $http.get('products/search_product_review_by_key?filter=' + JSON.stringify(param)).then(r => {
                        $scope.loadingProduct = false;
                        if (r.data && r.data.status == 1) {
                            console.log(r.data);
                            $scope.products = r.data.data;
                        } else {
                            toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
                        }
                    })

                    currentInput.parent().find('.loader-in-row').fadeOut('fast');
                }, doneTypingInterval);

            }
        });

        //on keydown, clear the countdown
        input.on('keydown', function () {
            clearTimeout(typingTimer);
        });

        document.addEventListener("click", function (event) {
            if (event.target.closest(".product-search-wrapper")) return true;
            else jQuery('.product-search').removeClass('showed');
        });

    };

    $scope.searchPro = async (keyword) => {
        var barcode = keyword ? keyword : $scope.valSearch;
        var param = {
            barcode: barcode,
            active: 'yes',
            type: 'product_retail'
        };
        $scope.valSearch = '';
        param = jQuery.param(param);
        var product = await getApi('product/search_product_by_barcode?' + param);
        if (checkApi(product) && product.data.item) {
            showMessSuccess('Quét thành công');
            $scope.updateOrAddProduct(product.data.item);
        } else {
            showMessErr('Không tìm thấy sản phẩm')
        }
        $scope.loadingProduct = false;
        $scope.$digest();
    }

    $scope.updateOrAddProduct = async (product) => {
        let has = $scope.order.products.findIndex(r => {
            return r.product_id == product.id
        });
        if (has == -1) {
            let p = {
                description: product.description,
                product_id: product.id,
                id: product.id,
                barcode: product.barcode,
                order_quantity: 1,
                price_input: 0,
                totalPrice: 0
            }
            if (product.received_quantity) p.received_quantity = product.received_quantity;
            $scope.order.products.unshift(p);
        }
        $scope.countTotalProduct();
    }


    function isNull(val) {
        if (!val || val == '') return true;
        return false;
    }

    $scope.searchProductRoot = async (type, view) => {

        let name = $scope.search_product.name;
        if (!name || name.length < 3) return true;
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchProductRoot(type, name, view);
        }, 350);
    }

    $scope._searchProductRoot = async (type, name, view) => {
        let res = await getApi('product/list_root_products?' + jQuery.param({
            "type": type,
            "name": name
        }));
        $scope.search_product.load = false;
        if (checkApi(res)) {
            if (view == 'search') {
                $scope.list_product_parent_search = res.data;
            } else {
                $scope.list_product_parent = res.data;
            }
        }
        $scope.$digest();
    }

    $scope.chooseItemSearchProduct = (prod) => {
        $scope.productRoot = prod;
        $scope.product.parent_id = prod.id;
        $scope.product.category_id = prod.category_id;
        $scope.search_product.name = '';
    }


    $scope.getTypeClass = (type) => {
        if (type == 'retail') return 'badge badge-primary';
        if (type == 'profession') return 'badge badge-success';
    }

    $scope.getStatusClass = (status) => {
        if (status == 1) return 'badge badge-primary';
        if (status == 2) return 'badge badge-danger';
        if (status == 3) return 'badge badge-success';
        if (status == 4) return 'badge badge-danger';
        return 'badge badge-default';
    }

    $scope.checkkey = (event) => {
        var keys = {
            'up': 38,
            'right': 39,
            'down': 40,
            'left': 37,
            'escape': 27,
            'backspace': 8,
            'tab': 9,
            'enter': 13,
            'del': 46,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'dash': 189,
            'subtract': 109
        };

        for (var index in keys) {
            if (!keys.hasOwnProperty(index)) continue;
            if (event.charCode == keys[index] || event.keyCode == keys[index]) {
                return; //default event
            }
        }
        event.preventDefault();
    }

    $scope.getlistUnit = async () => {
        let res = await getApi('unit/get_list_unit?' + jQuery.param({
            type: 'product'
        }));
        if (checkApi(res)) {
            $scope.list_unit = res.data;
            select2();
        }
        $scope.$digest();
    }

    $scope.getAttributeDetail = async () => {
        let res = await getApi('product/get_list_attribute_detail?');
        if (checkApi(res)) {
            $scope.list_attribute_detail_array = res.data;
            select2();
        }
        $scope.$digest();
    }

    $scope.exportExcel = () => {
        window.open(HOST_URL + '/app/warehouse/excel_order?id=' + $scope.order.id);
    }





    $('#file_image_url').on('change', function () {
        var input = this;
        var formData = new FormData();
        if (input.files.length) {
            var arrType = [
                'image/jpg',
                'image/png',
                'image/jpeg'
            ],
                file = input.files[0];

            if (!arrType.includes(file.type)) {
                showMessErr(`File ${file.name} sai định dạng`);
                input.value = '';
                return;
            }
        }
        input.value = '';

        formData.append('file', file);
        $.ajax({
            url: base_url + 'uploads/ajax_upload_to_filehost?func=warehouse_order_detail',
            method: 'post',
            dataType: 'text',
            processData: false,
            crossOrigin: false,
            contentType: false,
            data: formData,
            beforeSend() {
                $('.wrap-upload').addClass('loading');
            },
            success(r) {
                r = JSON.parse(r);
                if (r.status) {
                    $('[name="image_url"]').val(r.data[0]);
                    $('.wrap-upload').find('img').attr('src', r.data[0]);
                } else {
                    showMessErr(r.message);
                }
            },
            complete() {
                $('.wrap-upload').removeClass('loading');
            },
            error() {
                showMessErrSystem();
            }
        })
    })

    $('#file_image_url_update').on('change', function () {
        var input = this;
        var formData = new FormData();
        if (input.files.length) {
            var arrType = [
                'image/jpg',
                'image/png',
                'image/jpeg'
            ],
                file = input.files[0];

            if (!arrType.includes(file.type)) {
                showMessErr(`File ${file.name} sai định dạng`);
                input.value = '';
                return;
            }
        }
        input.value = '';

        formData.append('file', file);
        $.ajax({
            url: base_url + 'uploads/ajax_upload_to_filehost?func=warehouse_order_detail',
            method: 'post',
            dataType: 'text',
            processData: false,
            crossOrigin: false,
            contentType: false,
            data: formData,
            beforeSend() {
                $('.wrap-upload').addClass('loading');
            },
            success(r) {
                r = JSON.parse(r);
                if (r.status) {
                    $('[name="image_url"]').val(r.data[0]);
                    $('.wrap-upload').find('img').attr('src', r.data[0]);
                } else {
                    showMessErr(r.message);
                }
            },
            complete() {
                $('.wrap-upload').removeClass('loading');
            },
            error() {
                showMessErrSystem();
            }
        })
    })



})
var barcode = '';
var reading = false;

document.addEventListener("keydown", e => {
    var seft = jQuery(e.target);
    if (e.key == 'Enter') {
        if (barcode.length > 5) {
            var flag_repace = true;

            if (seft.val() && flag_repace) {
                var str_ = (seft.val() + '').replace(barcode, '').trim();
                seft.val(str_).trigger('input');
            }
            angular.element(document.getElementById('inventoryCtrl')).scope().searchPro(barcode);
            barcode = "";
        }
    } else {
        if (e.key != 'Shift') {
            barcode += e.key;
        }
    }

    if (!reading) {
        reading = true;
        setTimeout(() => {
            barcode = "";
            reading = false;
        }, 500);
    }
}, true);

async function upload(input, action = 'add') {
    let file = input.files[0];
    if (file) {
        jQuery('.wrap-custom-upload').addClass('loading');
        jQuery('.addnew-save-btn').prop('disabled', true);

        var fd = new FormData();
        fd.append('folder', UPLOAD_FOLDERS.products.folder);
        fd.append('file', file);
        let res = await doUploadAjax(fd);
        if (!res.success) {
            showMessErr('Không thể upload hình ảnh');
        } else {
            jQuery('.product-image-url').val(res.data.url);
        }
        jQuery('.wrap-custom-upload').removeClass('loading');
        jQuery('.addnew-save-btn').removeAttr('disabled');

    }
};

function readURL(input) {
    let img = jQuery(input).closest('.wrap-custom-upload').find('img'),
        arrType = ['image/jpg', 'image/png', 'image/jpeg'];
    if (input.files && input.files[0]) {
        if (arrType.includes(input.files[0].type)) {
            var reader = new FileReader();

            reader.onload = function (e) {
                img.attr('src', e.target.result);
            };

            reader.readAsDataURL(input.files[0]);
        } else {
            showMessErr('Chỉ cho phép hình ảnh có đuôi: ' + arrType.join(', '));
        }
    } else {
        input.value = '';
        img.attr('src', '');
    }
}


jQuery('#addNewModal').on('show.bs.modal', function () {
    setTimeout(() => {
        $(this).find('input.name').focus().trigger('input');
    }, 300);
});

jQuery('#editModal').on('show.bs.modal', function () {
    setTimeout(() => {
        $(this).find('.input-format-number').trigger('keyup');
    }, 300);
});