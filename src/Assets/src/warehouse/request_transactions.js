app.controller('whCtl', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.dzOptions = {
        paramName: 'file',
        maxFilesize: '10',
        url: base_url + '/uploads/ajax_upload_to_filehost?func=warehouse_request_transactions&folder=warehouse',
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
                $scope.transaction.images.push({
                    url_image: res.data[0],
                    name: 'Chứng từ ' + ($scope.transaction.images.length + 1)
                })
                $('.dz-image').remove();
            }
        }
    };

    $scope.init = () => {
        $('.box-opc').css('opacity', 1);
        $scope.load_data = true;
        $scope.load_sumbit_form = false;
        $scope.load_list_product = false;
        $scope.is_astm = is_astm;
        $scope.isRegionAdmin = isRegionAdmin;
        $scope.currStoreId = currStoreId;
        $scope.isAdmin = isAdmin;
        $scope.isManager = isManager;
        $scope.isLeader = isLeader;
        $scope.currentUserId = currentUserId;
        $scope.isReceptionist = isReceptionist;
        $scope.newdate = new Date();
        $scope.ls_status = [];
        $scope.rows = {};
        $scope.products = [];
        $scope.product = {};
        $scope.store_type = store_type;
        $scope.store_types = $scope.store_type == 1 ? [0, 1, 3] : [0, 1, 2, 3];
        $scope.filter = {
            date: dateft,
            status: 0,
            dest_id: 0,
            source_id: 0,
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
            request: true,
            wh_id: ''
        };
        if (idRequest > 0) {
            $scope.filter.id = idRequest;
        }
        $scope.getWHTransactions();
        $scope.transaction = {
            status: 1
        };
        $scope.warehouses = warehouses;
        $scope.currWarehouse = cr_warehouses;
        $scope.products_inventory = [];
        initSearchProduct();

        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $scope.openModal(preview_id);
        } else console.log('no value was found!');
    }

    function checkCurrentWarehouse(warehouse_id) {
        if ($scope.currWarehouse) {
            let wh = $scope.currWarehouse.find(r => {
                return r.id == warehouse_id && r.store_id == currStoreId;
            });
            return wh ? true : false;
        }
    }

    function loadRole(tran) {
        tran.isCancel = false;
        tran.isUpdate = false;
        tran.isReceive = false;
        tran.isConfirm = false;
        tran.isInventory = false;

        let i_isCancel = tran.status == 1 && tran.transaction_type == 1 && checkCurrentWarehouse(tran.dest_id);
        let i_isUserCancel = tran.user_id == currentUserId || $scope.isManager || $scope.is_astm;

        let i_isReceive = (tran.status == 3 || tran.status == 4) && tran.transaction_type == 1;

        let i_isUpdate = tran.status == 1 && tran.transaction_type == 1 && checkCurrentWarehouse(tran.dest_id);
        let i_isUserUpdate = tran.user_id == currentUserId || $scope.isManager;;

        let e_isCancel = tran.status == 1 && tran.transaction_type == 2 && checkCurrentWarehouse(tran.source_id);
        let e_isUserCancel = tran.user_id == currentUserId || $scope.isManager || $scope.is_astm;

        let e_isConfirm = tran.status == 1 && tran.transaction_type == 2 && checkCurrentWarehouse(tran.source_id);
        let e_isUserConfirm = (tran.user_id != currentUserId && ($scope.isAdmin || $scope.isRegionAdmin || $scope.isManager || $scope.is_astm));

        let e_isUpdate = tran.status == 1 && tran.transaction_type == 2 && checkCurrentWarehouse(tran.source_id);
        let e_isUserUpdate = tran.user_id == currentUserId || $scope.isManager;

        let m_isCancel = (tran.status == 1 || tran.status == 3) && tran.transaction_type == 3 && checkCurrentWarehouse(tran.source_id);
        let m_isUserCancel = (tran.user_id == currentUserId && tran.status == 1) || ($scope.isManager || $scope.is_astm);

        let m_isConfirm = tran.status == 1 && tran.transaction_type == 3 && checkCurrentWarehouse(tran.source_id);
        let m_isUserConfirm = ($scope.isManager || $scope.is_astm);

        let m_isReceive = tran.status == 3 && tran.transaction_type == 3;

        let m_isUpdate = (tran.status == 1 || tran.status == 4) && tran.transaction_type == 3 && checkCurrentWarehouse(tran.source_id);
        let m_isUserUpdate = (tran.user_id == currentUserId || $scope.isManager) || (tran.status == 4 && ($scope.isManager || $scope.is_astm));

        let isInventory = (tran.transaction_type == 2 || tran.transaction_type == 3) && (tran.status == 1 || tran.status == 2);

        tran.isInventory = isInventory;
        tran.isCancel = (i_isCancel && i_isUserCancel) || (e_isCancel && e_isUserCancel) || (m_isCancel && m_isUserCancel);

        tran.isReceive = i_isReceive || m_isReceive;
        tran.isConfirm = (e_isConfirm && e_isUserConfirm) || (m_isConfirm && m_isUserConfirm);

        tran.isUpdate = (i_isUpdate && i_isUserUpdate) || (e_isUpdate && e_isUserUpdate) || (m_isUpdate && m_isUserUpdate);

    }


    $scope.openModal = (id, type) => {
        $('#upload-file').text(' Upload file');
        $scope.isModal = 1;
        if (id && id > 0) {
            $scope.actionType = type;
            $scope.getTransById(id);
        } else {
            $scope.transaction = {
                status: 1,
                products: [],
                images: [],
                transaction_type: type,
                store_id: $scope.currStoreId,
                export_type: 'export_use'
            };
            $scope.product = {};
            loadRole($scope.transaction);
            select2();
            $('#modaladdoredit').modal('show');
        }
    }

    $scope.openModalCancel = (item) => {
        $scope.transaction = item;
        $('#modalcancel').modal('show');
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

        let hasErrr = $scope.transaction.products.find(r => {
            return !isNumber(r.quantity_request);
        });
        if (hasErrr) {
            toastr['error']('Số lượng không hợp lệ!');
            return;
        }
        $scope.loading = true;

        $http.post(base_url + '/warehouse/ajax_import_transaction', $scope.transaction).then(r => {
            if (checkResponse(r, !$scope.transaction.id ? 'Tạo phiếu thành công' : 'Cập nhật phiếu thành công')) {
                $('#modaladdoredit').modal('hide');
                $('#modalIVDT').modal('hide');
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
        let hasErr = $scope.transaction.products.find(r => {
            return !isNumber(r.quantity_request);
        });
        if (hasErr) {
            toastr['error']('Số lượng không hợp lệ!');
            return;
        }

        let hasErrInventory = $scope.transaction.products.find(r => {
            return !(isNumber(r.quantity_request) && r.quantity_request <= r.inventory);
        });
        if (hasErrInventory) {
            toastr['error']('Số lượng xuất phải nhỏ hơn số lượng trong kho!');
            return;
        }

        $scope.loading = true;

        $http.post(base_url + '/warehouse/ajax_export_transaction', $scope.transaction).then(r => {
            if (checkResponse(r, !$scope.transaction.id ? 'Tạo phiếu thành công' : 'Cập nhật phiếu thành công')) {
                $('#modaladdoredit').modal('hide');
                $scope.getWHTransactions();
                $scope.loading = false;
            }
        });

    }

    function moveTransaction() {
        if ($scope.transaction.products.length == 0) {
            toastr['error']('Chưa chọn sản phẩm!');
            return;
        }

        let hasErrInventory = $scope.transaction.products.find(r => {
            return !(isNumber(r.quantity_request) && r.quantity_request <= r.inventory);
        });
        if (hasErrInventory) {
            toastr['error']('Số lượng yêu cầu phải nhỏ hơn số lượng trong kho!');
            return;
        }
        $scope.loading = true;

        $http.post(base_url + '/warehouse/ajax_move_transaction', $scope.transaction).then(r => {
            if (checkResponse(r, !$scope.transaction.id ? 'Tạo phiếu thành công' : 'Cập nhật phiếu thành công')) {
                $('#modaladdoredit').modal('hide');
                $scope.getWHTransactions();
                $scope.loading = false;
            }
        });
    }

    $scope.confirmExportMoveTransaction = () => {

        let hasErrInventory = $scope.transaction.products.find(r => {
            return !(isNumber(r.quantity_accept) && r.quantity_accept <= r.inventory);
        });
        if (hasErrInventory) {
            toastr['error']('Số lượng xuất phải nhỏ hơn số lượng trong kho!');
            return;
        }

        swal({
            title: "Bạn có chắc?",
            text: "Duyệt phiếu này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $scope.loading = true;
            let body = {
                id: $scope.transaction.id,
                note: $scope.transaction.confirm_note,
                images: $scope.transaction.images,
                transaction_type: $scope.transaction.transaction_type,
                products: $scope.transaction.products
            }
            $http.post(base_url + '/warehouse/ajax_confirm_export_or_move_transaction', body).then(r => {
                if (checkResponse(r, r.data.message)) {
                    swal("Thông báo!", 'Thành công!', "success");
                    $('#modaladdoredit').modal('hide');
                    $scope.loading = false;
                    $scope.getWHTransactions();
                } else {
                    swal("Lỗi!", "Có lổi xẩy ra. Vui lòng thử lại sau", "error");
                }
            });
        })
    }


    $scope.cancelTransaction = () => {

        let body = {
            note: $scope.transaction.cancel_note,
            id: $scope.transaction.id
        }
        if (!$scope.transaction.cancel_note || $scope.transaction.cancel_note == '') {
            toastr['error']('Bạn chưa nhập lý do!');
            return;
        }
        $scope.loading = true;
        $http.post(base_url + '/warehouse/ajax_cancel_transaction', body).then(r => {
            if (checkResponse(r, r.data.message)) {
                $('#modalcancel').modal('hide');
                $scope.getWHTransactions();
                $scope.loading = false;
            }
        });
    }

    $scope.receiveTransaction = () => {

        let hasErrInventory = $scope.transaction.products.find(r => {
            let isErr = r.quantity_received == '' || Number(r.quantity_accept) < Number(r.quantity_received);
            return isErr;
        });
        if (hasErrInventory) {
            toastr['error']('Số lượng nhận không hợp lệ!');
            return;
        }

        if ($scope.transaction.images.length == 0) {
            toastr['error']('Bạn chưa up chứng từ!');
            return;
        }
        let isDifference = $scope.transaction.products.find(prd => {
            return prd.quantity_shipped != prd.quantity_received;
        });

        $scope.transaction.status_change = isDifference ? 4 : 5;

        swal({
            title: "Bạn có chắc?",
            text: "Nhận hàng và hoàn tất phiếu này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {

            $scope.loading = true;
            $http.post(base_url + '/warehouse/ajax_receive_transaction', $scope.transaction).then(r => {
                if (checkResponse(r, 'Nhận hàng thành công')) {
                    swal("Thông báo!", 'Thành công!', "success");
                    $('#modaladdoredit').modal('hide');
                    $scope.getWHTransactions();
                    $scope.loading = false;
                } else {
                    swal("Lỗi!", "Có lổi xẩy ra. Vui lòng thử lại sau", "error");
                }
            })
        });
    }

    $scope.isNotValidInputQuantity = (tran, item) => {
        if (!tran) return true;
        if (!item) return true;
        if (!isNumber(item.quantity_request)) return true;
        if (tran.transaction_type != 1 && item.quantity_request > item.inventory) return true;
    }

    $scope.isNotValidAcceptQuantity = (tran, item) => {
        if (!tran) return true;
        if (!item) return true;
        if (!isNumber(item.quantity_accept)) return true;
        if (tran.transaction_type != 1 && item.quantity_accept > item.inventory) return true;
    }

    $scope.isNotValidRecievedQuantity = (tran, item) => {
        if (item.quantity_received != item.quantity_shipped) return true;
        return false;
    }

    function isNumber(val) {
        if (val && Number(val) > 0) return true;
        return false;
    }


    $scope.getTypeName = (tran) => {
        let name = '';
        if (tran.id && tran.id > 0) {
            name = 'Thông tin phiếu Nhập Kho #' + tran.id;
            if (tran.transaction_type == 2) name = 'Thông tin phiếu Xuất Kho #' + tran.id;
            if (tran.transaction_type == 3) name = 'Thông tin phiếu Chuyển Kho #' + tran.id;
        } else {
            name = 'Tạo phiếu yêu cầu Nhập Kho';
            if (tran.transaction_type == 2) name = 'Tạo phiếu yêu cầu Xuất Kho';
            if (tran.transaction_type == 3) name = 'Tạo phiếu yêu cầu Chuyển Kho';
        }
        return name;
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
                    store_type: $scope.store_types,
                    limit: 10,
                    offset: 0
                };

                if ($scope.transaction.transaction_type) {
                    param.type = $scope.transaction.type;
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
                    let store_type_name = 'spa';
                    if (us.store_type == 2) store_type_name = 'Thẩm mỹ viện';
                    if (us.store_type == 3) store_type_name = 'spa + TMV';
                    store_type = ` <span title="Ngành hàng" class="label-cus label label-primary">${store_type_name}</span> `;
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

    $scope.handelProdReturn = (key) => {
        let prd = $scope.products.find(r => {
            return r.id == $scope.product.id[0]
        });
        $scope.handelProd(prd);
        $scope.product.id = [];
    }

    $scope.handelProd = (product) => {
        var checkProd = $scope.transaction.products.find(i => i.product_id == product.id);
        if (!checkProd) {
            var data = {
                product_id: product.id.toString(),
                product_code: product.barcode.toString(),
                product_name: product.name,
                quantity_request: product.quantity_request ? product.quantity_request : 1
            };
            setTimeout(() => {
                $scope.transaction.products.unshift(data);
                $scope.product.id = [];
                if ($scope.transaction.transaction_type != 1) {
                    $scope.get_inventory($scope.transaction.source_id, $scope.transaction.type, $scope.transaction.products.map(r => {
                        return r.product_id;
                    }));
                }
                $scope.$apply();
            }, 100);

        } else {
            toastr["error"]("Bạn đã chọn sản phẩm này!");
            $scope.product.id = [];
        }
    }

    $scope.isDisabledSearch = (tran) => {
        if (tran) {
            if (tran.transaction_type == 1 && tran.type && tran.dest_id) return true;
            if (tran.transaction_type == 2 && tran.type && tran.source_id) return true;
            if (tran.transaction_type == 3 && tran.type && tran.source_id && tran.dest_id) return true;
            return false;
        }
        return false;
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

    $scope.refreshFilter = () => {
        $scope.filter = {};
        $scope.filter.status = 0;
        $scope.filter.dest_id = 0;
        $scope.filter.source_id = 0;
        $scope.filter.date = dateft;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.request = true;
        $scope.getWHTransactions();
    }


    $scope.get_inventory = (source_id, type, product_ids) => {
        let filter = {
            type: type,
            warehouse_id: source_id,
            product_type: type,
            date: moment().format('DD/MM/YYYY'),
            ls_product: product_ids,
            store_type: 3
        };

        $scope.loadInventory = true;

        $http.get(base_url + '/warehouse/api_get_warehouse_inventory?filter=' + JSON.stringify(filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.products_inventory = r.data.data;
                $scope.transaction.products.forEach(p => {
                    let inven = $scope.products_inventory.find(r => {
                        return r.id == p.product_id
                    });
                    p.inventory = inven ? inven.total : 0;
                });
                $scope.loadInventory = false;

            } else {
                toastr['error']('Không thể lấy tồn kho. Vui lòng kiểm tra lại!');
            }
        }, function (data, status, headers, config) {
            toastr.error('Vui lòng thử lại sau', 'Lỗi hệ thống!');
        });
    }

    $scope.getTransById = ($id) => {
        $http.get(base_url + '/warehouse/api_get_whtransaction_by_id?id=' + $id).then(r => {
            $scope.transaction = r.data.data;
            loadClassName($scope.transaction);
            loadRole($scope.transaction);
            if ($scope.transaction.transaction_type != 1) $scope.get_inventory($scope.transaction.source_id, $scope.transaction.type, $scope.transaction.products.map(r => {
                return r.product_id;
            }));
            $('#modaladdoredit').modal('show')

        }, function (data, status, headers, config) {
            toastr.error('Vui lòng thử lại sau', 'Lỗi hệ thống!');
        })
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

    $scope.filterTrans = () => {
        $scope.filter.offset = 0;
        if ($scope.filter.id) {
            delete $scope.filter.id;
            window.history.pushState('', '', window.location.origin + window.location.pathname);
        }
        $scope.getWHTransactions();
    }

    $scope.filterRP = (status, type, dests = [], sources = []) => {
        $scope.filter.status = status + '';
        $scope.filter.transaction_type = type + '';
        if (dests.length > 0) $scope.filter.sources = sources.map(x => x.id);
        if (sources.length > 0) $scope.filter.dests = dests.map(x => x.id);
        $scope.filterTrans();
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }

    $scope.getWHTransactions = () => {
        $scope.load_data = true;
        if ($scope.filter.date) {
            var _date = $scope.filter.date.split(' - '),
                _start = _date[0].split('/'),
                _end = _date[1].split('/');

            $scope.filter.start_date = _start[2] + '-' + _start[1] + '-' + _start[0];
            $scope.filter.end_date = _end[2] + '-' + _end[1] + '-' + _end[0];
        }
        $http.get(base_url + '/warehouse/ajax_get_transactions?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.rows.forEach(tran => {
                    loadRole(tran);
                });

                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
                $scope.load_data = false;
                select2();
                if ($scope.filter.id) {
                    $scope.openModal($scope.filter.id, 1, 'VIEW');
                }
            }
        }, function (data, status, headers, config) {
            toastr.error('Vui lòng thử lại sau', 'Lỗi hệ thống!');
        })
        $scope.getReport();

    }
    $scope.getReport = () => {
        $http.get(base_url + '/warehouse/ajax_report_transaction?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.total = r.data.total;
            }
        }, function (data, status, headers, config) {
            toastr.error('Vui lòng thử lại sau', 'Lỗi hệ thống!');
        })
    }

    $scope.print_docs = () => {
        window.open(base_url + '/warehouse/print_docs/' + $scope.transaction.id);
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format ? format : 'DD/MM/YYYY HH:mm');
    }

    $scope.showImg = (img) => {
        $scope.currImg = img;
    }

    $scope.closeModal = (id) => {
        $('#' + id).modal('hide');
    }

    $scope.returnProduct = () => {
        $('#modalIV').modal('hide');
        $('#modalIVDT').modal('show');
        $scope.transaction = {
            status: 5,
            type: 'retail',
            store_id: $scope.currStoreId,
            transaction_type: 1,
            products: [],
            images: [],
            note: 'Trả hàng từ phiếu thu ' + $scope.invoice.id + '.'
        }
    }
    $scope.openModalReturn = () => {
        $('#modalIV').modal('show');
        $scope.invoice = null;
    }

    $scope.getInvoiceById = () => {
        $http.post(base_url + '/warehouse/api_get_invoice?id=' + $scope.invoiceId + '&&store_id=' + $scope.currStoreId).then(r => {
            if (r.data.status == 1) {
                $scope.invoice = r.data.data;
                $scope.invoiceId = '';
                $scope.products = $scope.invoice.products;
                $scope.pkgProducts = $scope.invoice.pkg_products;
                $scope.pkgProducts.forEach(r => {
                    r.type = 1;
                    $scope.products.push(r);
                })

            } else {
                toastr['error'](r.data.message ? r.data.message : 'Có lổi xẩy ra. Vui lòng thử lại!');
            }
        }, function (data, status, headers, config) {
            toastr.error('Vui lòng thử lại sau', 'Lỗi hệ thống!');
        })
    }


    function checkReceivedReturnProd() {
        if ($scope.transaction) {
            let prod = $scope.transaction.products.filter(e => {
                return (Number(e.quantity_received) > Number(e.quantity_request) && e.quantity_received > 0) || !e.quantity_received || e.quantity_received == '';
            });
            if (prod && prod.length) toastr['error']('Số lượng nhập không hợp lệ')
            return prod && prod.length > 0 ? false : true;
        }
        return false;
    }

    $scope.createdReturnPrd = () => {
        if (!$scope.transaction.dest_id) {
            toastr['error']('Bạn chưa nhập kho nhận');
            return;
        }
        if ($scope.transaction.products.length == 0) {
            toastr['error']('Bạn chưa chọn sản phẩm');
            return;
        }
        $scope.transaction.isReturn = true;
        if (checkReceivedReturnProd()) {
            importTransaction();
        }
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
        var tmp = [];
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

    function checkResponse(res, message) {
        if (res && res.data.status == 1) {
            if (message && message != '') toastr['success'](message);
            return true;
        }
        toastr['error'](res && res.data.message ? res.data.message : 'Có lổi xẩy ra. Vui lòng thử lại sau');
        return false;
    }

    $scope.attachFile = () => {
        if (!$scope.transaction.type) {
            showMessErr('Vui lòng chọn loại hàng!');
            return;
        }
        $('#input-file').click();
    }

    $scope.uploadFile = () => {
        var input = document.getElementById('input-file'),
            file = input.files[0],
            formData = new FormData();
        
        $('#upload-file').text(' Đang tải...');
        formData.append('file', file);
        formData.append('product_type', $scope.transaction.type);
        $scope.load_list_product = true;
        $http({
            url: base_url + 'warehouse/ajax_upload_file_product',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.load_list_product = false;
            input.value = '';
            $('#upload-file').text(' '+file.name);
            if (r.data.status == 1) {
                $scope.transaction.products = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        })
    }
})