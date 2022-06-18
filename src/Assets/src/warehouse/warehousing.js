app.controller('whsingCtrl', function ($scope, $http) {


    var pi = $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.filter = {
            'limit': $scope.pagingInfo.itemsPerPage,
            'offset': $scope.pagingInfo.offset,
            'store_id': 0
        };
        $scope.isMaster = isMaster;
        $scope.isAdmin = isAdmin;
        $scope.currentUserId = currentUserId;
        $scope.warehouses = [];
        $scope.isAction = 'EDIT';
        $scope.file = {};
        $scope.supplier = {};
        $scope.transaction = {};
        $scope.filterProd = {};
        $scope.products = [];
        $scope.images = [];
        initSearchProduct();
        $scope.getTransporters();
        $scope.filterTrans();
        $scope.getWarehouse();
        $scope.warehousesBranch = [];
        $scope.getWarehouseBranch();
        $scope.ls_status = [];
        $scope.getStatus();
        $scope.isInput = true;
        $scope.transporters = [];
        $scope.nations = [{
            key: 1,
            value: 'Việt Nam'
        }, {
            key: 2,
            value: 'Campuchia'
        }]

        var preview_id = getParamsValue('type');
        if (preview_id && preview_id == 'create') {
            let dt = getParamsValue('data');
            getWhOrder(dt);
        } else console.log('no value was found!');

    }
    function getWhOrder(id) {
        $http.get('warehouse/get_order_detail/' + id).then(r => {
            $scope.loadingPage = false;
            if (r.data && r.data.status == 1) {
                let order = r.data.data;
                let data = {
                    type: order.type,
                    supplier_id: order.provider_id,
                    note: order.note,
                    status: 5,
                    store_id: 0,
                    images: [],
                    transaction_type: 1
                };
                let prds = [];
                if (order.products.length > 0) {
                    angular.forEach(order.products, function (value, key) {
                        prds.push(
                            {
                                entry_price: value.price_input,
                                product_code: value.barcode,
                                product_id: value.product_id,
                                product_name: value.description,
                                quantity_request: value.order_quantity,
                                total: value.totaltPrice
                            }
                        )
                    });
                }
                data.products = prds;
                $scope.openModal(0, 'EDIT', 'openModal', data);
            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loading = false;
        })
    }

    function initSearchProduct() {
        var typingTimer;
        var doneTypingInterval = 200;
        var input = jQuery('.product_search_input');

        //on keyup, start the countdown
        input.on('keyup', function (e) {

            clearTimeout(typingTimer);
            var currentInput = jQuery(this);
            var keyword = currentInput.val();

            // Clear all input if have # symbol
            if (keyword.includes('#') && e.key === 'Backspace') {
                currentInput.val('');
                $('#data_product_id').val(0);
                return;
            }

            if (!keyword || keyword.includes('#')) {
                // jQuery('.product-search').removeClass('showed');
                return false;
            }
            typingTimer = setTimeout(async function () {
                var param = {
                    key: keyword,
                    nation_id: nationId,
                    company_id: companyId,
                    limit: 10,
                    offset: 0
                };

                if ($scope.transaction.transaction_type) {
                    param.type = $scope.transaction.type;
                }
                if ($scope.transaction.nation_id) {
                    param.nation_id = $scope.transaction.nation_id;
                }

                param = jQuery.param(param);


                currentInput.parent().find('.loader-in-row').fadeIn('fast');
                currentInput.parent().find('.product-search').addClass('showed');

                var products = await getApi('products/get_list_products?' + param);

                var ul = '';

                if (products.length == 0) {
                    ul += '<li>Không tìm thấy kết quả phù hợp</li>';
                }

                jQuery.each(products, (key, us) => {
                    // <img src="${us.image_url}">
                    let store_type = '';
                    if (us.store_type == 1) store_type = ' <span title="Ngành hàng" class="label-cus label label-primary">Spa</span> ';
                    if (us.store_type == 2) store_type = ' <span title="Ngành hàng"  class="label-cus label label-success">Thẩm mỹ</span> ';

                    let li = `
                            <li class="product-item" 
                                data-id="${us.id}" data-name="${us.description}" 
                                data-type="${us.type}" data-type="${us.price}" 
                                data-barcode ="${us.barcode}"
                                style="float: left;width: 100%;">
                                <div style="width: 90%;float: left;">
                                    <strong>${us.description}</strong> <br>
                                    <span title="Mã sản phẩm"  class="label-cus label label-default">#${us.id}</span> 
                                    ${store_type}
                                    <span title="Giá bán" >${Number(us.price).toLocaleString()} đ</span>
                                </div>
                            </li>
                        `;
                    ul += li;
                });

                currentInput.parent().find('.product-search').addClass('hided');
                currentInput.parent().find('.loader-in-row').fadeOut('fast');
                currentInput.parent().find('.product-search-list').html(ul);

            }, doneTypingInterval);
        });

        //on keydown, clear the countdown
        input.on('keydown', function () {
            clearTimeout(typingTimer);
        });

        // on blur input, hide dropdown
        jQuery(document).on('click', function () {
            jQuery('.product-search').removeClass('showed');
        });

        // on click on item
        jQuery(document).off('click', '.product-item').on('click', '.product-item', function () {

            var currentItem = jQuery(this);
            var productName = '#' + currentItem.data('id') + ' ' + currentItem.data('name');
            var div = currentItem.parent().parent().parent();
            product_select = {
                id: currentItem.data('id'),
                name: currentItem.data('name'),
                price: currentItem.data('price'),
                type: currentItem.data('price'),
                barcode: currentItem.data('barcode')
            }

            $scope.handelProd(product_select);
            div.find('.product_search_input').val(productName);
            div.find('.product_search_id_input').val(currentItem.data('id'));
            div.find('.product_search_input').val('')
            // Add new row

            var row = div.parent().parent().parent();

            // Only add new row if
            if (!row.hasClass('last-row')) {
                return;
            }

            row.removeClass('last-row');

            row.find('.product-search ul').empty();
            row.clone(true).find(".form-control").val("").css({
                'background-color': 'transparent'
            }).end().find('.form-label').css({
                'background-color': 'transparent'
            }).end().addClass('appended_row last-row').insertAfter(row);
            jQuery('.im-date-field, .im-number-field').inputmask(undefined, {
                disablePredictiveText: false
            });
        });
    };

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

    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }

    $scope.loadDisableProduct = (tran) => {
        if (tran.transaction_type == 1 && tran.type && tran.supplier_id && tran.dest_id && tran.nation_id) {
            return false;
        }
        if (tran.transaction_type == 2 && tran.source_id && tran.type) {
            return false;
        }
        if (tran.transaction_type == 3 && tran.source_id && tran.type && tran.dest_id) {
            return false;
        }
        return true;
    }

    $scope.dzOptions = {
        paramName: 'file',
        maxFilesize: '10',
        url: base_url + '/uploads/ajax_upload_to_filehost?func=warehouse_warehousing&folder=warehouse',
        dictDefaultMessage: 'Kéo thả hồ sơ tại đây',
        acceptedFiles: 'image/*',
        resizeWidth: 1200
    };

    $scope.dzCallbacks = {
        'addedfile': function (file) {
            $scope.newFile = file;
        },
        'success': function (file, resp) {
            let res = JSON.parse(resp);
            if (res.success) {
                if (!$scope.transaction.images) $scope.transaction.images = [];
                $scope.transaction.images.push({
                    url_image: res.data[0],
                    name: 'Chứng từ ' + ($scope.transaction.images.length + 1)
                })
                $('.dz-image').remove();
            }
        }
    };

    $scope.getTypeName = (type) => {
        if (!type) return '';
        if (type == 1) return 'nhập kho';
        if (type == 2) return 'xuất kho';
        if (type == 3) return 'chuyển kho';
    }

    $scope.getTransactionStatus = (status, type) => {
        if (!status) return '';
        if (status == 1) return type == 'name' ? 'Vừa tạo' : 'label-primary';
        if (status == 2) return type == 'name' ? 'Đã xác nhận' : 'label-warning';
        if (status == 3) return type == 'name' ? 'Đã vận chuyển' : 'label-info';
        if (status == 4) return type == 'name' ? 'Treo' : 'label-danger';
        if (status == 5) return type == 'name' ? 'Hoàn tất' : 'label-success';
        if (status == 6) return type == 'name' ? 'Vừa tạo' : 'label-danger';
    }
    $scope.getStatus = () => {
        $http.get(base_url + 'warehouse/api_get_ls_status').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.ls_status = r.data.data;
                $scope.ls_status.unshift({
                    id: 0,
                    name: 'Tất cã'
                });
                $scope.filter.status = 0;
            }
        });
    }

    $scope.getWarehouse = () => {
        let filter = {
            type: "MAIN_BRANCH"
        }
        $http.get(base_url + '/warehouse/api_get_ls_warehouse?filter=' + JSON.stringify(filter)).then(r => {
            let data = r.data;
            if (data && data.status == 1) {
                $scope.warehouses = data.data;
                $scope.warehousesFilter = [...$scope.warehousesFilter, ...data.data];
            }
        });
    }

    $scope.exportExcel = () => {
        window.open(base_url + '/warehouse/export_warehouse?filter=' + JSON.stringify($scope.filter));
    }

    $scope.getWarehouseBranch = () => {
        let filter = {
            type: "BRANCH"
        }
        $http.get(base_url + '/warehouse/api_get_ls_warehouse?filter=' + JSON.stringify(filter)).then(r => {
            let data = r.data;
            if (data && data.status == 1) {
                $scope.warehousesBranch = data.data;
            }
        });
    }

    $scope.getWarhouseName = (id) => {
        $wh = $scope.warehouses.find(val => {
            return val.id = id;
        })
        return $wh.name;
    }

    $scope.loadSuppliers = () => {
        let ft = {};
        $http.get(base_url + '/partner/ajax_get_suppliers?filter=' + JSON.stringify(ft)).then(r => {
            $scope.suplliers = r.data.data;
            $scope.suplliers.forEach(e => {
                e.value = e.name + ' (' + e.phone + ')';
            });
        });
    }

    $scope.showImg = (img) => {
        $scope.currImg = img;
    }

    $scope.deleteProd = (index) => {
        $scope.transaction.products.splice(index, 1);
        for (let i = 0; i <= $scope.transaction.products.length; i++) {
            $scope.caculaterTransDetail(i);
        }
    }

    $scope.openOutOrIn = ($id, type, existed_data = 0) => {
        $scope.getWarehouseBranch();
        $scope.getTransporters();
        $scope.file = {};
        if ($id) {
            $scope.getTransById($id);
        } else {
            if (existed_data == 0) {
                $scope.transaction = {
                    status: 5,
                    products: [],
                    images: [],
                    store_id: 0,
                    export_type: 'export_use'
                };
            } else $scope.transaction = existed_data;
            $('#modalOutOrIn').modal('show');
        }
    }

    $scope.sendToInOut = (id) => {
        $http.get(base_url + '/warehouse/api_get_whtransaction_by_id?id=' + id).then(r => {
            $('#modaladdoredit').modal('hide');
            let rs = r.data.data;
            let data = {
                type: rs.type,
                log_note: rs.note,
                status: 5,
                store_id: 0
            };
            let prds = [];
            if (rs.products.length > 0) {
                angular.forEach(rs.products, function (value, key) {
                    prds.push({
                        entry_price: value.entry_price,
                        product_code: value.product_code,
                        product_id: value.product_id,
                        product_name: value.product_name,
                        quantity_request: value.quantity_request,
                    })
                });
            }
            data.products = prds;
            $scope.openOutOrIn(0, 'openOutOrIn', data);
        })
    }

    $scope.openModal = (id, action, type, existed_data = 0) => {
        $scope.typeOpen = type;
        $scope.isAction = action;
        $scope.file = {};
        // $scope.getWarehouse();
        $scope.loadSuppliers();
        if (id && id > 0) {
            $scope.getTransById(id);
        } else {
            if (existed_data == 0) {
                $scope.transaction = {
                    status: 5,
                    products: [],
                    images: [],
                    transaction_type: 1,
                    store_id: 0
                };
            } else $scope.transaction = existed_data;

            $('#modaladdoredit').modal('show');
        }
    }

    $scope.getTransporters = () => {
        $http.get(base_url + '/partner/api_get_transporters?filter={}').then(r => {
            $scope.transporters = r.data.data;
        })
    }

    $scope.getTransById = ($id) => {
        $http.get(base_url + '/warehouse/api_get_whtransaction_by_id?id=' + $id).then(r => {
            $scope.transaction = r.data.data;
            $scope.transaction.type_name = $scope.getTypeName($scope.transaction.transaction_type);
            $scope.transaction.status_name = $scope.getTransactionStatus($scope.transaction.status, 'name');
            $scope.transaction.class_name = $scope.getTransactionStatus($scope.transaction.status, 'class');
            loadClassName($scope.transaction);
            for (let i = 0; i <= $scope.transaction.products.length; i++) {
                $scope.caculaterTransDetail(i);
            }
            $scope.filterProd.nation_id = $scope.transaction.nation_id;
            if ($scope.transaction.transaction_type == 1) {
                $('#modaladdoredit').modal('show');
            } else {
                $('#modalOutOrIn').modal('show');
            }
            select2();
        });
    }

    function loadClassName(tran) {
        if (tran.type == 'retail') {
            tran.type_class = 'label-primary';
            tran.type_name = 'Lể tân';
        }

        if (tran.type == 'medicine') {
            tran.type_class = 'label-warning';
            tran.type_name = 'Thuốc';
        }

        if (tran.type == 'profession') {
            tran.type_class = 'label-success';
            tran.type_name = 'Chuyển nghiêp';
        }

        if (tran.status == 1) {
            tran.status_class = 'label-primary';
            tran.status_name = 'Mới tạo';
        }

        if (tran.status == 2) {
            tran.status_class = 'label-warning';
            tran.status_name = 'Xác nhận';
        }
        if (tran.status == 3) {
            tran.status_class = 'label-info';
            tran.status_name = 'Chuyển đi';
        }

        if (tran.status == 4) {
            tran.status_class = 'label-danger';
            tran.status_name = 'Treo';
        }

        if (tran.status == 5) {
            tran.status_class = 'label-success';
            tran.status_name = 'Hoàn tất';
        }

        if (tran.status == 6) {
            tran.status_class = 'label-danger';
            tran.status_name = 'Đã hủy';
        }

    }

    function select2() {
        setTimeout(() => {
            $('select2').select2();
        }, 200);
    }

    $scope.handelProd = (item) => {
        var checkProd = $scope.transaction.products.find(i => i.product_id == item.id);
        if (!checkProd) {
            var data = {
                product_id: item.id,
                product_code: item.barcode,
                product_name: item.name,
                quantity_request: 1,
                entry_price: 0,
                total: 0
            };
            $scope.transaction.products.unshift(data);

            for (let i = 0; i <= $scope.transaction.products.length; i++) {
                $scope.caculaterTransDetail(i);
            }
            $scope.$digest();
        } else {
            toastr["error"]("Bạn đã chọn sản phẩm này!");
        }
    }

    $scope.filterTrans = () => {
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = 0
        $scope.getWHTransactions();
    }


    $scope.getWHTransactions = () => {

        if ($scope.filter.date) {
            var _date = $scope.filter.date.split(' - '),
                _start = _date[0].split('/'),
                _end = _date[1].split('/');

            $scope.filter.start_date = _start[2] + '-' + _start[1] + '-' + _start[0];
            $scope.filter.end_date = _end[2] + '-' + _end[1] + '-' + _end[0];
        }
        $scope.loadingData = true;
        $http.get(base_url + '/warehouse/api_get_ls_warehousing?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.loadingData = false;
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }
    $scope.checkExistDestBranch = () => {
        if ($scope.warehousesBranch.length > 0) {
            let checkExistDestBranch = $scope.warehousesBranch.find(e => {
                return e.id == $scope.transaction.dest_id
            });
            return checkExistDestBranch ? true : false;
        }
        return false;
    }

    $scope.handleTransaction = () => {
        if ($scope.transaction.transaction_type == 1) importTransaction();
        if ($scope.transaction.transaction_type == 2) exportTransaction();
        if ($scope.transaction.transaction_type == 3) moveTransaction();
    }

    function importTransaction() {
        if ($scope.transaction.products.length == 0) {
            toastr['error']('Chưa chọn sản phẩm!');
            return;
        }

        let hasErrr = $scope.transaction.products.find(r => { return (r.quantity_request == '' || r.quantity_request == 0) });
        if (hasErrr) {
            toastr['error']('Số lượng không hợp lệ!');
            return;
        }

        let hasErr = $scope.transaction.products.find(r => { return r.entry_price == ''; });
        if (hasErr) {
            toastr['error']('Giá nhập không hợp lệ!');
            return;
        }

        let body = angular.copy($scope.transaction);
        body.products.forEach(e => {
            e.entry_price = formatNumber(e.entry_price);
        });
        $scope.loading = true;

        $http.post(base_url + '/warehouse/ajax_import_transaction', body).then(r => {
            if (checkResponse(r, !$scope.transaction.id ? 'Tạo phiếu thành công' : 'Cập nhật phiếu thành công')) {
                $('#modaladdoredit').modal('hide');
                $scope.getWHTransactions();
                $scope.loading = false;
            }
        });
    }

    function exportTransaction() {
        if ($scope.transaction.products.length == 0) {
            toastr['error']('Chưa chọn sản phẩm!');
            return;
        }
        let hasErr = $scope.transaction.products.find(r => { return r.quantity_request == '' || r.quantity_request == 0 });
        if (hasErr) {
            toastr['error']('Số lượng không hợp lệ!');
            return;
        }

        if (!$scope.transaction.source_id) {
            toastr['error']('Bạn chưa chọn kho xuất!');
            return;
        }

        if (!$scope.transaction.images || ($scope.transaction.images && $scope.transaction.images.length == 0)) {
            toastr['error']('Vui lòng up chứng từ!');
            return;
        }


        $scope.loading = true;

        $http.post(base_url + '/warehouse/ajax_export_transaction', $scope.transaction).then(r => {
            if (checkResponse(r, !$scope.transaction.id ? 'Tạo phiếu thành công' : 'Cập nhật phiếu thành công')) {
                $('#modalOutOrIn').modal('hide');
                $scope.getWHTransactions();
                $scope.loading = false;
            }
        });

    }

    function moveTransaction() {

        if (!$scope.transaction.type) {
            toastr['error']('Bạn chưa chọn loại sản phẩm!');
            return;
        }

        if (!$scope.transaction.transporter_id) {
            toastr['error']('Bạn chưa nhà vận chuyển!');
            return;
        }

        if (!$scope.transaction.dest_id) {
            toastr['error']('Bạn chưa chọn kho nhận!');
            return;
        }

        if (!$scope.transaction.source_id) {
            toastr['error']('Bạn chưa chọn kho xuất!');
            return;
        }

        if ($scope.transaction.products.length == 0) {
            toastr['error']('Chưa chọn sản phẩm!');
            return;
        }

        let hasErrInventory = $scope.transaction.products.find(r => { return r.quantity_request == ''; });
        if (hasErrInventory) {
            toastr['error']('Số lượng không hợp lệ!');
            return;
        }

        if (!$scope.transaction.images) {
            $scope.transaction.images = [];
        }
        $scope.loading = true;

        $http.post(base_url + '/warehouse/ajax_move_transaction', $scope.transaction).then(r => {
            if (checkResponse(r, !$scope.transaction.id ? 'Tạo phiếu thành công' : 'Cập nhật phiếu thành công')) {
                $('#modalOutOrIn').modal('hide');
                $scope.getWHTransactions();
                $scope.loading = false;
            }
        });
    }

    $scope.getInformationTransporter = (id) => {
        if ($scope.transporters.length > 0) {
            let tran = $scope.transporters.find(e => {
                return e.id == id
            });
            return id && tran ? `${tran.name} (${tran.phone})` : '';
        } else return '';

    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format ? format : 'DD/MM/YYYY HH:mm');
    }

    $scope.caculaterTransDetail = (index) => {
        try {
            let count = Number($scope.transaction.products[index].quantity_request);
            let price = formatNumber($scope.transaction.products[index].entry_price);
            $scope.transaction.products[index].entry_price = formatCurrency(price);
            $scope.transaction.products[index].total = formatCurrency(price * count);

            $scope.totaPriceProd = 0;
            $scope.transaction.products.forEach(e => {
                let count_price = formatNumber(e.quantity_request) * formatNumber(e.entry_price);
                $scope.totaPriceProd = $scope.totaPriceProd + count_price;
            })
            $scope.totaPriceProd = formatCurrency($scope.totaPriceProd);
        } catch (error) { }
    }

    $scope.closeModal = (id) => {
        $('#' + id).modal('hide');
    }

    $scope.cancelTransaction = () => {

        swal({
            title: "Bạn có chắc?",
            text: "Hủy phiếu này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            let body = {
                note: $scope.transaction.cancel_note,
                id: $scope.transaction.id
            }
            $scope.loading = true;
            $http.post(base_url + '/warehouse/ajax_cancel_transaction', body).then(r => {
                if (checkResponse(r, r.data.message)) {
                    swal("Thông báo!", 'Thành công!', "success");
                    $('#modaladdoredit').modal('hide');
                    $scope.getWHTransactions();
                    $scope.loading = false;
                } else {
                    swal("Lỗi!", "Có lổi xẩy ra. Vui lòng thử lại sau", "error");
                }
            });
        })
    }


    //paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getWHTransactions();
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
        return _.range(min, max);
    }
    //end paging

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

    function formatCurrency(value) {

        var formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            // the default value for minimumFractionDigits depends on the currency
            // and is usually already 2
        });
        // if ($scope.transaction.nation_id == 2) {
        //     var result = formatter.format(formatNumber(value))
        //     return result.replace('$', '');
        // }
        // if ($scope.transaction.nation_id == 1) {
        var index = (value + '').indexOf('.');
        if (index >= 0) {
            var result = value.slice(0, index);
        } else result = value;
        return formatNumber(result).toLocaleString();
        // }
    }

    function formatNumber(value) {
        let tmp = (value + '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '');
        return Number(tmp);
    }

    function checkResponse(res, message) {
        if (res && res.data.status == 1) {
            if (message && message != '') toastr['success'](message);
            return true;
        }
        toastr['error'](res && res.data.message ? res.data.message : 'Có lổi xẩy ra. Vui lòng thử lại sau');
        return false;
    }

})