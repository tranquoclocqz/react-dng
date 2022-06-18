
_obj_invoice = function () {
    return {
        load: true,
        invoice_id: 0,
        province_id: '0',
        district_id: '0',
        ward_id: '0',
        total: 0,
        visa: 0,
        price: 0,
        discount: 0,
        discount_type: 'amount',
        discount_change: 0,
        total_quatity: 0,
        ship_price: 0,
        shipper_id: '0',
        sale_user_id: '0',
        note: '',
        note_print: '',
        list_result: {
            products: [],
        },
        obj_edit: {
            product: {}
        },
        transaction: {
            list_mpos: [],
            list_bank: []
        },
        customer_id: 0,
        customer_phone: '',
        customer_name: '',
        fullAddress: '',
    }
};
app.controller('saleCtrl', function ($scope, $http, $sce) {
    $scope.init = () => {
        window.history.pushState('', '', window.location.origin + window.location.pathname);
        $scope.userCollaborators = userCollaborators;
        $scope.user = user;
        $scope.filter = {
            user_id: user_id + '',
            invoice_type_sale: 'OFFLINE',
            ship_status_id: '4'
        };
        $scope.filterCb = {
            store_id: store_id + '',
            customers: [],
            ship_status: '4'
        };

        if (customerId > 0) {
            $scope.filterCb.customers = [customerId];
        }

        $scope.state = 'ALL';
        $scope.type = 'ALL';

        $scope.base_url = base_url;
        $scope.getData();
        $scope.isCollaborators = false;
        setTimeout(() => {
            $scope.filterCb.date = moment().format('01/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
        }, 0);
        $scope.loadUser = false;

        if (filter && filter.is_view == 2) {
            $scope.filterCb.store_id = filter.store_id + '';
            $scope.filterCb.customers = [filter.customer_id + ''];
            $scope.getUser($scope.filterCb.store_id);
            $scope.changeType('CTV');
        }
    }

    $scope.checkShowUrlImageVisa = checkShowUrlImageVisa;

    $scope.showModalListInvoiceVisa = (_value) => {
        var item = angular.copy(_value);

        $scope.obj_list_invoice_visa = {
            load: true,
            invoice_choose: item,
            choose_code: '',
            choose_image: '',
            list_mpos: [],
            list_vnpay: [],
            list_bank: [],
        }
        $('#modal_invoice_visa').modal('show');
        $http.get(base_url + 'invoice_new/ajax_get_invoice_visa_by_invoice_id?invoice_id=' + item.id).then(r => {
            if (r.data && r.data.status) {
                var list = r.data.data,
                    mpos = [],
                    vnpays = [],
                    banks = [],
                    choose_default = '';
                $.each(list, function (key, value) {
                    if (value.type == 1) {
                        mpos.push(value);
                    } else if (value.bank_id == 9) {
                        vnpays.push(value);
                    } else {
                        if (value.type == 2) value.trans_code_edit = '';
                        banks.push(value);
                    }
                });

                if (mpos.length) {
                    choose_default = 'mpos';
                } else if (vnpays.length) {
                    choose_default = 'vnpay';
                } else {
                    choose_default = 'bank'
                }

                $scope.obj_list_invoice_visa.list_mpos = mpos;
                $scope.obj_list_invoice_visa.list_vnpay = vnpays;
                $scope.obj_list_invoice_visa.list_bank = banks;
                $scope.chooseItemShowVisa(choose_default, 0);
            } else {
                showMessErr(r.data.message);
            }
            $scope.obj_list_invoice_visa.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.chooseItemShowVisa = (type, key) => {
        $scope.obj_list_invoice_visa.choose_code = '';
        $scope.obj_list_invoice_visa.choose_image = '';
        $scope.obj_list_invoice_visa.list_mpos.filter(x => x.current_choose = false);
        $scope.obj_list_invoice_visa.list_vnpay.filter(x => x.current_choose = false);
        $scope.obj_list_invoice_visa.list_bank.filter(x => x.current_choose = false);
        if (type == 'mpos') {
            $scope.obj_list_invoice_visa.list_mpos[key].current_choose = true;
            $scope.obj_list_invoice_visa.choose_code = $scope.obj_list_invoice_visa.list_mpos[key].value;
        } else if (type == 'vnpay') {
            $scope.obj_list_invoice_visa.list_vnpay[key].current_choose = true;
            $scope.obj_list_invoice_visa.choose_code = $scope.obj_list_invoice_visa.list_vnpay[key].value;
        } else {
            $scope.obj_list_invoice_visa.list_bank[key].current_choose = true;
            var _bank = angular.copy($scope.obj_list_invoice_visa.list_bank[key]);
            if (_bank.type == 2) {
                $scope.obj_list_invoice_visa.choose_image = _bank.value;
            } else {
                $scope.obj_list_invoice_visa.choose_code = _bank.value;
            }
        }
    }

    $scope.getUser = (store_id) => {
        $scope.userCollaborators = [];
        $scope.loadUser = true;
        $scope.filterCb.customer_id = 0;
        $http.get(base_url + `/ajax/get_list_users?store_id=${store_id}&is_collabor=true`).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.userCollaborators = r.data.data;
                console.log($scope.filterCb);
                select2();
                $scope.loadUser = false;
            }
        })
    }
    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    $scope.changeState = (val) => {
        $scope.state = val;
    }

    $scope.changeType = (val) => {
        $scope.type = val;
        if (val == 'ALL') {
            $scope.getData();
        } else {
            $scope.total = {};
            $scope.getCollaboratorsSale();
        }
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200)
    }

    $scope.getClassStatusName = (id) => {
        id = parseInt(id);
        var name = '';
        if ([1, 7, 9, 10, 20, 127, 128, 49, 410].includes(id)) {
            name = 'label-warning';
        } else if ([2, 3, 4, 12, 21, 123, 45].includes(id)) {
            name = 'label-info';
        } else if ([5, 6, 11].includes(id)) {
            name = 'label-success';
        } else if ([-1].includes(id)) {
            name = 'label-dark';
        } else if ([8].includes(id)) {
            name = 'label-danger';
        }
        return name;
    }


    $scope.getData = () => {
        if ($scope.filter.user_id > 0) {
            if ($scope.filter.date) {
                let d1 = $scope.filter.date.split('-')[0].trim();
                let d2 = d1.split('/');
                let d3 = $scope.filter.date.split('-')[1].trim();
                let d4 = d3.split('/');
                $scope.filter.start_date = d2[2] + '-' + d2[1] + '-' + d2[0];
                $scope.filter.end_date = d4[2] + '-' + d4[1] + '-' + d4[0];
            } else {
                $scope.filter.start_date = moment().format('YYYY-MM-DD');
                $scope.filter.end_date = moment().format('YYYY-MM-DD');
            }

            $scope.loading = true;
            $http.get(base_url + '/staffs/ajax_get_sale_user?filter=' + JSON.stringify($scope.filter)).then(r => {
                if (r.data.status == 1) {
                    $scope.total = r.data.total;
                    $scope.rows = r.data.data;
                    $scope.viewTarget = r.data.view_target;
                    $scope.loading = false;
                    $scope.invoice = {
                        products: [],
                        services: [],
                        packages: [],
                        debits: []
                    };
                    $scope.rows.forEach(iv => {
                        iv.products.forEach(e => {
                            let inv = angular.copy(iv);
                            inv.product_name = e.product_name;
                            inv.product_price = e.total;
                            inv.quantity = e.quantity;
                            $scope.invoice.products.push(inv);
                        });
                        iv.services.forEach(e => {
                            let invSer = angular.copy(iv);
                            invSer.service_name = e.service_name;
                            invSer.service_price = e.total;
                            invSer.type = e.type;
                            invSer.is_saler = e.is_saler;
                            invSer.is_handle = e.is_handle;
                            $scope.invoice.services.push(invSer);
                        });

                        iv.units.forEach(unit => {
                            let invUnit = angular.copy(iv);
                            invUnit.service_name = unit.service_name;
                            invUnit.service_price = 0;
                            invUnit.is_handle = 1;
                            invUnit.is_unit = 1;
                            $scope.invoice.services.push(invUnit);
                        });

                        iv.packages.forEach(e => {
                            let invPac = angular.copy(iv);
                            invPac.package_name = e.package_name;
                            invPac.package_price = e.pay;
                            $scope.invoice.packages.push(invPac);
                        });

                        iv.debits.forEach(e => {
                            let invDebit = angular.copy(iv);
                            invDebit.package_name = e.package_name;
                            invDebit.debit_price = e.total;
                            $scope.invoice.debits.push(invDebit);
                        });
                    });
                }
            })

        }
    }

    $scope.ressetData = () => {
        $scope.total_package = {};
        $scope.histories = [];
        $scope.rows = [];
        $scope.tota = {};
    }

    // $scope.changeCustomer = () => {
    //     let hasAll = $scope.filterCb.customers.find(r => { return r == 0; });
    //     if (hasAll) $scope.filterCb.customers = ['0'];
    //     select2();
    // }

    $scope.getCollaboratorsSale = () => {
        $scope.loading = true;
        if ($scope.userCollaborators.length > 0) {
            if ($scope.filterCb.date) {
                let d1 = $scope.filterCb.date.split('-')[0].trim();
                let d2 = d1.split('/');
                let d3 = $scope.filterCb.date.split('-')[1].trim();
                let d4 = d3.split('/');
                $scope.filterCb.start_date = d2[2] + '-' + d2[1] + '-' + d2[0];
                $scope.filterCb.end_date = d4[2] + '-' + d4[1] + '-' + d4[0];
            } else {
                $scope.filterCb.start_date = moment().format('YYYY-MM-01');
                $scope.filterCb.end_date = moment().format('YYYY-MM-DD');
            }
            let hasAll = $scope.filterCb.customers.find(r => { return r == 0; });
            filterCb = angular.copy($scope.filterCb);
            if (hasAll) {
                $scope.filterCb.customers = ['0'];
                filterCb.customers = $scope.userCollaborators.map(r => { return r.customer_id; });
                select2();
            }

            if (filterCb.customers.length == 0) {
                $scope.ressetData();
                $scope.loading = false;
                return;
            }
            $http.get(base_url + '/staffs/get_user_collaborators_sale_details?filter=' + JSON.stringify(filterCb)).then(r => {
                if (r.data.status == 1) {
                    $scope.total_package = r.data.total_package;
                    $scope.histories = r.data.histories;
                    $scope.total = r.data.total;
                    $scope.rows = r.data.data;
                }
                $scope.loading = false;
            });
        } else {
            setTimeout(() => {
                $scope.$apply(function () {
                    $scope.ressetData();
                    $scope.loading = false;
                });
            }, 200)
        }
    }

    $scope.formatDate = (date, fm) => {
        return moment(date).format(fm ? fm : 'DD-MM-YYYY');
    }

    $scope.showDetail = (value) => {
        $scope.invoice = value;
        $('#invoice_modal').modal('show');
    }

    $scope.geStatusShip = (id) => {
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


    $scope.openInvoiceDetail = (value, is_return = 1) => {
        var item = angular.copy(value);
        $scope.resetEditInvocie();

        if (is_return == 1) {
            if (!([1, 2].includes(parseInt(item.ship_status_id)))) {
                showMessErr('Trạng thái đơn hàng không phù hợp để tạo Đơn chuyển hoàn!');
                return;
            }
            if (!item.warehouse_shipper_api_id) {
                showMessErr('Chưa khởi tạo api cho nhà vận chuyển! Vui lòng liên hệ DEV!');
                return;
            }
            $scope.obj_invoice.note = 'Hoàn từ đơn hàng ' + item.invoice_id;
        } else {
            $scope.obj_invoice.note = item.note;
            $scope.obj_invoice.note_print = item.note_print;
            $scope.obj_invoice.ship_price = item.ship_price;
        }

        $('#modal_edit').modal('show');
        $scope.obj_invoice.is_return = is_return;
        if (!is_return) {
            $scope.obj_invoice.ship_price = item.ship_price;
            $scope.obj_invoice.discount_change = item.discount;
        }

        $scope.obj_invoice.cod_amount = item.cod_amount;
        $scope.obj_invoice.visa = item.visa;
        $scope.obj_invoice.total = item.total;
        $scope.obj_invoice.invoice_id = item.id;
        $scope.obj_invoice.customer_id = item.customer_id;
        $scope.obj_invoice.customer_phone = item.customer_phone;
        $scope.obj_invoice.customer_name = item.customer_name;
        $scope.obj_invoice.fullAddress = item.fullAddress;
        $scope.obj_invoice.name = item.name;
        $scope.obj_invoice.phone = item.phone;
        $scope.obj_invoice.invoice_type_sale = item.invoice_type_sale;
        $scope.getInvoiceDetail();
        $scope.getInvoiceVisa();
    }

    $scope.updateInvoice = () => {
        var cr_invoice = angular.copy($scope.obj_invoice),
            price = 0,
            discount_change = formatDefaultNumber(cr_invoice.discount_change),
            discount_type = cr_invoice.discount_type,
            ship_price = formatDefaultNumber(cr_invoice.ship_price),
            total = 0,
            list_result = cr_invoice.list_result,
            list_product = list_result.products,
            list_service = list_result.services,
            list_package = list_result.packages,
            list_debit = list_result.debits,
            list_unit = list_result.units,
            total_quatity = 0;

        if (list_unit.length) {
            var units_pro = list_unit.filter(x => x.type == 'product');
            total_quatity += units_pro.length;
        }

        if (list_product.length) {
            price += list_product.map(o => parseFloat(o.total)).reduce((a, c) => {
                return a + c;
            });

            total_quatity += list_product.map(o => parseInt(o.quantity)).reduce((a, c) => {
                return a + c;
            });
        }

        if (list_service.length) {
            price += list_service.map(o => parseFloat(o.total)).reduce((a, c) => {
                return a + c;
            });
        }

        if (list_package.length) {
            price += list_package.map(o => parseFloat(o.pay)).reduce((a, c) => {
                return a + c;
            });
        }

        if (list_debit.length) {
            price += list_debit.map(o => parseFloat(o.total)).reduce((a, c) => {
                return a + c;
            });
        }

        if (discount_type == 'percent') {
            discount = price * discount_change / 100;
        } else {
            discount = discount_change;
        }
        total = price - discount + ship_price;

        $scope.obj_invoice.discount = discount;
        $scope.obj_invoice.total = total;
        $scope.obj_invoice.price = price;
        $scope.obj_invoice.total_quatity = total_quatity;
    }

    $scope.getInvoiceDetail = () => {
        $scope.obj_invoice.load = true;
        $http.get(base_url + 'invoice_new/' + 'ajax_get_invoice_detail?invoice_id=' + $scope.obj_invoice.invoice_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data;

                $.each(data.invoice_products, function (index, value) {
                    var quantity = parseInt(value.quantity);
                    value.quantity_default = quantity;
                    value.quantity = quantity;
                    if ($scope.obj_invoice.is_return) {
                        value.note = '';
                    }
                });
                $scope.obj_invoice.list_result.products = data.invoice_products;

                if (!$scope.obj_invoice.is_return) {
                    $scope.obj_invoice.list_result.services = data.invoice_services;
                    $scope.obj_invoice.list_result.packages = data.customer_packages;
                    $scope.obj_invoice.list_result.units = data.customer_package_units;
                    $scope.obj_invoice.list_result.debits = data.customer_package_debits;
                }
            } else {
                showMessErr(r.data.message);
            }
            $scope.updateInvoice();
            $scope.obj_invoice.load = false;
            $('.input-format-number').trigger('keyup');
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

    $scope.resetEditInvocie = () => {
        $scope.obj_invoice = _obj_invoice();
    }

    $scope.getInvoiceVisa = () => {
        $http.get(base_url + 'invoice_new/' + 'ajax_get_invoice_visa_by_invoice_id?invoice_id=' + $scope.obj_invoice.invoice_id).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data,
                    mpos = [],
                    banks = [];
                $.each(data, function (key, value) {
                    if (value.type == 1) {
                        mpos.push(value);
                    } else {
                        banks.push(value);
                    }
                });

                $scope.obj_invoice.transaction.list_bank = banks;
                $scope.obj_invoice.transaction.list_mpos = mpos;
            } else {
                showMessErr(r.data.message);
            }
            $scope.updateInvoice();
        }, function (data, status, headers, config) {
            showMessErrSystem();
        });
    }

});