app.controller('confirmWhCtl', function ($scope, $http, WarehouseSvc) {

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
        url: base_url + '/uploads/ajax_upload_to_filehost?func=warehouse_confirm_transactions&folder=warehouse',
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

    function setDefautPage() {
        $scope.pagingInfo = {
            itemsPerPage: 50,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };
    }

    $scope.init = () => {
        $scope.products_inventory = [];
        $scope.rows = {};
        $scope.product = {};
        $scope.filter = {
            status: '',
            request: true,
            transaction_type: '1',
            limit: $scope.pagingInfo.itemsPerPage,
            offset: $scope.pagingInfo.offset,
            is_confirm: true
        };
        $scope.getWHTransactions();
        $scope.transDetails = [];
        $scope.warehouses = [];

        $scope.ls_status = [];
        $scope.getStatus();
        $scope.getWarehouse();
        $scope.transporter = {};
        $scope.transporters = [];
        $scope.getTransporters();
        initSearchProduct();
        $scope.warehouse = {};
        $scope.warehouse.type = 'BRANCH';
        $scope.warehouse_type = [{
            key: '',
            value: ''
        },
        {
            key: 'BRANCH',
            value: 'Chi nhánh'
        },
        {
            key: 'MAIN_BRANCH',
            value: 'Kho tổng'
        },
        ];
        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $scope.getTransById(preview_id);
        }
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
                let prd_ids = $scope.transaction.products.map(r => {
                    return r.product_id;
                });
                if ($scope.transaction.dest_id > 0) {
                    $scope.get_inventory($scope.transaction.dest_id, $scope.transaction.type, prd_ids, true);
                }
                if ($scope.transaction.source_id > 0) {
                    $scope.get_inventory($scope.transaction.source_id, $scope.transaction.type, prd_ids, false);
                }
                $scope.$apply();
            }, 100);
        } else {
            toastr["error"]("Sản phẩm đã tồn tại!");
            $scope.product.id = [];
        }
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

    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }

    $scope.getTransporters = () => {
        $http.get(base_url + '/partner/api_get_transporters?filter={}').then(r => {
            $scope.transporters = r.data.data;
        })
    }

    $scope.getStatus = () => {
        $http.get(base_url + 'warehouse/api_get_ls_status').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.ls_status = r.data.data;
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

        let isDifference = $scope.transaction.products.find(prd => {
            return prd.quantity_accept != prd.quantity_received;
        });

        $scope.transaction.status_change = isDifference ? 4 : 5;

        swal({
            title: "Bạn có chắc?",
            text: "Cập nhật và hoàn tất phiếu này!",
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

    $scope.getWarehouse = () => {
        $http.get(base_url + '/warehouse/api_get_ls_warehouse').then(r => {
            let data = r.data;
            if (data && data.status == 1) {
                $scope.warehouses = data.data;
            }
        });
    }

    $scope.showImg = (img) => {
        $scope.currImg = img;
    }

    //get wh transaction by id
    $scope.getTransById = ($id) => {
        $scope.loading = true;
        $('#modaladdoredit').modal('show');
        $http.get(base_url + '/warehouse/api_get_whtransaction_by_id?id=' + $id).then(r => {
            if (r.data) {
                $scope.loading = false;
                $scope.isInventory = false;
                $scope.transaction = r.data.data;
                loadForm($scope.transaction);
                loadClassName($scope.transaction);
                loadRole($scope.transaction);
                let prd_ids = $scope.transaction.products.map(r => {
                    return r.product_id;
                });
                if ($scope.transaction.dest_id > 0 && ($scope.transaction.status != 5 && $scope.transaction.status != 6)) {
                    $scope.get_inventory($scope.transaction.dest_id, $scope.transaction.type, prd_ids, true);
                }
                if ($scope.transaction.source_id > 0 && ($scope.transaction.status != 5 && $scope.transaction.status != 6)) {
                    $scope.get_inventory($scope.transaction.source_id, $scope.transaction.type, prd_ids, false);
                }
                select2();
            }
        });
    }

    function loadRole(tran) {
        tran.isCancel = false;
        tran.isUpdate = false;
        tran.isConfirm = false;
        tran.isReceive = false;
        tran.isSend = false;
        tran.isExportConfirm = false;

        tran.isCancel = tran.status == 1 || tran.status == 2 || tran.status == 3 || tran.status == 4;
        tran.isUpdate = tran.transaction_type == 1 && (tran.status == 1 || tran.status == 2 || tran.status == 4)
        tran.isConfirm = tran.transaction_type == 1 && tran.status == 1;
        tran.isSend = tran.transaction_type == 1 && tran.status == 2;
        tran.isExportConfirm = (tran.transaction_type == 2 || tran.transaction_type == 3) && tran.status == 1;
        tran.isReceive = (tran.status == 3 || tran.status == 4) && tran.transaction_type == 3 && checkSendWarehouseToMain(tran.dest_id);
    }

    function checkSendWarehouseToMain(dest_id) {
        $wh = $scope.warehouses.find(r => {
            return r.id == dest_id
        });
        if ($wh && $wh.type == 'MAIN_BRANCH') return true;
        return false;
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
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

    function loadForm(tran) {
        tran.formName = '';
        if (tran.transaction_type == 1) tran.formName = 'Duyệt yêu cầu nhập kho';
        if (tran.transaction_type == 2) tran.formName = 'Duyệt yêu cầu chuyển kho';
        if (tran.transaction_type == 3) tran.formName = 'Duyệt yêu cầu xuất kho';
    }

    $scope.confirmExportMoveTransaction = () => {
        let hasErrInventory = $scope.transaction.products.find(r => {
            return Number(r.quantity_request) > Number(r.source_inventory);
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

    $scope.confirmMoveBranchTransaction = () => {

        if (!($scope.transaction.transporter_id > 0)) {
            toastr['error']('Bạn chưa chọn nhà vận chuyển!');
            return;
        }

        let hasErrInventory = $scope.transaction.products.find(r => {
            return r.quantity_shipped == '';
        });
        if (hasErrInventory) {
            toastr['error']('Số lượng gửi đi không hợp lệ!');
            return;
        }

        swal({
            title: "Bạn có chắc?",
            text: "Xác nhận gửi hàng từ phiếu này!",
            type: "warning",
            showCancelButton: true,
            cancelButtonText: "Hủy",
            closeOnConfirm: false,
            confirmButtonColor: '#f39c12',
            showLoaderOnConfirm: true
        }, function () {
            $scope.loading = true;
            $http.post(base_url + '/warehouse/ajax_confirm_move_branch_transaction', $scope.transaction).then(r => {
                if (checkResponse(r, 'Duyệt phiếu thành công')) {
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

    $scope.confirmOrderBranchTransaction = () => {
        if (!($scope.transaction.source_id > 0)) {
            toastr['error']('Bạn chưa chọn kho xuất!');
            return;
        }
        let hasErrInventory = $scope.transaction.products.find(r => {
            return (!r.quantity_accept || r.quantity_accept == '');
        });
        if (hasErrInventory) {
            toastr['error']('Số lượng cho phép không hợp lệ!');
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
            $http.post(base_url + '/warehouse/ajax_confirm_order_branch_transaction', $scope.transaction).then(r => {
                if (checkResponse(r, 'Duyệt phiếu thành công')) {
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


    function isNumber(val) {
        if (val && Number(val) > 0) return true;
        return false;
    }



    $scope.print_docs = () => {
        window.open(base_url + '/warehouse/print_docs/' + $scope.transaction.id);
    }

    $scope.checkProdNew = () => {
        if ($scope.transaction && $scope.transaction.products.length > 0) {
            let tmp = $scope.transaction.products.find(e => {
                return !e.id
            });
            return tmp ? true : false;
        } else return false;
    }

    $scope.changeWarehouseSource = () => {
        let prds = $scope.transaction.products.map(r => {
            return r.product_id
        });
        $scope.get_inventory($scope.transaction.source_id, $scope.transaction.type, prds, false);
    }

    $scope.get_inventory = (source_id, type, product_ids, is_dest) => {
        let filter = {
            type: type,
            warehouse_id: source_id,
            product_type: type,
            date: moment().format('DD/MM/YYYY'),
            ls_product: product_ids
        };
        $scope.loadInventory = true;

        $http.get(base_url + '/warehouse/api_get_warehouse_inventory?filter=' + JSON.stringify(filter)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.isInventory = true;
                $scope.transaction.products.forEach(e => {
                    let prd = r.data.data.find(r => {
                        return r.id == e.product_id
                    });
                    if (is_dest) e.dest_inventory = prd ? prd.total : 0;
                    if (!is_dest) e.source_inventory = prd ? prd.total : 0;
                });
            } else {
                toastr['error']('Không thể lấy tồn kho. Vui lòng kiểm tra lại!');
            }
        }, function (data, status, headers, config) {
            toastr.error('Vui lòng thử lại sau', 'Lỗi hệ thống!');
        });
    }



    $scope.updateImportTransaction = () => {
        let hasErrr = $scope.transaction.products.find(r => {
            if ($scope.transaction.status == 1 && r.quantity_accept == '') {
                return true;
            }
        });
        if (hasErrr) {
            toastr['error']('Số lượng không hợp lệ!');
            return;
        }
        $scope.loading = true;
        $scope.transaction.confirm_type = true;
        $http.post(base_url + '/warehouse/ajax_import_transaction', $scope.transaction).then(r => {
            if (checkResponse(r, !$scope.transaction.id ? 'Tạo phiếu thành công' : 'Cập nhật phiếu thành công')) {
                $('#modaladdoredit').modal('hide');
                $scope.getWHTransactions();
                $scope.loading = false;
            }
        });
    }

    $scope.getWHTransactions = () => {
        if ($scope.filter.date) {
            $scope.filter.start_date = $scope.filter.date.split('-')[0].trim();
            $scope.filter.end_date = $scope.filter.date.split('-')[1].trim();
        }
        $scope.loadingData = true;
        $http.get(base_url + '/warehouse/ajax_get_transactions?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            $scope.loadingData = false;
        })
    }

    $scope.getProductTransactionRequest = ($id) => {
        $http.get(base_url + '/warehouse/ajax_get_product_transaction_request?product_id=' + $id).then(r => {
            $scope.transDetails = r.data.data;

            $scope.totalQuantityTransDetail = 0;
            $scope.transDetails.forEach(element => {
                $scope.totalQuantityTransDetail += Number(element.quantity_request);
            });
            $('#transactionDetail').modal('show');
        })
    }

    $scope.filterTrans = () => {
        setDefautPage();
        $scope.getWHTransactions();
    }

    $scope.viewHistory = (item) => {
        let data = {
            product_id: item.product_id,
            warehouse_id: $scope.transaction.dest_id,
            date: moment().format('YYYY-MM-DD'),
            product_type: $scope.transaction.type
        };
        $scope.productHis = item;
        $scope.list_row = [];
        WarehouseSvc.getWarehouseHistoryProduct(data).then(r => {
            if (r && r.status == 1) {
                $scope.list_row = r.data;
                $('#ordernow').modal('show');
            } else {
                toastr["error"]('Chưa có lịch sử sản phẩm này');
            }
        });
    }


    $scope.closeModal = (id) => {
        $('#' + id).modal('hide');
    }

    $scope.formatDate = (date, format) => {
        return moment(date).format(format);
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

    function checkResponse(res, message) {
        if (res && res.data.status == 1) {
            if (message && message != '') toastr['success'](message);
            return true;
        }
        toastr['error'](res && res.data.message ? res.data.message : 'Có lổi xẩy ra. Vui lòng thử lại sau');
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
})