const _url = base_url + 'invoices_v2/';
var time_blur = 250;
const _obj_online_address = function () {
        return {
            customer_address_id: 0,
            fullAddress: '',
            province_id: '0',
            district_id: '0',
            ward_id: '0',
            address: '',
            name: '',
            phone: '',
        }
    },
    _obj_edit_address = function () {
        return {
            province_id: '0',
            district_id: '0',
            ward_id: '0',
            address: '',
            name: '',
            phone: '',
        }
    },
    _obj_edit_customer = function () {
        return {
            id: 0,
            name: '',
            phone: '',
            hobby_note: '',
            birthday: '',
            gender: '0',
            collabor_type: 'none',
            obj_user_collaborator: {
                id: 0,
                fisrt_name: '',
                last_name: '',
                phone: '',
                image_url: '',
            },
            source_id: '1',
            store_id: invoice.store_id,
            cmnd_number: '',
            cmnd_provide_date: '',
            cmnd_address: '',
            list_address: [],
            list_address_: [],
            edit_address: _obj_edit_address()
        }
    },
    _obj_upload = function () {
        return {
            type: '',
            list_uploaded: [],
            load: false,
        }
    },
    _obj_bank = function () {
        return {
            id: '0',
            code: '',
            price: '',
            verify_payment_id: 0,
            choose_visa_trans: {},
            image_url: '',
            confirm_type: 'image',
            load: false,
            model_manual: false,
        }
    },
    _obj_vnpay = function () {
        return {
            code: '',
            price: '',
            price_from_vnpay: 0,
            check: false,
            payDate: moment(invoice.date, 'YYYY-MM-DD').format('DD / MM / YYYY'),
            load: false
        }
    },
    _obj_vnpay_spos = function () {
        return {
            code: '',
            price: '',
            load: false,
            invoice_visa_transaction_id: 0,
        }
    },
    _obj_mpos = function () {
        return {
            code: '',
            price: '',
            load: false,
            invoice_visa_transaction_id: 0,
        }
    },
    _obj_list_visa_trans = function () {
        return {
            key: '',
            date_end: invoice.date,
            offset: -10,
            limit: 10,
            load: false,
            list: [],
            list_df: [],
        }
    },
    _obj_tab_transaction = function () {
        return {
            type: 'mpos',
            child_tab_vnpay: {
                type: 'qr_static', // spos
            }
        }
    },
    _obj_search_user = function () {
        return {
            key: '',
            list: '',
            list_df: '',
            type: '', // technician
            load_more: false,
        }
    },
    _obj_search_skin = function () {
        return {
            key: '',
            list: '',
            list_df: '',
            type: '', // technician
            load_more: false,
        }
    },
    _obj_pk_info_hover = function () {
        return {
            is_show: false,
            load: false,
            price: 0,
            total: 0,
            min_price: 0,
            children: {
                services: [],
                products: [],
            }
        }
    },
    _obj_customer_package_history = function () {
        return {
            load: false,
            info: {},
            obj_edit: {
                push_price: {
                    price: '',
                    load: false
                }
            }
        }
    },
    _obj_customer_package_debit_history = function () {
        return {
            customer_package_id: 0,
            current_debit: 0,
            name: '',
            history: [],
            price: '',
            load: false,
        }
    },
    _obj_remove_detail_with_confirm_user = function () {
        return {
            type: '',
            item: null,
            reason: '',
            user_id: '0',
            password: '',
            load: false,
        }
    },
    _obj_remove_with_confirm = function () {
        return {
            reason: '',
            user_id: '0',
            password: '',
            list: [],
            load: false,
        }
    },
    _obj_invoice_temp = function () {
        return {
            load: false,
            list: []
        }
    },
    _obj_invoice_df = function () {
        return {
            id: invoice.id,
            customer_id: invoice.customer_id,
            created_user_id: invoice.created_user_id,
            technician_id: invoice.technician_id,
            skin_id: invoice.skin_id,
            shipper_id: invoice.shipper_id,
            ship_price: invoice.ship_price,
            ring_size: invoice.ring_size,
            date: invoice.date,
            obj_online_address: {},
            list_result: {
                products: [],
                services: [],
                packages: [],
                debits: [],
                units: []
            },
            obj_edit: {
                product: {},
                service: {},
                package: {},
                debit: _obj_customer_package_debit_history(),
            },
            invoice_type_sale: Number(invoice.invoice_type_sale),
            invoice_type_return: invoice_type_sale_return.includes(Number(invoice.invoice_type_sale)),
            customer: {},
            note: invoice.note,
            note_print: invoice.note_print,
            print_count: Number(invoice.print_count),
            price: invoice.price,
            discount: invoice.discount,
            discount_type: 'amount',
            discount_change: invoice.discount,
            price: 0,
            price_invoice_type_1: 0,
            price_invoice_type_2: 0,
            amount: 0,
            visa: 0,
            total: 0,
            finish_time: invoice.finish_time,
            is_finish: Number(invoice.is_finish),
            transaction: {
                list_mpos: [],
                mpos: _obj_mpos(),

                vnpay: _obj_vnpay(),
                list_vnpay: [],

                vnpay_spos: _obj_vnpay_spos(),
                list_vnpay_spos: [],

                bank: _obj_bank(),
                list_bank: [],
            },
            customer_package_history: _obj_customer_package_history(),
            service_wait_use: [],
            link_print: '',
            obj_voucher: {
                added: [],
                load: false,
                code: '',
                list_confirm: {}
            },
            obj_out_of_stock: {
                isset: false,
                accept: false,
            }
        };
    };
