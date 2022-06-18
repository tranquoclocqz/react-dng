app.controller('ivdtCtrl', function ($scope, $http) {
    $scope.init = () => {
        $scope.initSearchProduct();
        $scope.id = id;
        $scope.tran = {};
        $scope.getTranDetail();
        $scope.isBarcode = true;
        $scope.valSearch = '';
        $scope.isCanCancel = isCancel == 1 ? true : false;
        $scope.total_product = 0;
        $scope.dateInputInit();
        $scope.isSelectDate = false;
        $scope.getNumberSaleProduct();
        $scope.barcode_mb_scanner = false;
    }

    $scope.changeSelectDate = (val) => {
        $scope.isSelectDate = val;
    }

    $scope.changeBarcode = () => {
        $scope.isBarcode = !$scope.isBarcode;
        $scope.valSearch = '';
    }

    $scope.countTotalProduct = () => {
        $scope.total_product = 0;
        $scope.tran.products.forEach(e => {
            $scope.total_product += Number(e.quantity);
        });
    }

    $scope.print = () => {
        window.open(HOST_URL + '/app/warehouse/print_branch_inventories?id=' + $scope.tran.id)
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

    function convertDateFormat(date) {
        // date = 2021-03-20 return 20-03-2021
        // date = 20-03-2021 return 2021-03-20
        var dateOrgParts = (date + '').split("-");
        return dateOrgParts[2] + "-" + dateOrgParts[1] + "-" + dateOrgParts[0];
    }
    $scope.getNumberSaleProduct = async () => {
        $scope.loadQuantitySale = true;
        $scope.ipdate = '';
        let fl = {};
        if ($scope.dateProduct) {
            var date = $scope.dateProduct.split('-');
            var fromDate = date[0].replaceAll('/', '-').replaceAll(' ', '');
            var toDate = date[1].replaceAll('/', '-').replaceAll(' ', '');
            fl.fromDate = convertDateFormat(fromDate);
            fl.toDate = convertDateFormat(toDate);
            $scope.ipdate = date[0] + ' đến ' + date[1];

        } else {
            fl.fromDate = moment().format('YYYY-MM-DD');
            fl.toDate = moment().format('YYYY-MM-DD')
            $scope.ipdate = moment().format('DD/MM/YYYY') + ' đến ' + moment().format('DD/MM/YYYY');
        }

        $http.get(base_url + 'warehouse/get_quantity_sale_product?filter=' + JSON.stringify(fl)).then(r => {
            $scope.loadQuantitySale = false;
            if (r.data.status == 1) {
                $scope.numberProduct = r.data.data.quantity
                $scope.changeSelectDate(false);
            } else toastr["error"]('Vui lòng thử lại');
        })
    }


    $scope.getTranDetail = async () => {
        $http.get(base_url + 'warehouse/get_wh_temp_detail/' + $scope.id).then(r => {
            if (r.data.status == 1) {
                $scope.tran = r.data.data;
                $scope.countTotalProduct();
                $scope.getProductInventory();
            } else toastr["error"]('Vui lòng thử lại');
        })
    }

    $scope.getProductInventory = async () => {
        let products = $scope.tran.products;
        let warehouse_id = $scope.tran.warehouse_id;
        let type = $scope.tran.type;
        let created = $scope.tran.created;
        if (warehouse_id > 0) {
            var data = {
                ls_product: products.map(r => {
                    return r.product_id
                }),
                warehouse_id: warehouse_id,
                type: type,
                date: created,
                fullcreated: true,
                offset: 0,
                limit: 10000,
                tmp: 0
            }

            $http.get('warehouse/api_get_warehouse_inventory?filter=' + JSON.stringify(data)).then(r => {
                if (r.data.status == 1) {
                    $scope.inventories = r.data.data;
                    $scope.failed_inven = false;
                    $scope.tran.products.forEach(r => {
                        let quan = $scope.inventories.find(item => {
                            return item.id == r.product_id
                        });
                        if (quan) r.inventory = quan.total.toString();
                        else r.inventory = 'Chưa xác định';
                        if (r.quantity != r.inventory) $scope.failed_inven = true;
                    });
                } else toastr["error"]('Vui lòng thử lại');
            })
        } else {
            toastr["error"]('Bạn chưa khọn kho. Không thể lấy dữ liệu tồn kho!')
        }
    }

    function input_search_handle(keyword) {
        var typingTimer;
        var doneTypingInterval = 200;
        var currentInput = jQuery('.product_search_input');
        // Clear all input if have # symbol
        if (keyword.includes('#')) {
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
                active: 'yes',
                type: jQuery('#product-type-select').val()
            };
            param = jQuery.param(param);

            currentInput.parent().find('.loader-in-row').fadeIn('fast');
            currentInput.parent().find('.product-search').addClass('showed');

            var products = await getApi('product/search_product_by_key?' + param);
            $scope.products = products.data;
            $scope.loadingProduct = false;
            $scope.$digest();
            currentInput.parent().find('.loader-in-row').fadeOut('fast');
        }, doneTypingInterval);
        currentInput.val(keyword).trigger('change');
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
                        active: 1,
                        type: $scope.tran.type,
                        nation_id: nationId,
                        company_id: companyId,
                        limit: 10,
                        offset: 0
                    };
                    param = jQuery.param(param);

                    currentInput.parent().find('.loader-in-row').fadeIn('fast');
                    currentInput.parent().find('.product-search').addClass('showed');

                    var products = await getApi('products/get_list_products?' + param);
                    $scope.products = products;
                    $scope.loadingProduct = false;
                    $scope.$digest();
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

    async function postApi(url) {
        let result = await jQuery.ajax({
            url: base_url + url,
            type: 'POST',
            dataType: 'json',
            beforeSend: (request) => {
                request.setRequestHeader("Content-Type", "application/json");
            },
        });
        return result.data;
    }

    async function getApi(url) {
        let result = await jQuery.ajax({
            url: base_url + url,
            type: 'GET',
            dataType: 'json',
            beforeSend: (request) => {
                request.setRequestHeader("Content-Type", "application/json");
            },
        });
        return result.data;
    }

    $scope.updateOrAddTranDetail = (product) => {
        let pro = {
            warehouse_tmp_id: $scope.tran.id,
            product_id: product.id
        };
        $scope.loadBtnAdd = true;
        $http.post(base_url + 'warehouse/actionInventoryTmpDetail', JSON.stringify(pro)).then(r => {
            console.log(r.data);
            $scope.loadBtnAdd = false;
            if (r.data.status == 1) {
                updateNumberQuantity(product);
                $scope.getProductInventory();
            } else $scope.getTranDetail();
        });
    }

    function updateNumberQuantity(product) {
        let has = $scope.tran.products.findIndex(r => {
            return r.product_id == product.id
        });
        if (has >= 0) {
            $scope.tran.products[has].quantity = Number($scope.tran.products[has].quantity) + 1;
            let p = angular.copy($scope.tran.products[has]);
            $scope.tran.products.splice(has, 1);
            $scope.tran.products.unshift(p);
        } else {
            console.log(product);
            let p = {
                warehouse_tmp_id: $scope.tran.id,
                product_name: product.description,
                product_id: product.id,
                barcode: product.barcode,
                quantity: 1,
                id: 'Loading'
            }
            $scope.tran.products.unshift(p);
        }
        $scope.countTotalProduct();
    }

    $scope.update = async (item) => {
        $scope.loadBtnAdd = true;
        $http.post(base_url + 'warehouse/actionInventoryTmpDetail', JSON.stringify(item)).then(r => {
            $scope.loadBtnAdd = false;
            if (r.data.status == 1) {
                updateNumberQuantity(product);
                $scope.getProductInventory();
            } else $scope.getTranDetail();
        });
    }

    $scope.delete = async (item, key) => {
        $scope.loadBtnAdd = true;
        $scope.tran.products.splice(key, 1);
        $http.post(base_url + 'warehouse/deleteByWarehouseTmp', JSON.stringify(item)).then(r => {
            $scope.loadBtnAdd = false;
            $scope.getTranDetail();
        });
    }

    $scope.confirmTran = async (status) => {
        $scope.tran.status_action = status;
        $scope.loading = true;
        let cf = await postApi('warehouse/confirm_warehouse_tmp', $scope.tran);
        if ((cf)) {
            showMessSuccess('Cập nhật thành công');
            $scope.getTranDetail();
        }
        $scope.loading = false;
    }
    async function postApi(url, data) {
        let result = await jQuery.ajax({
            url: base_url + url,
            type: 'POST',
            data: JSON.stringify(data),
            dataType: 'json',
            beforeSend: (request) => {
                request.setRequestHeader("Content-Type", "application/json");
            },
        });
        return result.data;
    }
    $scope.formatDate = (date, type) => {
        return moment(date).format(type);
    }

    $scope.getTypeClass = (type) => {
        if (type == 'product_retail') return 'label label-primary';
        if (type == 'product_pro') return 'label label-success';
    }

    $scope.getStatusClass = (status, type) => {
        if (type == 'STATUS') {
            if (status == 1) return 'label label-primary';
            if (status == 2) return 'label label-warning';
            if (status == 3) return 'label label-info';
            if (status == 5) return 'label label-success';
            if (status == 6) return 'label label-danger';
            return 'label label-default';
        }

        if (type == 'BTN') {
            if (status == 1) return 'btn btn-primary btn-sm';
            if (status == 2) return 'btn btn-warning btn-sm';
            if (status == 3) return 'btn btn-info btn-sm';
            if (status == 5) return 'btn btn-success btn-sm';
            if (status == 6) return 'btn btn-danger btn-sm';
            return 'btn btn-default';
        }
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


    $scope.handleBarcodeScanner = () => {
        if (!$scope.barcode_mb_scanner) {
            (async () => {
                $scope.scanner = await Dynamsoft.DBR.BarcodeScanner.createInstance();
                await $scope.scanner.setUIElement(document.getElementById('div-video-container'));
                $scope.scanner.onFrameRead = results => {
                    console.log(results);
                };
                $scope.scanner.onUnduplicatedRead = async (txt, result) => {
                    var param = {
                        key: txt,
                        active: 'yes',
                        type: "",
                        barcode_search: true,
                        limit: 1
                    };
                    param = jQuery.param(param);
                    var products = await getApi('products/get_list_products?' + param);
                    products = products.data.item;
                    if (products) {
                        $scope.updateOrAddTranDetail(products)
                        showMessSuccess('Đã thêm thành công');
                        return true;
                    }
                    showMessErr('Không tìm thấy sản phẩm');
                };
                await $scope.scanner.show();
            })();
        } else {
            $scope.scanner.hide();
        }
        $scope.barcode_mb_scanner = !$scope.barcode_mb_scanner;
    }


    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment(),
            endDate: moment(),
            // maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            ranges: {
                'Hôm nay': [moment(), moment()],
                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1,
                    'days')],
                '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                'Tháng trước': [moment().subtract(1, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
                ]
            },
            locale: {
                format: 'DD/MM/YYYY',
            }
        });
    }
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
}, true)