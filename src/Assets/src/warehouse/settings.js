app.controller('settingCtrl', function ($scope, $http, SystemConstructionSvc) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 20,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.isView = 1;
        $scope.filter = {};
        $scope.warehouse_type = [
            { key: 'BRANCH', value: 'Chi nhánh' },
            { key: 'MAIN_BRANCH', value: 'Kho tổng' },
        ]
        $scope.warehouse = {};
        $scope.warehouse.type = 'BRANCH';
        $scope.isChooseStore = true;
        $scope.isFilter = false;
        $scope.transporter = {};
        $scope.transporter.active = 1;
        $scope.supplier = {};
        $scope.supplier.active = 1;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = 0;
        initSearchProduct();
        $scope.changeView(1);
        $scope.productGroup = {};
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
                    find: keyword,
                    limit: 10,
                    offset: 0
                };

                if ($scope.contruc && $scope.contruc.id) {
                    param.ign_id = $scope.contruc.id;
                }

                currentInput.parent().find('.loader-in-row').fadeIn('fast');
                currentInput.parent().find('.product-search').addClass('showed');

                let product = await getApi('warehouse/ajax_get_system_construction?' + $.param(param));
                let products = product.data;
                var ul = '';

                if (products.length == 0) {
                    ul += '<li>Không tìm thấy kết quả phù hợp</li>';
                }

                jQuery.each(products, (key, us) => {
                    let li = `
                                <li class="product-item" 
                                    data-id="${us.id}" data-name="${us.name}" 
                                    style="float: left;width: 100%;">
                                    <div style="width: 90%;float: left;">
                                        <span title="Mã sản phẩm"  class="label-cus label label-default">#${us.id}</span> 
                                        ${us.name}
                                        <span title="Công ty" class="label label-primary">${us.company_name}</span>
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
            }
            div.find('.product_search_input').val(productName);
            div.find('.product_search_id_input').val(currentItem.data('id'));
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

    $scope.openModalGr = (id) => {
        if (id) {
            $scope.getPrdGroupById(id);
        } else {
            $scope.productGroup = {
                active: 1
            }
            $('#openModalGr').modal('show');
        }
    }
    $scope.getPrdGroupById = (id) => {
        $http.get(base_url + '/products/api_get_group_product?id=' + id).then(r => {
            if (r && r.data) {
                $scope.productGroup = r.data.data;
                $scope.productGroup.active = Number($scope.productGroup.active);
                $('#openModalGr').modal('show');
            }
        });
    }

    $scope.createOrUpdateProdGrp = () => {
        $('#openModalGr').modal('hide');
        $http.post(base_url + '/products/api_create_or_update_group_product', $scope.productGroup).then(r => {
            if (r.data && r.data.status == 1) {
                toastr['success']($scope.productGroup.group_id ? 'Cập nhật thành công!' : 'Tạo nhóm thành công!');
                $scope.getListPrdGroup();
            } else {
                toastr['error']('Đã có lổi xẩy ra. Vui lòng thử lại!');
            }
        });
    }

    $scope.getListPrdGroup = () => {
        $http.get(base_url + '/products/api_get_ls_group_product?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
        });
    }

    $scope.lockWH = (id, isLock) => {
        let data = {
            id: id,
            is_lock: isLock
        }
        $http.post(base_url + '/warehouse/api_lock_warehouse', data).then(r => {
            if (r.data.status == 1) {
                $scope.getWarehouses();
                toastr["success"]("Cập nhật thành công!");
            } else {
                toastr["error"]("Đã có lổi xẩy ra. Vui lòng thử lại!");
            }
        });
    }

    $scope.changeView = (val) => {
        $scope.isView = val;
        $scope.filter.offset = 0;
        $scope.filter.currentPage = 1;
        $scope.getAll();
    }

    $scope.handelFilter = () => {
        $scope.isFilter = $scope.filter.type == 'BRANCH' ? true : false;
        $scope.filter.store_id = $scope.filter.type == 'BRANCH' ? $scope.filter.store_id : 0;
    }

    $scope.handelStore = () => {
        $scope.isChooseStore = $scope.warehouse.type == 'BRANCH' ? true : false;
    }

    $scope.getAll = () => {
        $scope.loadingPage = true;
        if ($scope.isView == 4) {

            SystemConstructionSvc.getAll($scope.filter).then(r => {
                $scope.loadingPage = false;
                $scope.rows = r.data;
                $scope.pagingInfo.total = r.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.count / pi.itemsPerPage);
            })
        } else {

            let url = '';
            if ($scope.isView == 1) url = '/warehouse/api_get_warehouses';
            if ($scope.isView == 2) url = '/partner/ajax_get_suppliers';
            if ($scope.isView == 3) url = '/partner/api_get_transporters';
            $http.get(base_url + url + '?filter=' + JSON.stringify($scope.filter)).then(r => {
                $scope.loadingPage = false;
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            })
        }
    }

    $scope.createOrUpdateWareHouse = ($id) => {
        $query = $id ? '?id=' + $id : '';
        if ($scope.warehouse.type == 'MAIN_BRANCH') {
            $scope.warehouse.store_id = $scope.warehouse.type == 'MAIN_BRANCH' ? 0 : $scope.warehouse.store_id;
            warehouseService();
        } else {
            if ($scope.warehouse.store_id) {
                $scope.warehouse.store_id = $scope.warehouse.type == 'MAIN_BRANCH' ? 0 : $scope.warehouse.store_id;
                warehouseService();
            } else {
                toastr["error"]("Bạn chưa chọn chi nhánh.");
            }
        }
    }

    function warehouseService() {
        $http.post(base_url + '/warehouse/api_created_warehouses' + $query, $scope.warehouse).then(r => {
            if (r.data && r.data.status == 1) {
                toastr["success"]("Cập nhật thành công!");
                $scope.changeView($scope.isView);
            } else {
                toastr["error"]("Đã có lổi xẩy ra!. Vui lòng thử lại.");
            }
        })
        $('#addWH').modal('hide');
    }

    $scope.editWarehosue = ($id) => {
        if ($id) {
            $http.get(base_url + '/warehouse/ajax_get_warehouses_by_id?id=' + $id).then(r => {
                $scope.warehouse = r.data.data;
                $scope.warehouse.active = Number($scope.warehouse.active);
                $scope.titleModal = 'Sửa thông tin kho';
                $scope.warehouse.store_id = $scope.warehouse.store_id;
                $scope.handelStore();
                $('#addWH').modal('show');
                $scope.changeView($scope.isView);
            })
        } else {
            $('#addWH').modal('show');
            $scope.titleModal = 'Tạo kho';
            $scope.warehouse = {
                active: 1
            }
        }
    }


    $scope.checkTaxcode = (sup) => {
        let data = {};
        if(sup.id) data.id = sup.id;
        data.tax_code = sup.code;
        $http.post(base_url + '/partner/api_check_supplier_code',data).then(r => {
            if (r.data && r.data.status == 1) {
               $scope.status_taxcode =r.data.data;
            } 
        });
    }

    $scope.cOrUpSupplier = () => {
        if ($scope.status_taxcode) {
            toastr["error"]('Mã NCC đã tồn tại, vui lòng kiểm tra lại!');
            return false;
        }
        
        if (!$scope.supplier.type || $scope.supplier.type == 0) {
            toastr["warning"]('Vui lòng chọn loại nhà cung cấp');
            return false;
        }
        
        $http.post(base_url + '/partner/api_created_or_up_suppliers', $scope.supplier).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.changeView($scope.isView);
                toastr["success"]($scope.supplier.id ? 'Cập nhật thành công!' : 'Tạo thành công!');
            } else {
                toastr["error"]('Đã có lỗi xẩy ra!. Vui lòng thử lại')
            }
        });
        $('#modalSuppliers').modal('hide');
    }

    $scope.openModal = (id) => {
        if (id) {
            $scope.getSuppliersById(id);
            $scope.titleModal = 'Chỉnh sửa nhà cung cấp'
        } else {
            $scope.supplier = {};
            $scope.supplier.active = true;
            $scope.supplier.type = '0';
            $scope.titleModal = 'Tạo nhà cung cấp';
        }
        $('#modalSuppliers').modal('show');
    }

    $scope.getSuppliersById = (id) => {
        $http.get(base_url + '/partner/ajax_get_supplier_by_id?id=' + id).then(r => {
            $scope.supplier = r.data.data;
            $scope.supplier.active = ($scope.supplier.active == 1);
        })
    }

    $scope.formatDate = (date, type) => {
        return moment(date).format(type);
    }


    $scope.deleteSupplier = (id) => {
        $http.get(base_url + 'partner/api_delete_supplier_by_id?id=' + id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.getSuppliers();

                $scope.changeView($scope.isView);
                toastr["success"]('Xóa thành công!');
            } else toastr["error"](r.data.message);
        })
    }

    $scope.addOrEditTransporter = () => {
        $('#addTrans').modal('hide');
        $http.post(base_url + '/partner/api_add_or_up_transporters', $scope.transporter).then(r => {
            if (r.data) {
                toastr["success"](r.data.message);
                $scope.changeView($scope.isView);
            }
        })
    }

    $scope.addOrEdit = (id) => {
        $scope.titleModal = id ? 'Chỉnh sửa nhà vận chuyển' : 'Tạo nhà vận chuyển';
        if (id) {
            $http.get(base_url + '/partner/api_get_transporter_by_id?id=' + id).then(r => {
                $scope.transporter = r.data.data;
                $scope.transporter.active = Number($scope.transporter.active);
                $('#addTrans').modal('show');
            })
        } else {
            $scope.transporter = {
                active: 1
            };
            $('#addTrans').modal('show');
        }
    }

    $scope.deleteTransporter = (id) => {
        $http.get(base_url + 'partner/api_delete_transporter_by_id?id=' + id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.changeView($scope.isView);
                toastr["success"](r.data.message);
            } else toastr["error"](r.data.message);
        })
    }

    $scope.formatDate = (date, type) => {
        return moment(date).format(type);
    }


    $scope.openModalContruc = (value) => {
        $('#data_user_show').val('');
        $scope.contruc = value;
        if (!value.id) $scope.contruc.active = 1;
        if (value.id) {
            $scope.contruc.active = Number($scope.contruc.active);
            if ($scope.contruc.parent_id > 0) {
                $('#data_product_id').val($scope.contruc.parent_id);
                var productName = '#' + $scope.contruc.parent_id + ' ' + $scope.contruc.parent_name;
                $('#data_user_show').val(productName);
            }
        }

        $('#add').modal('show');
        select2();
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 100);
    }

    $scope.addOrUpdate = () => {
        $scope.loading = true;
        let prId = $('#data_product_id').val();
        let contruc = {
            name: $scope.contruc.name,
            code: $scope.contruc.code,
            company_id: $scope.contruc.company_id,
            note: $scope.contruc.note ? $scope.contruc.note : '',
            parent_id: prId ? prId : 0,
            active: $scope.contruc.active
        }

        if ($scope.contruc.id) {
            contruc.id = $scope.contruc.id;
            SystemConstructionSvc.updateConstruction(contruc).then(r => {
                $scope.loading = false;
                $scope.changeView($scope.isView);
                $('#add').modal('hide');
            })
        } else {
            SystemConstructionSvc.createConstruction(contruc).then(r => {
                $scope.loading = false;
                $scope.changeView($scope.isView);
                $('#add').modal('hide');
            })
        }
    }


    // paging
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
    // end paging

});