app.controller('invoiceCtrl', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $scope.voucher_par = {
            key: '',
            load: false,
            list: [],
            list_: []
        };
        $scope.tab_voucher = 1;
        $scope.base_url = base_url;
        $scope.toDay = toDay;
        $scope.time_allow_discount_debit = time_allow_discount_debit;
        $scope.service_km_id = service_km_id;
        $scope.gift_online_id = gift_online_id;
        $scope.store_use_invoice_temp = store_use_invoice_temp;
        $scope.store_use_choose_staff = store_use_choose_staff;
        $scope.cr_company_id = cr_company_id;
        $scope.cr_nation_id = cr_nation_id;
        $scope.cr_store_type = cr_store_type;
        $scope.symbol_currency = cr_nation_id == 1 ? 'VNĐ' : '$';
        $scope.obj_invoice = _obj_invoice_df();
        $scope.is_dev = is_dev;
        $scope.is_admin = is_admin;
        $scope.is_manager = is_manager;
        $scope.is_only_assistantmanager = is_only_assistantmanager;
        $scope.remove_need_confirm = cr_company_id == 1 && !is_dev && $scope.obj_invoice.print_count;
        $scope.resetEditCustomer();
        $scope.all_provinces = [];
        $scope.all_districts = [];
        $scope.all_wards = [];
        $scope.getProvinces();
        $scope.getDistricts(-1);
        $scope.resetSearch();
        $scope.resetSearchGift();
        $scope.resetMposTransactions();
        $scope.resetVnpaySposTransactions();
        $scope.resetListVisaTransactions();
        $scope.resetChooseTypeTransactions();
        $scope.productInventory = [];
        $scope.getInvoiceDetail();
        $('#invoiceCtrl').show();
        $scope.list_info_service_denys = {};
        $scope.resetRemoveDetailWithConfirmUser();
        
    }

    $scope.submitRemoveWithConfirm = () => {
        var obj_confirm = angular.copy($scope.obj_remove_with_confirm);

        if (!Number(obj_confirm.user_id)) {
            showMessErr('Vui lòng chọn người xác nhận');
            return;
        }
        if (!obj_confirm.password) {
            showMessErr('Vui lòng nhập mật khẩu người xác nhận');
            return;
        }
        if (!obj_confirm.reason) {
            showMessErr('Vui lòng nhập lý do xóa');
            return;
        }

        obj_confirm.invoice_id = invoice.id;
        $scope.obj_remove_with_confirm.load = true;
        $http.post(_url + 'ajax_remove_with_confirm', obj_confirm).then(r => {
            $scope.obj_remove_with_confirm.load = false;
            if (r.data.status == 1) {
                hidePopup('#modal_remove_with_confirm');
                $scope._saveInvoice();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    };

    $scope.openServiceDenys = () => {
        showPopup('#modal_service_denys');
        if (!$scope.list_info_service_denys.list || !$scope.list_info_service_denys.list.length) $scope.getListInfoServiceDenys();
    }

    $scope.getListInfoServiceDenys = () => {
        $scope.list_info_service_denys.load = true;
        var data_rq = {
            store_id: invoice.store_id,
        };

        $scope.list_info_service_denys.load = true;
        $http.get(_url + 'ajax_get_list_service_denys?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.list_info_service_denys = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.list_info_service_denys.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.submitEditRingSize = () => {
        var item = angular.copy($scope.obj_invoice.obj_edit_ring_size),
            ring_size = item.ring_size;

        $scope.obj_invoice.obj_edit_ring_size.load = true;
        $http.post(_url + 'ajax_edit_ring_size', {
            invoice_id: invoice.id,
            ring_size: ring_size
        }).then(r => {
            if (r.data && r.data.status == 1) {
                showMessSuccess();
                $scope.obj_invoice.ring_size = ring_size;
                hidePopup('#modal_edit_ring_size');
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.obj_edit_ring_size.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.checkExistFatService = () => {
        var exist = false,
            services = angular.copy($scope.obj_invoice.list_result.services),
            units = angular.copy($scope.obj_invoice.list_result.units);

        exist = services.find(x => !x.is_remove && fat_service_ids.includes(x.service_id + ''));
        if (!exist) {
            exist = units.find(x => x.type == 'service' && fat_service_ids.includes(x.unit_id + ''));
        }

        return exist ? true : false;
    }

    $scope.openEditRingSize = () => {
        if (!$scope.checkShow('permit_edit_ring_size')) return;
        if (!$scope.checkExistFatService()) {
            showMessErr('Chưa tồn tại dịch vụ cần chỉnh số đo');
            return;
        }

        $scope.obj_invoice.obj_edit_ring_size = {
            ring_size: angular.copy($scope.obj_invoice.ring_size),
            load: false
        }
        showPopup('#modal_edit_ring_size');
    }

    // tab spos
    $scope.chooseTabVnpayTransaction = (type) => {
        $scope.obj_tab_transaction.child_tab_vnpay.type = type;
        if (type == 'spos' && !$scope.vnpay_spos_transactions.list.length) {
            $scope.getListVnpaySposTransactions();
        }
    }

    $scope.openInitSpos = () => {
        $scope.obj_init_spos = {
            load: false,
            amount: $scope.obj_invoice.amount,
            method_code: 'VNPAY_SPOS_CARD'
        }
        showPopup('#modal_init_spos');
        setTimeout(() => {
            $('#modal_init_spos input').focus().trigger('keyup');
        }, 300);
    }

    $scope.submitInitSpos = () => {
        var item = angular.copy($scope.obj_init_spos),
            amount = formatDefaultNumber(item.amount);

        if (!amount) {
            showMessErr('Số tiền phải lớn hơn 0');
            showInputErr('#modal_init_spos input');
            return;
        }
        $scope.obj_init_spos.load = true;
        $.ajax({
            type: 'post',
            url: base_url + 'vnpay/ajax_request_init_spos',
            data: {
                invoice_id: invoice.id,
                store_id: invoice.store_id,
                amount: amount,
                methodCode: item.method_code
            },
            dataType: 'json',
            success: function (r) {
                if (r.status) {
                    hidePopup('#modal_init_spos');
                    showMessSuccess('Khởi tạo thành công');
                } else {
                    showMessErr(r.message);
                }
            },
            complete: function () {
                $scope.$apply(() => {
                    $scope.obj_init_spos.load = false;
                })
            },
            error: function () {
                showMessErrSystem();
            }
        });
    }

    $scope.resetVnpaySposTransactions = () => {
        $scope.vnpay_spos_transactions = {
            list: [],
            load: false
        }
    }

    $scope.chooseItemVnpaySposTransaction = (value) => {
        var item = angular.copy(value),
            price = item.transfer_amount,
            transfer_status = Number(item.transfer_status),
            code = item.transfer_code;

        if (![200].includes(transfer_status)) {
            showMessErr('Trạng thái không phù hợp để chọn');
            return;
        }

        var check_exist = $scope.obj_invoice.transaction.list_vnpay_spos.find(x => x.invoice_visa_transaction_id == value.id);
        if (check_exist) {
            showMessErr('Giao dịch này đã được chọn trong phiếu thu');
            return;
        }

        if ($scope.obj_invoice.transaction.vnpay_spos.price) {
            price = $scope.obj_invoice.transaction.vnpay_spos.price;
        }
        price = parseNumber(price);

        $scope.obj_invoice.transaction.vnpay_spos = {
            code: code,
            price: price,
            invoice_visa_transaction_id: item.id,
        }
    }

    $scope.getListVnpaySposTransactions = () => {
        var data_rq = {
            date: invoice.date,
            store_id: invoice.store_id,
        };

        $scope.vnpay_spos_transactions.load = true;
        $scope.vnpay_spos_transactions.list = [];
        $http.get(_url + 'ajax_get_list_vnpay_spos_transactions?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $.each(data, function (index, value) {
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                })
                $scope.vnpay_spos_transactions.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.vnpay_spos_transactions.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.saveVnpaySpos = () => {
        var item = angular.copy($scope.obj_invoice.transaction.vnpay_spos),
            price = formatDefaultNumber(item.price),
            code = item.code,
            invoice_visa_transaction_id = item.invoice_visa_transaction_id;

        if (!code) {
            showMessErr('Mã thanh toán không được bỏ trống!')
            showInputErr('.vs_vnpay_spos_code');
            return;
        }

        if (!price) {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_vnpay_spos_price');
            return;
        }
        if (!$scope.checkPriceAddVisa(price)) return;
        $scope.obj_invoice.transaction.vnpay.load = true;
        $http.post(_url + 'ajax_add_vnpay_spos', {
            invoice_id: invoice.id,
            price: price,
            code: code,
            invoice_visa_transaction_id: invoice_visa_transaction_id,
        }).then(r => {
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $scope.updateListVisaByData(data);
                showMessSuccess();
                $scope.obj_invoice.transaction.vnpay_spos = _obj_vnpay_spos();
                $scope.getListVnpaySposTransactions();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.transaction.vnpay.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveVnpaySpos = (key) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        var cur_obj = $scope.obj_invoice.transaction.list_vnpay_spos[key];
                        $scope._removeVisa(cur_obj.id, 4);
                    });
                });
            },
        }).then(function () {});
    }

    // end tab spos
    $scope.openCustomerHistory = (e = null) => {
        if (e && e.which == 3) { // this is right click
            window.open(base_url + 'customers/history/' + invoice.customer_id);
            return;
        }
        showPopup('#modal_customer_history');
        $scope.obj_invoice.customer.history = {
            load: true,
            html: '',
        };

        $http.get(base_url + 'customers/history/' + invoice.customer_id + '?is_get_view=1').then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.customer.history.html = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.customer.history.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmToggleFinishInvoice = (is_finish = 0) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: (is_finish ? 'Hoàn tất' : 'Mở khóa') + ' phiếu thu',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope._toggleFinishInvoice(is_finish);
            }
        });
    }

    $scope._toggleFinishInvoice = (is_finish) => {
        $scope.load_list = true;
        $http.post(_url + 'ajax_toggle_finish_invoice', {
            invoice_id: invoice_id,
            is_finish: is_finish,
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                _reload();
            } else {
                $scope.load_list = false;
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.showModalInvoiceTemp = () => {
        $scope.resetInvoiceTemp();
        $scope.getInvoiceTempDetail();
        showPopup('#modal_invoice_temp');
    }

    $scope.resetInvoiceTemp = () => {
        $scope.obj_invoice_temp = _obj_invoice_temp();
    }

    $scope.getInvoiceTempDetail = () => {
        $scope.obj_invoice_temp.load = true;
        $http.get(base_url + 'invoice_temp_v2/ajax_get_list_invoice_temp_detail_by_invoice_main_id?invoice_main_id=' + invoice.id).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice_temp.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice_temp.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.importInvoiceTemp = (is_finish = 0) => {
        var list = angular.copy($scope.obj_invoice_temp.list);
        choosed = list.filter(x => x.choose);
        if (!choosed.length) {
            showMessErr('Vui lòng chọn ít nhất 1 phiếu thu tạm');
            return;
        }

        var data_rq = {
            is_finish: is_finish,
            invoice_id: invoice_id,
            invoice_temp_ids: choosed.map(x => x.id)
        };
        $scope.obj_invoice_temp.load = true;
        $http.post(_url + 'ajax_import_invoice_temp', data_rq).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                _reload();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice_temp.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.submitRemoveDetailWithConfirmUser = () => {
        var _obj = angular.copy($scope.obj_remove_detail_with_confirm_user),
            item_rq = _obj.item;

        _obj.item = null;
        item_rq.obj_remove_confirm_user = _obj;

        if (!Number(_obj.user_id)) {
            showMessErr('Vui lòng chọn người xác nhận');
            return;
        }
        if (!_obj.password) {
            showMessErr('Vui lòng chọn mật khẩu người xác nhận');
            showInputErr('#password-remove');
            return;
        }
        if (!_obj.reason) {
            showMessErr('Vui lòng nhập lý do xóa');
            showInputErr('#reason-remove');
            return;
        }

        if (_obj.type == 'product') {
            $scope._removeInvoiceProduct(item_rq);
        } else if (_obj.type == 'service') {
            $scope._removeInvoiceService(item_rq);
        } else if (_obj.type == 'package') {
            $scope._removeCustomerPackage(item_rq);
        } else if (_obj.type == 'debit') {
            $scope._removeCustomerPackageDebit(item_rq);
        } else {
            showMessErr('Không xác định loại chi tiết được xóa');
        }
    };

    $scope.resetRemoveDetailWithConfirmUser = () => {
        $scope.obj_remove_detail_with_confirm_user = _obj_remove_detail_with_confirm_user();
        select2(100, '#modal_remove_detail_with_confirm_user select.select2');
    }

    $scope.checkShowUrlImageVisa = checkShowUrlImageVisa;

    $scope.showPoupEditCustomer = () => {
        showPopup('#modal_edit_customer');
        $scope.obj_edit_customer = angular.copy($scope.obj_invoice.customer.info);
        $scope.resetEditCustomerAddress();
        $scope.obj_search_list_customer_address = {
            key: ''
        }
        $scope.resetSearchUserCollaborator();
        $scope.obj_edit_customer.birthday = $scope.obj_edit_customer.birthday && $scope.obj_edit_customer.birthday != '0000-00-00' ? moment($scope.obj_edit_customer.birthday, 'YYYY-MM-DD').format('DD / MM / YYYY') : '';
        $scope.obj_edit_customer.cmnd_provide_date = $scope.obj_edit_customer.cmnd_provide_date && $scope.obj_edit_customer.cmnd_provide_date != '0000-00-00' && $scope.obj_edit_customer.cmnd_provide_date != 'null' ? moment($scope.obj_edit_customer.cmnd_provide_date, 'YYYY-MM-DD').format('DD / MM / YYYY') : '';
        $scope.obj_edit_customer.cmnd_number = $scope.obj_edit_customer.cmnd_number && $scope.obj_edit_customer.cmnd_number != 'null' ? $scope.obj_edit_customer.cmnd_number : '';
        $scope.obj_edit_customer.cmnd_address = $scope.obj_edit_customer.cmnd_address && $scope.obj_edit_customer.cmnd_address != 'null' ? $scope.obj_edit_customer.cmnd_address : '';
        $scope.obj_edit_customer.list_address_ = angular.copy($scope.obj_edit_customer.list_address);
        $('[href="#info_c"]').trigger('click');
        setTimeout(() => {
            $('#modal_edit_customer .fullname').focus();
        }, 300);
        select2();
    }

    $scope.resetSearchUser = () => {
        $scope.obj_search_user = _obj_search_user();
    }

    $scope.chooseTypeSearchUser = (type) => {
        if ($scope.obj_search_user.type == type) {
            $scope.obj_search_user.type = '';
            return;
        }
        $scope.resetSearchUser();
        $scope.obj_search_user.type = type;
        var list = [];
        if (type == 'sale') {
            list = $scope.list_saler;
        } else {
            list = $scope.list_technician;
        }
        $scope.obj_search_user.list = angular.copy(list);
        $scope.obj_search_user.list_df = angular.copy(list);
        setTimeout(() => {
            $(`.input-search-${type}`).focus();
        }, 100)
    }

    $scope.searchUser = () => {
        var expected = ToSlug($scope.obj_search_user.key);
        $scope.obj_search_user.list = angular.copy($scope.obj_search_user.list_df.filter(item => ToSlug(item.fullname).indexOf(expected) !== -1));
    }

    $scope.resetEditCustomer = () => {
        $scope.obj_edit_customer = _obj_edit_customer();
        $scope.resetEditCustomerAddress();
        $scope.obj_search_list_customer_address = {
            key: ''
        }
        $scope.resetSearchUserCollaborator();
    }

    $scope.hideRsFilterUserCollaborator = () => {
        setTimeout(() => {
            $scope.filter_user_collaborator.show_rs = false;
            $scope.$apply();
        }, time_blur)
    }

    $scope.chooseTabAddress = () => {
        if ($scope.obj_edit_customer.id > 0) return;
        // tạo mới thì copy cái name, phone qua
        var item = angular.copy($scope.obj_edit_customer),
            phone = item.edit_address.phone ? item.edit_address.phone : item.phone,
            name = item.edit_address.name ? item.edit_address.name : item.name;

        $scope.obj_edit_customer.edit_address.phone = phone;
        $scope.obj_edit_customer.edit_address.name = name;
    }

    $scope.resetEditCustomerAddress = () => {
        $scope.all_districts = [];
        $scope.all_wards = [];
        $scope.obj_edit_customer.edit_address = _obj_edit_address();
    }

    $scope.chooseCustomerAddress = (item) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: 'Đổi địa chỉ giao hàng cho phiếu thu này',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.changeAddressInvoice(item);
            }
        });
    }

    $scope.changeAddressInvoice = (value) => {
        var item = angular.copy(value),
            data_rq = angular.copy(item);

        data_rq.invoice_id = invoice_id;
        $scope.obj_edit_customer.load = true;
        $http.post(_url + 'ajax_change_invoice_address', data_rq).then(r => {
            if (r.data && r.data.status) {
                hidePopup('#modal_edit_customer');
                showMessSuccess('Đã cập nhật địa chỉ giao hàng');
                $scope.obj_invoice.obj_online_address = item;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_edit_customer.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    };

    $scope.editCustomerAddress = (key) => {
        var item = angular.copy($scope.obj_edit_customer.list_address[key]);
        item.index_of = key;
        $scope.obj_edit_customer.edit_address = item;

        $scope.obj_edit_customer.edit_address.province_id += '';
        $scope.obj_edit_customer.edit_address.district_id += '';
        $scope.obj_edit_customer.edit_address.ward_id += '';

        $scope.getDistricts(item.province_id);
        $scope.getWards(item.district_id);
    }

    $scope.saveCustomerAddress = () => {
        var obj_address = angular.copy($scope.obj_edit_customer.edit_address),
            province_id = obj_address.province_id,
            district_id = obj_address.district_id,
            ward_id = obj_address.ward_id,
            address = obj_address.address,
            name = obj_address.name,
            phone = obj_address.phone;

        if (!name) {
            showMessErr('Vui lòng nhập Họ tên');
            showInputErr('#modal_edit_customer .name');
            return;
        }
        if (!phone) {
            showMessErr('Vui lòng nhập số điện thoại');
            showInputErr('#modal_edit_customer .phone');
            return;
        }
        if (!(province_id > 0)) {
            showMessErr('Vui lòng chọn Tỉnh');
            showInputErr('.province_id');
            return;
        }
        if (!(district_id > 0)) {
            showMessErr('Vui lòng chọn Quận/ Huyện');
            showInputErr('.district_id');
            return;
        }
        if (!(ward_id > 0)) {
            showMessErr('Vui lòng chọn Phường/ Xã');
            showInputErr('.ward_id');
            return;
        }

        if (!address) {
            showMessErr('Vui lòng nhập Số nhà');
            showInputErr('.address');
            return;
        }
        var obj_edit = obj_address,
            province_name = $scope.all_provinces.find(x => x.id == province_id).name,
            district_name = $scope.all_districts.find(x => x.id == district_id).name,
            ward_name = $scope.all_wards.find(x => x.id == ward_id).name;

        obj_edit.fullAddress = address + ' - ' + ward_name + ' - ' + district_name + ' - ' + province_name;
        $scope.obj_edit_customer.load = true;
        obj_edit.customer_id = invoice.customer_id;
        $http.post(base_url + 'customers/ajax_insert_or_edit_customer_addresses', obj_edit).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_search_list_customer_address.key = '';
                $scope.searchCustomerAddress();
                showMessSuccess();
                obj_edit.customer_address_id = r.data.data;
                if (obj_edit.index_of >= 0) {
                    $scope.obj_edit_customer.list_address[obj_edit.index_of] = obj_edit;
                } else {
                    $scope.obj_edit_customer.list_address.unshift(obj_edit);
                }
                $scope.obj_edit_customer.list_address_ = angular.copy($scope.obj_edit_customer.list_address);
                $scope.resetEditCustomerAddress();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_edit_customer.load = false;
            select2();
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.searchCustomerAddress = () => {
        var expected = ToSlug($scope.obj_search_list_customer_address.key);
        $scope.obj_edit_customer.list_address = angular.copy($scope.obj_edit_customer.list_address_.filter(item => ToSlug(item.name).indexOf(expected) !== -1 || ToSlug(item.phone).indexOf(expected) !== -1));
    }

    $scope.changeProvinces = (province_id = 0) => {
        $scope.all_wards = {};
        $scope.all_districts = {};
        $scope.obj_edit_customer.edit_address.district_id = '0';
        $scope.obj_edit_customer.edit_address.ward_id = '0';
        if (province_id > 0) {
            $scope.getDistricts(province_id);
        }
        select2();
    };

    $scope.changeDistricts = (district_id = 0) => {
        $scope.all_wards = {};
        $scope.obj_edit_customer.edit_address.ward_id = '0';
        if (district_id > 0) {
            $scope.getWards(district_id);
        }
        select2();
    };

    $scope.getProvinces = () => {
        var cacheProvinces = getStorage('provinces');
        if (cacheProvinces) {
            $scope.all_provinces = cacheProvinces;
            select2();
        } else {
            $scope.load_address = true;
            $http.get(base_url + 'systems/ajax_get_provinces').then(r => {
                if (r.data && r.data.status) {
                    let data = r.data.data;
                    $scope.all_provinces = data;
                    setStorage('provinces', data);
                } else {
                    showMessErr(r.data.message);
                }
                $scope.load_address = false;
                select2();
            }, function (data, status, headers, config) {
                showMessErrSystem()
            });
        }
    };

    $scope.getDistricts = (id) => {
        var all_districts = [];
        var cacheDistricts = getStorage('districts');
        if (cacheDistricts) {
            all_districts = cacheDistricts;

            $scope.all_districts = cacheDistricts.filter(x => x.province_id == id);
            select2();
        } else {
            var data_rq = {
                province_id: -1,
            };
            $scope.load_address = true;
            $http.get(base_url + 'systems/ajax_get_districts?' + $.param(data_rq)).then(r => {
                if (r.data && r.data.status) {
                    let data = r.data.data;
                    data = data.filter(x => x.id > 0);
                    all_districts = data;
                    setStorage('districts', data);

                    $scope.all_districts = all_districts.filter(x => x.province_id == id);
                    select2();
                } else {
                    showMessErr(r.data.message);
                }
                $scope.load_address = false;
            }, function (data, status, headers, config) {
                showMessErrSystem()
            });
        }
    };

    $scope.getWards = (id) => {
        var data_rq = {
            district_id: id,
        };
        $scope.load_address = true;
        $http.get(base_url + 'systems/ajax_get_wards?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $scope.all_wards = data.filter(x => x.id > 0);
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_address = false;
            select2();
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    };

    $scope.editCustomer = () => {
        var item = angular.copy($scope.obj_edit_customer),
            date_rq = {
                name: item.name,
                hobby_note: item.hobby_note,
                phone: item.phone,
                gender: item.gender,
                store_id: item.store_id,
                collabor_id: 0,
                collabor_type: item.collabor_type,
                source_id: item.source_id,
                cmnd_number: item.cmnd_number,
                cmnd_address: item.cmnd_address,
                cmnd_provide_date: '',
                birthday: '',
            },
            birthday = item.birthday,
            obj_user_collaborator = item.obj_user_collaborator,
            is_check_birthday = item.is_check_birthday,
            list_address = item.list_address,
            update_address = false;

        if (!item.name) {
            showMessErr('Vui lòng nhập Họ tên');
            showInputErr('#modal_edit_customer .fullname');
            $('#home-tab').trigger('click');
            return;
        }
        if (!item.phone) {
            showMessErr('Vui lòng nhập số điện thoại');
            showInputErr('#modal_edit_customer .phone');
            $('#home-tab').trigger('click');
            return;
        }
        if (item.gender == 0) {
            showMessErr('Vui lòng chọn giới tính');
            showInputErr('#modal_edit_customer .gender');
            $('#home-tab').trigger('click');
            return;
        }
        if (birthday && !is_check_birthday) {
            if (birthday.length != 14) {
                showMessErr('Ngày sinh sai định dạng');
                showInputErr('#modal_edit_customer .birthday');
                $('#home-tab').trigger('click');
                return;
            }
            var birthdays = birthday.replace(' / ', '/').replace(' / ', '/').split('/');
            date_rq.birthday = birthdays[2] + '-' + birthdays[1] + '-' + birthdays[0];
        }

        cmnd_provide_date = item.cmnd_provide_date;
        if (cmnd_provide_date) {
            if (cmnd_provide_date.length != 14) {
                showMessErr('Ngày cấp CMND sai định dạng');
                showInputErr('#modal_edit_customer .cmnd_provide_date');
                $('#home-tab').trigger('click');
                return;
            }
            var cmnd_provide_dates = cmnd_provide_date.replace(' / ', '/').replace(' / ', '/').split('/');
            date_rq.cmnd_provide_date = cmnd_provide_dates[2] + '-' + cmnd_provide_dates[1] + '-' + cmnd_provide_dates[0];
        }

        if (item.id > 0) {
            date_rq.id = item.id;
            var address_add = [],
                address_update = [];
            if (list_address && list_address.length) {
                $.each(list_address, function (index, item) {
                    if (item.need_save) {
                        if (item.customer_address_id > 0) {
                            address_update.push(item);
                        } else {
                            address_add.push(item);
                        }
                        update_address = true;
                    }
                })
            }
            date_rq.address_query = {
                add: address_add,
                update: address_update,
            };
        } else {
            date_rq.store_id = store_id;
            date_rq.address_query = list_address;
        }

        if (item.collabor_type != 'none') {
            if (!obj_user_collaborator || !obj_user_collaborator.id) {
                showMessErr('Vui lòng chọn nhân viên cho Cộng tác viên.');
                return;
            }
            date_rq.collabor_id = obj_user_collaborator.id;
        }

        $scope.obj_edit_customer.load = true;
        $http.post(base_url + 'customers/ajax_insert_or_edit', date_rq).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                $scope.parseCustomerInfo(data);
                showMessSuccess('Cập nhật thành công');
                hidePopup('#modal_edit_customer');
                if (update_address && data.list_address.length == 1 && invoice.invoice_type_sale == 5) {
                    $scope.chooseCustomerAddress(data.list_address[0]);
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_edit_customer.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $('#search-filter-user-collaborator').on('focus', function () {
        setTimeout(() => {
            $scope.filter_user_collaborator.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $scope.resetSearchUserCollaborator = () => {
        $scope.filter_user_collaborator = {
            key: '',
            load: false,
            list: [],
            show_rs: false
        }
    }

    $scope.searchUserCollaborator = () => {
        var key = $scope.filter_user_collaborator.key;
        if (key.length < 4) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchUserCollaborator();
        }, 350);
    }

    $scope._searchUserCollaborator = () => {
        $scope.filter_user_collaborator.load = true;
        $http.get(base_url + 'admin_users/ajax_search_user_by_key?key=' + $scope.filter_user_collaborator.key).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $scope.filter_user_collaborator.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_user_collaborator.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseUserCollaborator = (value) => {
        var item = angular.copy(value);
        if (item.customer_id != 0) {
            var cus_info = _jsonObj(item.obj_customer_collaborator);
            Swal.fire({
                icon: 'info',
                confirmButtonText: 'Đồng ý',
                title: 'Nhân viên này là CTV',
                width: (window.innerWidth > 768) ? '' : '60 vw',
                html: `<table class="table text-left font-14px">
                            <tbody>
                                <tr>
                                    <td>Mã KH:</td>
                                    <td><b>${cus_info.id}</b></td>
                                </tr>
                                <tr>
                                    <td>Họ tên:</td>
                                    <td><b>${cus_info.name}</b></td>
                                </tr>
                                <tr>
                                    <td>Số điện thoai:</td>
                                    <td>${cus_info.phone}</td>
                                </tr>
                            </tbody>
                        </table>`
            });
            return;
        }
        $scope.obj_edit_customer.obj_user_collaborator = item;
        $scope.resetSearchUserCollaborator();
    }

    $scope.removeUserCollaborator = () => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: `Gỡ cộng tác viên này`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.$apply(() => {
                    $scope.obj_edit_customer.obj_user_collaborator = null;
                    $scope.obj_edit_customer.collabor_type = 'none';
                });
            }
        });
    }

    $scope.resetChooseTypeTransactions = () => {
        $scope.obj_tab_transaction = _obj_tab_transaction();
    }

    $scope.chooseTabTransaction = (type) => {
        $scope.obj_tab_transaction.type = type;
        if (type == 'bank' && !$scope.obj_list_visa_trans.list_df.length) {
            $scope.sumbitGetListVisaTransactions();
        }
        if (type == 'vnpay') {
            $scope.chooseTabVnpayTransaction($scope.obj_tab_transaction.child_tab_vnpay.type);
        }
    }

    $scope.resetMposTransactions = () => {
        $scope.mpos_transactions = {
            list: [],
            load: false
        }
    }

    $scope.chooseItemMposTransaction = (value) => {
        var item = angular.copy(value),
            price = item.transfer_amount,
            transfer_status = Number(item.transfer_status),
            code = item.transfer_authcode; // mã chuẩn chi

        if (![100, 104].includes(transfer_status)) {
            showMessErr('Trạng thái không phù hợp để chọn');
            return;
        }

        var check_exist = $scope.obj_invoice.transaction.list_mpos.find(x => x.invoice_visa_transaction_id == value.id);
        if (check_exist) {
            showMessErr('Giao dịch này đã được chọn trong phiếu thu');
            return;
        }

        if (code == '000000') {
            code = item.transfer_code; // mã giao dịch
        }

        if ($scope.obj_invoice.transaction.mpos.price) {
            price = $scope.obj_invoice.transaction.mpos.price;
        }
        price = parseNumber(price);

        $scope.obj_invoice.transaction.mpos = {
            code: code,
            price: price,
            invoice_visa_transaction_id: item.id,
        }
    }

    $scope.getListMposTransactions = () => {
        var data_rq = {
            date: invoice.date,
            store_id: invoice.store_id,
        };

        $scope.mpos_transactions.load = true;
        $scope.mpos_transactions.list = [];
        $http.get(_url + 'ajax_get_list_mpos_transactions?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $.each(data, function (index, value) {
                    value.transfer_code = value.transfer_code.toString().slice(-8);
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                })
                $scope.mpos_transactions.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.mpos_transactions.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseItemVisaTransaction = (value) => {
        var item = angular.copy(value);
        var _exist_bank = $scope.cashbook_bank.find(x => x.id == item.bank_id);
        if (_exist_bank) {
            $scope.obj_invoice.transaction.bank.id = item.bank_id;
        } else {
            showMessErr('Ngân hàng khách thanh toán không phù hợp.');
            return;
        }

        var check_exist = $scope.obj_invoice.transaction.list_bank.find(x => x.invoice_visa_transaction_id == value.id);
        if (check_exist) {
            showMessErr('Giao dịch này đã được chọn trong phiếu thu');
            return;
        }

        $scope.obj_invoice.transaction.bank.choose_visa_trans = item;
        $scope.obj_invoice.transaction.bank.price = parseNumber(item.amount_remain);
        $scope.obj_invoice.transaction.bank.model_manual = true;
    }

    $scope.editBank = (k) => {
        var item_edit = angular.copy($scope.obj_invoice.transaction.list_bank[k]),
            is_remove_edit = $scope.obj_invoice.transaction.bank.item_edit && $scope.obj_invoice.transaction.bank.item_edit.id == item_edit.id;
        $scope.obj_invoice.transaction.bank = _obj_bank();
        if (is_remove_edit) return;
        $scope.chooseTabTransaction('bank');
        var _exist_bank = $scope.cashbook_bank.find(x => x.id == item_edit.bank_id);
        if (_exist_bank) {
            $scope.obj_invoice.transaction.bank.id = item_edit.bank_id;
        } else {
            showMessErr('Ngân hàng khách thanh toán không phù hợp.');
            return;
        }
        if (_exist_bank.confirm_type == 'image') {
            $scope.obj_invoice.transaction.bank.image_url = item_edit.value;
        } else if (_exist_bank.confirm_type == 'code') {
            $scope.obj_invoice.transaction.bank.code = item_edit.value;
        }
        if (item_edit.invoice_visa_transaction_id != 0) {
            $scope.obj_invoice.transaction.bank.choose_visa_trans = {
                id: item_edit.invoice_visa_transaction_id,
                bank_name: item_edit.bank_name,
                transfer_amount: item_edit.price
            }
        }

        $scope.obj_invoice.transaction.bank.item_edit = item_edit;
        $scope.obj_invoice.transaction.bank.price = parseNumber(item_edit.price);
        $scope.obj_invoice.transaction.bank.model_manual = true;
    }

    $scope.removeChooseItemVisaTransaction = () => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: 'Bỏ chọn giao dịch này',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.$apply(() => {
                    $scope.obj_invoice.transaction.bank.choose_visa_trans = {};
                    if ($scope.obj_invoice.transaction.bank.item_edit) {
                        $scope.obj_invoice.transaction.bank.item_edit.invoice_visa_transaction_id = 0;
                    }
                });
            }
        });
    }

    $scope.resetListVisaTransactions = () => {
        var key = $scope.obj_list_visa_trans && $scope.obj_list_visa_trans.key ? $scope.obj_list_visa_trans.key : '';
        $scope.obj_list_visa_trans = _obj_list_visa_trans();
        $scope.obj_list_visa_trans.key = key;
    }

    $scope.sumbitGetListVisaTransactions = () => {
        $scope.resetListVisaTransactions();
        $scope._getListVisaTransactions();
    }

    $scope.scollMoreListVisaTrans = (e) => {
        var self = $(e);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            $scope._getListVisaTransactions();
        }
    }

    $scope._getListVisaTransactions = () => {
        if ($scope.obj_list_visa_trans.offset >= 0) {
            if ($scope.obj_list_visa_trans.list.length != $scope.obj_list_visa_trans.offset + $scope.obj_list_visa_trans.limit) {
                return;
            }
        }
        $scope.obj_list_visa_trans.offset += $scope.obj_list_visa_trans.limit;
        $scope.obj_list_visa_trans.load = true;

        var obj_search = angular.copy($scope.obj_list_visa_trans);
        obj_search.list = [];
        obj_search.list_df = [];

        $http.get(_url + 'ajax_get_list_visa_transaction?' + $.param(obj_search)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data,
                    _list = angular.copy($scope.obj_list_visa_trans.list);
                $.each(data, function (index, value) {
                    value.transfer_time = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm');
                    value.payment_identifier = value.payment_identifier ? value.payment_identifier : '---';
                });
                _list.push(...data);
                $scope.obj_list_visa_trans.list = _list;
                $scope.obj_list_visa_trans.list_df = _list;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_visa_trans.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.saveMpos = () => {
        var item = angular.copy($scope.obj_invoice.transaction.mpos),
            price = formatDefaultNumber(item.price),
            code = item.code,
            invoice_visa_transaction_id = item.invoice_visa_transaction_id;

        if (!$scope.checkCodeMpos(code)) return;
        if (price > 0) {
            if (!$scope.checkPriceAddVisa(price)) return;
            $scope.obj_invoice.transaction.mpos.load = true;

            $http.post(_url + 'ajax_add_mpos', {
                invoice_id: invoice.id,
                price: price,
                code: code,
                invoice_visa_transaction_id: invoice_visa_transaction_id,
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    var data = r.data.data;
                    $scope.updateListVisaByData(data);
                    showMessSuccess();
                    $scope.obj_invoice.transaction.mpos = _obj_mpos();
                    $scope.getListMposTransactions();
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_invoice.transaction.mpos.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });
        } else {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_mpos_price');
            return;
        }
    }

    $scope.confirmRemoveMpos = (key) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        var cur_obj = $scope.obj_invoice.transaction.list_mpos[key];
                        $scope._removeVisa(cur_obj.id, 1);
                    });
                });
            },
        }).then(function () {});
    }

    $scope.checkCodeMpos = (code = '') => {
        var len = code.length;
        if (len < 6 || len > 8) {
            showMessErr('Vui lòng nhập 6 đến 8 chữ số của mã giao dịch Mpos!')
            showInputErr('.vs_mpos_code');
            return false;
        }
        if (code == '000000') {
            showMessErr('Mã chuẩn chi là số 0 thì nhập 8 số cuối của mã GIAO DỊCH!')
            showInputErr('.vs_mpos_code');
            return false;
        }
        return true;
    }

    $scope.uploadFileVisa = (input, verify_payment_id = 0) => {
        var formData = new FormData();
        if (verify_payment_id) {
            file = input;
        } else {
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
        }

        formData.append('file', file);
        $scope.obj_invoice.transaction.bank.load = true;
        $http({
            method: 'POST',
            url: _url + 'ajax_upload_visa_sale_online_temp',
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.transaction.bank.image_url = r.data.data;
                $scope.obj_invoice.transaction.bank.verify_payment_id = verify_payment_id;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (response) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveFileVisa = () => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: "Sau khi xóa, bạn sẽ không hoàn nguyên!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.$apply(() => {
                    $scope._removeFileVisa($scope.obj_invoice.transaction.bank.image_url);
                    $scope.obj_invoice.transaction.bank.image_url = '';
                });
            }
        })
    }

    $scope._removeFileVisa = (url) => {
        $scope.obj_invoice.transaction.bank.load = true;
        $http.post(_url + 'ajax_remove_visa_sale_online_temp', {
            file_url: url
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.saveBank = () => {
        var item = angular.copy($scope.obj_invoice.transaction.bank),
            price = formatDefaultNumber(item.price),
            item_edit = item.item_edit,
            code = item.code,
            confirm_type = item.confirm_type,
            bank_id = item.id,
            verify_payment_id = item.verify_payment_id,
            image_url = item.image_url,
            invoice_visa_transaction_id = (item.choose_visa_trans && item.choose_visa_trans.id > 0) ? item.choose_visa_trans.id : 0,
            cr_bank = $scope.cashbook_bank.find(item => item.id === bank_id);

        if (!cr_bank) {
            showMessErr('Vui chọn tài khoản thụ hưởng');
            showInputErr('.vs_bank_id');
            return;
        }

        if (confirm_type == 'image' && !image_url) {
            showMessErr('Vui lòng up chứng từ');
            showInputErr('.vs_bank_image_url');
            return;
        }
        if (confirm_type == 'code' && !code.length) {
            showMessErr('Vui lòng nhập mã thanh toán');
            showInputErr('.vs_bank_code');
            return;
        }
        if (price == 0) {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!');
            showInputErr('.vs_bank_price');
            return;
        }

        if (invoice_visa_transaction_id && !item_edit) {
            if (price > Number(item.choose_visa_trans.amount_remain)) {
                showMessErr('Số tiền thanh toán vượt mức giao dịch đang chọn!');
                showInputErr('.vs_bank_price');
                return;
            }
        }
        var price_check = price;
        if (item_edit) {
            price_check = -item_edit.price + price;
        }
        if (!$scope.checkPriceAddVisa(price_check)) return;
        $scope.obj_invoice.transaction.bank.load = true;

        $http.post(_url + 'ajax_save_bank', {
            invoice_id: invoice.id,
            invoice_visa_id: item_edit ? item_edit.id : 0,
            code: code,
            price: price,
            bank_id: bank_id,
            image_url: image_url,
            verify_payment_id: verify_payment_id,
            confirm_type: cr_bank.confirm_type,
            invoice_visa_transaction_id: invoice_visa_transaction_id,
        }).then(r => {
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $scope.updateListVisaByData(data);
                $scope.sumbitGetListVisaTransactions();
                showMessSuccess();
                $scope.obj_invoice.transaction.bank = _obj_bank();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope._removeVisa = (invoice_visa_id, type = 1) => {
        $scope.load_tab_transaction = true;
        $http.post(_url + 'ajax_remove_visa', {
            id: invoice_visa_id,
            invoice_id: invoice.id,
        }).then(r => {
            if (r.data && r.data.status == 1) {
                var data = r.data.data;
                $scope.updateListVisaByData(data);
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Xóa thành công!'
                });
                if (type == 1) $scope.getListMposTransactions();
                if (type == 2) $scope.sumbitGetListVisaTransactions();
                if (type == 4) $scope.sumbitGetListVisaTransactions();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: r.data.message
                });
            }
            $scope.load_tab_transaction = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveBank = (key) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        var cur_obj = $scope.obj_invoice.transaction.list_bank[key];
                        $scope._removeVisa(cur_obj.id, 2);
                    });
                });
            },
        }).then(function () {});
    }

    $scope.checkVnpay = () => {
        var obj_vnpay = angular.copy($scope.obj_invoice.transaction.vnpay),
            price = formatDefaultNumber(obj_vnpay.price),
            txnId = obj_vnpay.code,
            payDate = obj_vnpay.payDate,
            data_rq = {
                txnId: txnId,
                store_id: store_id,
                payDate: '',
                invoice_type_sale: 5,
            };

        if (!txnId) {
            showMessErr('Vui lòng nhập số hóa đơn VNPAY');
            showInputErr('.vs_vnpay_code');
            return;
        }

        if (payDate) {
            if (payDate.length != 14) {
                showMessErr('Ngày khách thanh toán sai định dạng');
                showInputErr('.vs_vnpay_payDate');
                return;
            }

            payDate = payDate.replace(' / ', '/').replace(' / ', '/').split('/');
            data_rq.payDate = payDate[2] + '-' + payDate[1] + '-' + payDate[0];
        } else {
            showMessErr('Vui lòng điền ngày khách thanh toán VNPAY');
            return;
        }

        $scope.obj_invoice.transaction.vnpay.check = false;
        $scope.obj_invoice.transaction.vnpay.load = true;
        $.ajax({
            url: base_url + 'vnpay/check_transaction',
            type: 'post',
            data: data_rq,
            dataType: 'json',
            success: function (response) {
                if (response.status) {
                    var data = response.data;
                    $scope.$apply(() => {
                        $scope.obj_invoice.transaction.vnpay.check = true;
                        $scope.obj_invoice.transaction.vnpay.price = price > 0 ? price : data.debitAmount;
                        $scope.obj_invoice.transaction.vnpay.price_from_vnpay = data.debitAmount;
                    });

                    Swal.fire({
                        icon: 'success',
                        confirmButtonText: 'Đồng ý',
                        title: 'Thành công',
                        width: (window.innerWidth > 768) ? '' : '60 vw',
                        html: `<table class="table table-bordered table-striped table-vcenter" style="color: #000;">
                                    <tbody>
                                        <tr>
                                            <td>Số tiền:</td>
                                            <td><h3><b>${data.debitAmount} đ</b></h3></td>
                                        </tr>
                                        <tr>
                                            <td>Ngân hàng:</td>
                                            <td>${data.bankCode}</td>
                                        </tr>
                                        <tr>
                                            <td>Mã thanh toán:</td>
                                            <td><b>${data.txnId}</b></td>
                                        </tr>
                                        <tr>
                                            <td>Thời gian:</td>
                                            <td>${data.payDate}</td>
                                        </tr>
                                    </tbody>
                                </table>`
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi!',
                        text: response.message
                    });
                }
                $('.vs_vnpay_price').trigger('keyup');
            },
            complete: function () {
                $scope.$apply(() => {
                    $scope.obj_invoice.transaction.vnpay.load = false;
                })
            },
            error: function () {
                showMessErrSystem();
            }
        });
    }

    $scope.saveVnpay = () => {
        var item = angular.copy($scope.obj_invoice.transaction.vnpay),
            price = formatDefaultNumber(item.price),
            code = item.code,
            price_from_vnpay = formatDefaultNumber(item.price_from_vnpay);
        if (!item.check) {
            showMessErr('Mã VNPAY chưa được xác thực!')
            return;
        }
        if (price > 0) {
            if (!$scope.checkPriceAddVisa(price)) return;
            $scope.obj_invoice.transaction.vnpay.load = true;
            $http.post(_url + 'ajax_add_vnpay', {
                invoice_id: invoice.id,
                price: price,
                code: code,
                price_from_vnpay: price_from_vnpay
            }).then(r => {
                if (r.data && r.data.status == 1) {
                    var data = r.data.data;
                    $scope.updateListVisaByData(data);
                    showMessSuccess();
                    $scope.obj_invoice.transaction.vnpay = _obj_vnpay();
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_invoice.transaction.vnpay.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });
        } else {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_vnpay_price');
            return;
        }
    }

    $scope.confirmRemoveVnpay = (key) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: 'Bạn không thể hoàn nguyên điều này!',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
            showLoaderOnConfirm: true,
            preConfirm: function () {
                return new Promise(function (resolve, reject) {
                    $scope.$apply(function () {
                        var cur_obj = $scope.obj_invoice.transaction.list_vnpay[key];
                        $scope._removeVisa(cur_obj.id, 3);
                    });
                });
            },
        }).then(function () {});
    }

    $scope.clearEditInPopupVisa = () => {
        $scope.obj_invoice.transaction.mpos = _obj_mpos();
        $scope.obj_invoice.transaction.vnpay = _obj_vnpay();
        $scope.obj_invoice.transaction.bank = _obj_bank();
    }

    $scope.checkPriceAddVisa = (price_add) => {
        if (price_add > $scope.obj_invoice.amount) {
            showMessErr('Đã vượt quá số tiền cần thanh toán');
            return 0;
        }
        return 1;
    }

    $scope.savePrintInvoice = () => {
        $scope.saveInvoice(true);
    }

    $scope.openPrintInvoice = () => {
        window.open(base_url + 'invoices_v2/invoice_print_bill/' + invoice_id, '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
    }

    $scope.saveInvoice = (print = false) => {
        if ($scope.load_list) return;

        var cr_invoice = angular.copy($scope.obj_invoice),
            ring_size = cr_invoice.ring_size,
            discount = formatDefaultNumber(cr_invoice.discount),
            ship_price = formatDefaultNumber(cr_invoice.ship_price),
            list_product = {
                add: [],
                update: [],
                remove: []
            },
            list_service = {
                add: [],
                update: [],
                remove: []
            },
            list_package = {
                add: [],
                update: [],
                remove: []
            },
            list_debit = {
                remove: []
            },
            list_result = cr_invoice.list_result,
            warehouse_shipper_api_id = 0,
            list_remove_with_confirm = {
                product: {
                    remove: [],
                    update: []
                },
                service: {
                    remove: [],
                    update: []
                },
                package: {
                    remove: [],
                },
                debit: {
                    remove: [],
                }
            };

        const _list_remove_with_confirm_default = angular.copy(list_remove_with_confirm);

        if (discount > 0 && !cr_invoice.note.length) {
            showMessErr('Nhập lý do giảm giá đơn hàng vào ô ghi chú');
            showInputErr('.note-invoice');
            return;
        }

        if ($scope.checkExistFatService() && (ring_size == null || ring_size == '')) {
            showMessErr('Vui lòng nhập số do béo');
            showInputErr('.btn_edit_ring_size');
            return;
        }

        if (cr_invoice.invoice_type_sale == 5) {
            if (cr_invoice.shipper_id > 0) {
                var _shipper = $scope.list_shipper.find(x => x.id == cr_invoice.shipper_id);
                warehouse_shipper_api_id = _shipper.warehouse_shipper_api_id;
            }
        }

        if (!cr_invoice.invoice_type_return && discount && cr_invoice.total < 0) {
            showMessErr('Giảm giá đơn hàng không hợp lệ!');
            showInputErr('.discount-invoice');
            return;
        }

        $.each(list_result.products, function (index, value) {
            value.discount = formatDefaultNumber(value.discount);
            if (value.invoice_id == 0) {
                list_product.add.push(value);
            } else if (value.is_remove) {
                list_product.remove.push(value);
                if (value.is_remove_confirm) {
                    list_remove_with_confirm.product.remove = [...list_remove_with_confirm.product.remove, value];
                }
            } else if (value.need_save) {
                if ($scope.remove_need_confirm && value.quantity < value.quantity_before) {
                    list_remove_with_confirm.product.update = [...list_remove_with_confirm.product.update, value];
                }
                list_product.update.push(value);
            }
        });

        $.each(list_result.services, function (index, value) {
            value.discount = formatDefaultNumber(value.discount);
            if (value.invoice_id == 0) {
                list_service.add.push(value);
            } else if (value.is_remove) {
                if (value.is_remove_confirm) {
                    list_remove_with_confirm.service.remove = [...list_remove_with_confirm.service.remove, value];
                }
                list_service.remove.push(value);
            } else if (value.need_save) {
                if ($scope.remove_need_confirm && value.quantity < value.quantity_before) {
                    list_remove_with_confirm.service.update = [...list_remove_with_confirm.service.update, value];
                }
                list_service.update.push(value);
            }
        });

        $.each(list_result.packages, function (index, value) {
            value.price = formatDefaultNumber(value.price);
            value.pay = formatDefaultNumber(value.pay);
            value.discount = formatDefaultNumber(value.discount);
            if (value.is_remove || value.need_save) {
                if (value.is_remove) {
                    if (value.is_remove_confirm) {
                        list_remove_with_confirm.package.remove = [...list_remove_with_confirm.package.remove, value];
                    }
                    list_package.remove.push(value);
                } else if (value.invoice_id == 0) {
                    list_package.add.push(value);
                } else if (value.need_save) {
                    if (value.package_type == 'normal') {
                        $.each(value.children.services, function (k, v) {
                            v.price = formatDefaultNumber(v.price);
                        });

                        $.each(value.children.products, function (k, v) {
                            v.price = formatDefaultNumber(v.price);
                        });
                    }
                    list_package.update.push(value);
                }
            }
        });

        $.each(list_result.debits, function (index, value) {
            if (value.is_remove) {
                if (value.is_remove_confirm) {
                    list_remove_with_confirm.debit.remove = [...list_remove_with_confirm.debit.remove, value];
                }
                list_debit.remove.push(value);
            }
        });
        $scope.invoice_query = {
            invoice_id: invoice_id,
            skin_id: cr_invoice.skin_id,
            technician_id: cr_invoice.technician_id,
            created_user_id: cr_invoice.created_user_id,
            shipper_id: cr_invoice.shipper_id,
            warehouse_shipper_api_id: warehouse_shipper_api_id,
            list_result: {
                products: list_product,
                services: list_service,
                packages: list_package,
                debits: list_debit
            },
            note: cr_invoice.note,
            note_print: cr_invoice.note_print,
            discount: discount,
            ship_price: ship_price,
        };
        if (JSON.stringify(_list_remove_with_confirm_default) === JSON.stringify(list_remove_with_confirm)) {
            $scope._saveInvoice(print);
        } else {
            // xóa cần xác nhận
            $scope.obj_remove_with_confirm = _obj_remove_with_confirm();
            $scope.obj_remove_with_confirm.list = list_remove_with_confirm;
            select2(100, '#modal_remove_with_confirm select.select2');
            showPopup('#modal_remove_with_confirm');
        }
    }

    $scope._saveInvoice = (print) => {
        $scope.load_list = true;
        $http.post(_url + 'ajax_save_invoice', $scope.invoice_query).then(r => {
            if (r.data.status == 1) {
                if (print) $scope.openPrintInvoice();
                _reload();
            } else {
                showMessErr(r.data.message);
                $scope.load_list = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể cập nhật phiếu thu');
        });
    }

    $scope.saveInvoiceWhenFinished = () => {
        var cr_invoice = angular.copy($scope.obj_invoice),
            note = cr_invoice.note,
            skin_id = cr_invoice.skin_id,
            technician_id = cr_invoice.technician_id,
            note_print = cr_invoice.note_print;

        $scope.load_list = true;
        $http.post(_url + 'ajax_save_invoice_when_finished', {
            invoice_id: invoice.id,
            note: note,
            note_print: note_print,
            skin_id: skin_id,
            technician_id: technician_id,
        }).then(r => {
            if (r.data && r.data.status == 1) {
                _reload();
            } else {
                showMessErr(r.data.message);
                $scope.load_list = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể cập nhật ghi chú phiếu thu');
        });
    }

    $scope.getInvoiceDetail = () => {
        $scope.load_list = true;
        $http.get(_url + 'ajax_get_invoice_detail?invoice_id=' + invoice_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data,
                    allow_edit = data.allow_edit,
                    user_allow_edit_invoice = data.user_allow_edit_invoice,
                    data_detail = data.data_detail,
                    data_customer = data.info_customer,
                    data_config = data.data_config,
                    list_promise = data_config.list_promise,
                    list_voucher_added = data_config.list_voucher_added,
                    cashbook_bank = data_config.cashbook_bank,
                    list_saler = data_config.list_saler,
                    list_created = data_config.list_created,
                    list_technician = data_config.list_technician,
                    list_skin = data_config.list_skin,
                    list_user_confirm_remove = data_config.list_user_confirm_remove,
                    list_service_denys = data_config.list_service_denys,
                    invoice_visa = data_detail.invoice_visa,
                    products = data_detail.invoice_products,
                    services = data_detail.invoice_services,
                    packages = data_detail.invoice_customer_packages,
                    debits = data_detail.invoice_customer_package_debits,
                    units = data_detail.invoice_customer_package_units,
                    obj_online_address = data_detail.invoice_online_detail,
                    service_wait_use = data_customer.list_service_wait_use;

                $.each(products, function (index, value) {
                    value.quantity = Number(value.quantity);
                    value.quantity_debit = Number(value.quantity_debit);
                    value.load_inventory = true;
                });

                $scope.obj_invoice.list_result = {
                    products: products,
                    services: services,
                    packages: packages,
                    debits: debits,
                    units: units,
                }

                $scope.allow_edit = allow_edit;
                $scope.user_allow_edit_invoice = user_allow_edit_invoice;

                //Kế toán được chỉnh visa trong 1 tháng
                allow_accountant_edit_visa = is_accountant_edit_invoice && moment(new Date(toDay)).diff(new Date(invoice.date), 'months') <= 1;
                $scope.allow_accountant_edit_visa = allow_accountant_edit_visa;

                data_customer.packages = $scope.formatCustomerPackages(data_customer.packages);
                $scope.parseCustomerInfo(data_customer.info);
                $scope.obj_invoice.customer.info;
                $scope.obj_invoice.customer = data_customer;
                $scope.obj_invoice.service_wait_use = service_wait_use;
                $scope.obj_invoice.obj_online_address = obj_online_address;

                $scope.list_created = list_created;
                $scope.list_technician = list_technician;
                $scope.list_skin = list_skin;
                $scope.list_saler = list_saler;

                if (invoice.skin_id) {
                    var obj_skin = list_saler.find(x => x.user_id == invoice.skin_id);
                    $scope.obj_invoice.obj_skin = obj_skin;
                }

                $scope.cashbook_bank = cashbook_bank.banks;
                $scope.list_user_confirm_remove = list_user_confirm_remove;
                $scope.list_service_denys = list_service_denys;

                $scope.list_promise = list_promise;
                $scope.obj_invoice.obj_voucher.added = list_voucher_added;
                $scope.updateListInvoiceVisa(invoice_visa);
                $scope.getProductInventory();
                $scope.updateInvoice();

                if ($scope.obj_invoice.invoice_type_sale == 5) {
                    $scope.getListShipperStore();

                    var obj_stt_info = shipStatusInfo(invoice.ship_status_id);
                    $scope.obj_invoice.ship_status_html = `<label class="label ${obj_stt_info.class_name}">${obj_stt_info.name}</label>`;
                }
            } else {
                showMessErr(r.data.message);
            }
            select2();
            $scope.load_list = false;
            $('.discount-invoice').trigger('keyup');
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể lấy chi tiết phiếu thu');
        });
    }

    $scope.getListShipperStore = () => {
        $http.get(base_url + 'warehouse_shipper/ajax_get_list_shipper_store_for_invoice?shipper_id=' + invoice.shipper_id).then(r => {
            if (r.data && r.data.status) {
                $scope.list_shipper = r.data.data;
                select2();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.updateListVisaByData = (data) => {
        $scope.obj_invoice.visa = data.invoice_update.visa;
        $scope.updateListInvoiceVisa(data.list_invoice_visa);
    }

    $scope.updateListInvoiceVisa = (list) => {
        var mpos = [],
            vnpays = [],
            vnpay_spos = [],
            banks = [];
        $scope.sended_rq_visa = false;
        $.each(list, function (input, value) {
            if (value.type == 1) {
                mpos.push(value);
            } else if (value.bank_id == 9) {
                if (value.type == 3) {
                    vnpays.push(value);
                } else {
                    vnpay_spos.push(value);
                }
            } else {
                banks.push(value);
                if (value.type == 2 && value.confirm == 0) {
                    $scope.sended_rq_visa = true;
                }
            }
        });

        $scope.obj_invoice.transaction.list_mpos = mpos;
        $scope.obj_invoice.transaction.list_vnpay = vnpays;
        $scope.obj_invoice.transaction.list_vnpay_spos = vnpay_spos;
        $scope.obj_invoice.transaction.list_bank = banks;
        $scope.updateInvoice();
    }

    $scope.chooseTypeDiscountInvoice = (type) => {
        $scope.obj_invoice.discount_type = type;
        $scope.updateInvoice();
    }

    $scope.resetSearch = () => {
        $scope.filter = {
            key: '',
            type: 'product',
            load: false,
            list: {
                product: [],
                service: [],
                package: [],
            },
            show_rs: false,
            nation_id: cr_nation_id,
            store_id: invoice.store_id,
            store_type: cr_store_type,
            company_id: cr_company_id,
            store_type_package: (cr_store_type != 3 ? cr_store_type : 1).toString(),
        }
    }

    $scope.resetSearchGift = () => {
        $scope.filter_gift = {
            key: '',
            type: 'product',
            load: false,
            list: {
                product: [],
                service: [],
                package: [],
            },
            show_rs: false,
            nation_id: cr_nation_id,
            store_id: invoice.store_id,
            store_type: cr_store_type,
            company_id: cr_company_id,
            store_type_package: (cr_store_type != 3 ? cr_store_type : 1).toString(),
        }
    }

    $scope.resetCustomerPackageDebitHistory = () => {
        $scope.obj_invoice.obj_edit.debit = _obj_customer_package_debit_history();
    }

    $scope.resetCustomerPackageHistory = () => {
        $scope.obj_invoice.customer_package_history = _obj_customer_package_history();
    }

    $scope.focusInSearchGift = (e) => {
        scrollBoxSearchGift();
        $(e).parent().find('.fa-search').addClass('text-danger');
        setTimeout(() => {
            $scope.filter_gift.show_rs = true;
            $scope.$apply();
        }, time_blur + 1);
    }

    $scope.focusOutSearchGift = (e) => {
        $(e).parent().find('.fa-search').removeClass('text-danger');
        setTimeout(() => {
            $scope.filter_gift.show_rs = false;
            $scope.$apply();
        }, time_blur);
    }

    $scope.chooseTypeGift = (type) => {
        $scope.filter_gift.type = type;
        $scope.searchWithTypeGift();
        focusSearchGift();
    }

    $scope.searchWithTypeGift = () => {
        let filter_gift = angular.copy($scope.filter_gift),
            key = filter_gift.key,
            type = filter_gift.type;

        if (key.length < 3) return;

        $scope.filter_gift.limit = 20;
        $scope.filter_gift.offset = 0;
        $scope.filter_gift.list.product = [];
        $scope.filter_gift.list.package = [];
        $scope.filter_gift.list.service = [];
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            if (type == 'product') {
                $scope.searchProductGift();
            } else if (type == 'service') {
                $scope.searchServiceGift();
            } else {
                $scope.filter_gift.offset = -20;
                $scope.searchPackageGift();
            }
        }, 350);
    }

    $scope.searchProductGift = () => {
        var filter = angular.copy($scope.filter_gift),
            key = filter.key;
        if (key.length < 3) return;

        var data_rq = {
            key: key,
            store_type: cr_store_type,
            nation_id: filter.nation_id,
            company_id: filter.company_id,
        };
        $scope.filter_gift.load = true;
        $http.get(_url + 'ajax_get_product_retail_by_key?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter_gift.list.product = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_gift.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm sản phẩm');
        });
    }

    $scope.searchServiceGift = () => {
        var filter = angular.copy($scope.filter_gift),
            key = filter.key;
        if (key.length < 3) return;

        var data_rq = {
            key: key,
            store_type: filter.store_type,
            nation_id: filter.nation_id,
            company_id: filter.company_id,
        };
        $scope.filter_gift.load = true;
        $http.get(_url + 'ajax_get_service_by_key?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter_gift.list.service = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_gift.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm dịch vụ');
        });
    }

    $scope.loadMorePackageGift = (e) => {
        var self = $(e);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            $scope.searchPackageGift();
        }
    }

    $scope.searchPackageGift = () => {
        let key = $scope.filter_gift.key,
            date_rq = {};

        if (key.length < 3) return;
        if ($scope.filter_gift.load) return;

        if ($scope.filter_gift.offset >= 0) {
            if ($scope.filter_gift.list.package.length != $scope.filter_gift.offset + $scope.filter_gift.limit) {
                return;
            }
        }
        $scope.filter_gift.offset += $scope.filter_gift.limit;

        date_rq = angular.copy($scope.filter_gift);
        date_rq.store_type = date_rq.store_type_package;
        date_rq.type = 'normal';
        date_rq.list = [];
        $scope.filter_gift.load = true

        $http.get(_url + 'ajax_get_package_by_key?' + $.param(date_rq)).then(r => {
            if (r.data && r.data.status) {
                if (r.data.data.length) {
                    $scope.filter_gift.list.package.push(...r.data.data);
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_gift.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm danh sách gói');
        });
    }

    $scope.rechargeGift = () => {
        var cp_history = angular.copy($scope.obj_invoice.customer_package_history),
            edit_push = cp_history.obj_edit.push_price,
            price = formatDefaultNumber(edit_push.price),
            customer_package_id = cp_history.info.item.customer_package_id;

        if (!price) {
            showMessErr('Tiền nạp gift phải lớn hơn 0!');
            showInputErr('.item-push-gift');
            return;
        }

        $scope.obj_invoice.customer_package_history.obj_edit.push_price.load = true;
        $http.post(_url + 'ajax_recharge_gift', {
            customer_package_id: customer_package_id,
            price: price,
            invoice_id: invoice_id
        }).then(r => {
            $scope.obj_invoice.customer_package_history.obj_edit.push_price.load = false;
            if (r.data && r.data.status) {
                $scope.obj_invoice.list_result.services.push(r.data.data.item_added);
                showMessSuccess('Nạp tiền gift thành công');
                $scope.getCustomerPackageHistory(customer_package_id);
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.buyItemInGift = (item, type) => {
        var customer_package_id = $scope.obj_invoice.customer_package_history.info.item.customer_package_id;

        $scope.obj_invoice.customer_package_history.load = true;
        $http.post(_url + 'ajax_use_item_by_gift_id', {
            customer_package_id: customer_package_id,
            unit_id: item.id,
            discount: item.discount,
            price: item.price,
            invoice_id: invoice_id,
            type: type,
            customer_id: invoice.customer_id,
        }).then(r => {
            $scope.obj_invoice.customer_package_history.load = false;
            if (r.data && r.data.status) {
                showMessSuccess('Thêm thành công');
                $scope.getInvoiceCustomerPackageUnit();
                $scope.getCustomerPackageHistory(customer_package_id);
                if (type == 'package') $scope.getCustomerPackage();
                if (type == 'product') $scope.getProductInventory();
                hidePopup('#modal_edit_choose_item_gift');
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmChooseItemGift = (item, type) => {
        var _created = $scope.obj_invoice.customer_package_history.info.item.created,
            before_deloy = _created && _created < date_deployment_service_denys;

        if (type == 'product') {
            item.discount = $scope.obj_invoice.customer_package_history.info.item.package_product_saleof;
        } else if (type == 'service') {
            item.discount = $scope.obj_invoice.customer_package_history.info.item.package_service_saleof;
        } else if (type == 'package') {
            item.discount = $scope.obj_invoice.customer_package_history.info.item.package_package_saleof;
        }

        if (!before_deloy) {
            if (['service', 'product'].includes(type)) {
                if ($scope.checkExistInServiceDenys(item.id, type)) return;
            } else if (type == 'package') {
                if (item.is_deny) {
                    showMessErr('Gói chứa dịch vụ không được phép bán');
                    return;
                }
            }
        }

        $scope.resetEditChooseItemGift();

        var _item = angular.copy(item),
            cr_package_id = $scope.obj_invoice.customer_package_history.info.item.package_id;

        if (cr_package_id == gift_online_id && type == 'product' || (['product', 'service'].includes(type) && item.price_max != 0)) {
            $scope.obj_edit_choose_item_gift.item = _item;
            $scope.obj_edit_choose_item_gift.discount = _item.discount;
            $scope.obj_edit_choose_item_gift.type = type;
            $scope.obj_edit_choose_item_gift.price = _item.price;
            showPopup('#modal_edit_choose_item_gift');
            setTimeout(() => {
                $('#modal_edit_choose_item_gift input[data-type="currency"]').trigger('keyup');
            }, 0);
            return;
        }

        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: `Dùng gift mua <b>${item.description}</b>!`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                setTimeout(() => {
                    $scope.buyItemInGift(item, type);
                    $scope.$apply();
                }, 0);
            }
        })
    }

    $scope.saveEditChooseItemGift = () => {
        var _obj = angular.copy($scope.obj_edit_choose_item_gift),
            type = _obj.type,
            price = formatDefaultNumber(_obj.price),
            discount = formatDefaultNumber(_obj.discount),
            price_min = Number(_obj.item.price_min),
            price_max = Number(_obj.item.price_max);

        if (discount > 100) {
            showMessErr('Giảm giá không hợp lệ');
            return;
        }
        if (price < price_min || (price_max > 0 && price > price_max)) {
            showMessErr('Giá bán không hợp lệ');
            return;
        }
        $scope.buyItemInGift({
            id: _obj.item.id,
            discount: discount,
            price: price,
            invoice_id: invoice_id,
            type: type,
            customer_id: invoice.customer_id,
        }, type);
    }

    $scope.resetEditChooseItemGift = () => {
        $scope.obj_edit_choose_item_gift = {
            item: null,
            price: '',
            type: '',
            discount: '',
            discount_type: 'percent',
        }
    }

    $scope.chooseType = (type) => {
        $scope.filter.type = type;
        $scope.searchWithType();
        focusSearch();
    }

    $scope.focusInSearch = (e) => {
        $(e).parent().find('.fa-search').addClass('text-danger');
        setTimeout(() => {
            $scope.filter.show_rs = true;
            $scope.$apply();
        }, time_blur + 1);
    }

    $scope.focusOutSearch = (e) => {
        $(e).parent().find('.fa-search').removeClass('text-danger');
        setTimeout(() => {
            $scope.filter.show_rs = false;
            $scope.$apply();
        }, time_blur);
    }

    $scope.searchWithType = () => {
        var filter = angular.copy($scope.filter),
            key = filter.key,
            type = filter.type;

        if (key.length < 3) return;
        $scope.filter.limit = 20;
        $scope.filter.offset = 0;
        $scope.filter.list.product = [];
        $scope.filter.list.package = [];
        $scope.filter.list.service = [];
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            if (type == 'product') {
                $scope.searchProduct();
            } else if (type == 'service') {
                $scope.searchService();
            } else {
                $scope.filter.offset = -20;
                $scope.searchPackage();
            }
        }, 350);
    }

    $scope.searchProduct = () => {
        var filter = angular.copy($scope.filter),
            key = filter.key;
        if (key.length < 3) return;

        var data_rq = {
            key: key,
            store_type: cr_store_type,
            nation_id: filter.nation_id,
            company_id: filter.company_id,
        };
        $scope.filter.load = true;
        $http.get(_url + 'ajax_get_product_retail_by_key?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter.list.product = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm sản phẩm');
        });
    }

    $scope.searchScanner = (barcode) => {
        $http.get(_url + 'ajax_get_product_retail_by_barcode?barcode=' + barcode).then(r => {
            if (r.data && r.data.status) {
                var product = r.data.data;
                if (product) {
                    $scope.chooseProductScanner(product);
                } else {
                    showMessInfo('Không tìm thấy sản phẩm: ' + barcode);
                    showSoundErr();
                }
            }
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm sản phẩm với barcode');
        });
    }

    $scope.searchService = () => {
        var filter = angular.copy($scope.filter),
            key = filter.key;
        if (key.length < 3) return;

        var data_rq = {
            key: key,
            store_type: filter.store_type,
            nation_id: filter.nation_id,
            company_id: filter.company_id,
        };
        $scope.filter.load = true;
        $http.get(_url + 'ajax_get_service_by_key?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter.list.service = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm dịch vụ');
        });
    }

    $scope.loadMorePackage = (e) => {
        var self = $(e);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            $scope.searchPackage();
        }
    }

    $scope.searchPackage = () => {
        let key = $scope.filter.key,
            date_rq = {};

        if (key.length < 3) return true;

        if ($scope.filter.load) {
            return;
        }
        if ($scope.filter.offset >= 0) {
            if ($scope.filter.list.package.length != $scope.filter.offset + $scope.filter.limit) {
                return;
            }
        }
        $scope.filter.offset += $scope.filter.limit;

        date_rq = angular.copy($scope.filter);
        date_rq.store_type = date_rq.store_type_package;
        date_rq.type = '';
        date_rq.list = [];
        $scope.filter.load = true

        $http.get(_url + 'ajax_get_package_by_key?' + $.param(date_rq)).then(r => {
            if (r.data && r.data.status) {
                if (r.data.data.length) {
                    $scope.filter.list.package.push(...r.data.data);
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm danh sách gói');
        });
    }

    $scope.hideRsFilter = () => {
        setTimeout(() => {
            $scope.filter.show_rs = false;
            $scope.$apply();
        }, 300)
    }

    $scope.chooseProductScanner = (item) => {
        var product = angular.copy(item),
            pro_formated = $scope.setDefaultItem(product);

        pro_formated.product_id = product.id;
        pro_formated.need_save = true;
        $scope.obj_invoice.list_result.products.push(pro_formated);
        $scope.updateInvoice();
    }

    $scope.chooseProduct = (item) => {
        $scope.filter.key = '';
        var product = angular.copy(item),
            pro_formated = $scope.setDefaultItem(product);

        pro_formated.product_id = product.id;
        $scope.modalProduct(pro_formated);
    }

    $scope.modalProduct = (item) => {
        if (item.is_remove) {
            showMessErr('Hãy gỡ xóa để tiếp tục');
            return;
        }
        item.quantity = Number(item.quantity);
        item.index_of = $scope.obj_invoice.list_result.products.indexOf(item);
        $scope.obj_invoice.obj_edit.product = angular.copy(item);
        showPopup('#modal_product');
        setTimeout(() => {
            $('#modal_product input[data-type="currency"]').trigger('keyup');
        }, 0)
    }

    $scope.saveItemProduct = () => {
        var product = angular.copy($scope.obj_invoice.obj_edit.product),
            index_of = product.index_of;

        product.discount = formatDefaultNumber(product.discount);
        product.price = formatDefaultNumber(product.price);
        product.price_min = Number(product.price_min);
        product.price_max = Number(product.price_max);
        product.total = $scope.totalItem(product);
        product.need_save = true;

        if (product.price_max > 0 && (product.price < product.price_min || product.price > product.price_max)) {
            showMessErr('Giá bán không hợp lệ');
            return;
        }

        if (!(product.quantity > 0)) {
            showMessErr('Số lượng không hợp lệ');
            showInputErr('#modal_product .quantity');
            return;
        }

        if (!(product.quantity_debit >= 0)) {
            showMessErr('Số lượng nợ không hợp lệ');
            showInputErr('#modal_product .quantity_debit');
            return;
        }

        if (product.discount > 0) {
            if (product.total < 0) {
                showMessErr('Giảm giá không hợp lệ');
                showInputErr('#modal_product .discount');
                return;
            }
            if (product.note == '') {
                showMessErr('Vui lòng nhập lý do giảm giá!');
                showInputErr('#modal_product .note');
                return;
            }
        } else {
            product.note = '';
        }

        if (index_of == -1) {
            $scope.obj_invoice.list_result.products.push(product);
            $scope.getProductInventory();
        } else {
            $scope.obj_invoice.list_result.products[index_of] = product;
            $scope.checkReustProductInventory();
        }
        hidePopup('#modal_product');
        $scope.updateInvoice();
    }

    $scope.toggleRemoveProduct = (item) => {
        if (item.invoice_id) { // nó đã được insert vào data trước đo nên update trường is_remove thôi
            if ($scope.remove_need_confirm && item.total_before > 0 && !item.is_remove) {
                /**
                 * Đã in rồi
                 * total trong db total_before > 0 
                 */
                item.is_remove_confirm = true;
            }

            item.is_remove = !item.is_remove;
        } else {
            var index = $scope.obj_invoice.list_result.products.indexOf(item);
            $scope.obj_invoice.list_result.products.splice(index, 1);
        }
        $scope.updateInvoice();
        $scope.checkReustProductInventory();
    }

    $scope._removeInvoiceProduct = (item) => {
        $scope.load_result_invoice = true;
        $scope.obj_remove_detail_with_confirm_user.load = true;
        $http.post(_url + 'ajax_remove_invoice_product', {
            id: item.invoice_product_id,
            obj_remove_confirm_user: item.obj_remove_confirm_user
        }).then(r => {
            if (r.data && r.data.status) {
                var index = $scope.obj_invoice.list_result.products.indexOf(item);
                $scope.obj_invoice.list_result.products.splice(index, 1);
                showMessSuccess('Xóa thành công');
                hidePopup('#modal_remove_detail_with_confirm_user');
                $scope.updateInvoice();
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_result_invoice = false;
            $scope.obj_remove_detail_with_confirm_user.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseService = (item) => {
        $scope.filter.key = '';
        var service = angular.copy(item),
            ser_formated = $scope.setDefaultItem(service);

        if ($scope.checkExistInServiceDenys(service.id)) return;

        ser_formated.service_id = service.id;
        $scope.modalService(ser_formated);
    }

    $scope.checkExistInServiceDenys = (unit_id, type = 'service') => {
        var is_deny = $scope.list_service_denys.find(x => x.unit_id == unit_id && x.type == type);
        if (is_deny) {
            showMessErr((type == 'service' ? 'Dịch vụ' : 'Sản phẩm') + ' không được phép bán/ dùng  ở Chi nhánh!');
        }
        return is_deny;
    }

    $scope.modalService = (item) => {
        if (item.is_remove) {
            showMessErr('Hãy gỡ xóa để tiếp tục');
            return;
        }
        item.quantity = Number(item.quantity);

        if (item.gift_id > 0) {
            showMessInfo('Không thể chỉnh sửa giá trị Nạp gift');
            return;
        }

        if (item.service_id == service_km_id) {
            showMessInfo('Dịch vụ khuyến mãi không thể chỉnh sửa');
            return;
        }

        if (item.used > 0) {
            showMessInfo('Dịch vụ dùng lại không thể chỉnh sửa');
            return;
        }
        item.index_of = $scope.obj_invoice.list_result.services.indexOf(item);
        $scope.obj_invoice.obj_edit.service = angular.copy(item);
        showPopup('#modal_service');
        setTimeout(() => {
            $('#modal_service input[data-type="currency"]').trigger('keyup');
        }, 0)
    }

    $scope.saveItemService = () => {
        var service = angular.copy($scope.obj_invoice.obj_edit.service),
            index_of = service.index_of;

        service.discount = formatDefaultNumber(service.discount);
        service.price = formatDefaultNumber(service.price);
        service.price_min = Number(service.price_min);
        service.price_max = Number(service.price_max);
        service.total = $scope.totalItem(service);
        service.need_save = true;

        if (service.price_max > 0 && (service.price < service.price_min || service.price > service.price_max)) {
            showMessErr('Giá bán không hợp lệ');
            return;
        }

        if (service.quantity > 0) {
            if (service.used == -1 && service.quantity > 1) {
                showMessErr('Chỉ tích Chưa dùng khi số lượng dịch vụ là 1');
                showInputErr('#modal_service .used');
                return;
            }
        } else {
            showMessErr('Số lượng không hợp lệ');
            showInputErr('#modal_service .quantity');
            return;
        }

        if (service.technician_id > 0) {
            if (service.used != 0 && store_use_choose_staff) {
                showMessErr('Dịch vụ được tích KTV bắt buộc ở trạng thái Đã dùng! Gỡ KTV để tiếp tục');
                showInputErr('#modal_service .used');
                return;
            }
        }

        if (service.discount > 0) {
            if (service.total < 0) {
                showMessErr('Giảm giá không hợp lệ');
                showInputErr('#modal_service .discount');
                return;
            }
            if (service.note == '') {
                showMessErr('Vui lòng nhập lý do giảm giá!');
                showInputErr('#modal_service .note');
                return;
            }
        } else {
            service.note = '';
        }

        if (index_of == -1) {
            $scope.obj_invoice.list_result.services.push(service);
        } else {
            $scope.obj_invoice.list_result.services[index_of] = service;
        }
        hidePopup('#modal_service');
        $scope.updateInvoice();
    }

    $scope._removeInvoiceService = (item) => {
        $scope.load_result_invoice = true;
        $scope.obj_remove_detail_with_confirm_user.load = true;
        $http.post(_url + 'ajax_remove_invoice_service', {
            id: item.invoice_service_id,
            obj_remove_confirm_user: item.obj_remove_confirm_user
        }).then(r => {
            if (r.data && r.data.status) {
                var index = $scope.obj_invoice.list_result.services.indexOf(item);
                $scope.obj_invoice.list_result.services.splice(index, 1);
                showMessSuccess('Xóa thành công');
                hidePopup('#modal_remove_detail_with_confirm_user');
                $scope.updateInvoice();
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_result_invoice = false;
            $scope.obj_remove_detail_with_confirm_user.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope._removeInvoiceServiceWaitUse = (item) => {
        $scope.load_result_invoice = true;
        $http.post(_url + 'ajax_remove_invoice_service_wait', {
            id: item.invoice_service_id,
        }).then(r => {
            if (r.data && r.data.status) {
                var index = $scope.obj_invoice.list_result.services.indexOf(item);
                $scope.obj_invoice.list_result.services.splice(index, 1);
                showMessSuccess('Xóa thành công');
                $scope.getListServiceWaitUse();
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_result_invoice = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.useServiceWait = (value) => {
        $scope.load_cpu = true;
        $http.post(_url + 'ajax_use_service_wait', {
            invoice_id: invoice_id,
            invoice_service_id: value.invoice_service_id,
        }).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.list_result.services.push(r.data.data.item_added);
                showMessSuccess();
                $scope.getListServiceWaitUse();
            } else {
                showMessErr(r.data.message);
                $scope.load_cpu = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getListServiceWaitUse = () => {
        $scope.load_cpu = true;
        $http.get(_url + 'ajax_get_list_service_wait_use?customer_id=' + invoice.customer_id).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.service_wait_use = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_cpu = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể lấy dịch vụ chưa dùng');
        });
    }

    $scope.toggleRemoveService = (item) => {
        if (item.invoice_id) { // nó đã được insert vào data trước đo nên update trường is_remove thôi
            if ($scope.remove_need_confirm && item.total_before > 0 && !item.is_remove) {
                item.is_remove_confirm = true;
            } else {
                if (item.gift_id > 0) { // dich vụ nạp gift
                    Swal.fire({
                        title: 'Bạn có chắc chắn?',
                        html: "Xóa Nạp thẻ gift?",
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'Hủy',
                        confirmButtonText: 'Đồng ý',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $scope._removeInvoiceService(item);
                        }
                    });
                    return;
                }

                if (item.used > 0) {
                    Swal.fire({
                        title: 'Bạn có chắc chắn?',
                        html: "Xóa dịch vụ dùng lại?",
                        icon: 'warning',
                        showCancelButton: true,
                        cancelButtonText: 'Hủy',
                        confirmButtonText: 'Đồng ý',
                        allowOutsideClick: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            $scope._removeInvoiceServiceWaitUse(item);
                        }
                    });
                    return;
                }
            }

            item.is_remove = !item.is_remove;
        } else {
            var index = $scope.obj_invoice.list_result.services.indexOf(item);
            $scope.obj_invoice.list_result.services.splice(index, 1);
        }
        $scope.updateInvoice();
    }

    $scope.choosePackage = (item) => {
        $scope.filter.key = '';
        var package = angular.copy(item),
            package_formated = $scope.setDefaultPackage(package);

        if (item.is_deny) {
            showMessErr('Gói chứa dịch vụ không được phép bán');
            return;
        }
        $scope.obj_invoice.obj_edit.package.load = false;
        $scope.modalPackage(package_formated);
    }

    $scope.changeDiscountPackage = () => {
        var discount = formatDefaultNumber($scope.obj_invoice.obj_edit.package.discount),
            discount_type = $scope.obj_invoice.obj_edit.package.discount_type,
            cost = formatDefaultNumber($scope.obj_invoice.obj_edit.package.cost),
            price = 0;

        if (discount_type == 'percent') {
            price = cost - (cost * (discount / 100));
        } else {
            price = cost - discount;
        }
        $scope.obj_invoice.obj_edit.package.price = _formatValueCurrency(price);
        $scope.formatUnitInPackage();
    }

    $scope.formatUnitInPackage = () => {
        if ($scope.obj_invoice.obj_edit.package.package_type != 'normal') return;

        $.each($scope.obj_invoice.obj_edit.package.children.services, function (index, value) {
            value.price = _formatValueCurrency(value.price);
            value.total = value.quantity * formatDefaultNumber(value.price);
        });
        $.each($scope.obj_invoice.obj_edit.package.children.products, function (index, value) {
            value.price = _formatValueCurrency(value.price);
            value.total = value.quantity * formatDefaultNumber(value.price);
        });
    }

    $scope.changePricePackage = () => {
        var current_price = formatDefaultNumber($scope.obj_invoice.obj_edit.package.price),
            cost = formatDefaultNumber($scope.obj_invoice.obj_edit.package.cost),
            discount = formatDefaultNumber(cost - current_price);

        $scope.obj_invoice.obj_edit.package.discount_type = 'amount';
        $scope.obj_invoice.obj_edit.package.discount = _formatValueCurrency(discount);
    }

    $scope.changePriceUnitPackage = () => {
        var cost = 0;
        if ($scope.obj_invoice.obj_edit.package.children.services.length) {
            cost += $scope.obj_invoice.obj_edit.package.children.services.map(x => formatDefaultNumber(x.price) * x.quantity).reduce((a, c) => {
                return a + c;
            });
        }
        if ($scope.obj_invoice.obj_edit.package.children.products.length) {
            cost += $scope.obj_invoice.obj_edit.package.children.products.map(x => formatDefaultNumber(x.price) * x.quantity).reduce((a, c) => {
                return a + c;
            });
        }
        $scope.obj_invoice.obj_edit.package.cost = cost;
        $scope.changePricePackage();
    }

    $scope.modalPackage = (item) => {
        if (item.is_remove) {
            showMessErr('Hãy gỡ xóa để tiếp tục');
            return;
        }
        showPopup('#modal_package');
        item.index_of = $scope.obj_invoice.list_result.packages.indexOf(item);
        if (item.package_type == 'normal') {
            if (item.children && (item.children.services.length || item.children.products.length)) {
                $scope.obj_invoice.obj_edit.package = angular.copy(item);
                setTimeout(() => {
                    $('#modal_package input[data-type="currency"]').trigger('keyup');
                }, 0);
            } else {
                $scope.obj_invoice.obj_edit.package.load = true;
                var data_rq = {
                    id: item.package_id,
                    customer_package_id: item.invoice_customer_package_id > 0 ? item.invoice_customer_package_id : 0
                };
                $http.get(_url + 'ajax_get_package_details?' + $.param(data_rq)).then(r => {
                    if (r.data && r.data.status) {
                        var data = r.data.data;
                        item.children = {
                            services: data.services,
                            products: data.products,
                        }
                        item.min_price = data.min_price;

                        $scope.obj_invoice.obj_edit.package = angular.copy(item);
                        if (item.invoice_customer_package_id) {
                            $scope.formatUnitInPackage();
                        } else {
                            $scope.changeDiscountPackage();
                        }
                        setTimeout(() => {
                            $('#modal_package .detail-r input[data-type="currency"]').trigger('keyup');
                        }, 0);
                    } else {
                        showMessErr(r.data.message);
                    }
                    $scope.obj_invoice.obj_edit.package.load = false;
                }, function (data, status, headers, config) {
                    showMessErrSystem('Không thể lấy thông tin chi tiết gói');
                });
            }
        } else {
            $scope.obj_invoice.obj_edit.package = angular.copy(item);
            $scope.changeDiscountPackage();
            setTimeout(() => {
                $('#modal_package input[data-type="currency"]').trigger('keyup');
            }, 0);
        }
    }

    $scope.saveItemPackage = () => {
        var package = angular.copy($scope.obj_invoice.obj_edit.package),
            index_of = package.index_of,
            error = 0;

        if (package.package_type == 'normal') {
            $.each([...package.children.services, ...package.children.products], function (index, value) {
                var price = value.price = formatDefaultNumber(value.price),
                    price_min = formatDefaultNumber(value.price_min),
                    price_max = formatDefaultNumber(value.price_max);

                if (price_max && (price < price_min || price > price_max)) {
                    error = 1;
                    showMessErr(value.description + `: giá không hợp lệ (${parseNumber(price_min)} - ${parseNumber(price_max)})`);
                    return false;
                }
            });
            if (error) return;
        }

        package.min_price = Number(package.min_price);
        package.price = formatDefaultNumber(package.price);
        package.pay = formatDefaultNumber(package.pay);
        package.debit = package.price - package.pay;
        package.discount = formatDefaultNumber(package.discount);
        package.need_save = true;

        if (package.discount > 0) {
            if (package.discount_type == 'percent') {
                if (package.discount > 100) {
                    showMessErr('Giảm giá không hợp lệ');
                    showInputErr('#modal_package .discount');
                    return;
                }
            } else {
                if (package.discount > package.cost) {
                    showMessErr('Giảm giá không hợp lệ');
                    showInputErr('#modal_package .discount');
                    return;
                }
            }

            if (package.note == '') {
                showMessErr('Vui lòng nhập lý do giảm giá!');
                showInputErr('#modal_package .note');
                return;
            }
        } else {
            package.note = '';
        }

        if (package.pay > package.price) {
            showMessErr('Trả trước không hợp lệ!');
            showInputErr('#modal_package .pay');
            return;
        }

        // if (package.price < package.min_price) {
        //     showMessErr('Giá bán không được thấp hơn mức cho phép!');
        //     showInputErr('#modal_package .price');
        //     return;
        // }
        if (index_of == -1) {
            $scope.obj_invoice.list_result.packages.push(package);
        } else {
            $scope.obj_invoice.list_result.packages[index_of] = package;
        }
        hidePopup('#modal_package');
        $scope.updateInvoice();
    }

    $scope.setDefaultPackage = (item) => {
        var price = formatDefaultNumber(item.price);
        item.invoice_id = 0;
        item.invoice_type = '1';
        item.package_id = item.id;
        item.pay = 0;
        item.total = price;
        item.min_price = 0;
        item.children = {
            services: [],
            products: [],
        }
        item.discount = 0;
        item.discount_type = 'percent';
        item.note = '';
        item.package_product_saleof = item.product_saleof;
        item.package_service_saleof = item.service_saleof;
        item.package_package_saleof = item.package_saleof;
        return item;
    }

    $scope.confirmRemovePackage = (item) => {
        if (item.invoice_id) { // nó đã được insert vào data trước đo nên update trường is_remove thôi
            if ($scope.remove_need_confirm && item.pay_before > 0) {
                if (!item.is_remove) {
                    item.is_remove_confirm = true;
                }
                item.is_remove = !item.is_remove;
            } else {
                Swal.fire({
                    title: 'Bạn có chắc?',
                    html: `Xóa gói: <b>${item.description}</b>!`,
                    icon: 'warning',
                    showCancelButton: true,
                    cancelButtonText: 'Hủy',
                    confirmButtonText: 'Đồng ý',
                    allowOutsideClick: false,
                    showLoaderOnConfirm: true,
                    preConfirm: function () {
                        return new Promise(function (resolve, reject) {
                            $scope._removeCustomerPackage(item);
                        });
                    },
                }).then(function () {});
            }
        } else {
            var index = $scope.obj_invoice.list_result.packages.indexOf(item);
            $scope.obj_invoice.list_result.packages.splice(index, 1);
        }
        $scope.updateInvoice();
    }

    $scope._removeCustomerPackage = (item) => {
        $scope.load_result_invoice = true;
        $scope.obj_remove_detail_with_confirm_user.load = true;
        $http.post(_url + 'ajax_remove_customer_package', {
            id: item.invoice_customer_package_id,
            obj_remove_confirm_user: item.obj_remove_confirm_user
        }).then(r => {
            if (r.data && r.data.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thông báo',
                    text: 'Xóa gói thành công!'
                });
                _reload();
                hidePopup('#modal_remove_detail_with_confirm_user');
            } else {
                Swal.close();
                showMessErr(r.data.message);
                $scope.load_result_invoice = false;
                $scope.obj_remove_detail_with_confirm_user.load = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    document.addEventListener('mouseover', function (e) {
        var self = $(e.target),
            hover_in = self.closest('.list-package-search').length;
        if (!hover_in) {
            $scope.$apply(() => {
                $scope.resetInfoPackageHover();
            })
        }
    });

    $scope.hideInfoPackageHover = () => {
        $scope.obj_pk_info_hover.is_show = false;
    }

    $scope.hoverPackageSearchIn = (item) => {
        if (window.innerWidth <= 1024) {
            return;
        }
        if ($scope.obj_pk_info_hover.children && $scope.obj_pk_info_hover.id == item.id && $scope.obj_pk_info_hover.is_show) {
            return;
        }
        $scope.resetInfoPackageHover();
        if ($scope.timer_pk_hover) {
            clearTimeout($scope.timer_pk_hover);
        }
        $scope.timer_pk_hover = setTimeout(() => {
            $scope.obj_pk_info_hover.is_show = true;
            $scope.getInfoPackageHover(item);
            $scope.$apply();
        }, 350);
    }

    $scope.resetInfoPackageHover = () => {
        $scope.obj_pk_info_hover = _obj_pk_info_hover();
    }

    $scope.getInfoPackageHover = (item) => {
        $scope.obj_pk_info_hover.package_type = item.package_type;
        $scope.obj_pk_info_hover.product_saleof = item.product_saleof;
        $scope.obj_pk_info_hover.service_saleof = item.service_saleof;
        $scope.obj_pk_info_hover.package_saleof = item.package_saleof;
        $scope.obj_pk_info_hover.cost = item.cost;
        $scope.obj_pk_info_hover.id = item.id;

        if (item.package_type == 'normal') {
            $scope.obj_pk_info_hover.load = true;
            $http.get(_url + 'ajax_get_package_details?id=' + item.id).then(r => {
                if (r.data && r.data.status) {
                    let data = r.data.data;
                    $scope.obj_pk_info_hover.children = {
                        services: data.services,
                        products: data.products,
                    }
                    $scope.obj_pk_info_hover.min_price = data.min_price;
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_pk_info_hover.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem('Không thể lấy thông tin chi tiết gói');
            });
        }
    }

    $scope.setDefaultItem = (item) => {
        item.invoice_id = 0;
        item.invoice_type = '1';
        item.image_url = item.image_url ? item.image_url : '';
        item.quantity = 1;
        item.quantity_debit = 0;
        item.discount = '';
        item.discount_type = 'percent';
        item.note = '';
        item.used = '0';
        item.is_remove = false;
        item.need_save = false;
        item.total = $scope.totalItem(item);
        item.sale_user_id = '0';
        item.technician_id = '0';
        item.load_inventory = true;
        item.out_of_tock = false;
        return item;
    }

    $scope.totalItem = (value) => {
        var item = angular.copy(value),
            quantity = item.quantity ? item.quantity : 1,
            total_format = $scope.priceSale(item) * quantity;

        return parseFloat(total_format);
    }

    $scope.parseNumToArrr = (unit) => {
        if (!unit) return [0];

        var num_for = unit.quantity - unit.used,
            arr_return = [];

        if (num_for > 0) {
            arr_return = Array.from({
                length: num_for
            }, (v, k) => k + 1);
        } else if (unit.allow_use_guarantee != 0 && unit.type == 'service') {
            arr_return = [1];
        } else {
            arr_return = [0];
        }

        return arr_return;
    }

    $scope.priceSale = (value) => {
        var item = angular.copy(value),
            price = formatDefaultNumber(item.price),
            price_sale = price,
            discount_type = item.discount_type,
            discount = formatDefaultNumber(item.discount);

        if (price > 0 && discount > 0) {
            if (discount_type == 'percent') {
                price_sale = price - (price * discount / 100);
            } else {
                price_sale = price - discount;
            }
        }
        return price_sale;
    }

    $scope.parseCustomerInfo = (info) => {
        info.obj_user_collaborator = info.obj_user_collaborator ? JSON.parse(info.obj_user_collaborator) : null;
        info.list_address = _jsonArr(info.list_address);
        $scope.obj_invoice.customer.info = info;
        if ($scope.obj_invoice.customer.info.gender == 0 && $scope.checkShow('show_edit_customer')) {
            $scope.showPoupEditCustomer();
        }
    }

    $scope.formatCustomerPackages = (data) => {
        $.each(data, function (index, value) {
            value.obj_unit = JSON.parse(value.obj_unit);
            if (value.obj_unit && value.obj_unit.length) {
                $.each(value.obj_unit, function (key, unit) {
                    unit.quantity = Number(unit.quantity);
                    unit.used = Number(unit.used);
                });
            }
        });

        return data;
    };

    $scope.updateInvoice = () => {
        var cr_invoice = angular.copy($scope.obj_invoice),
            price = 0,
            price_invoice_type_1 = 0,
            price_invoice_type_2 = 0,
            discount = formatDefaultNumber(cr_invoice.discount),
            discount_type = cr_invoice.discount_type,
            discount_change = formatDefaultNumber(cr_invoice.discount_change),
            ship_price = formatDefaultNumber(cr_invoice.ship_price),
            total = 0,
            amount = 0,
            visa = 0,
            list_result = cr_invoice.list_result,
            list_transactions = cr_invoice.transaction,
            total_quatity = 0;

        if (list_result.products.length) {
            price += list_result.products.map(o => o.is_remove ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });

            price_invoice_type_1 += list_result.products.map(o => o.is_remove || o.invoice_type != 1 ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });

            price_invoice_type_2 += list_result.products.map(o => o.is_remove || o.invoice_type != 2 ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });

            total_quatity = list_result.products.map(o => o.is_remove ? 0 : Number(o.quantity)).reduce((a, c) => {
                return a + c;
            });
        }
        if (list_result.services.length) {
            price += list_result.services.map(o => o.is_remove ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });

            price_invoice_type_1 += list_result.services.map(o => o.is_remove || o.invoice_type != 1 ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });

            price_invoice_type_2 += list_result.services.map(o => o.is_remove || o.invoice_type != 2 ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });
        }
        if (list_result.packages.length) {
            price += list_result.packages.map(o => o.is_remove ? 0 : Number(o.pay)).reduce((a, c) => {
                return a + c;
            });

            price_invoice_type_1 += list_result.packages.map(o => o.is_remove || o.invoice_type != 1 ? 0 : Number(o.pay)).reduce((a, c) => {
                return a + c;
            });

            price_invoice_type_2 += list_result.packages.map(o => o.is_remove || o.invoice_type != 2 ? 0 : Number(o.pay)).reduce((a, c) => {
                return a + c;
            });
        }
        if (list_result.debits.length) {
            price += list_result.debits.map(o => o.is_remove ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });

            price_invoice_type_1 += list_result.debits.map(o => o.is_remove ? 0 : Number(o.total)).reduce((a, c) => {
                return a + c;
            });
        }

        if (list_result.units.length) {
            total_quatity += list_result.units.filter(o => o.type == 'product').length;
        }

        if (list_transactions) {
            let mpos = list_transactions.list_mpos,
                vnpay = list_transactions.list_vnpay,
                vnpay_spos = list_transactions.list_vnpay_spos,
                bank = list_transactions.list_bank,
                total_price_mpos = 0,
                total_price_vnpay = 0,
                total_price_vnpay_spos = 0,
                total_price_bank = 0;

            if (mpos.length) {
                total_price_mpos = mpos.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }

            if (vnpay.length) {
                total_price_vnpay = vnpay.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }

            if (vnpay_spos.length) {
                total_price_vnpay_spos = vnpay_spos.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }

            if (bank.length) {
                total_price_bank = bank.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }
            visa = Number(total_price_mpos + total_price_vnpay + total_price_vnpay_spos + total_price_bank);
        }

        if (discount_type == 'percent') {
            discount = price * discount_change / 100;
        } else {
            discount = discount_change;
        }

        total = price - discount + ship_price;
        amount = total - visa;

        $scope.obj_invoice.discount = discount;
        $scope.obj_invoice.total = total;
        $scope.obj_invoice.price = price;
        $scope.obj_invoice.price_invoice_type_1 = _formatValueCurrency(price_invoice_type_1);
        $scope.obj_invoice.price_invoice_type_2 = _formatValueCurrency(price_invoice_type_2);
        $scope.obj_invoice.amount = amount;
        $scope.obj_invoice.visa = visa;
        $scope.obj_invoice.total_quatity = total_quatity;
    }

    $scope.openSearchChangeUnit = (item) => {
        $scope.unit_search = {
            key: '',
            list_rs: [],
            load_rs: false,
        }
        if (item.open_search) {
            item.open_search = false;
        } else {
            $scope.obj_invoice.customer_package_history.info.history.map(item => item.open_search = false);
            item.open_search = true;
            setTimeout(() => {
                $(document).find('.frm-search-unit>input').focus().trigger('input');
            }, 50)
        }
    }

    $scope.searchServiceProductChangeUnit = (item) => {
        $scope.unit_search.load_rs = true;
        $http.get(_url + 'ajax_get_service_product_change_unit_by_key?' + $.param(item)).then(r => {
            if (r.data && r.data.status) {
                $scope.unit_search.result_search = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.unit_search.load_rs = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.searchUnit = (item) => {
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            var key = $scope.unit_search.key,
                data_rq = {
                    key: key,
                    unit_id: item.unit_id,
                    type: item.type,
                };

            if (key.length < 2) return true;
            $scope.searchServiceProductChangeUnit(data_rq);
        }, 350);
    }

    $scope.confirmChooseItemUnitSearch = (item_choose, unit) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: `Chọn <b>${item_choose.description}<b>!`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope._changeUnit(item_choose.id, unit);
            }
        })
    }

    $scope._changeUnit = (choose_id, unit) => {
        $scope.obj_invoice.customer_package_history.load = true;
        var data_rq = {
            customer_package_unit_id: unit.id,
            unit_id: choose_id,
        };

        $http.post(_url + 'ajax_change_customer_package_unit', data_rq).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                $scope.getCustomerPackageHistory(unit.customer_package_id);
                $scope.getCustomerPackage();
            } else {
                showMessErr(r.data.message);
                $scope.obj_invoice.customer_package_history.load = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getCustomerPackage = () => {
        $scope.load_cpu = true;
        $http.get(_url + 'ajax_get_customer_packages?customer_id=' + invoice.customer_id).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.customer.packages = $scope.formatCustomerPackages(r.data.data);
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_cpu = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.useCustomPackageUnit = (cpu, unit, event) => {
        var quantity = $(event.target).closest('tr').find('.form-select-quantity').val(),
            customer_package_id = cpu.customer_package_id,
            unit_id = unit.unit_id,
            type = unit.type,
            before_deloy = cpu.created && cpu.created < date_deployment_service_denys;

        if (quantity > 0) {
            if (!before_deloy && $scope.checkExistInServiceDenys(unit_id, type)) return;

            $scope.load_cpu = true;
            $http.post(_url + 'ajax_use_customer_package_unit', {
                customer_package_id: customer_package_id,
                quantity: quantity,
                unit_id: unit_id,
                type: type,
                invoice_id: invoice_id,
            }).then(r => {
                if (r.data && r.data.status) {
                    showMessSuccess();
                    $scope.getCustomerPackage();
                    $scope.getInvoiceCustomerPackageUnit();
                    if (type == 'product') $scope.getProductInventory();
                } else {
                    showMessErr(r.data.message);
                    $scope.load_cpu = false;
                }
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });
        } else {
            showMessErr('Không xác định số lượng cần dùng');
        }
    }

    $scope.useCustomPackageUnitWarranted = (cpu, unit) => {
        var customer_package_id = cpu.customer_package_id,
            unit_id = unit.unit_id;

        $scope.load_cpu = true;
        $http.post(_url + 'ajax_use_customer_package_unit_guarantee', {
            customer_package_id: customer_package_id,
            unit_id: unit_id,
            invoice_id: invoice_id,
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                $scope.getCustomerPackage();
                $scope.getInvoiceCustomerPackageUnit();
            } else {
                showMessErr(r.data.message);
                $scope.load_cpu = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveUnit = (item) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: "Xóa <b>" + item.description + "</b>?",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope._removeUnits(item);
            }
        })
    }

    $scope._removeUnits = (item) => {
        $scope.load_result_invoice = true;
        $http.post(_url + 'ajax_remove_customer_package_unit', {
            id: item.invoice_customer_package_unit_id
        }).then(r => {
            if (r.data && r.data.status) {
                if (item.type == 'package') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thông báo',
                        text: 'Xóa gói thành công!'
                    });
                    _reload();
                } else {
                    showMessSuccess('Xoá thành công');
                    $scope.getInvoiceCustomerPackageUnit();
                    $scope.getCustomerPackage();
                    if (item.type == 'product') $scope.getProductInventory();
                }
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getInvoiceCustomerPackageUnit = () => {
        $scope.load_result_invoice = true;
        $http.get(_url + 'ajax_get_invoice_customer_package_units?invoice_id=' + invoice_id).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.list_result.units = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_result_invoice = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.openCustomerPackageDebitHistory = (value) => {
        $('body').trigger('click');
        showPopup('#modal_customer_package_debit_history');
        $scope.getCustomerPackageDebitHistory(value.customer_package_id);
    }

    $scope.getCustomerPackageDebitHistory = (customer_package_id) => {
        $scope.resetCustomerPackageDebitHistory();
        $scope.obj_invoice.obj_edit.debit.load = true;
        $scope.obj_invoice.obj_edit.debit.customer_package_id = customer_package_id;

        $http.get(_url + 'ajax_get_customer_package_debit_history?customer_package_id=' + customer_package_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                $scope.obj_invoice.obj_edit.debit.description = data.description;
                $scope.obj_invoice.obj_edit.debit.history = data.history;
                $scope.obj_invoice.obj_edit.debit.description = data.description;
                $scope.obj_invoice.obj_edit.debit.current_debit = data.current_debit;
                $scope.obj_invoice.obj_edit.debit.is_percent = data.is_percent;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.obj_edit.debit.load = false;
            setTimeout(() => {
                $('#modal_customer_package_debit_history .item-debit').focus().trigger('input');
            }, 0);
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.saveDebit = () => {
        var item = angular.copy($scope.obj_invoice.obj_edit.debit),
            price = formatDefaultNumber(item.price),
            customer_package_id = item.customer_package_id;

        if (price == 0) {
            showMessErr('Tiền thu nợ phải lớn hơn 0!');
            showInputErr('.item-debit');
            return;
        } else if (price > item.current_debit) {
            showMessErr('Số tiền thu nợ không được lớn hơn số tiền đang nợ!');
            showInputErr('.item-debit');
            return;
        }
        $scope.obj_invoice.obj_edit.debit.load = true;
        $http.post(_url + 'ajax_add_customer_package_debit', {
            customer_package_id: customer_package_id,
            price: price,
            invoice_id: invoice_id,
        }).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                if (data.service_add) {
                    $scope.obj_invoice.list_result.services.push(data.service_add);
                }
                showMessSuccess('Thu nợ gói thành công');
                $scope.getCustomerPackageDebitHistory(customer_package_id);
                $scope.getInvoiceCustomerPackageDebit();
                $scope.getCustomerPackage();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.obj_edit.debit.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveCustomerPackageDebit = (item) => {
        if ($scope.remove_need_confirm) {
            if (!item.is_remove) {
                item.is_remove_confirm = true;
            }
            item.is_remove = !item.is_remove;
        } else {
            Swal.fire({
                title: "Bạn có chắc chắn?",
                html: "Sau khi xóa, bạn sẽ không hoàn nguyên!",
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'Hủy',
                confirmButtonText: 'Đồng ý',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    $scope._removeCustomerPackageDebit(item);
                }
            })
        }

        $scope.updateInvoice();
    }

    $scope._removeCustomerPackageDebit = (item) => {
        $scope.load_result_invoice = true;
        $scope.obj_remove_detail_with_confirm_user.load = true;
        $http.post(_url + 'ajax_remove_customer_package_debit', {
            id: item.invoice_customer_package_debit_id,
            obj_remove_confirm_user: item.obj_remove_confirm_user
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                $scope.getInvoiceCustomerPackageDebit();
                $scope.getCustomerPackage();
                hidePopup('#modal_remove_detail_with_confirm_user');
            } else {
                showMessErr(r.data.message);
                $scope.load_result_invoice = false;
                $scope.obj_remove_detail_with_confirm_user.load = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getInvoiceCustomerPackageDebit = () => {
        $scope.load_result_invoice = true;
        $http.get(_url + 'ajax_get_invoice_customer_package_debit?invoice_id=' + invoice_id).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.list_result.debits = r.data.data;
                $scope.updateInvoice();
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_result_invoice = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.openCustomerPackageHistory = (value) => {
        $('body').trigger('click');
        showPopup('#modal_customer_package_history');
        $scope.getCustomerPackageHistory(value.customer_package_id);
    }

    $scope.getCustomerPackageHistory = (customer_package_id) => {
        $scope.resetSearchGift();
        $scope.resetCustomerPackageHistory();
        $scope.obj_invoice.customer_package_history.load = true;
        $http.get(_url + 'ajax_get_customer_package_history?customer_package_id=' + customer_package_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                data.item.allow_change_unit = moment(data.item.created, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD') < $scope.obj_invoice.date;
                $scope.obj_invoice.customer_package_history.info = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.customer_package_history.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.openAddVoucher = () => {
        $scope.showMoreVoucher = false;
        $scope.loadListName = true;
        showPopup('#modal_add_voucher');
        $scope.getListVoucherPartner();
        $scope.getListNameVoucher()
        setTimeout(() => {
            $('#modal_add_voucher input').focus();
        }, 300)
    }
    $scope.toggleShowMoreVoucher = () => {
        $scope.showMoreVoucher = !$scope.showMoreVoucher;
    }
    $scope.addVoucher = () => {
        if (!$scope.obj_invoice.obj_voucher.code) {
            showMessErr('Vui lòng nhập mã giảm giá');
            return;
        }

        $scope.obj_invoice.obj_voucher.load = true;
        $http.post(_url + 'ajax_add_voucher_invoice', {
            voucher_code: $scope.obj_invoice.obj_voucher.code,
            invoice_id: invoice_id,
            customer_id: invoice.customer_id,
        }).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.obj_voucher.code = '';
                $scope.getListVoucherInvoice();
                showMessSuccess('Thêm thành công');
            } else {
                showMessErr(r.data.message);
                $scope.obj_invoice.obj_voucher.load = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveVoucher = (id) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            html: 'Xóa voucher này',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope._removeVoucher(id);
            }
        });
    }

    $scope._removeVoucher = (voucher) => {
        $scope.obj_invoice.obj_voucher.load = true;
        var data_rq = angular.copy(voucher);
        $http.post(_url + 'ajax_remove_voucher_invoice', data_rq).then(r => {
            if (r.data && r.data.status) {
                $scope.getListVoucherInvoice();
                showMessSuccess('Xóa thành công');
            } else {
                showMessErr(r.data.message);
                $scope.obj_invoice.obj_voucher.load = false;
            }
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.getListVoucherInvoice = () => {
        $scope.obj_invoice.obj_voucher.load = true;
        $http.get(_url + 'ajax_get_list_voucher_added?invoice_id=' + invoice_id).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_invoice.obj_voucher.added = r.data.data;
                $scope.getListVoucherPartner();
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.obj_voucher.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetUpload = () => {
        $scope.obj_upload = _obj_upload();
    }

    $scope.openUploadImage = (type) => {
        showPopup('#modal_upload_image');
        $scope.resetUpload();
        $scope.obj_upload.type = type;
        $scope.getListCustomerImageInvoice();
    }

    $scope.getListCustomerImageInvoice = () => {
        $scope.obj_upload.load = true;
        var type = $scope.obj_upload.type,
            data_rq = {
                invoice_id: invoice_id
            };

        if (type == 'normal_contract') {
            data_rq.type = ['normal', 'contract'];
        } else if (type == 'treatment') {
            data_rq.type = [type];
        }
        $http.get(_url + 'ajax_get_invoice_images?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.obj_upload.list_uploaded = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_upload.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.uploadCustomerImage = (input, type_upload) => {
        var fd = new FormData(),
            file = input.files,
            arrType = ['image/jpg', 'image/png', 'image/jpeg'];

        for (var x = 0; x < file.length; x++) {
            if (arrType.includes(file[x].type)) {
                fd.append("file[]", file[x]);
            } else {
                showMessErr('File: ' + file[x].name + ' sai định dạng!');
                $scope.resetInputFile();
                return true;
            }
        }
        $scope.resetInputFile();
        $scope.obj_upload.load = true;

        fd.append('type', type_upload);
        fd.append('id', invoice_id);
        $http({
            method: 'POST',
            url: _url + 'ajax_upload_image_customer_upfiledev',
            headers: {
                'Content-Type': undefined
            },
            data: fd
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess(r.data.message);
                $scope.getListCustomerImageInvoice();
            } else {
                showMessErr(r.data.message);
                $scope.obj_upload.load = false;
            }
        }, function (response) {
            showMessErrSystem();
        });
    }

    $scope.confirmRemoveImage = (item) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: "Sau khi xóa, bạn sẽ không hoàn nguyên!",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.removeCustomerImage(item);
            }
        })
    }

    $scope.removeCustomerImage = (item) => {
        item.load = true;
        $http.post(_url + 'ajax_remove_image_customer', {
            id: item.id,
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess('Xóa thành công');
                $scope.getListCustomerImageInvoice();
            } else {
                showMessErr(r.data.message);
            }
            item.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetInputFile = () => {
        $('.wrap-upload input').val('');
    }

    $scope.chooseUser = (item, type) => {
        if (
            !(
                $scope.allow_edit ||
                (
                    company_id == 4 && [324].includes(id_current_user) &&
                    invoice.date >= '2022-06-01' && invoice.date < '2022-06-14'
                )
            ) ||
            !store_use_choose_staff ||
            item.is_remove ||
            invoice.invoice_type_sale != 1) {
            return true;
        }
        var technician_id = typeof (item.technician_id) !== 'undefined' ? item.technician_id : '0',
            sale_user_id = typeof (item.sale_user_id) !== 'undefined' ? item.sale_user_id : '0';

        $scope.item_choose_user = {
            load: false,
            type: type,
            self: item,
            edit: {
                technician_id: technician_id,
                sale_user_id: sale_user_id,
            },
            info: {
                technician: {
                    name: '',
                    image_url: '',
                },
                sale: {
                    name: '',
                    image_url: '',
                },
            },
            show_view: {
                technician: false,
                sale: false,
            }
        }
        if (type == 'product') {
            $scope.item_choose_user.show_view.sale = true;
        } else if (type == 'service') {
            if (!(item.gift_id > 0) && item.used != -1) { // nạp gift và khác chưa dùng
                $scope.item_choose_user.show_view.technician = true;
            }
            if (!(item.used > 0)) { //dịch vụ dùng lại
                $scope.item_choose_user.show_view.sale = true;
            }
        } else if (type == 'package') {
            $scope.item_choose_user.show_view.sale = true;
        } else if (type == 'debit') {
            $scope.item_choose_user.show_view.sale = true;
        } else if (type == 'unit') {
            if (item.type != 'service') return;
            $scope.item_choose_user.show_view.technician = true;
        } else {
            showMessErr('Không xác định loại sp, dv cần chọn Nhân viên');
            return;
        }
        if (parseInt(technician_id)) {
            var user = getUserInfo(technician_id);
            if (!user) return;
            $scope.item_choose_user.info.technician = user.obj_info;
        }

        if (parseInt(sale_user_id)) {
            var user = getUserInfo(sale_user_id);
            if (!user) return;
            $scope.item_choose_user.info.sale = user.obj_info;
        }

        $scope.resetSearchUser();
        showPopup('#modal_choose_user');
    }

    $scope.chooseSetUser = (value, type) => {
        var item = angular.copy(value),
            id = 0;
        if (item) {
            id = item.id;
        }
        $scope.resetSearchUser();
        if (type == 'technician') {
            $scope.item_choose_user.edit.technician_id = id;
            var user = getUserInfo(id);
            if (!user) return;
            $scope.item_choose_user.info.technician = user.obj_info;
        } else {
            $scope.item_choose_user.edit.sale_user_id = id;
            var user = getUserInfo(id);
            if (!user) return;
            $scope.item_choose_user.info.sale = user.obj_info;
        }
    }

    $scope.saveChooseUser = () => {
        var item = angular.copy($scope.item_choose_user),
            technician_id = item.edit.technician_id,
            sale_user_id = item.edit.sale_user_id,
            type = item.type;

        if ($scope.item_choose_user.self.invoice_id > 0) {
            var data_rq = {
                type: type,
                technician_id: technician_id,
                sale_user_id: sale_user_id,
            };
            if (type == 'product') {
                data_rq.id = item.self.invoice_product_id;
            } else if (type == 'service') {
                data_rq.id = item.self.invoice_service_id;
            } else if (type == 'package') {
                data_rq.id = item.self.invoice_customer_package_id;
            } else if (type == 'debit') {
                data_rq.id = item.self.id;
            } else if (type == 'unit') {
                data_rq.id = item.self.id;
            }

            $scope.item_choose_user.load = true;
            $http.post(_url + 'ajax_choose_user', data_rq).then(r => {
                if (r.data && r.data.status) {
                    hidePopup('#modal_choose_user');
                    showMessSuccess();
                    $scope.item_choose_user.self.technician_id = technician_id;
                    $scope.item_choose_user.self.sale_user_id = sale_user_id;
                    $scope.updateUserItem($scope.item_choose_user.self, 'technician');
                    $scope.updateUserItem($scope.item_choose_user.self, 'sale');
                } else {
                    showMessErr(r.data.message);
                }
                $scope.item_choose_user.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });

        } else {
            $scope.item_choose_user.self.technician_id = technician_id;
            $scope.item_choose_user.self.sale_user_id = sale_user_id;
            $scope.updateUserItem($scope.item_choose_user.self, 'technician');
            $scope.updateUserItem($scope.item_choose_user.self, 'sale');
            hidePopup('#modal_choose_user');
        }
    }

    $scope.chooseMutiUser = () => {
        if (!($scope.allow_edit || (is_receptionist && invoice.date >= '2022-01-01')) ||
            current_user_group == 5 ||
            invoice.invoice_type_sale != 1) {
            return true;
        }
        if (!$('.input_choose_muti_user:checked').length) {
            showMessErr('Vui lòng chọn ít nhất 1 hàng hóa!');
            return;
        }
        $scope.item_choose_muti_user = {
            load: false,
            edit: {
                technician_id: '0',
                sale_user_id: '0',
            },
            info: {
                technician: {
                    name: '',
                    image_url: '',
                },
                sale: {
                    name: '',
                    image_url: '',
                },
            },
        }
        $scope.resetSearchUser();
        showPopup('#modal_muti_choose_user');
    }

    $scope.chooseSetMutiUser = (value, type) => {
        var item = angular.copy(value),
            id = 0;
        if (item) {
            id = item.id;
        }
        $scope.resetSearchUser();
        if (type == 'technician') {
            $scope.item_choose_muti_user.edit.technician_id = id;
            var user = getUserInfo(id);
            if (!user) return;
            $scope.item_choose_muti_user.info.technician = user.obj_info;
        } else {
            $scope.item_choose_muti_user.edit.sale_user_id = id;
            var user = getUserInfo(id);
            if (!user) return;
            $scope.item_choose_muti_user.info.sale = user.obj_info;
        }
    }

    $scope.saveChooseMutiUser = () => {
        var technician_id = $scope.item_choose_muti_user.edit.technician_id,
            sale_user_id = $scope.item_choose_muti_user.edit.sale_user_id,
            data_rq = {
                product: [],
                service: [],
                package: [],
                debit: [],
                unit: [],
            },
            call_api = false;

        $('.input_choose_muti_user:checked').each(function (index, element) {
            var type = $(this).attr('data-type'),
                key = $(this).attr('data-key');
            if (type == 'product') {
                var item = $scope.obj_invoice.list_result.products[key];
                if (item.invoice_id > 0) {
                    data_rq.product.push({
                        id: item.invoice_product_id,
                        sale_user_id: sale_user_id
                    });
                    call_api = true;
                }
                item.sale_user_id = sale_user_id;
                $scope.updateUserItem(item);
            } else if (type == 'service') {
                var item = $scope.obj_invoice.list_result.services[key],
                    tech_id = 0,
                    sale_id = 0;

                if (!(item.gift_id > 0) && item.used != -1) { // nạp gift và khác chưa dùng
                    tech_id = technician_id;
                }
                if (!(item.used > 0)) { //dịch vụ dùng lại
                    sale_id = sale_user_id;
                }

                if (item.invoice_id > 0) {
                    data_rq.service.push({
                        id: item.invoice_service_id,
                        sale_user_id: sale_id,
                        technician_id: tech_id,
                    });
                    call_api = true;
                }
                item.sale_user_id = sale_id;
                item.technician_id = tech_id;
                $scope.updateUserItem(item);
                $scope.updateUserItem(item, 'technician');

            } else if (type == 'package') {
                var item = $scope.obj_invoice.list_result.packages[key];
                if (item.invoice_id > 0) {
                    data_rq.package.push({
                        id: item.invoice_customer_package_id,
                        sale_user_id: sale_user_id
                    });
                    call_api = true;
                }
                item.sale_user_id = sale_user_id;
                $scope.updateUserItem(item);
            } else if (type == 'debit') {
                var item = $scope.obj_invoice.list_result.debits[key];
                data_rq.debit.push({
                    id: item.id,
                    sale_user_id: sale_user_id
                });
                call_api = true;
                item.sale_user_id = sale_user_id;
                $scope.updateUserItem(item);
            } else if (type == 'unit') {
                var item = $scope.obj_invoice.list_result.units[key];
                if (item.type != 'service') return;
                data_rq.unit.push({
                    id: item.id,
                    technician_id: technician_id
                });
                call_api = true;
                item.technician_id = technician_id;
                $scope.updateUserItem(item, 'technician');
            }
        });
        if (call_api) {
            $scope._saveChooseMutiUser(data_rq);
        } else {
            hidePopup('#modal_muti_choose_user');
            showMessSuccess();
            $('.input_choose_muti_user').prop('checked', false);
        }
    }

    $scope._saveChooseMutiUser = (data_rq) => {
        $scope.item_choose_muti_user.load = true;
        $http.post(_url + 'ajax_choose_muti_user', data_rq).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
                $('.input_choose_muti_user').prop('checked', false);
                hidePopup('#modal_muti_choose_user');
            } else {
                showMessErr(r.data.message);
            }
            $scope.item_choose_muti_user.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    function getUserInfo(user_id) {
        user_id = parseInt(user_id);
        var user = $scope.list_saler.find(x => x.id == user_id);
        if (user) {
            user.obj_info = {
                name: user.fullname,
                image_url: user.image_url
            };
            return user;
        }
        return false;
    }

    $scope.updateUserItem = (item, type = 'sale') => {
        if (type == 'sale') {
            var user = getUserInfo(item.sale_user_id);
            if (!user) return;
            item.obj_sale = user.obj_info;
        } else {
            var user = getUserInfo(item.technician_id);
            if (!user) return;
            item.obj_tech = user.obj_info;
        }
    }

    $scope.getProductInventory = () => {
        var list_product = angular.copy($scope.obj_invoice.list_result.products),
            list_unit = angular.copy($scope.obj_invoice.list_result.units.filter(x => x.type == 'product'));
        if (!list_product.length && !list_unit.length) return;

        var data_rq = {
            store_id: invoice.store_id,
            date: invoice.date,
            list_product_id: [...list_product.map(x => x.product_id), ...list_unit.map(x => x.unit_id)],
        };
        $scope.obj_invoice.list_result.products.map(x => x.load_inventory = true);
        $scope.obj_invoice.list_result.units.map(x => x.type == 'product' && (x.load_inventory = true));

        $http.get(_url + 'api_get_list_product_inventory?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.productInventory = r.data.data;
                $scope.checkReustProductInventory();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.checkGetProductInventory = () => {
        var list_product = angular.copy($scope.obj_invoice.list_result.products),
            list_unit = angular.copy($scope.obj_invoice.list_result.units.filter(x => x.type == 'product')),
            list_product_id = [...list_product.map(x => x.product_id), ...list_unit.map(x => x.unit_id)],
            product_inventory = angular.copy($scope.productInventory),
            product_id_inventory = product_inventory.map(x => x.id);

        var check_not_exist = list_product_id.filter(x => !product_id_inventory.includes(Number(x)));
        if (check_not_exist.length) {
            $scope.getProductInventory();
        } else {
            $scope.checkReustProductInventory();
        }
    }

    $scope.checkReustProductInventory = () => {
        $scope.obj_invoice.obj_out_of_stock.isset = false;
        var product_inventory = angular.copy($scope.productInventory);
        if (!product_inventory.length) return;

        var list_product = angular.copy($scope.obj_invoice.list_result.products),
            list_unit = angular.copy($scope.obj_invoice.list_result.units.filter(x => x.type == 'product'));
        if (!list_product.length && !list_unit.length) return;

        $.each($scope.obj_invoice.list_result.products, function (index, value) {
            value.load_inventory = false;
            var _list = list_product.filter(x => x.product_id == value.product_id);

            if (!_list.length) return;

            var quantity_retail_added = _list.map(x => (Number(x.quantity_before) ? Number(x.quantity_before) : 0)).reduce((a, c) => {
                    return a + c;
                }),
                quantity_unit_added = list_unit.filter(x => x.unit_id == value.product_id).length;

            _list = list_product.filter(x => !x.is_remove && x.product_id == value.product_id);
            if (!_list.length) return;

            var quantity_adding = list_product.filter(x => !x.is_remove && x.product_id == value.product_id).map(x => Number(x.quantity)).reduce((a, c) => {
                    return a + c;
                }),
                obj_inventory = product_inventory.find(x => x.id == value.product_id);
            if (!obj_inventory) return;

            var total_inventory = obj_inventory.inventory + quantity_retail_added + quantity_unit_added,
                cr_inventory = total_inventory - (quantity_adding + quantity_unit_added);

            value.inventory = total_inventory;
            if (cr_inventory < 0) {
                $scope.obj_invoice.obj_out_of_stock.isset = true;
                value.out_of_stock = true;
            } else {
                value.out_of_stock = false;
            }
        });

        $.each($scope.obj_invoice.list_result.units, function (index, value) {
            value.load_inventory = false;

            var _list = list_product.filter(x => x.product_id == value.unit_id);
            var quantity_retail_added = 0;
            if (_list.length) {
                quantity_retail_added = _list.map(x => (Number(x.quantity_before) ? Number(x.quantity_before) : 0)).reduce((a, c) => {
                    return a + c;
                })
            }

            var quantity_unit_added = list_unit.filter(x => x.unit_id == value.unit_id).length;
            var quantity_adding = 0;
            if (list_product.length) {
                var list_product_adding = list_product.filter(x => !x.is_remove && x.product_id == value.unit_id);
                if (list_product_adding.length) {
                    quantity_adding = list_product_adding.map(x => Number(x.quantity)).reduce((a, c) => {
                        return a + c;
                    })
                }
            }

            var obj_inventory = product_inventory.find(x => x.id == value.unit_id);
            if (!obj_inventory) return;

            var total_inventory = obj_inventory.inventory + quantity_retail_added + quantity_unit_added,
                cr_inventory = total_inventory - (quantity_adding + quantity_unit_added);

            value.inventory = total_inventory;
            if (cr_inventory < 0) {
                $scope.obj_invoice.obj_out_of_stock.isset = true;
                value.out_of_stock = true;
            } else {
                value.out_of_stock = false;
            }
        });
    }

    $scope.showModalChooseSkin = () => {
        $scope.resetSearchSkin();
        showPopup('#modal_choose_user_sale');
        setTimeout(() => {
            $('#modal_choose_user_sale .input-search-user-sale').focus();
        }, 300)
    }

    $scope.removeSkin = () => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: 'Gỡ người bán phiếu thu này',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.$apply(() => {
                    $scope.obj_invoice.skin_id = 0;
                });
            }
        });
    }

    $scope.resetSearchSkin = () => {
        $scope.obj_search_skin = _obj_search_skin();
        $scope.obj_search_skin.list = angular.copy($scope.list_saler);
        $scope.obj_search_skin.list_df = angular.copy($scope.list_saler);
    }

    $scope.searchSkin = () => {
        if (invoice.store_id == 47) {
            if ($scope.obj_search_skin.key.length < 4) {
                $scope.obj_search_skin.list = [];
                return;
            }
        }
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchSkin();
            $scope.$apply();
        }, 350);
    }

    $scope._searchSkin = () => {
        var key = $scope.obj_search_skin.key;
        if (invoice.store_id == 47) {
            $scope.obj_search_skin.load = true;
            $http.get(base_url + 'admin_users/ajax_search_user_by_key?key=' + key).then(r => {
                if (r.data && r.data.status) {
                    $scope.obj_search_skin.list = r.data.data;
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_search_skin.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem();
            });
        } else {
            var expected = ToSlug(key);
            $scope.obj_search_skin.list = angular.copy($scope.obj_search_skin.list_df.filter(item => ToSlug(item.fullname).indexOf(expected) !== -1));
        }
    }

    $scope.chooseSkin = (user = null) => {
        if (!user) {
            $scope.obj_invoice.obj_skin = {};
            $scope.obj_invoice.skin_id = 0;
        } else {
            $scope.obj_invoice.skin_id = user.user_id;
            $scope.obj_invoice.obj_skin = angular.copy(user);
        }
        hidePopup('#modal_choose_user_sale');
    }

    $scope.confirmSetInvoiceNote = (day_note) => {
        var note = 'LỊCH HẸN TIẾP THEO ',
            d_ = day_note.split('/'),
            full_date_format = new Date(d_['2'] + '-' + d_['1'] + '-' + d_['0']),
            day = full_date_format.getDay(),
            isWeekend = false,
            date_note_change = '',
            note_day = '',
            note_change = 'Bạn muốn ';

        // 6 = Saturday, 0 = Sunday
        if (day === 0) { // CN thì chuyển sang t2
            isWeekend = true;
            note_day += 'Ngày hẹn rơi vào Chủ nhật';
            date_note_change = full_date_format.setDate(full_date_format.getDate() + 1);
            date_note_change = moment(date_note_change).format("DD/MM/YYYY");
            note_change += ' dời sang thứ 2 (' + date_note_change + ') ?';

        } else if (day === 6) { // thú 7 thì chuyển sang t6
            isWeekend = true;
            note_day += 'Ngày hẹn rơi vào Thứ 7';
            date_note_change = full_date_format.setDate(full_date_format.getDate() - 1);
            date_note_change = moment(date_note_change).format("DD/MM/YYYY");
            note_change += ' dời lại thứ 6 (' + date_note_change + ') ?';
        }

        if ($scope.obj_invoice.note.length || $scope.obj_invoice.note_print.length) {
            Swal.fire({
                title: 'Bạn có chắc chắn?',
                html: 'Bạn muốn xóa ghi chú cũ.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Hủy',
                confirmButtonText: 'Đồng ý',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.value) {
                    if (isWeekend) {
                        Swal.fire({
                            title: note_day,
                            html: note_change,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            cancelButtonText: 'Hủy',
                            confirmButtonText: 'Đồng ý',
                            allowOutsideClick: false,
                        }).then((result) => {
                            if (result.value) {
                                setTimeout(() => {
                                    $scope.setInvoiceNote(note + date_note_change);
                                    $scope.$apply();
                                }, 0)
                            } else {
                                setTimeout(() => {
                                    $scope.setInvoiceNote(note + day_note);
                                    $scope.$apply();
                                }, 0)
                            }
                        })
                    } else {
                        setTimeout(() => {
                            $scope.setInvoiceNote(note + day_note);
                            $scope.$apply();
                        }, 0)
                    }
                }
            })
        } else {
            if (isWeekend) {
                Swal.fire({
                    title: note_day,
                    html: note_change,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'Hủy',
                    confirmButtonText: 'Đồng ý',
                    allowOutsideClick: false,
                }).then((result) => {
                    if (result.value) {
                        setTimeout(() => {
                            $scope.setInvoiceNote(note + date_note_change);
                            $scope.$apply();
                        }, 0)
                    } else {
                        setTimeout(() => {
                            $scope.setInvoiceNote(note + day_note);
                            $scope.$apply();
                        }, 0)
                    }
                })
            } else {
                setTimeout(() => {
                    $scope.setInvoiceNote(note + day_note);
                    $scope.$apply();
                }, 0)
            }
        }
    }

    $scope.setInvoiceNote = (day_note = '') => {
        $scope.obj_invoice.note = day_note
        $scope.obj_invoice.note_print = day_note;
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope._linkInvoice = _linkInvoice;
    $scope.showZoomImg = showZoomImg;
    $scope.formatDefaultNumber = formatDefaultNumber;

    $scope.checkShow = (type, value = null) => {
        var invoice_type_sale = angular.copy($scope.obj_invoice.invoice_type_sale),
            item = angular.copy(value),
            user_allow_edit_invoice = $scope.user_allow_edit_invoice,
            allow_edit = $scope.allow_edit;

        if (type == 'search_product') {
            if (allow_edit) return true;
        } else if (type == 'search_service') {
            if ([1, 3].includes(invoice_type_sale)) return true;
        } else if (type == 'search_package') {
            if ([1, 3].includes(invoice_type_sale)) return true;
        } else if (type == 'open_customer_package') {
            if ([1, 3, 5].includes(invoice_type_sale)) return true;
        } else if (type == 'use_customer_package_unit') {
            if ([1].includes(invoice_type_sale) && allow_edit) {
                return true;
            }
        } else if (type == 'recharge_gift') {
            if (allow_edit) return true;
        } else if (type == 'search_item_in_gift') {
            if (allow_edit) return true;
        } else if (type == 'choose_technician') {
            if (
                $scope.obj_invoice.date == toDay &&
                (is_receptionist || is_manager || is_admin || is_region_admin) ||
                allow_edit
            ) return true;
        } else if (type == 'choose_skin_sale') {
            if (allow_edit) return true;
        } else if (type == 'choose_skin') {
            if (
                $scope.obj_invoice.date == toDay &&
                (is_receptionist || is_manager || is_admin || is_region_admin) ||
                allow_edit
            ) return true;
        } else if (type == 'choose_created_user') {
            if (user_allow_edit_invoice) return true;
        } else if (type == 'show_choose_tech_skin') {
            if ([1].includes(invoice_type_sale)) return true;
        } else if (type == 'show_choose_sale_online') {
            if ([5, 6].includes(invoice_type_sale)) return true;
        } else if (type == 'show_choose_created_user') {
            if ([1, 5, 6].includes(invoice_type_sale)) return true;
        } else if (type == 'check_muti_user') {
            if (store_use_choose_staff &&
                (
                    allow_edit ||
                    (
                        company_id == 4 && [324].includes(id_current_user) &&
                        invoice.date >= '2022-06-01' && invoice.date < '2022-06-14'
                    )
                )
            ) return true;
        } else if (type == 'show_choose_invoice_type_item') {
            if (!store_use_choose_staff) return true;
        } else if (type == 'show_modal_invoice_temp') {
            if (
                [1].includes(invoice_type_sale) &&
                $scope.allow_edit &&
                store_use_invoice_temp
            ) return true;
        } else if (type == 'show_obj_address') {
            if ([5].includes(invoice_type_sale)) return true;
        } else if (type == 'show_pay_amount') {
            if (![5, 6].includes(invoice_type_sale)) return true;
        } else if (type == 'disabled_discount_invoice') {
            if (!allow_edit) return true;
        } else if (type == 'input_ship_price') {
            if (allow_edit) return true;
        } else if (type == 'show_ship_price') {
            if ([5, 6, 7, 8].includes(invoice_type_sale)) return true;
        } else if (type == 'show_shipper') {
            if ([5, 6, 7, 8].includes(invoice_type_sale)) return true;
        } else if (type == 'disabled_shipper') {
            if (!is_dev) return true;
        } else if (type == 'open_modal_transaction') {
            if (
                [1, 3, 5].includes(invoice_type_sale) &&
                $scope.obj_invoice.date == toDay &&
                (is_receptionist || is_manager || is_admin || is_region_admin) ||
                (allow_edit || allow_accountant_edit_visa)
            ) return true;
        } else if (type == 'remove_visa_not_confirm') {
            if ($scope.obj_invoice.transaction.bank && $scope.obj_invoice.transaction.bank.item_edit) {
                if ($scope.obj_invoice.transaction.bank.item_edit.id == value.id) {
                    return false;
                }
            }
            if (user_allow_edit_invoice) return true;
            if (value && value.confirm != 1 && allow_edit) return true;
        } else if (type == 'edit_bank') {
            if (user_allow_edit_invoice) return true;
            if (value && value.confirm == 0 && (allow_edit || allow_accountant_edit_visa)) return true;
        } else if (type == 'disabled_price_bank') {
            if (!allow_edit && !allow_accountant_edit_visa && $scope.obj_invoice.transaction.bank.item_edit && $scope.obj_invoice.transaction.bank.item_edit.id) {
                return true;
            }
        } else if (type == 'disabled_change_unit') {
            if (!allow_edit ||
                !$scope.obj_invoice.customer_package_history.info.item.allow_change_unit
            ) return true;
        } else if (type == 'save_invoice_temp') {
            if (invoice_type_sale == 3 && allow_edit) return true;
        } else if (type == 'print_invoice') {
            if (!$scope.checkShow('save_invoice')) return true;
        } else if (type == 'finish_invoice') {
            if (
                company_id == 1 &&
                allow_edit &&
                !$scope.obj_invoice.is_finish &&
                invoice_type_sale != 5
            ) return true;
        } else if (type == 'unfinish_invoice') {
            if (
                company_id == 1 &&
                $scope.obj_invoice.is_finish &&
                (
                    user_allow_edit_invoice || (
                        $scope.obj_invoice.date == toDay &&
                        (is_admin || is_region_admin)
                    )
                ) &&
                invoice_type_sale != 5
            ) return true;
        } else if (type == 'save_invoice') {
            if (allow_edit) return true;
        } else if (type == 'edit_note_invoice') {
            if (
                allow_edit || $scope.checkShow('save_invoice_when_finished')
            ) return true;
        } else if (type == 'save_invoice_when_finished') {
            if (!$scope.checkShow('save_invoice') && [1, 3, 5, 7].includes(invoice_type_sale) &&
                $scope.obj_invoice.date == toDay &&
                (is_receptionist || is_manager || is_admin || is_region_admin)
            ) return true;
        } else if (type == 'disabled_note_invoice') {
            if (!$scope.checkShow('save_invoice') &&
                !$scope.checkShow('save_invoice_when_finished')
            ) return true;
        } else if (type == 'show_edit_customer') {
            if (allow_edit) return true;
        } else if (type == 'open_upload_img_customer') {
            if (
                allow_edit ||
                (
                    [1, 3, 5].includes(invoice_type_sale) &&
                    $scope.obj_invoice.date == toDay &&
                    (is_receptionist || is_manager || is_admin || is_region_admin)
                )
            ) return true;
        } else if (type == 'remove_img_customer_upload') {
            if ($scope.checkShow('open_upload_img_customer')) return true;
        } else if (type == 'show_modal_add_voucher') {
            if (allow_edit) return true;
        } else if (type == 'disabled_save_invoice_when_finished') {
            if (
                $scope.obj_invoice.obj_out_of_stock.isset &&
                !$scope.obj_invoice.obj_out_of_stock.accept
            ) return true;
        } else if (type == 'choose_customer_address') {
            if (
                item.customer_address_id > 0 &&
                !item.need_save &&
                invoice_type_sale == 5 &&
                allow_edit
            ) return true;
        } else if (type == 'edit_user_collaborator') {
            if (
                is_admin ||
                is_region_admin ||
                is_only_assistantmanager ||
                is_manager ||
                is_dev
            ) return true;
        } else if (type == 'show_type_item_tmv') {
            if (
                (
                    item.store_type == 2 ||
                    item.store_type == 3
                ) &&
                (
                    cr_store_type == 2 ||
                    cr_store_type == 3
                )
            ) return true;
        } else if (type == 'remove_item_invoice_detail') {
            if (allow_edit) return true;
        } else if (type == 'permit_edit_ring_size') {
            if (allow_edit) return true;
        } else if (type == 'show_edit_ring_size') {
            if (cr_company_id == 1) return true;
        } else if (type == 'disabled_change_price_unit_package') {
            if (!allow_edit) return true;
        }

        return false;
    }

    $scope.resetVoucherPartner = () => {
        $scope.voucher_par = {
            key: '',
            load: true,
            list: [],
            list_: []
        }
    }

    $scope.getListVoucherPartner = () => {
        $scope.resetVoucherPartner();
        $http.get(base_url + 'vouchers/ajax_get_voucher_partner').then(r => {
            $scope.voucher_par.load = false;
            if (r.data && r.data.status) {
                var data = r.data.data;
                if (data.length && $scope.obj_invoice.obj_voucher.added.voucher.length) {
                    $.each(data, function(i,item) {
                        item.quantity_add = 0;
                        $.each($scope.obj_invoice.obj_voucher.added.voucher, function(index,val) {
                            if(val.id == item.id){
                                item.is_added = true;
                                item.quantity_add =  item.quantity_add + 1
                            }
                        });
                    });
                }
                $scope.voucher_par.list = data;
                $scope.voucher_par.list_ = data;                
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.getListNameVoucher = () => {
        $http.get(base_url + 'vouchers/ajax_get_list_name_voucher_partner').then(r => {
            $scope.loadListName = false;
            if (r.data && r.data.status) {
                $scope.listNameVoucher = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.addVoucherCode = (item) => {
        
        var regexCode = /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]+/g;
        var regexSpace = /\s/g;

        if (!item.code_partner) {
            showMessErr('Vui lòng nhập mã giảm giá');
            return;
        }

        var data_rq = {
            code_partner: item.code_partner.trim().toUpperCase(),
            voucher_id: item.id,
            invoice_id: invoice.id
        }

        if (data_rq.code_partner.match(regexSpace)) {
            showMessErr('Mã khuyến mãi không được chứa ký tự khoảng trắng');
            return;
        }

        if (data_rq.code_partner.match(regexCode)) {
            showMessErr('Mã khuyến mãi phải là ký tự không dấu');
            return;
        }

        item.load = true;
        $http.get(base_url + 'vouchers/ajax_add_voucher_code_partner?' + $.param(data_rq)).then(r => {
            item.load = false;
            item.code_partner = '';
            if (r.data && r.data.status) {
                item.is_added = true;
                console.log(item.quantity_add);
                item.quantity_add = item.quantity_add + 1;
                console.log(item.quantity_add);
                $scope.getListVoucherInvoice();
                showMessSuccess(r.data.message);
            } else {
                showMessErr(r.data.message);
            }
        });
    }

    $scope.showDescription = (item) => {
        $scope.voucher_par.list.forEach(vou => {
            if (vou.id != item.id) {
                vou.is_show_des = false;
            }
        });
        item.is_show_des = !item.is_show_des;
    }

    $scope.removeVoucherKey = () => {
        $scope.voucher_par.key = '';
        $scope.searchVoucherPartner();
    }

    $scope.searchVoucherPartner = () => {
        var key = angular.copy($scope.voucher_par.key);
        var listVoucher = angular.copy($scope.voucher_par.list_);

        if (key.length == 0) {
            $scope.voucher_par.list = listVoucher;
        }

        $scope.voucher_par.list = listVoucher.filter(item => ToSlug(item.name).indexOf(ToSlug(key)) !== -1);
    }

    $scope.goToTabVoucher = (tab) => {
        if (tab == 'voucher-added') {
            $scope.tab_voucher = 1;
        } else {
            $scope.tab_voucher = 2;
            $scope.getListVoucherPartner();
        }
    }
});

app.filter('formatDefaultNumber', function () {
    return (value, n = 0, x = 3) => {
        if (!value) return 0;
        value = parseFloat(value);
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return value.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };
});

app.filter('formatCurrency', function () {
    return (value, noname = true, nation_id = cr_nation_id) => {
        if (!value) return 0;
        value = Number(value);
        if (nation_id == 1) {
            return parseNumber(value) + (noname ? '' : ' đ');
        } else {
            return Number(value).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + (noname ? '' : ' $');
        }
    };
});

/**
 * Convert date into human readable
 */
app.filter('convertToHumanDate', function () {
    return (value, onlyDate) => {
        return onlyDate ? moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY') : moment(value, 'YYYY-MM-DD HH:mm:ss').format('HH:mm DD-MM-YYYY');
    };
});

app.filter('momentFormat', function () {
    return (value, format) => {
        return moment(value, 'YYYY-MM-DD HH:mm:ss').format(format);
    };
});

/**
 * AngularJS return safe html
 */
app.filter('safeHtml', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});

/**
 * Uppercase
 */
app.filter('uppercase', function () {
    return (value) => {
        return value.toUpperCase();
    };
});

function shipStatusInfo(id) {
    id = parseInt(id);
    var obj_return = {
        name: '',
        class_name: ''
    };
    switch (id) {
        case -1:
            obj_return = {
                name: 'Hủy',
                class_name: 'label-danger'
            }
            break;
        case 1:
            obj_return = {
                name: 'Chờ lấy hàng',
                class_name: 'label-warning'
            }
            break;

        case 2:
            obj_return = {
                name: 'Đang giao hàng',
                class_name: 'label-primary'
            }
            break;

        case 3:
            obj_return = {
                name: 'Đã chuyển hoàn',
                class_name: 'label-danger'
            }
            break;

        case 4:
            obj_return = {
                name: 'Đã đối soát',
                class_name: 'label-success'
            }
            break;

        case 5:
            obj_return = {
                name: 'Giao thành công',
                class_name: 'label-info'
            }
            break;

        default:
            obj_return = {
                name: 'Không xác định',
                class_name: 'label-default'
            }
            break;
    }
    return obj_return;
}

$(document).on('click', '.open-old-pakages', function () {
    setTimeout(() => {
        $('.box-package').addClass('active');
    }, 0)
})

document.addEventListener('click', function (event) {
    if (event.target.closest('.box-package')) {} else {
        $('.box-package').removeClass('active');
    }
});

$(document).on('input', '.voucher .input-code', function (e) {
    var self = $(this);
    self.val((ToSlug(self.val()).replace(/[^a-zA-Z0-9]/g, '')).toUpperCase());
});

var barcode = '';
var reading = false;
var _timeout = false;

document.addEventListener('keydown', e => {
    var seft = $(e.target);
    if (e.key == 'Enter') {
        if (barcode.length > 10) {
            var flag_repace = true;

            if (seft.val() && flag_repace) {
                var str_ = (seft.val() + '').replace(barcode, '').trim();
                seft.val(str_).trigger('input');
            }
            angular.element(document.getElementById('invoiceCtrl')).scope().searchScanner(barcode);
            reading = true;
            barcode = '';
            _timeout && clearTimeout(_timeout);
        }
    } else {
        if (e.keyCode >= 48 && e.keyCode <= 90) {
            barcode += e.key;
        }
    }

    if (!reading) {
        reading = true;
        _timeout = setTimeout(() => {
            barcode = '';
            reading = false;
        }, 300);
    }
}, true)

window.onhelp = function () {
    return false;
};

// f1	112
// f2	113
// f3	114
// f4	115
// f5	116
// f6	117
// f7	118
// f8	119
// f9	120
// f10	121
// f11	122
// f12	123

window.onkeydown = evt => {
    // debugger
    switch (evt.keyCode) {
        case 27: // esc
            evt.preventDefault();
            $('body').trigger('click');
            $('.modal').modal('hide');
            hideAllPopup();
            break;
        case 112: // f1
            evt.preventDefault();
            focusSearch();
            break;
        case 113: // f2
            evt.preventDefault();
            openCustomerPackage();
            break;
        case 114: // f3
            evt.preventDefault();
            openPromise();
            break;
        case 119: // f8
            evt.preventDefault();
            openCustomerHistory();
            break;
        case 120: // f9
            evt.preventDefault();
            triggerOpenVisa();
            break;
        case 122: // f11
            evt.preventDefault();
            triggerSaveInvoice();
            break;
        case 123: // f12
            evt.preventDefault();
            triggerSaveAndPrintInvoice();
            break;
        default:
            return true;
    }
    //Returning false overrides default browser event
    return false;
};

function focusSearch() {
    $('#search-filter-input').focus().trigger('input');
}

function focusSearchGift() {
    $('#search-filter-input-gift').focus().trigger('input');
}

function scrollBoxSearchGift() {
    $('#modal_customer_package_history').animate({
        scrollTop: $("#modal_customer_package_history .popup-body").height()
    }, 'fast');
}

function openCustomerPackage() {
    $('.box-package').toggleClass('active');
}

function triggerSaveInvoice() {
    !$('#save-invoice').attr('disabled') && $('#save-invoice').trigger('click');
}

function triggerSaveAndPrintInvoice() {
    !$('#save-print-invoice').attr('disabled') && $('#save-print-invoice').trigger('click');
}

function triggerOpenVisa() {
    $('#btn-show-visa').trigger('click');
}

function openPromise() {
    showPopup('#modal_promise');
}

function openCustomerHistory() {
    $('.btn-customer-history').trigger('mousedown');
}

$(document).on('mouseenter', '[data-invoice_visa_transaction_id]', function () {
    var self = $(this),
        id = self.attr('data-invoice_visa_transaction_id'),
        this_load = self.attr('this_load');

    if (Number(id) > 0 && !this_load) {
        document.body.style.cursor = 'wait';
        self.attr('this_load', 1);

        $.ajax({
            type: 'get',
            url: base_url + 'invoice_new/ajax_get_invoice_visa_transaction_by_id?id=' + id,
            dataType: 'json',
            success: function (r) {
                if (r.status && r.data) {
                    var item = r.data;
                    if (item.transfer_type == 1) {
                        html_title = `Tên: ${item.cus_name}, Số tiền: ${parseNumber(item.transfer_amount)} đ, Mã CC/GD: ${item.transfer_authcode}/ ****${item.transfer_code.substr(-4)}`;
                    } else {
                        html_title = item.data_origin_received;
                    }
                    self.attr('title', html_title);
                    self.tooltip('show')
                } else {
                    showMessErr(r.message);
                }
            },
            complete: function () {
                setTimeout(() => {
                    document.body.style.cursor = 'auto';
                }, 50);
            },
            error: function () {
                showMessErrSystem('Không lấy được log giao dịch');
            }
        });
    }
})