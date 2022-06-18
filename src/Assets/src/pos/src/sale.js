const _url = base_url + 'invoices_v2/';
const _obj_bank = function () {
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
            check: false,
            payDate: moment(toDay, 'YYYY-MM-DD').format('DD / MM / YYYY'),
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
    _obj_search_list_customer_address = function () {
        return {
            limit: 5,
            offset: 5,
            load: false,
            key: '',
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
            source_id: '1',
            collabor_type: 'none',
            obj_user_collaborator: {
                id: 0,
                fisrt_name: '',
                last_name: '',
                phone: '',
                image_url: '',
            },
            store_id: store_id,
            cmnd_number: '',
            cmnd_provide_date: '',
            cmnd_address: '',
            list_address: [],
            edit_address: _obj_edit_address()
        }
    },
    _obj_list_visa_trans = function () {
        return {
            key: '',
            date_end: toDay,
            store_id: store_id,
            offset: -10,
            limit: 10,
            load: false,
            list: [],
            list_df: [],
        }
    },
    _obj_list_invoice_return = function () {
        return {
            key: '',
            date_created: date_bw_today,
            by_date_create: false,
            offset: -10,
            limit: 10,
            load: false,
            list: [],
        }
    },
    _obj_voucher = function () {
        return {
            code: '',
            info: '',
        }
    },
    _obj_online_address = function () {
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
    _obj_search_user = function () {
        return {
            key: '',
            list: '',
            list_df: '',
            load_more: false,
            load: false,
        }
    },
    _obj_search_list_verify_payment = function () {
        return {
            key: '',
            date_start: moment(toDay, 'YYYY-MM-DD').add(-1, 'days').format('YYYY-MM-DD HH:mm:ss'),
            offset: -5,
            limit: 5,
            load: false,
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
    _obj_gift_online = function () {
        return {
            load: false,
            item: {},
            history: [],
            history_push: [],
            total_push: 0,
            total_used: 0,
            total_used_temp: 0,
            total_remaining: 0,
        }
    },
    _obj_invoice_df = function () {
        var date = new Date(),
            h = date.getHours(),
            m = date.getMinutes(),
            cr_time = (parseInt(h) < 10 ? '0' : '') + h + ':' + (parseInt(m) < 10 ? '0' : '') + m;
        return {
            cr_id: 1,
            sale_user: {},
            ship_price: '',
            edit_cod_amount: false,
            cod_amount: '',
            shipper_id: '0',
            created_time: cr_time,
            invoice_type: invoice_type,
            list_product: [],
            list_unit: [],
            customer: {},
            note: '',
            note_print: '',
            note_invoice_return: '',
            discount: 0,
            discount_type: 'percent',
            discount_change: '',
            pay_amount: 0,
            pay_visa: 0,
            total: 0,
            price: 0,
            store_id: 0,
            total_quatity: 0,
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
            obj_voucher: _obj_voucher(),
            obj_online_address: _obj_online_address(),
            obj_gift_online: _obj_gift_online(),
            obj_return: null
        };
    };

app.controller('invoiceCtrl', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $scope.invoice_type = invoice_type;
        $scope.nation_id = nation_id;
        $scope.symbol_currency = $scope.nation_id == 1 ? 'VNĐ' : '$';
        $scope.store_id = store_id;
        $scope.store_type = store_type;
        $scope.company_id = company_id;
        $('.wrap-invoice').fadeIn(100);
        $scope.list_invoice = [
            _obj_invoice_df()
        ];

        $scope.is_dev = is_dev;
        $scope.is_admin = is_admin;
        $scope.is_manager = is_manager;
        $scope.current_main_group_id = current_main_group_id;
        $scope.is_only_assistantmanager = is_only_assistantmanager;
        $scope.gift_online_id = gift_online_id;
        $scope.base_url = base_url;
        $scope.users = [];
        $scope.chooseInvoice(0);
        $scope.resetSearchProduct();
        $scope.resetSearchCustomer();
        $scope.resetEditCustomer();

        $scope.cashbook_bank = banks;
        $scope.vnpay = vnpay;
        $scope.current_uer = user;
        $scope.load_list = false;

        $scope.getlistUserStore();
        $scope.getListShipperStore();

        $scope.all_provinces = [];
        $scope.all_districts = [];
        $scope.all_wards = [];
        $scope.getProvinces();
        $scope.getDistricts(-1);
        $scope.list_promise = [];
        $scope.productInventory = [];

        $scope.df_img_pro = df_img_pro;
        $scope.df_img_pk = base_url + 'assets/images/package.png';
        $scope.df_img_pk_gift = base_url + 'assets/images/gift-card.png';

        $scope.df_img_ser = base_url + 'assets/images/grooming.svg';
        $scope.df_img_ser_tmv = base_url + 'assets/images/syringe.png';
        $scope.resetMposTransactions();
        $scope.resetVnpaySposTransactions();

        $scope.resetListVisaTransactions();
        $scope.resetChooseTypeTransactions();

        setTimeout(() => {
            setWidthBtnSave();
        }, 200)
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
            amount: $scope.obj_invoice.pay_amount,
            method_code: 'VNPAY_SPOS_CARD',
            store_name: _userStores.find(x => x.id == store_id).description
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
                invoice_id: 'retail',
                store_id: store_id,
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

    // return invoices

    $scope.changeQuantity = (item) => {
        if (item.quantity > item.quantity_default) {
            if ($scope.obj_invoice.obj_return) {
                item.quantity = angular.copy(item.quantity_default);
            }
        }
        $scope.checkReustProductInventory();
    }

    $scope.chooseItemInvoiceReturn = (item) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: 'Trả hàng cho phiếu thu này',
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
                    $scope.getDetailInvoiceNeedReturn(item);
                });
            }
        });
    }

    $scope.getDetailInvoiceNeedReturn = (item) => {
        $scope.obj_list_invoice_return.load = true;

        $http.get(_url + 'ajax_get_invoice_detail_need_return?invoice_id=' + item.invoice_id).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data,
                    cr_time = new Date().getTime();
                if (data.length) {
                    $scope.obj_invoice.list_product = [];
                    $.each(data, function (index, value) {
                        value.quantity = Number(value.quantity);

                        var pro = $scope.resetItemProduct(value);
                        pro.sale_user_id = value.sale_user_id ? value.sale_user_id : 0;
                        pro.quantity_default = value.quantity;
                        pro.id = value.product_id;
                        pro.quantity = value.quantity;
                        pro.discount = parseNumber(value.discount);
                        pro.discount_type = value.discount_type;

                        pro.note = '';
                        pro.time_created = cr_time;

                        $scope.obj_invoice.list_product.unshift(pro);
                        zoominElement(`.time-${cr_time}`);
                    });

                    $scope.resetSearchProduct();
                    $scope.checkGetProductInventory();
                    $scope.obj_invoice.customer.id = item.customer_id;
                    $scope.obj_invoice.obj_return = item;
                    hidePopup('#modal_invoice_return');
                } else {
                    showMessErr('Phiếu thu không có sản phẩm nào');
                    return;
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_invoice_return.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetListInvoiceReturn = (clear = false) => {
        var _filter = $scope.obj_list_invoice_return && !clear ? $scope.obj_list_invoice_return : {};
        $scope.obj_list_invoice_return = {
            by_date_create: _filter.by_date_create ? _filter.by_date_create : false,
            date_created: _filter.date_created ? _filter.date_created : date_bw_today,
            limit_start_date: limit_date_iv_return,
            key: _filter.key ? _filter.key : '',
            limit: 10,
            offset: -10,
            load: false,
            list: [],
        };
    }

    $scope.sumbitGetListInvoiceReturn = () => {
        if ($scope.obj_list_invoice_return.key.length < 4) {
            showMessErr('Vui lòng nhập ít nhất 4 ký tự để tìm kiếm');
            return;
        }
        $scope.resetListInvoiceReturn();
        $scope._getListInvoiceReturn();
    }

    $scope.openListInvoiceReturn = () => {
        $scope.resetListInvoiceReturn(1);
        showPopup('#modal_invoice_return');
        setTimeout(() => {
            $('#modal_invoice_return .input-search').trigger('focus')
        }, 300);
    }

    $scope.scollMoreListInvoiceReturn = (e) => {
        var self = $(e);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
            if ($scope.obj_list_invoice_return.key.length < 4) {
                showMessErr('Vui lòng nhập ít nhất 4 ký tự để tìm kiếm');
                return;
            }
            $scope._getListInvoiceReturn();
        }
    }

    $scope._getListInvoiceReturn = () => {
        if ($scope.obj_list_invoice_return.offset >= 0) {
            if ($scope.obj_list_invoice_return.list.length != $scope.obj_list_invoice_return.offset + $scope.obj_list_invoice_return.limit) {
                return;
            }
        }
        $scope.obj_list_invoice_return.offset += $scope.obj_list_invoice_return.limit;
        $scope.obj_list_invoice_return.load = true;

        var obj_search = angular.copy($scope.obj_list_invoice_return),
            dates_created = obj_search.date_created.split(' - '),
            dates_start = dates_created[0].split('/'),
            dates_end = dates_created[1].split('/'),
            create_start = dates_start[2] + '-' + dates_start[1] + '-' + dates_start[0],
            create_end = dates_end[2] + '-' + dates_end[1] + '-' + dates_end[0];

        if (obj_search.by_date_create) {
            obj_search.date_create_start = create_start;
            obj_search.date_create_end = create_end;
        }

        obj_search.list = [];
        obj_search.company_id = company_id;

        $http.get(_url + 'ajax_get_list_invoice_need_return?' + $.param(obj_search)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data,
                    _list = angular.copy($scope.obj_list_invoice_return.list);

                $.each(data, function (index, value) {
                    value.created = moment(value.created, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm');
                    // value.customer_phone = '****' + value.customer_phone.slice(-6);
                });
                _list.push(...data);
                $scope.obj_list_invoice_return.list = _list;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_invoice_return.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    // list spos
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
            date: toDay,
            store_id: store_id,
        };

        $scope.vnpay_spos_transactions.load = true;
        $scope.vnpay_spos_transactions.list = [];
        $http.get(_url + 'ajax_get_list_vnpay_spos_transactions?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data,
                    list_vnpay_spos = angular.copy($scope.obj_invoice.transaction.list_vnpay_spos);

                $.each(data, function (index, value) {
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    var _vnpay_spos = list_vnpay_spos.find(x => x.invoice_visa_transaction_id == value.id);
                    if (_vnpay_spos) {
                        value.visa_imports.push({
                            invoice_id: 0,
                            price: _vnpay_spos.price
                        });
                    }
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


        if (price > 0) {
            $scope.obj_invoice.transaction.list_vnpay_spos.push({
                price: price,
                code: code,
                invoice_visa_transaction_id: invoice_visa_transaction_id,
            });
            $scope.obj_invoice.transaction.vnpay_spos = _obj_vnpay_spos();
            $scope.getListVnpaySposTransactions();
        } else {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_vnpay_spos_price');
            return;
        }
    }

    $scope.confirmRemoveVnpaySpos = (key) => {
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
                setTimeout(() => {
                    $scope.obj_invoice.transaction.list_vnpay_spos.splice(key, 1);
                    $scope.getListVnpaySposTransactions();
                    $scope.$apply();
                }, 0);
            }
        })
    }

    // end tab spos

    $scope.checkShowUrlImageVisa = checkShowUrlImageVisa;

    $scope.chooseItemVisaTransaction = (value) => {
        var item = angular.copy(value),
            check_exit = $scope.obj_invoice.transaction.list_bank.find(x => x.invoice_visa_transaction_id == item.id);

        if (check_exit) {
            showMessErr('Giao dịch này đã được chọn.');
            return;
        }

        var _exit_bank = $scope.cashbook_bank.find(x => x.id == item.bank_id);
        if (_exit_bank) {
            $scope.obj_invoice.transaction.bank.id = item.bank_id;
        } else {
            showMessErr('Ngân hàng khách thanh toán không phù hợp.');
            return;
        }
        $scope.obj_invoice.transaction.bank.choose_visa_trans = item;
        $scope.obj_invoice.transaction.bank.price = parseNumber(item.amount_remain);
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
                    _list = angular.copy($scope.obj_list_visa_trans.list),
                    list_bank = angular.copy($scope.obj_invoice.transaction.list_bank);

                $.each(data, function (index, value) {
                    value.transfer_time = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY HH:mm');
                    value.payment_identifier = value.payment_identifier ? value.payment_identifier : '---';
                    var _bank = list_bank.find(x => x.invoice_visa_transaction_id == value.id);
                    if (_bank) {
                        value.amount_remain -= _bank.price;
                    }
                });
                _list.push(...data);
                $scope.obj_list_visa_trans.list = _list;
                $scope.obj_list_visa_trans.list_df = _list;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_visa_trans.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.clearEditInPopupVisa = () => {
        $scope.obj_invoice.transaction.mpos = _obj_mpos();
        $scope.obj_invoice.transaction.vnpay = _obj_vnpay();
        $scope.obj_invoice.transaction.bank = _obj_bank();
    }

    $scope.showGiftOnline = () => {
        $scope.resetGiftOnline();
        $scope.obj_invoice.obj_gift_online.load = true;
        $http.get(_url + 'ajax_get_gift_collaborator?customer_id=' + $scope.obj_invoice.customer.id).then(r => {
            if (r.data && r.data.status == 1) {
                let data = r.data.data;
                $scope.obj_invoice.obj_gift_online = {
                    item: data.item,
                    nation_id: nation_id,
                    store_type: store_type,
                    history: data.history,
                    history_push: data.history_push,
                    total_push: data.total_push,
                    total_used: data.total_used,
                    total_remaining: data.total_remaining,
                    total_used_temp: 0,
                }
                $scope._updatePriceGift();
                showPopup('#modal_gift_online');
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.obj_gift_online.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope._updatePriceGift = () => {
        var list_unit = angular.copy($scope.obj_invoice.list_unit);
        if (!list_unit.length) return;
        var total_used_temp = list_unit.map(o => o.price).reduce((a, c) => {
            return a + c;
        });
        $scope.obj_invoice.obj_gift_online.total_used_temp = total_used_temp;
    }

    $scope.removeUnit = (key) => {
        $scope.obj_invoice.list_unit.splice(key, 1);
        $scope._updatePriceGift();
    }

    $scope.resetGiftOnline = () => {
        $scope.obj_invoice.obj_gift_online = _obj_gift_online();
        $scope.resetSearchGiftOnline();
    }

    $scope.resetSearchGiftOnline = () => {
        $scope.filter_gift_online = {
            key: '',
            type: 'product',
            load: false,
            list: [],
            show_rs: false,
            limit: 20,
            offset: -20,
        }
    }

    $scope.chooseTypeSearchGift = (type) => {
        var key = $scope.filter_gift_online.key;
        $scope.resetSearchGiftOnline();
        $scope.filter_gift_online.type = type;
        $scope.filter_gift_online.key = key;
        $scope.searcGiftWithType();
        $('#modal_gift_online').animate({
            scrollTop: $("#modal_gift_online .popup-footer").offset().top
        }, 'fast');
        setTimeout(() => {
            forcusSearchGift();
        }, 255)
    }

    $scope.searcGiftWithType = () => {
        let filter = angular.copy($scope.filter_gift_online),
            key = filter.key,
            type = filter.type;

        if (key.length < 3) return;
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {

            if (type == 'product') {
                $scope.searchProductInGift();
            } else if (type == 'service') {
                $scope.searchServiceInGift();
            } else { // package

                $scope.filter_gift_online.list = [];
                $scope.filter_gift_online.limit = 20;
                $scope.filter_gift_online.offset = -20;
                $scope.searchPackageInGift();
            }
        }, 350);
    }

    $scope.searchProductInGift = () => {
        $scope.filter_gift_online.load = true;
        var data_rq = {
            key: $scope.filter_gift_online.key,
            store_id: store_id,
            company_id: company_id,
            nation_id: nation_id,
        };
        $http.get(_url + 'ajax_get_product_retail_by_key?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter_gift_online.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_gift_online.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.searchServiceInGift = () => {
        $scope.filter_gift_online.load = true;
        var data_rq = {
            key: $scope.filter_gift_online.key,
            company_id: company_id,
            store_type: store_type,
            nation_id: nation_id,
        };
        $http.get(_url + 'ajax_get_service_by_key?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter_gift_online.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_gift_online.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.searchPackageInGift = () => {
        let key = $scope.filter_gift_online.key,
            date_rq = {};

        if (key.length < 3) return true;

        if ($scope.filter_gift_online.load) {
            return;
        }

        if ($scope.filter_gift_online.offset >= 0) {
            if ($scope.filter_gift_online.list.length != $scope.filter_gift_online.offset + $scope.filter_gift_online.limit) {
                return;
            }
        }

        $scope.filter_gift_online.offset += $scope.filter_gift_online.limit;
        $scope.filter_gift_online.load = true;
        $scope.filter_gift_online.nation_id = $scope.nation_id;
        $scope.filter_gift_online.store_type = $scope.store_type != 3 ? $scope.store_type : 1;
        $scope.filter_gift_online.company_id = $scope.company_id;

        date_rq = angular.copy($scope.filter_gift_online);
        date_rq.type = 'normal';
        date_rq.list = [];

        $http.get(_url + 'ajax_get_package_by_key?' + $.param(date_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter_gift_online.list.push(...r.data.data);
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_gift_online.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseProductInGift = (value) => {
        $scope.resetEditProductGift();
        $scope.resetSearchGiftOnline();
        var item = angular.copy(value);
        $scope.obj_product_gift.id = item.id;
        $scope.obj_product_gift.barcode = item.barcode;
        $scope.obj_product_gift.price = item.price;
        $scope.obj_product_gift.description = item.description;

        showPopup('#modal_discount_gift');
    }

    $scope.checkShowClassErr = (value) => {
        if ($scope.obj_invoice.obj_return) return;

        var pro = angular.copy(value),
            discount = formatDefaultNumber(pro.discount),
            price = formatDefaultNumber(pro.price),
            price_max = parseFloat(pro.price_max),
            price_min = parseFloat(pro.price_min);

        if (price < price_min || (price_max && price > price_max)) {
            return true;
        }
        if (discount) {
            if (!pro.note.length) return true;

            if (pro.discount_type == 'percent' && discount > 100) {
                return true;
            } else if (pro.discount_type == 'amount' && discount > price) {
                return true;
            }
        }
        return false;
    }

    $scope.checkChangePrice = (value) => {
        var pro = angular.copy(value),
            price = formatDefaultNumber(pro.price),
            price_max = formatDefaultNumber(pro.price_max),
            price_min = formatDefaultNumber(pro.price_min);

        if (price < price_min || price > price_max) {
            showMessErr(`Giá bán phải nằm trong khoảng ${parseNumber(price_min)} đến ${parseNumber(price_max)} đ.`);
            value.price = parseNumber(price_max);
            return;
        }

    }

    $scope._validatePriceUseGift = (price_use) => {
        var total_remaining = $scope.obj_invoice.obj_gift_online.total_remaining - $scope.obj_invoice.obj_gift_online.total_used_temp;
        if (total_remaining - price_use < 0) {
            showMessErr('Không thể sử dụng quá hạn mức cho phép');
            return false;
        }
        return true;
    }

    $scope.chooseServiceInGift = (value) => {
        var item = angular.copy(value),
            price = formatDefaultNumber(item.price),
            price_before = price;

        if (!$scope._validatePriceUseGift(price)) return;
        $scope._useGiftBuy({
            id: item.id,
            type: 'service',
            description: item.description,
            discount: 0,
            discount_type: 'percent',
            price: price,
            price_before: price_before,
        });
    }

    $scope.choosePackageInGift = (value) => {
        var item = angular.copy(value),
            price = formatDefaultNumber(item.price),
            price_before = price;

        if (!$scope._validatePriceUseGift(price)) return;

        $scope._useGiftBuy({
            id: item.id,
            type: 'package',
            description: item.description,
            discount: 0,
            discount_type: 'percent',
            price: price,
            price_before: price_before,
        });
    }

    $scope.saveProductInGift = () => {
        var item = angular.copy($scope.obj_product_gift),
            discount = formatDefaultNumber(item.discount),
            price = formatDefaultNumber(item.price),
            price_before = price;

        if (isNaN(discount)) {
            showMessErr('Giảm giá không hợp lệ!');
            return;
        }

        if (discount != 0) {
            if (item.discount_type == 'percent') {
                if (discount > 100) {
                    showMessErr('Không giảm giá quá 100%!');
                    return;
                }
                price = price - (price * discount * 0.01);
            }

            if (item.discount_type == 'amount') {
                if (discount > formatDefaultNumber(price)) {
                    showMessErr('Giảm giá không hợp lệ!');
                    return;
                }
                price -= discount;
            }
        }

        if (!$scope._validatePriceUseGift(price)) return;
        $scope._useGiftBuy({
            id: item.id,
            type: 'product',
            description: item.description,
            discount: discount,
            discount_type: item.discount_type,
            price: price,
            barcode: item.barcode,
            price_before: price_before,
        });
        hidePopup('#modal_discount_gift');
        $scope.checkGetProductInventory();
    }

    $scope._useGiftBuy = (value) => {
        var item = angular.copy(value);
        $scope.obj_invoice.list_unit.push(item);
        $scope._updatePriceGift();
        $scope.resetSearchGiftOnline();
    }

    $scope.resetEditProductGift = () => {
        $scope.obj_product_gift = {
            id: 0,
            description: '',
            price: 0,
            barcode: '',
            discount: '',
            discount_type: 'percent',
        }
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

    $('.list_pk_in_gift').on('scroll', function () {
        var self = $(this);
        div = self.get(0);
        if (div.scrollTop + div.clientHeight >= div.scrollHeight && $scope.filter_gift_online.type == 'package') {
            $scope.searchPackageInGift();
        }
    });

    $scope.searchCustomerAddress = () => {
        var expected = ToSlug($scope.obj_search_list_customer_address.key);
        $scope.obj_edit_customer.list_address = angular.copy($scope.obj_edit_customer.list_address_.filter(item => ToSlug(item.name).indexOf(expected) !== -1 || ToSlug(item.phone).indexOf(expected) !== -1));
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
            store_id: store_id,
        };

        $scope.mpos_transactions.load = true;
        $scope.mpos_transactions.list = [];
        $http.get(_url + 'ajax_get_list_mpos_transactions?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data,
                    list_mpos = angular.copy($scope.obj_invoice.transaction.list_mpos);

                $.each(data, function (index, value) {
                    value.transfer_code = value.transfer_code.toString().slice(-8);
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    var _mpos = list_mpos.find(x => x.invoice_visa_transaction_id == value.id);
                    if (_mpos) {
                        value.visa_imports.push({
                            invoice_id: 0,
                            price: _mpos.price
                        });
                    }
                })
                $scope.mpos_transactions.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.mpos_transactions.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.resetSearchUser = () => {
        $scope.obj_search_user = _obj_search_user();
        $scope.obj_search_user.list = angular.copy($scope.users);
        $scope.obj_search_user.list_df = angular.copy($scope.users);
    }
    // get list user current store
    $scope.getlistUserStore = () => {
        var data_rq = {
            store_id: store_id,
            user_id: [current_user_id],
        };
        $http.get(base_url + 'admin_users/ajax_get_list_saler_store?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $scope.users = data;
                $scope.chooseCurrentUser();
                $scope.resetSearchUser();
            } else {
                showMessErr(r.data.message);
            }
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.confirmSaveInvoice = () => {
        if (!$scope.validateInvoice()) return;

        var out_of_stock = $scope.obj_invoice.list_product.find(x => x.out_of_stock),
            html_cf = 'Xác nhận lưu phiếu thu!';
        if (out_of_stock) {
            html_cf = 'Xác nhận lưu và bán <b class="text-danger">ÂM</b> kho';
        }

        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: html_cf,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                $scope.saveInvoice();
            }
        })
    }

    $scope.validateInvoice = (is_return = 0) => {
        var invoice = angular.copy($scope.obj_invoice),
            list_product = invoice.list_product,
            list_unit = invoice.list_unit,
            flag_err = false;

        invoice.cod_amount = formatDefaultNumber(invoice.cod_amount);
        invoice.discount = formatDefaultNumber(invoice.discount);
        invoice.ship_price = formatDefaultNumber(invoice.ship_price);
        invoice.total = formatDefaultNumber(invoice.total);
        invoice.pay_visa = formatDefaultNumber(invoice.pay_visa);
        invoice.pay_amount = formatDefaultNumber(invoice.pay_amount);
        invoice.customer_id = invoice.customer.id ? invoice.customer.id : 0;
        invoice.voucher_detail_id = typeof (invoice.obj_voucher.info.voucher) == "undefined" ? 0 : invoice.obj_voucher.info.voucher.id;
        if (list_product.length) {
            $.each(list_product, function (key, pro) {
                if (formatDefaultNumber(pro.quantity) < 1) {
                    showMessErr('Số lượng sản phẩm: ' + pro.description + ' không hợp lệ');
                    flag_err = true;
                    return false;
                }
                pro.price = formatDefaultNumber(pro.price);
                pro.price_min = parseFloat(pro.price_min);
                pro.price_max = parseFloat(pro.price_max);
                pro.discount = formatDefaultNumber(pro.discount);

                if (pro.discount && !pro.note.length && !invoice.obj_return) {
                    showMessErr('Nhập lý do giảm giá: ' + pro.description);
                    flag_err = true;
                    return false;
                }
                if (pro.discount_type == 'percent') {
                    if (pro.discount > 100) {
                        showMessErr(pro.description + ': giảm giá không hợp lệ!');
                        flag_err = true;
                        return false;
                    }
                } else if (pro.discount_type == 'amount') {
                    if (pro.discount > pro.price) {
                        showMessErr(pro.description + ': giảm giá không hợp lệ!');
                        flag_err = true;
                        return false;
                    }
                }

                if (pro.price < pro.price_min || (pro.price_max && pro.price > pro.price_max)) {
                    showMessErr(pro.description + `: giá bán phải nằm trong khoảng ${parseNumber(pro.price_min)} đến ${parseNumber(pro.price_max)}.`);
                    flag_err = true;
                    return false;
                }

            });
        } else if (!list_unit.length) {
            showMessErr('Vui lòng thêm sản phẩm cần bán!');
            return false;
        }

        if (flag_err) return false;

        if (invoice.discount > 0 && !invoice.note.length) {
            showMessErr('Nhập lý do giảm giá đơn hàng vào ô ghi chú');
            showInputErr('.wrap-note-tranfer .note');
            return;
        }

        if (invoice.total < 0) {
            showMessErr('Giảm giá đơn hàng không hợp lệ!');
            showInputErr('.discount-invoice');
            return false;
        }

        if (invoice_type == 'online') {
            if (!invoice.obj_online_address.customer_address_id) {
                showMessErr('Vui lòng chọn địa chỉ giao hàng!');
                return false;
            }
        }
        hidePopup('#modal_confirm_invoice_return');
        if (is_return) {
            if (invoice.pay_visa) {
                showMessErr('Phiếu thu trả hàng không thể nhập visa');
                return false;
            }
        } else {
            if (!invoice.sale_user || !Object.keys(invoice.sale_user).length) {
                $scope.resetSearchUser();
                showPopup('#modal_user_save_invoice');
                setTimeout(() => {
                    $('#modal_user_save_invoice .input-group>input').focus().trigger('input');
                }, 300)
                return false;
            }
        }
        hidePopup('#modal_user_save_invoice');
        return true;
    }

    $scope.chooseTypeDiscountInvoice = (type) => {
        $scope.obj_invoice.discount_type = type;
        $scope.updateInvoice();
    }

    $scope.saveInvoice = (is_return = 0) => {
        if (!$scope.validateInvoice(is_return)) return;

        var invoice = angular.copy($scope.obj_invoice),
            list_product = invoice.list_product;

        invoice.discount = formatDefaultNumber(invoice.discount);
        invoice.ship_price = formatDefaultNumber(invoice.ship_price);
        invoice.cod_amount = formatDefaultNumber(invoice.cod_amount);
        invoice.total = formatDefaultNumber(invoice.total);
        invoice.pay_visa = formatDefaultNumber(invoice.pay_visa);
        invoice.customer_id = invoice.customer.id ? invoice.customer.id : 0;
        invoice.sale_user_id = invoice.sale_user && typeof (invoice.sale_user.user_id) != 'undefined' ? invoice.sale_user.user_id : 0;
        invoice.voucher_detail_id = typeof (invoice.obj_voucher.info.voucher) == "undefined" ? 0 : invoice.obj_voucher.info.voucher.id;
        invoice.customer_package_id = invoice.obj_gift_online.item.id;
        if (list_product && list_product.length) {
            $.each(list_product, function (key, pro) {
                pro.price = formatDefaultNumber(pro.price);
                pro.discount = formatDefaultNumber(pro.discount);
                pro.sale_user_id = pro.sale_user_id ? pro.sale_user_id : invoice.sale_user_id;
            });
        }
        if (invoice_type == 'online') {
            if (invoice.shipper_id > 0) {
                var _shipper = $scope.shippers.find(x => x.id == invoice.shipper_id);
                invoice.warehouse_shipper_api_id = _shipper.warehouse_shipper_api_id;
            } else {
                invoice.warehouse_shipper_api_id = 0;
            }
        }

        invoice.is_return = is_return;
        invoice.store_id = store_id;
        invoice.nation_id = nation_id;
        invoice.company_id = company_id;
        $scope._saveInvoice(invoice);
    }

    $scope._saveInvoice = (invoice) => {
        $scope.load_list = true;
        $http.post(_url + 'ajax_add_sale', invoice).then(r => {
            if (r.data && r.data.status) {
                var invoice_id = r.data.data,
                    current_invoice = $scope.list_invoice.indexOf($scope.obj_invoice);
                $scope.delectInvoice(current_invoice);
                $scope.clearEditInPopupVisa();
                $scope.resetMposTransactions();
                $scope.resetListVisaTransactions();

                if (invoice_type == 'offline') {
                    window.open(_url + 'invoice_print_bill/' + invoice_id, '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
                } else {
                    showMessSuccess('Tạo phiếu thu thành công');
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_list = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.updateInvoice = () => {
        var cr_invoice = angular.copy($scope.obj_invoice),
            discount = formatDefaultNumber(cr_invoice.discount),
            discount_change = formatDefaultNumber(cr_invoice.discount_change),
            discount_type = cr_invoice.discount_type,
            ship_price = formatDefaultNumber(cr_invoice.ship_price),
            list = cr_invoice.list_product,
            list_unit = cr_invoice.list_unit,
            list_transactions = cr_invoice.transaction,
            total_quatity = list_unit.length,
            price = 0,
            total = 0,
            pay_visa = 0,
            pay_amount = 0;

        if (!cr_invoice) return;

        if (list && list.length) {
            $.each(list, function (index, value) {
                price += $scope.totalItem(value);
            });

            total_quatity += list.map(o => o.quantity).reduce((a, c) => {
                return a + c;
            });
        }
        if (list_transactions) {
            var mpos = list_transactions.list_mpos,
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
            pay_visa = parseFloat(total_price_mpos + total_price_vnpay + total_price_vnpay_spos + total_price_bank);
        }
        if (discount_type == 'percent') {
            discount = price * discount_change / 100;
        } else {
            discount = discount_change;
        }
        total = price - discount + ship_price;
        pay_amount = total - pay_visa;

        $scope.obj_invoice.discount = discount;
        $scope.obj_invoice.price = price;
        $scope.obj_invoice.total = total;
        $scope.obj_invoice.pay_amount = pay_amount;
        $scope.obj_invoice.pay_visa = pay_visa;
        $scope.obj_invoice.total_quatity = total_quatity;
    }

    $scope.resetSearchProduct = () => {
        $scope.filter_product = {
            key: '',
            load: false,
            list: [],
            show_rs: false,
        }
    }

    $scope.resetSearchCustomer = () => {
        $scope.filter_customer = {
            key: '',
            load: false,
            list: [],
            show_rs: false
        }
    }

    $scope.resetSearchUserCollaborator = () => {
        $scope.filter_user_collaborator = {
            key: '',
            load: false,
            list: [],
            show_rs: false
        }
    }

    // search customer
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
            showMessErrSystem()
        });
    }

    $scope.chooseUserCollaborator = (value) => {
        var item = angular.copy(value);
        if (item.customer_id != 0) {
            var cus_info = JSON.parse(item.obj_customer_collaborator);
            Swal.fire({
                icon: 'info',
                confirmButtonText: 'Đồng ý',
                title: 'Nhân viên này là CTV',
                width: (window.innerWidth > 768) ? '' : '60 vw',
                html: `<table class="table text-left">
                                <tbody>
                                    <tr>
                                        <td>Mã KH:</td>
                                        <td>${cus_info.id}</td>
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

    $scope.resetEditCustomer = () => {
        $scope.obj_edit_customer = _obj_edit_customer();
        $scope.resetEditCustomerAddress();
        $scope.resetSearchListCustomerAddress();
        $scope.resetSearchUserCollaborator();
    }

    $scope.resetSearchListCustomerAddress = () => {
        $scope.obj_search_list_customer_address = _obj_search_list_customer_address();
    }

    $scope.resetEditCustomerAddress = () => {
        $scope.all_districts = [];
        $scope.all_wards = [];
        $scope.obj_edit_customer.edit_address = _obj_edit_address();
    }

    $scope.editCustomerAddress = (item) => {
        item.index_of = $scope.obj_edit_customer.list_address.indexOf(item);
        $scope.obj_edit_customer.edit_address = angular.copy(item);

        $scope.obj_edit_customer.edit_address.province_id += '';
        $scope.obj_edit_customer.edit_address.district_id += '';
        $scope.obj_edit_customer.edit_address.ward_id += '';

        $scope.getDistricts(item.province_id);
        $scope.getWards(item.district_id);
    }

    $scope.chooseInvoice = (key) => {
        select2();
        $scope.obj_invoice = $scope.list_invoice[key];
        $scope.chooseCurrentUser();
        $scope.getProductInventory();
        setTimeout(() => {
            forcusSearchProduct();
        }, 250);
    }

    $scope.chooseCustomerAddres = (item) => {
        $scope.obj_invoice.obj_online_address = angular.copy(item);
        showMessSuccess('Đã chọn địa chỉ giao hàng');
    }

    $scope.confirmDelectInvoice = (key) => {
        var i_selected = $scope.list_invoice[key],
            exit_product = i_selected.list_product.length,
            current_id = i_selected.cr_id;
        if (exit_product) {
            Swal.fire({
                title: "Bạn có chắc chắn?",
                html: `Thông tin của Hóa đơn ${current_id} sẽ không được lưu lại`,
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
                        $scope.delectInvoice(key);
                    });
                }
            });
        } else {
            $scope.delectInvoice(key);
        }
    }

    $scope.delectInvoice = (key) => {
        var length = $scope.list_invoice.length,
            remove_cr_invoice = $scope.list_invoice[key].cr_id == $scope.obj_invoice.cr_id;

        if (length == 1) {
            $scope.list_invoice = [_obj_invoice_df()];
            $scope.chooseInvoice(0);
        } else {
            $scope.list_invoice.splice(key, 1);
            if (remove_cr_invoice) {
                $scope.chooseInvoice(length - 2);
            } else {
                setTimeout(() => {
                    forcusSearchProduct();
                }, 250);
            }
        }
    }

    $scope.addInvoice = () => {
        var list = angular.copy($scope.list_invoice),
            length = Object.keys(list).length,
            obj = _obj_invoice_df();

        if (length) {
            obj.cr_id = list[length - 1].cr_id + 1;
        }

        list.push(obj);
        $scope.list_invoice = list;
        $scope.chooseInvoice(length);
    }

    $scope.totalItem = (item) => {
        var pro = angular.copy(item),
            quantity = pro.quantity ? pro.quantity : 1,
            total_format = $scope.priceSale(pro) * quantity;

        return parseFloat(total_format);
    }

    $scope.priceSale = (item) => {
        var pro = angular.copy(item),
            price = formatDefaultNumber(pro.price),
            price_sale = price,
            discount_type = pro.discount_type,
            discount = pro.discount ? formatDefaultNumber(pro.discount) : 0;

        if (price > 0 && discount > 0) {
            if (discount_type == 'percent') {
                price_sale = price - (price / 100 * discount);
            } else {
                price_sale = price - discount;
            }
        }
        return price_sale;
    }

    $scope.hideRsFilterCustomer = () => {
        setTimeout(() => {
            $scope.filter_customer.show_rs = false;
            $scope.$apply();
        }, 300)
    }

    $scope.hideRsFilterUserCollaborator = () => {
        setTimeout(() => {
            $scope.filter_user_collaborator.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $scope.hideRsFilterProduct = () => {
        setTimeout(() => {
            $scope.filter_product.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    $scope.hideRsFilterGiftOnline = () => {
        setTimeout(() => {
            $scope.filter_gift_online.show_rs = false;
            $scope.$apply();
        }, 250)
    }

    // search product
    $scope.searchProduct = () => {
        var key = $scope.filter_product.key;
        if (key.length < 3) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchProduct(key);
        }, 350);
    }

    $scope._searchProduct = (key) => {
        $scope.filter_product.load = true;
        var data_rq = {
            key: key,
            store_id: store_id,
            company_id: company_id,
            nation_id: nation_id,
        };
        $http.get(_url + 'ajax_get_product_retail_by_key?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                $scope.filter_product.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_product.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.searchScanner = (barcode) => {
        $scope.filter_product.load = true;
        $http.get(_url + 'ajax_get_product_retail_by_barcode?barcode=' + barcode).then(r => {
            if (r.data && r.data.status) {
                var product = r.data.data;
                if (product) {
                    $scope.chooseProduct(product);
                } else {
                    showMessInfo('Không tìm thấy sản phẩm: ' + barcode);
                    showSoundErr();
                }
            }
            $scope.filter_product.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem('Không thể tìm sản phẩm với barcode');
        });
    }

    $scope.chooseProduct = (item) => {
        if ($scope.obj_invoice.obj_return) {
            showMessErr('Phiếu trả hàng không thể thêm sản phẩm');
            return;
        }

        var pro = $scope.resetItemProduct(item),
            added_quantity = false,
            cr_time = new Date().getTime();

        $.each($scope.obj_invoice.list_product, function (index, value) {
            if (value.id == pro.id) {
                value.time_created = cr_time;
                zoominElement(`.unit-${cr_time}`);
                value.quantity += 1;
                added_quantity = true;
                return false;
            }
        });
        if (!added_quantity) {
            pro.time_created = cr_time;
            $scope.obj_invoice.list_product.unshift(pro);
            zoominElement(`.time-${cr_time}`);
        }
        $scope.resetSearchProduct();
        $scope.checkGetProductInventory();

        setTimeout(() => {
            forcusSearchProduct();
        }, 250)
    }

    $scope.resetItemProduct = (item) => {
        var pro = angular.copy(item);
        pro.quantity = 1;
        pro.price = parseNumber(pro.price);
        pro.discount = '';
        pro.sale_user_id = '0';
        pro.note = '';
        pro.discount_type = 'percent';
        pro.load_inventory = false;
        pro.out_of_stock = false;
        return pro;
    }

    $scope.removeProduct = (key) => {
        $scope.obj_invoice.list_product.splice(key, 1);
        $scope.checkReustProductInventory();
        $scope.updateInvoice();
    }

    $scope.duplicateProduct = (item) => {
        var pro = $scope.resetItemProduct(item),
            _key = $scope.obj_invoice.list_product.indexOf(item),
            cr_time = new Date().getTime();

        pro.time_created = cr_time;
        if ($scope.obj_invoice.list_product.length == 1) { // mảng đang có 1 sp thì push vào phía sau luôn
            $scope.obj_invoice.list_product.push(pro);
        } else {
            $scope.obj_invoice.list_product.splice(_key + 1, 0, pro);
        }
        zoominElement(`.time-${cr_time}`);
        $scope.checkReustProductInventory();
    }

    $scope.searchUser = () => {
        if (store_id == 47) {
            if ($scope.obj_search_user.key.length < 4) {
                $scope.obj_search_user.list = [];
                return;
            }
        }
        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchUser();
            $scope.$apply();
        }, 350);
    }

    $scope._searchUser = () => {
        var key = $scope.obj_search_user.key;
        if (store_id == 47) {
            $scope.obj_search_user.load = true;
            $http.get(base_url + 'admin_users/ajax_search_user_by_key?key=' + key).then(r => {
                if (r.data && r.data.status) {
                    let data = r.data.data;
                    $scope.obj_search_user.list = data.filter(x => (x.user_id = x.id));
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_search_user.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem()
            });
        } else {
            var expected = ToSlug(key);
            $scope.obj_search_user.list = angular.copy($scope.obj_search_user.list_df.filter(item => ToSlug(item.fullname).indexOf(expected) !== -1));
        }
    }

    $scope.showModalUser = () => {
        $scope.resetSearchUser();
        showPopup('#modal_users');
        setTimeout(() => {
            $('#modal_users .input-group>input').focus().trigger('input');
        }, 200)
    }

    // search customer
    $scope.searchCustomer = () => {
        var key = $scope.filter_customer.key;
        if (key.length < 4) return true;

        if ($scope.filter_timer) {
            clearTimeout($scope.filter_timer);
        }
        $scope.filter_timer = setTimeout(() => {
            $scope._searchCustomer();
        }, 350);
    }

    $scope._searchCustomer = () => {
        var key = $scope.filter_customer.key;
        if (key.length < 4) return true;
        $scope.filter_customer.load = true;
        var data_rq = {
            phone: key,
            company_id: company_id,
        };
        $http.get(base_url + 'customers/ajax_get_customer_by_phone_v2?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $scope.filter_customer.list = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.filter_customer.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.chooseCustomer = (item) => {
        var cus = angular.copy(item);
        cus.list_address = cus.list_address ? JSON.parse(cus.list_address) : [];
        cus.obj_user_collaborator = cus.obj_user_collaborator ? JSON.parse(cus.obj_user_collaborator) : null;
        cus.list_address_ = cus.list_address;
        $scope.obj_invoice.customer = cus;
        if (invoice_type == 'online' && cus.list_address && cus.list_address.length && !$scope.obj_invoice.obj_online_address.customer_address_id) {
            $scope.chooseCustomerAddres(cus.list_address[0]);
        }

        $scope.filter_customer = {
            key: '',
            load: false,
            list: [],
            show_rs: false
        }
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
        if ($scope.obj_edit_customer.id > 0) { // đang cập nhật user thì lưu data luôn
            $scope.obj_edit_customer.load = true;
            obj_edit.customer_id = $scope.obj_edit_customer.id;
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
        } else {
            obj_edit.need_save = true;
            if (obj_edit.index_of >= 0) {
                $scope.obj_edit_customer.list_address[obj_edit.index_of] = obj_edit;
            } else {
                $scope.obj_edit_customer.list_address.push(obj_edit);
            }
            $scope.obj_edit_customer.list_address_ = angular.copy($scope.obj_edit_customer.list_address);
            $scope.resetEditCustomerAddress();
            select2();
        }
    }

    $scope.getListCustomerAddress = () => {
        if ($scope.obj_edit_customer.id == 0) return;
        if ($scope.obj_search_list_customer_address.offset >= 0) {
            if ($scope.obj_invoice.customer.list_address.length != $scope.obj_search_list_customer_address.offset + $scope.obj_search_list_customer_address.limit) {
                return;
            }
        }
        $scope.obj_search_list_customer_address.load = true;
        $scope.obj_search_list_customer_address.offset += $scope.obj_search_list_customer_address.limit;
        $scope.obj_search_list_customer_address.customer_id = $scope.obj_edit_customer.id;
        $http.get(base_url + 'customers/ajax_get_list_customer_address?' + $.param($scope.obj_search_list_customer_address)).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                $scope.obj_invoice.customer.list_address.push(...data);
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_search_list_customer_address.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.submitGetListCustomerAddress = () => {
        $scope.resetSearchListCustomerAddress();
        $scope.getListCustomerAddress();
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
            $scope.all_provinces = cacheProvinces.filter(x => x.nation_id == 1);
            select2();
        } else {
            $scope.load_address = true;
            $http.get(base_url + 'systems/ajax_get_provinces').then(r => {
                if (r.data && r.data.status) {
                    let data = r.data.data;
                    setStorage('provinces', data);
                    $scope.all_provinces = data.filter(x => x.nation_id == 1);
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

    $scope.resetCrCustomer = () => {
        if ($scope.obj_invoice.list_unit.length) {
            showMessErr('Phiếu thu này đã sử dụng GIFT ONLINE. Xóa hàng hóa dùng từ Gói này để Thay đổi khách hàng');
            return;
        }
        $scope.obj_invoice.customer = {
            id: 0,
            image: '',
            name: '',
            phone: '',
            hobby_note: '',
        }
        $scope.obj_invoice.obj_online_address = _obj_online_address();
        setTimeout(() => {
            forcusSearchCustomer();
        }, 100)
    }

    // get list shiper current store
    $scope.getListShipperStore = () => {
        $scope.load_shipper_list = true;
        $scope.obj_invoice.shipper_id = '0';
        $scope.shippers = [];
        $http.get(base_url + 'warehouse_shipper/ajax_get_list_shipper_store_for_invoice?store_id=' + store_id).then(r => {
            if (r.data && r.data.status) {
                let data = r.data.data;
                $scope.shippers = data;
                select2();
            } else {
                showMessErr(r.data.message);
            }
            $scope.load_shipper_list = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.updateConfirmTypeBank = () => {
        var bank_id = $scope.obj_invoice.transaction.bank.id,
            bank = $scope.cashbook_bank.filter(item => item.id === bank_id);
        if (bank.length) {
            $scope.obj_invoice.transaction.bank.confirm_type = bank[0].confirm_type;
        }
    }

    $scope.saveMpos = () => {
        var item = angular.copy($scope.obj_invoice.transaction.mpos),
            price = formatDefaultNumber(item.price),
            code = item.code,
            invoice_visa_transaction_id = item.invoice_visa_transaction_id;

        if ($scope.checkCodeMpos(code)) {
            if (price > 0) {
                $scope.obj_invoice.transaction.list_mpos.push({
                    code: code,
                    price: price,
                    invoice_visa_transaction_id: invoice_visa_transaction_id
                });
                $scope.obj_invoice.transaction.mpos = _obj_mpos();
                $scope.getListMposTransactions();
            } else {
                showMessErr('Số tiền thanh toán phải lớn hơn 0!')
                showInputErr('.vs_mpos_price');
                return;
            }
        }
    }

    $scope.confirmRemoveMpos = (key) => {
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
                setTimeout(() => {
                    $scope.obj_invoice.transaction.list_mpos.splice(key, 1);
                    $scope.$apply();
                }, 0);
            }
        })
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
            } else {
                // showMessErr(r.data.message);
            }
            $scope.obj_invoice.transaction.bank.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.saveBank = () => {
        var item = angular.copy($scope.obj_invoice.transaction.bank),
            price = formatDefaultNumber(item.price),
            code = item.code,
            invoice_visa_transaction_id = (item.choose_visa_trans && item.choose_visa_trans.id > 0) ? item.choose_visa_trans.id : 0,
            confirm_type = item.confirm_type,
            bank_id = item.id,
            verify_payment_id = item.verify_payment_id,
            image_url = item.image_url,
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

        if (invoice_visa_transaction_id) {
            if (price > Number(item.choose_visa_trans.amount_remain)) {
                showMessErr('Số tiền nhập vượt mức giao dịch đang chọn!');
                showInputErr('.vs_bank_price');
                return;
            }
        }

        $scope.obj_invoice.transaction.list_bank.push({
            code: code,
            price: price,
            bank_id: bank_id,
            image_url: image_url,
            verify_payment_id: verify_payment_id,
            bank_name: cr_bank.bank_name,
            account_name: cr_bank.account_name,
            account_number: cr_bank.account_number,
            confirm_type: cr_bank.confirm_type,
            invoice_visa_transaction_id: invoice_visa_transaction_id,
        });

        $scope.obj_invoice.transaction.bank = _obj_bank();
        if (verify_payment_id > 0) $scope.submitGetListVerifyPayment();
        if (invoice_visa_transaction_id > 0) $scope.sumbitGetListVisaTransactions();

    }

    $scope.confirmRemoveBank = (key) => {
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
                    var cur_obj = $scope.obj_invoice.transaction.list_bank[key];
                    if (cur_obj.confirm_type == 'image') {
                        $scope._removeFileVisa(cur_obj.image_url);
                    }
                    $scope.obj_invoice.transaction.list_bank.splice(key, 1);
                });
            }
        })
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
            code = item.code;
        if (!item.check) {
            showMessErr('Mã VNPAY chưa được xác thực!')
            return;
        }
        if (price > 0) {
            $scope.obj_invoice.transaction.list_vnpay.push({
                code: code,
                price: price,
            });
            $scope.obj_invoice.transaction.vnpay = _obj_vnpay();
        } else {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_vnpay_price');
            return;
        }
    }

    $scope.confirmRemoveVnpay = (key) => {
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
                setTimeout(() => {
                    $scope.obj_invoice.transaction.list_vnpay.splice(key, 1);
                    $scope.$apply();
                }, 0);
            }
        })
    }

    $scope.chooseCurrentUser = () => {
        if (!$scope.obj_invoice.sale_user || !Object.keys($scope.obj_invoice.sale_user).length) {
            var cr_user = $scope.users.find(x => x.user_id == current_user_id);
            $scope.chooseUser(cr_user);
        }
    }

    $scope.chooseUser = (user = null) => {
        $scope.obj_invoice.sale_user = angular.copy(user);
        hidePopup('#modal_users');
    }

    $scope.chooseUserSave = (user = null) => {
        user = user ? user : {
            user_id: 0
        };
        $scope.obj_invoice.sale_user = angular.copy(user);
        $scope.saveInvoice();
    }

    $scope.showPoupCreateCustmer = () => {
        showPopup('#modal_edit_customer');
        $scope.resetEditCustomer();
        var key = angular.copy($scope.filter_customer.key);
        $scope.obj_edit_customer.phone = key;
        $('#home-tab').trigger('click');
        setTimeout(() => {
            $('#modal_edit_customer .fullname').focus();
        }, 300);
        select2();
    }

    $scope.chooseTabAddress = () => {
        if ($scope.obj_edit_customer.list_address.length == 0) {
            var item = angular.copy($scope.obj_edit_customer),
                phone = item.edit_address.phone ? item.edit_address.phone : item.phone,
                name = item.edit_address.name ? item.edit_address.name : item.name;

            $scope.obj_edit_customer.edit_address.phone = phone;
            $scope.obj_edit_customer.edit_address.name = name;
        }
    }

    $scope.showPoupEditCustmer = () => {
        showPopup('#modal_edit_customer');
        $scope.obj_edit_customer = angular.copy($scope.obj_invoice.customer);
        $scope.resetEditCustomerAddress();
        $scope.resetSearchListCustomerAddress();
        $scope.resetSearchUserCollaborator();
        $scope.obj_edit_customer.birthday = $scope.obj_edit_customer.birthday && $scope.obj_edit_customer.birthday != '0000-00-00' ? moment($scope.obj_edit_customer.birthday, 'YYYY-MM-DD').format('DD / MM / YYYY') : '';
        $scope.obj_edit_customer.cmnd_provide_date = $scope.obj_edit_customer.cmnd_provide_date && $scope.obj_edit_customer.cmnd_provide_date != '0000-00-00' && $scope.obj_edit_customer.cmnd_provide_date != 'null' ? moment($scope.obj_edit_customer.cmnd_provide_date, 'YYYY-MM-DD').format('DD / MM / YYYY') : '';
        $scope.obj_edit_customer.cmnd_number = $scope.obj_edit_customer.cmnd_number && $scope.obj_edit_customer.cmnd_number != 'null' ? $scope.obj_edit_customer.cmnd_number : '';
        $scope.obj_edit_customer.cmnd_address = $scope.obj_edit_customer.cmnd_address && $scope.obj_edit_customer.cmnd_address != 'null' ? $scope.obj_edit_customer.cmnd_address : '';
        $('#home-tab').trigger('click');
        setTimeout(() => {
            $('#modal_edit_customer .fullname').focus();
        }, 300);
        select2();
    }

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
            list_address = item.list_address;

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
        if (birthday) {
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
                    }
                })
            }
            date_rq.address_query = {
                add: address_add,
                update: address_update,
            };
        } else {
            date_rq.store_id = store_id;
            date_rq.company_id = company_id;
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
                showMessSuccess('Cập nhật thành công');
                $scope.chooseCustomer(r.data.data);
                hidePopup('#modal_edit_customer');
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_edit_customer.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.checkPromiseDiscountMerchandise = (value) => {
        var item = angular.copy(value),
            type = item.type,
            price = item.price,
            id = item.id,
            promises = angular.copy($scope.list_promise),
            lists = [],
            arr_discount = [];
        if (!promises.length) return;

        lists = promises.filter(x => x.promotion_type_id == 1 || x.promotion_type_id == 2);
        if (!lists.length) return;

        $.each(lists, function (i, prom) {
            if (parseFloat(prom.price_request) > parseFloat(price)) return;

            var allow_discount = false;
            $.each(prom.obj_rule, function (index, rule) {
                if (rule.unit_type == type) {
                    if (rule.permit == 0) {
                        if (rule.unit_id == id) {
                            allow_discount = false;
                            return;
                        }
                    } else {
                        if (rule.unit_id == 0 || rule.id == id) {
                            allow_discount = true;
                        }
                    }
                }
            });
            if (allow_discount) {
                arr_discount.push({
                    promotion_id: prom.id,
                    discount: prom.discount,
                    discount_type: prom.discount_type,
                    name: prom.name,
                })
            }
        });

        var data_compile = {
            price: price,
            arr_discount: arr_discount
        };

        var discount_will = $scope.compileDiscountThan(data_compile);
        return discount_will;
    }

    $scope.compileDiscountThan = (item) => {
        var unit_price = item.price,
            arr_discount = item.arr_discount,
            discount_will = 0,
            discount_return = {
                discount: 0,
                name: '',
            };


        $.each(arr_discount, function (index, value) {
            value.price = unit_price;
            var _discount = $scope.returnPirceDiscount(value);
            if (discount_will < _discount) {
                discount_will = _discount;
                discount_return = {
                    discount: discount_will,
                    name: value.name,
                };
            }
        });

        return discount_return;
    }

    $scope.returnPirceDiscount = (value) => {
        var price = formatDefaultNumber(value.price),
            discount = formatDefaultNumber(value.discount),
            discount_type = value.discount_type;

        if (price > 0 && discount > 0) {
            if (discount_type == 'percent') {
                discount = price / 100 * discount;
            }
        }
        return parseFloat(discount);
    }

    $scope.checkVoucher = () => {
        if (!$scope.obj_invoice.obj_voucher.code) {
            showMessErr('Vui lòng nhập mã khuyễn mãi');
            return;
        }
        var customer_id = $scope.obj_invoice.customer.id,
            code = $scope.obj_invoice.obj_voucher.code,
            data_rq = {
                code: code,
                customer_id: customer_id
            };

        if (!customer_id) {
            showMessErr('Chọn khách hàng cho phiếu thu trước khi check mã');
            return;
        }

        $scope.obj_invoice.obj_voucher.load = true;
        $http.get(_url + 'ajax_check_voucher_by_code?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;
                $scope.obj_invoice.obj_voucher.code = '';
                $scope.obj_invoice.obj_voucher.info = data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_invoice.obj_voucher.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.removeVoucher = () => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            html: "Xóa mã voucher này!",
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'Đồng ý',
            allowOutsideClick: false,
        }).then((result) => {
            if (result.isConfirmed) {
                setTimeout(() => {
                    $scope.obj_invoice.obj_voucher = _obj_voucher();
                    $scope.$apply()
                }, 0)
            }
        })
    }

    $scope.checkGetProductInventory = () => {
        if ($scope.time_inventory) clearTimeout($scope.time_inventory);

        $scope.time_inventory = setTimeout(() => {
            var list_product = angular.copy($scope.obj_invoice.list_product),
                list_unit = angular.copy($scope.obj_invoice.list_unit.filter(x => x.type == 'product')),
                list_product_id = [...list_product.map(x => x.id), ...list_unit.map(x => x.id)],
                product_inventory = angular.copy($scope.productInventory),
                product_id_inventory = product_inventory.map(x => x.id);

            var check_not_exit = list_product_id.filter(x => !product_id_inventory.includes(Number(x)));
            if (check_not_exit.length) {
                $scope.getProductInventory();
            } else {
                $scope.checkReustProductInventory();
            }
        }, 100);
    }

    $scope.checkReustProductInventory = () => {
        var product_inventory = angular.copy($scope.productInventory),
            list_product = angular.copy($scope.obj_invoice.list_product),
            list_unit = angular.copy($scope.obj_invoice.list_unit.map(x => x.type == 'product'));

        if (!list_product.length && !list_unit.length) return;

        $.each($scope.obj_invoice.list_product, function (index, value) {
            value.load_inventory = false;

            var _list = list_product.filter(x => x.id == value.id),
                _list_unit = list_unit.filter(x => x.id == value.id);
            if (!_list.length) return;

            var pro_quantity_added = _list.map(x => x.quantity).reduce((a, c) => {
                    return a + c;
                }) + _list_unit.length,
                obj_inventory = product_inventory.find(x => x.id == value.id);

            if (!obj_inventory) return;
            var total_inventory = obj_inventory.inventory;

            value.inventory = total_inventory;
            if (total_inventory < 1 || total_inventory < pro_quantity_added) {
                value.out_of_stock = true;
            } else {
                value.out_of_stock = false;
            }
        });

        $.each($scope.obj_invoice.list_unit, function (index, value) {
            value.load_inventory = false;
            var _list = list_unit.filter(x => x.id == value.id),
                _list_pro = list_product.filter(x => x.id == value.id);

            if (!_list.length) return;

            var pro_quantity_added = _list.length,
                obj_inventory = product_inventory.find(x => x.id == value.id);

            if (_list_pro.length) {
                pro_quantity_added += _list_pro.map(x => x.quantity).reduce((a, c) => {
                    return a + c;
                });
            }

            if (!obj_inventory) return;
            var total_inventory = obj_inventory.inventory;

            value.inventory = total_inventory;
            if (total_inventory < 1 || total_inventory < pro_quantity_added) {
                value.out_of_stock = true;
            } else {
                value.out_of_stock = false;
            }
        });
    }

    $scope.getProductInventory = () => {
        var list_product = angular.copy($scope.obj_invoice.list_product),
            list_unit = angular.copy($scope.obj_invoice.list_unit.filter(x => x.type == 'product'));
        if (!list_product.length && !list_unit.length) return;

        var data_rq = {
            store_id: store_id,
            list_product_id: [...list_product.map(x => x.id), ...list_unit.map(x => x.id)],
        };
        $scope.obj_invoice.list_product.map(x => x.load_inventory = true);
        $scope.obj_invoice.list_unit.map(x => x.type == 'product' && (x.load_inventory = true));

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


    $('.search-product').on('focus', function () {
        setTimeout(() => {
            $scope.filter_product.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $('#search-filter-input-gift').on('focus', function () {
        setTimeout(() => {
            $scope.filter_gift_online.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $('#search-filter-user-collaborator').on('focus', function () {
        setTimeout(() => {
            $scope.filter_user_collaborator.show_rs = true;
            $scope.$apply();
        }, 0)
    })

    $('#switch_store_all').on('change', function () {
        var id = $(this).val(),
            com_id = _userStores.find(x => x.id == id).company_id;
        if ($scope.company_id != com_id) {
            ajax_change_store(id);
        } else {
            $scope.changeStore(id);
        }
    })

    $scope.changeStore = (id) => {
        var store = _userStores.find(x => x.id == id);

        store_id = id;

        if (store) {
            $scope.store_id = store_id;

            store_type = store.store_type;
            $scope.store_type = store_type;

            nation_id = store.nation_id;
            $scope.nation_id = nation_id;

            company_id = store.company_id;
            $scope.company_id = company_id;

            $scope.users = [];
            if (id == 47) {
                $scope.chooseCurrentUser();
                $scope.resetSearchUser();
            } else {
                $scope.getlistUserStore();
            }
            $scope.getListShipperStore();
            $scope.getProductInventory();
        }
        $scope.$apply();
    }

    $scope.openAddVoucher = () => {
        showPopup('#modal_add_voucher');
        setTimeout(() => {
            $('#modal_add_voucher input').focus();
        }, 300)
    }

    $scope.formatDefaultNumber = (num) => {
        return formatDefaultNumber(num)
    };
});

$(document).on('click', '.wrap-note:not(.disabled) .btn-icon', function () {
    var self = $(this);
    setTimeout(() => {
        var popover = self.parent().closest('.cell-name').find('.popover-c');
        popover.addClass('active');
        popover.find('textarea').focus();
    }, 0)
})

$(document).on('click', '.cell-change-price:not(.disabled)', function () {
    var self = $(this);
    setTimeout(() => {
        var popover = self.find('.popover-c');
        popover.addClass('active');
    }, 0)
})

$(window).resize(function () {
    setWidthBtnSave();
});

function setWidthBtnSave() {
    var w_col_right = $('.col-right').width();
    $('.wrap-save').css('width', w_col_right + 10);
}

document.addEventListener('click', function (event) {
    if (event.target.closest('.popover-c.active') || $(event.target).parents('.wrap-popover').find('.popover-c').hasClass('active')) {} else {
        $('.popover-c').removeClass('active');
    }

    if (event.target.closest('.menu-bar')) {
        // return true;
        if (event.target.closest('.list-bar') || event.target.closest('.dropdown-content')) {
            $('.menu-bar').toggleClass('active');
        }
    } else {
        $('.menu-bar').removeClass('active');
    }
});

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
    if (!Number(store_id)) return;
    switch (evt.keyCode) {
        case 27: // esc
            evt.preventDefault();
            hideAllPopup();
            break;
        case 112: // f1
            evt.preventDefault();
            forcusSearchProduct();
            break;
        case 113: // f2
            evt.preventDefault();
            forcusSearchCustomer();
            break;
        case 114: // f3
            evt.preventDefault();
            openPromise();
            break;
        case 120: // f9
            evt.preventDefault();
            openVisa();
            break;
        case 123: // f12
            evt.preventDefault();
            triggerSaveInvoice();
            break;
        default:
            return true;
    }
    return false;
};

function forcusSearchGift() {
    $('#search-filter-input-gift').focus().trigger('input');
}

function forcusSearchProduct() {
    $('.search-product').focus().trigger('input');
}

function forcusSearchCustomer() {
    $('.wrap-content .col-right .customer-search input').focus().trigger('input');
}

function triggerSaveInvoice() {
    $('#save-invoice').trigger('click');
}

function openVisa() {
    $('#btn-show-visa').trigger('click');
}

function openPromise() {
    showPopup('#modal_promise');
}

function showItemProErr(selector = '') {
    if (selector) {
        jQuery(selector).addClass('error');
        setTimeout(() => {
            jQuery(selector).removeClass('error');
        }, 1500);
    }
    return false;
}


var barcode = "";
var reading = false;
var _timeout = false;

document.addEventListener("keydown", e => {
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

function zoominElement(selector) {
    setTimeout(() => {
        $(selector).removeClass('zoomin');
        setTimeout(() => {
            $(selector).addClass('zoomin');
        }, 50)
    }, 0)
}
/**
 * Formatting number with thousand seperator
 */
app.filter('formatDefaultNumber', function () {
    return (value, n = 0, x = 3) => {

        if (!value) return 0;

        value = parseFloat(value);
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return value.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };
});

app.filter('formatCurrency', function () {
    return (value, noname = true, _nation_id = nation_id) => {
        if (!value) return 0;
        value = Number(value);
        if (_nation_id == 1) {
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
        return onlyDate ? moment(value, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY') : moment(value, 'YYYY-MM-DD HH:mm:ss').format('HH:mm:ss DD-MM-YYYY');
    };
});

app.filter('momentFormat', function () {
    return (value, format) => {
        return moment(value).format(format);
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