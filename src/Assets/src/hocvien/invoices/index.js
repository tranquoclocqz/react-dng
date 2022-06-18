var url_api = base_url + 'hocvien/invoice/';

const _obj_bank = function () {
        return {
            id: '0',
            code: '',
            price: '',
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
            id: '0',
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
    _obj_tab_transaction = function () {
        return {
            type: 'mpos',
            child_tab_vnpay: {
                type: 'qr_static', // spos
            }
        }
    };



$(document).keydown(function (event) {
    if (event.keyCode == 27) {
        $('#create_modal').modal('hide');
    }
});
app.directive('ngFile', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            element.bind('change', function () {

                $parse(attrs.ngFile).assign(scope, element[0].files)

                scope.$apply();

            });
        }
    };
}]);
app.controller('invoice', function ($scope, $http, $compile, $window) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 50,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        $('.box').css('opacity', '1');
        $scope.base_url = base_url;
        $scope.cashbook_bank = cashbook_bank;
        $scope.triggerFunction = {};
        $scope.triggerFunction2 = {};
        $scope.is_dev = is_dev;
        $scope.invoice = {};
        $scope.terminal_code = terminal_code;

        $scope.discountCheck = '0';
        $scope.filter = {};
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.date = moment().format('MM/DD/YYYY') + '-' + moment().format('MM/DD/YYYY');
        $scope.dateInputInit();
        $scope.check = 0;
        $scope.current_user_id = id_current_user;

        setTimeout(() => {
            $scope.check = 1;
            $scope.getInvoice();
        }, 150);

        $scope.getCourseOption();
        $scope.getStore();
        $scope.getBunos();

        $scope.getCourseStore();

        $scope.resetMposTransactions();
        $scope.resetListVisaTransactions();
        $scope.resetChooseTypeTransactions();
        $scope.clearEditInPopupVisa();
        // $scope.getInvoiceByUser();
        $scope.toDay = toDay;
        $scope.vnpay_spos_transactions = {
            list: [],
            load: false
        }
    }

    $scope.openInitSpos = () => {
        $scope.obj_init_spos = {
            load: false,
            amount: $scope.invoice.amount,
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
        $('#modal_init_spos .popup-content').addClass('loading');
        $.ajax({
            type: 'post',
            url: base_url + 'vnpay/ajax_request_init_spos',
            data: {
                invoice_id: $scope.invoice.id ? $scope.invoice.id : 'academy',
                store_id: cr_store_id,
                amount: amount,
                methodCode: item.method_code,
                company_id: 2
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
                    $('#modal_init_spos .popup-content').removeClass('loading');
                })
            },
            error: function () {
                showMessErrSystem();
            }
        });
    }

    $scope.getListVnpaySposTransactions = () => {
        var data_rq = {
            date: $scope.invoice.date,
            store_id: cr_store_id
        };

        $scope.vnpay_spos_transactions.load = true;
        $scope.vnpay_spos_transactions.list = [];
        $http.get(base_url + 'invoices_v2/ajax_get_list_vnpay_spos_transactions?' + $.param(data_rq)).then(r => {
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
    // tab spos
    $scope.chooseTabVnpayTransaction = (type) => {
        $scope.obj_tab_transaction.child_tab_vnpay.type = type;
        if (type == 'spos' && !$scope.vnpay_spos_transactions.list.length) {
            $scope.getListVnpaySposTransactions();
        }
    }

    $scope.checkShowUrlImageVisa = checkShowUrlImageVisaHocVien;

    $scope.resetChooseTypeTransactions = () => {
        $scope.obj_tab_transaction = _obj_tab_transaction();
        // $scope.obj_tab_transaction = {
        //     type: 'mpos',
        // };
    }

    $scope.chooseTabTransaction = (type) => {
        $scope.obj_tab_transaction.type = type;
        if (type == 'bank' && !$scope.obj_list_visa_trans.list_df.length) {
            $scope.sumbitGetListVisaTransactions();
        }
    }

    $scope.resetMposTransactions = () => {
        $scope.mpos_transactions = {
            list: [],
            load: false
        }
    }

    $scope.updateInvoice = () => {
        var cr_invoice = angular.copy($scope.invoice),
            list_transactions = cr_invoice.transaction,
            visa_mpost = 0,
            visa_transfer = 0;

        if (list_transactions) {
            var mpos = list_transactions.list_mpos,
                vnpay = list_transactions.list_vnpay,
                list_vnpay_spos = list_transactions.list_vnpay_spos,
                bank = list_transactions.list_bank;

            if (mpos.length) {
                visa_mpost += mpos.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }

            if (vnpay.length) {
                visa_transfer += vnpay.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }

            if (list_vnpay_spos.length) {
                visa_transfer += list_vnpay_spos.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }

            if (bank.length) {
                visa_transfer += bank.map(o => formatDefaultNumber(o.price)).reduce((a, c) => {
                    return a + c;
                });
            }
        }

        $scope.invoice.visa_mpost = parseFloat(visa_mpost);
        $scope.invoice.visa_transfer = parseFloat(visa_transfer);
        $scope.invoice.visa = $scope.invoice.visa_mpost + $scope.invoice.visa_transfer;
    }

    $scope.saveMpos = () => {
        var item = angular.copy($scope.invoice.transaction.mpos),
            price = formatDefaultNumber(item.price),
            code = item.code,
            invoice_visa_transaction_id = item.invoice_visa_transaction_id;

        if ($scope.checkCodeMpos(code)) {
            if (price > 0) {
                $scope.invoice.transaction.list_mpos.push({
                    code: code,
                    price: price,
                    invoice_visa_transaction_id: invoice_visa_transaction_id
                });
                $scope.invoice.transaction.mpos = _obj_mpos();
                $scope.getListMposTransactions();
                $scope.updateInvoice();
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
                var _mpos = $scope.invoice.transaction.list_mpos[key];
                if (_mpos.id) {
                    $scope.invoice.transaction_remove.push(_mpos.id);
                }
                setTimeout(() => {
                    $scope.invoice.transaction.list_mpos.splice(key, 1);
                    $scope.updateInvoice();
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

    $scope.chooseItemMposTransaction = (value) => {
        var item = angular.copy(value),
            price = item.transfer_amount,
            transfer_status = Number(item.transfer_status),
            code = item.transfer_authcode; // mã chuẩn chi

        if (![100, 104].includes(transfer_status)) {
            showMessErr('Trạng thái không phù hợp để chọn');
            return;
        }

        var check_exist = $scope.invoice.transaction.list_mpos.find(x => x.invoice_visa_transaction_id == value.id);
        if (check_exist) {
            showMessErr('Giao dịch này đã được chọn trong phiếu thu');
            return;
        }

        if (code == '000000') {
            code = item.transfer_code; // mã giao dịch
        }

        if ($scope.invoice.transaction.mpos.price) {
            price = $scope.invoice.transaction.mpos.price;
        }
        price = parseNumber(price);

        $scope.invoice.transaction.mpos = {
            code: code,
            price: price,
            invoice_visa_transaction_id: item.id,
        }
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
                    $scope.invoice.transaction.bank.choose_visa_trans = {};
                });
            }
        });
    }

    $scope.getListMposTransactions = () => {
        var data_rq = {
            is_academy: 1,
            date: $scope.invoice.date
        };

        $scope.mpos_transactions.load = true;
        $scope.mpos_transactions.list = [];
        $http.get(base_url + 'invoice_new/ajax_get_list_mpos_transactions?' + $.param(data_rq)).then(r => {
            if (r.data && r.data.status) {
                var data = r.data.data,
                    list_mpos = angular.copy($scope.invoice.transaction.list_mpos);

                $.each(data, function (index, value) {
                    value.transfer_code = value.transfer_code.toString().slice(-8);
                    value.transfer_date = moment(value.transfer_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm');
                    var _mpos = list_mpos.find(x => x.invoice_visa_transaction_id == value.id && !x.id);
                    if (_mpos) {
                        value.academy_visa_imports.push({
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

    $scope.checkVnpay = () => {
        var obj_vnpay = angular.copy($scope.invoice.transaction.vnpay),
            price = formatDefaultNumber(obj_vnpay.price),
            txnId = obj_vnpay.code,
            payDate = obj_vnpay.payDate,
            data_rq = {
                txnId: txnId,
                academy_stores_id: $scope.invoice.recive_store_id,
                payDate: '',
            };

        if (!$scope.invoice.recive_store_id) {
            showMessErr('Vui lòng chọn chi nhánh thu tiền');
            return;
        }

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

        $scope.invoice.transaction.vnpay.check = false;
        $scope.invoice.transaction.vnpay.load = true;
        $.ajax({
            url: base_url + 'vnpay/check_transaction_academy',
            type: 'post',
            data: data_rq,
            dataType: 'json',
            success: function (response) {
                if (response.status) {
                    var data = response.data;
                    $scope.$apply(() => {
                        $scope.invoice.transaction.vnpay.check = true;
                        $scope.invoice.transaction.vnpay.price = price > 0 ? price : data.debitAmount;
                        $scope.invoice.transaction.vnpay.price_from_vnpay = data.debitAmount;
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
                    $scope.invoice.transaction.vnpay.load = false;
                })
            },
            error: function () {
                showMessErrSystem();
            }
        });
    }

    $scope.chooseItemVnpaySpos = (value) => {
        var item = angular.copy(value),
            id = item.id,
            price = item.transfer_amount,
            transfer_status = Number(item.transfer_status),
            code = item.transfer_code;
        if (![200].includes(transfer_status)) {
            showMessErr('Trạng thái không phù hợp để chọn');
            return;
        }
        var check_exist = $scope.invoice.transaction.list_vnpay_spos.find(x => x.invoice_visa_transaction_id == value.id);
        if (check_exist) {
            showMessErr('Giao dịch này đã được chọn trong phiếu thu');
            return;
        }

        if ($scope.invoice.transaction.vnpay_spos.price) {
            price = $scope.invoice.transaction.vnpay_spos.price;
        }
        price = parseNumber(price);
        $scope.invoice.transaction.vnpay_spos = {
            id: id,
            code: code,
            price: price,
            invoice_visa_transaction_id: item.id,
        }
        $scope.updateInvoice();
    }

    $scope.saveVnpaySpos = () => {
        var item = angular.copy($scope.invoice.transaction.vnpay_spos),
            id = item.id,
            price = formatDefaultNumber(item.price),
            code = item.code,
            invoice_visa_transaction_id = item.invoice_visa_transaction_id;

        if (!code) {
            showMessErr('Mã thanh toán không được bỏ trống!')
            showInputErr('.vs_vnpay_spos_code');
            return;
        }
        if (price > 0) {
            $scope.invoice.transaction.list_vnpay_spos.push({
                code: code,
                price: price,
                invoice_visa_transaction_id: invoice_visa_transaction_id
            });
            $scope.invoice.transaction.vnpay_spos = _obj_vnpay_spos();
            $scope.updateInvoice();
        } else {
            showMessErr('Số tiền thanh toán phải lớn hơn 0!')
            showInputErr('.vs_vnpay_price');
            return;
        }
    }

    $scope.saveVnpay = () => {
        var item = angular.copy($scope.invoice.transaction.vnpay),
            price = formatDefaultNumber(item.price),
            code = item.code,
            price_from_vnpay = formatDefaultNumber(item.price_from_vnpay);

        if (!item.check) {
            showMessErr('Mã VNPAY chưa được xác thực!')
            return;
        }
        if (price > 0) {
            $scope.invoice.transaction.list_vnpay.push({
                code: code,
                price: price,
                price_from_vnpay: price_from_vnpay,
            });
            $scope.invoice.transaction.vnpay = _obj_vnpay();
            $scope.updateInvoice();
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
                $scope.$apply(() => {
                    var cur_obj = $scope.invoice.transaction.list_vnpay[key];
                    if (cur_obj.id) {
                        $scope.invoice.transaction_remove.push(cur_obj.id);
                    }
                    $scope.invoice.transaction.list_vnpay.splice(key, 1);
                    $scope.updateInvoice();
                });
            }
        })
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
                $scope.$apply(() => {
                    var cur_obj = $scope.invoice.transaction.list_vnpay_spos[key];
                    if (cur_obj.id) {
                        $scope.invoice.transaction_remove.push(cur_obj.id);
                    }
                    $scope.invoice.transaction.list_vnpay_spos.splice(key, 1);
                    $scope.updateInvoice();
                });
            }
        })
    }

    $scope.saveBank = () => {
        var item = angular.copy($scope.invoice.transaction.bank),
            price = formatDefaultNumber(item.price),
            code = item.code,
            invoice_visa_transaction_id = (item.choose_visa_trans && item.choose_visa_trans.id > 0) ? item.choose_visa_trans.id : 0,
            confirm_type = item.confirm_type,
            bank_id = item.id,
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

        $scope.invoice.transaction.list_bank.push({
            code: code,
            price: price,
            bank_id: bank_id,
            image_url: image_url,
            bank_name: cr_bank.bank_name,
            account_name: cr_bank.account_name,
            account_number: cr_bank.account_number,
            confirm_type: cr_bank.confirm_type,
            invoice_visa_transaction_id: invoice_visa_transaction_id,
        });

        $scope.invoice.transaction.bank = _obj_bank();
        if (invoice_visa_transaction_id > 0) $scope.sumbitGetListVisaTransactions();
        $scope.updateInvoice();
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
                    var cur_obj = $scope.invoice.transaction.list_bank[key];
                    if (cur_obj.confirm_type == 'image') {
                        $scope._removeFileVisa(cur_obj.image_url);
                    }
                    if (cur_obj.id) {
                        $scope.invoice.transaction_remove.push(cur_obj.id);
                    }
                    $scope.invoice.transaction.list_bank.splice(key, 1);
                    $scope.updateInvoice();
                });
            }
        })
    }

    $scope.uploadFileVisa = (input) => {
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
        $scope.invoice.transaction.bank.load = true;
        $http({
            method: 'POST',
            url: base_url + 'invoices_v2/ajax_upload_visa_sale_online_temp',
            headers: {
                'Content-Type': undefined
            },
            data: formData
        }).then(r => {
            if (r.data && r.data.status) {
                $scope.invoice.transaction.bank.image_url = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
            $scope.invoice.transaction.bank.load = false;
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
                    $scope._removeFileVisa($scope.invoice.transaction.bank.image_url);
                    $scope.invoice.transaction.bank.image_url = '';
                });
            }
        })
    }


    $scope._removeFileVisa = (url) => {
        $scope.invoice.transaction.bank.load = true;
        $http.post(url_api + 'ajax_remove_visa_sale_online_temp', {
            file_url: url
        }).then(r => {
            if (r.data && r.data.status) {
                showMessSuccess();
            } else {}
            $scope.invoice.transaction.bank.load = false;
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.chooseItemVisaTransaction = (value) => {
        var item = angular.copy(value);

        var _exit_bank = $scope.cashbook_bank.find(x => x.id == item.bank_id);
        if (_exit_bank) {
            $scope.invoice.transaction.bank.id = item.bank_id;
        } else {
            showMessErr('Ngân hàng khách thanh toán không phù hợp.');
            return;
        }

        $scope.invoice.transaction.bank.choose_visa_trans = item;
        $scope.invoice.transaction.bank.price = parseNumber(item.amount_remain);
        $scope.invoice.transaction.bank.model_manual = true;
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
                    $scope.invoice.transaction.bank.choose_visa_trans = {};
                });
            }
        });
    }

    $scope.resetListVisaTransactions = () => {
        var key = $scope.obj_list_visa_trans && $scope.obj_list_visa_trans.key ? $scope.obj_list_visa_trans.key : '';
        $scope.obj_list_visa_trans = {
            key: '',
            date_end: $scope.invoice.date ? $scope.invoice.date : moment().format('YYYY-MM-DD'),
            offset: -10,
            limit: 10,
            load: false,
            list: [],
            list_df: [],
        };
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
        obj_search.is_academy = 1;

        $http.get(base_url + 'invoice_new/ajax_get_list_visa_transaction?' + $.param(obj_search)).then(r => {
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
            showMessErrSystem()
        });
    }

    $scope.clearEditInPopupVisa = () => {
        $scope.invoice.date = $scope.invoice.date ? $scope.invoice.date : moment().format('YYYY-MM-DD');
        $scope.invoice.transaction = {
            list_mpos: [],
            mpos: _obj_mpos(),
            list_vnpay: [],
            vnpay: {
                code: '',
                price: '',
                check: false,
                payDate: moment($scope.invoice.date, 'YYYY-MM-DD').format('DD / MM / YYYY'),
                load: false
            },
            list_bank: [],
            bank: _obj_bank(),
            list_vnpay_spos: [],
            vnpay_spos: _obj_vnpay_spos()
        }
        $scope.invoice.transaction_remove = [];
    }

    // -----------------------
    $scope.openModalTrans = (value) => {
        var data = {
            id: value.id
        };

        $http.get(base_url + 'hocvien/invoice/ajax_get_trans?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.trans = r.data.data;
                $('#trans').modal('show');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.checkIsset = (items, value) => {
        var check = false;
        if (!items || items && items.length == 0)
            return check;

        items.forEach(element => {
            if (element.course_id == value.course_id) {
                check = true;
            }
        });
        return check;
    };

    $scope.turnUrl = (items) => {
        if (!items || items && items.length == 0)
            return {};

        var data = {
            member_id: 0,
            course_ids: []
        }


        items.forEach(element => {
            data.member_id = element.member_id;
            data.course_ids.push(element.course_id);
        });


        return JSON.stringify(data);

    }

    $scope.select_ = (value) => {
        var i = -1;
        $scope.cr_select.forEach((element, index) => {
            if (element.course_id == value.course_id) {
                i = index;
            }
        });

        if (i > -1) {
            $scope.cr_select.splice(i, 1);
        } else {
            $scope.cr_select.push(value);
        }

    };

    $scope.openModalCoursePrint = (value) => {
        var data = {
            member_id: value.member_id
        };

        $http.get(base_url + 'hocvien/invoice/ajax_get_all_course_p?filter=' + JSON.stringify(data)).then(r => {


            if (r && r.data.status == 1) {
                $scope.course_prints = r.data.data;
                $scope.cr_select = angular.copy($scope.course_prints);
                $('#prints').modal('show');
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }




    $scope.$watchGroup(['invoice.amount', 'invoice.visa'], function (newValues, oldValues, scope) {
        if (newValues[0] == oldValues[0] && newValues[1] == oldValues[1]) {
            return false;
        }
        $scope.check_open_bn();
    });

    $scope.check_open_bn = () => {
        if ($scope.lia) {
            var t1 = angular.copy($scope.invoice.amount);
            var t2 = angular.copy($scope.invoice.visa);

            if (!t1)
                t1 = 0;

            if (!t2)
                t2 = 0;

            t1 = parseInt(t1);
            t2 = parseInt(t2);



            // if (t1 + t2 + parseInt($scope.lia.total) + parseInt($scope.lia.total_discount) - $scope.lia.course_price == 0) {
            //     $('.bunos').css('opacity', '1');
            //     $('.bunos').css('pointer-events', 'initial');
            // } else {
            //     $('.bunos').css('opacity', '0');
            //     $('.bunos').css('pointer-events', 'none');
            // }
        }
    }

    $scope.unsetForm = () => {
        $scope.invoice = {};
        $scope.resetMposTransactions();
        $scope.resetListVisaTransactions();
        $scope.resetChooseTypeTransactions();
        $scope.clearEditInPopupVisa();
        $scope.member_id = undefined;
        $scope.course_id = undefined;
        $scope.course = undefined;
        $scope.member = undefined;
        $scope.course_lias = undefined;

        $scope.discountCheck = 0;
        $scope.returnCheck = 0;
        $scope.invoice.bunos_course_id = '0';
        $scope.invoice.bank_id = "2";

        $('#file').val('');
        $(`.datetimepicker`).datetimepicker({
            date: moment('YYYY-MM-DD HH:mm:ss'),
            format: 'DD/MM/YYYY HH:mm',
            widgetPositioning: {
                horizontal: 'left',
                vertical: 'bottom',
            },
        })
    }

    $scope.unset = (id) => {
        if (id == 1) {
            $scope.filter.date = undefined;
        } else if (id == 2) {
            $scope.filter.store_id = undefined;
        } else if (id == 3) {
            setTimeout(() => {
                $('#course_search').select2('val', '');
                //console.log($('#course_search').select2('val', ''));
            }, 0);
        }

        $scope.go2Page(1);
        //  $scope.getInvoiceByUser();
    }

    $scope.dateInputInit = () => {
        if ($('.date').length) {
            //var start = $scope.start;
            //var end = $scope.end;
            if (typeof start === "undefined") {
                start = end = moment().format("MM/DD/YYYY");
            }
            setTimeout(() => {
                $('.date').daterangepicker({
                    opens: 'right',
                    alwaysShowCalendars: true,
                    startDate: moment(),
                    endDate: moment(),
                    ranges: {
                        'Hôm nay': [moment(), moment()],
                        'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                        '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                        '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                        'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                        'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                    },
                    locale: {
                        format: 'DD/MM/YYYY'
                    }
                });
            }, 100);
        }
    }

    $scope.getInvoiceByUser = () => {
        $('.load_hv').css('opacity', 1);
        $http.get(base_url + 'hocvien/invoice/ajax_get_invoice_by_user?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('.load_hv').css('opacity', 0);


            if (r && r.data.status == 1) {
                $scope.invoices_users = r.data.data;

                $scope.total_user_money = 0;
                $scope.invoices_users.map(x => $scope.total_user_money += parseInt(x.total_all));

                $scope.invoices_care = r.data.care;

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getInvoice = () => {

        if ($scope.check == 0) return false;
        $('#home table').css('opacity', 0.5).addClass('loading');

        $http.get(base_url + 'hocvien/invoice/ajax_get_invoice?filter=' + JSON.stringify($scope.filter)).then(r => {
            $('#home table').css('opacity', 1).removeClass('loading');
            if (r && r.data.status == 1) {
                $scope.invoices = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }
    $scope.renderExcel = () => {
        $http.get(base_url + 'hocvien/invoice/createXLS/?filter=' + JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {

                var $a = $("<a>");
                $a.attr("href", r.data.data);
                $a.attr("download", "Excel" + moment().format('YYYYMMDDHHIISS'));
                $("body").append($a);
                $a[0].click();
                $a.remove();
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getStore = () => {
        $http.get(base_url + 'hocvien/ajax/ajax_get_store').then(r => {
            if (r && r.data.status == 1) {
                $scope.stores = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }


    $scope.getBunos = () => {
        $http.get(base_url + 'hocvien/ajax/ajax_get_bunos_course').then(r => {
            if (r && r.data.status == 1) {
                $scope.bunos_course = r.data.data;
                $scope.bunos_course.unshift({
                    id: 0,
                    name: 'Chọn khóa tặng'
                });
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.changeOption = () => {
        if ($scope.course && $scope.member) {
            var data = {
                course_store_id: $scope.course.id,
                member_id: $scope.member.id
            }
            $http.get(base_url + 'hocvien/ajax/ajax_get_lia?filter=' + JSON.stringify(data)).then(r => {

                if (r && r.data.status == 1) {
                    $scope.lia = r.data.data;
                    if ($scope.lia) {
                        $scope.lia.left = parseInt($scope.lia.course_price) - parseInt($scope.lia.total);
                    }
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        } else {
            $scope.lia = undefined;
        }
    }

    $scope.getLiaMember = () => {
        data = {
            member_id: $scope.member_id
        };

        $http.get(base_url + 'hocvien/ajax/ajax_get_invoice_list_lia?filter=' + JSON.stringify(data)).then(r => {



            if (r && r.data.status == 1) {
                $scope.course_lias = r.data.data;
                //console.log('manh', $scope.course_lias);

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getCourseStore = () => {
        $http.get(base_url + 'hocvien/ajax/ajax_get_course_store').then(r => {
            if (r && r.data.status == 1) {
                $scope.course_store_lists = r.data.data;

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.$watchGroup(['course', 'member_id'], function (newValues, oldValues, scope) {
        if (newValues[0] == oldValues[0] && newValues[1] == oldValues[1]) {
            return false;
        }
        if (newValues[1] != oldValues[1]) {
            if ($scope.member_id && !$scope.invoice.id)
                $scope.getLiaMember();
        }
        if ($scope.course && $scope.member_id) {
            var data = {
                course_store_id: $scope.course.id,
                member_id: $scope.member_id
            }

            $http.get(base_url + 'hocvien/ajax/ajax_get_lia?filter=' + JSON.stringify(data)).then(r => {

                if (r && r.data.status == 1) {
                    $scope.lia = r.data.data;
                    if ($scope.lia) {
                        $scope.lia.left = parseInt($scope.lia.course_price) - parseInt($scope.lia.total) - parseInt($scope.lia.total_discount);
                    }

                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        } else {
            $scope.lia = undefined;
        }
    });

    $scope.$watchGroup(['filter.course_id', 'filter.store_id', 'filter.key', 'filter.date'], function (newValues, oldValues) {
        if (newValues[0] == oldValues[0] && newValues[1] == oldValues[1] && newValues[2] == oldValues[2] && newValues[3] == oldValues[3]) return false;

        if (!$scope.filter.key || $scope.filter.key && $scope.filter.key.length == 0) {
            $('.date_search').removeClass('cant_tounch');
        } else {
            $('.date_search').addClass('cant_tounch');
        }
        $scope.go2Page(1);
        $scope.invoices_care = [];
        $scope.invoices_users = [];

        // if (time)
        //     clearTimeout(time);

        // var time = setTimeout(() => {
        //     $scope.getInvoiceByUser();
        // }, 100);

    });

    $scope.openDelete = (value) => {
        $scope.cr_invoice = value;
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
                        $scope.delete();
                    });
                });
            },
        }).then(function () {});
    }

    $scope.delete = () => {
        var data = angular.copy($scope.cr_invoice);
        data.import_id = id_current_user;
        $http.post(base_url + 'hocvien/invoice/ajax_delete', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                toastr["success"]("Xóa thành công!");
                $scope.getInvoice();
                $('#create_modal').modal('hide');
                Swal.close();
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.openModal = (value) => {
        $scope.unsetForm();
        $("#file").val('');
        $scope.first_transfer = undefined;
        $scope.invoice.member_id = value.member_id;
        $scope.invoice.course_store_id = value.course_store_id;
        $scope.invoice.amount = value.amount;
        $scope.invoice.visa = value.visa;
        $scope.invoice.note = value.note;
        $scope.invoice.id = value.id;
        $scope.invoice.discount_id = value.discount_id;
        $scope.invoice.visa_transfer = parseInt(value.visa_transfer);
        $scope.invoice.visa_mpost = parseInt(value.visa_mpost);
        $scope.invoice.mpost_code = value.mpost_code;
        $scope.discountCheck = value.discount_id;
        $scope.invoice.files = value.files;
        $scope.invoice.is_discount = value.is_discount;
        $scope.invoice.created_cashbook_store_linked = value.created_cashbook_store_linked;
        $scope.invoice.type = value.type;
        $scope.invoice.recive_store_id = value.recive_store_id;

        $scope.invoice.bunos_course_id = value.bunos_course_id;
        $scope.invoice.date = moment(value.created).format('YYYY-MM-DD');
        $scope.invoice.transaction.vnpay.payDate = moment($scope.invoice.date, 'YYYY-MM-DD').format('DD / MM / YYYY');
        $scope.invoice.bank_id = value.bank_id;

        $scope.getInvoiceVisa();

        if (value.is_discount == 1)
            $scope.discountCheck = 1;
        $scope.first_transfer = angular.copy($scope.invoice.visa_transfer);

        setTimeout(() => {
            $scope.$apply(function () {
                $scope.triggerFunction2.trigger(value.course_store_id);
                $scope.triggerFunction.trigger(value.member_id);
            })
        }, 10);


        $scope.first_money = angular.copy(parseInt(value.visa)) + angular.copy(parseInt(value.amount));
        $('#create_modal').modal('show');

        $scope.check_open_bn();
    }

    $scope.getInvoiceVisa = () => {
        $http.get(url_api + 'ajax_get_invoice_visa_by_invoice_id?invoice_id=' + $scope.invoice.id).then(r => {
            if (r && r.data.status) {
                var data = r.data.data,
                    mpos = [],
                    vnpays = [],
                    vnpaysSpos = [],
                    banks = [];
                $.each(data, function (input, value) {
                    if (value.type == 1) {
                        mpos.push(value);
                    } else if (value.bank_id == 9) {
                        if (value.type == 3) {
                            vnpays.push(value);
                        } else if (value.type == 4) {
                            vnpaysSpos.push(value);
                        }

                    } else {
                        banks.push(value);
                    }
                });

                $scope.invoice.transaction.list_mpos = mpos;
                $scope.invoice.transaction.list_vnpay = vnpays;
                $scope.invoice.transaction.list_vnpay_spos = vnpaysSpos;
                $scope.invoice.transaction.list_bank = banks;
                $scope.updateInvoice();
            } else showMessErr(t.data.message)
        }, function () {
            showMessErrSystem();
        });
    }

    $scope.deleteImg = (item, event) => {
        $http.post(base_url + 'hocvien/invoice/ajax_delete_img', JSON.stringify(item)).then(r => {
            if (r && r.data.status == 1) {

                toastr["success"]("Xóa thành công!");
                $(event.target).closest('.img_file').remove();

                $scope.getInvoice();
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.confirmSave = () => {
        if (!$scope.invoice.visa) {
            Swal.fire({
                title: 'Bạn có chắc chắn?',
                html: 'Phiếu thu không thanh toán <b>VISA</b>!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'Hủy',
                confirmButtonText: 'Đồng ý',
                allowOutsideClick: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    $scope.save();
                }
            })
        } else {
            $scope.save();
        }
    }

    $scope.save = () => {
        var fd = new FormData();

        $scope.invoice.course_store_id = $scope.course.id;
        $scope.invoice.member_id = $scope.member.id;
        $scope.invoice.type = $scope.returnCheck ? $scope.returnCheck : 0;

        if (!$scope.invoice.amount) {
            $scope.invoice.amount = 0;
        }
        if (!$scope.invoice.visa) {
            $scope.invoice.visa = 0;
        }

        if (!$scope.invoice.recive_store_id && $scope.discountCheck != 1) {
            toastr["error"]("Vui lòng chọn chi nhánh thu tiền!");
            return false;
        }
        $('#create_modal .modal-content').addClass('loading');
        $scope.invoice.import_id = id_current_user;
        $scope.invoice.check = $scope.discountCheck;
        if ($scope.invoice.created_ad) {
            $scope.invoice.created_ad = moment($scope.invoice.created_ad, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
        }

        angular.forEach($scope.uploadfiles, function (file) {
            fd.append('file_hs[]', file);
        });
        var data = JSON.stringify($scope.invoice);
        fd.append('data', data);
        $http({
            method: 'post',
            url: '../hocvien/invoice/ajax_save_invoice',
            data: fd,
            headers: {
                'Content-Type': undefined
            },
        }).then(function successCallback(r) {
            if (r && r.data.status == 1) {
                toastr["success"]("Thành công!");
                $scope.getInvoice();
                $('#create_modal').modal('hide');
                $scope.unsetForm();
                // $scope.getInvoiceByUser();
                $scope.invoices_care = [];
                $scope.invoices_users = [];
            } else if (r && r.data.status == 0) {
                toastr["error"](r.data.message);
            } else toastr["error"]("Đã có lỗi xẩy ra!");
            $('#create_modal .modal-content').removeClass('loading');
        }, function (data, status, headers, config) {
            showMessErrSystem()
        });
    }

    $scope.$watchGroup(['invoice.visa_mpost', 'invoice.visa_transfer'], function (newValues, oldValues) {
        if (newValues[0] == oldValues[0] && newValues[1] == oldValues[1]) return false;

        if (!$scope.invoice.visa_mpost) {
            $scope.invoice.visa_mpost = 0;
        }
        if (!$scope.invoice.visa_transfer) {
            $scope.invoice.visa_transfer = 0;
        }
        $scope.invoice.visa = $scope.invoice.visa_mpost + $scope.invoice.visa_transfer;
    });

    $scope.getCourseOption = () => {
        $http.get(base_url + 'hocvien/ajax/ajax_get_course').then(r => {
            if (r && r.data.status == 1) {
                $scope.course_option = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.getMember = () => {
        $http.get(base_url + 'hocvien/ajax/ajax_get_member').then(r => {
            if (r && r.data.status == 1) {
                $scope.members = r.data.data;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        });
    }

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getInvoice();
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

    $scope.checkShow = (type, value = null) => {
        if (type == 'remove_visa') {
            if (value.confirm != 1) {
                if (
                    !value.id ||
                    (
                        $scope.invoice.id &&
                        !$scope.invoice.created_cashbook_store_linked &&
                        $scope.invoice.date == toDay &&
                        is_admin
                    ) ||
                    is_dev
                ) return true;
            }
        }
    }

    $scope.showZoomImg = showZoomImg;
});

app.directive('numberInput', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelCtrl) {

            ngModelCtrl.$formatters.push(function (modelValue) {
                return setDisplayNumber(modelValue, true);
            });

            // it's best to change the displayed text using elem.val() rather than
            // ngModelCtrl.$setViewValue because the latter will re-trigger the parser
            // and not necessarily in the correct order with the changed value last.
            // see http://radify.io/blog/understanding-ngmodelcontroller-by-example-part-1/
            // for an explanation of how ngModelCtrl works.
            ngModelCtrl.$parsers.push(function (viewValue) {
                setDisplayNumber(viewValue);
                return setModelNumber(viewValue);
            });

            // occasionally the parser chain doesn't run (when the user repeatedly 
            // types the same non-numeric character)
            // for these cases, clean up again half a second later using "keyup"
            // (the parser runs much sooner than keyup, so it's better UX to also do it within parser
            // to give the feeling that the comma is added as they type)
            elem.bind('keyup focus blur', function () {
                setDisplayNumber(elem.val());
            })

            function setDisplayNumber(val, formatter) {
                var valStr, displayValue;

                if (typeof val === 'undefined') {
                    return 0;
                }

                valStr = val.toString();
                displayValue = valStr.replace(/,/g, '').replace(/[A-Za-z-]/g, '');
                displayValue = parseFloat(displayValue);
                displayValue = (!isNaN(displayValue)) ? displayValue.toString() : '';

                // handle leading character -/0
                if (valStr.length === 1 && valStr[0] === '-') {
                    displayValue = valStr[0];
                } else if (valStr.length === 1 && valStr[0] === '0') {
                    displayValue = '0';
                } else {
                    displayValue = $filter('number')(displayValue);
                }
                // handle decimal
                if (!attrs.integer) {
                    if (displayValue.indexOf('.') === -1) {
                        if (valStr.slice(-1) === '.') {
                            displayValue += '.';
                        } else if (valStr.slice(-2) === '.0') {
                            displayValue += '.0';
                        } else if (valStr.slice(-3) === '.00') {
                            displayValue += '.00';
                        }
                    } // handle last character 0 after decimal and another number
                    else {
                        if (valStr.slice(-1) === '0') {
                            displayValue += '0';
                        }
                    }
                }

                if (attrs.positive && displayValue[0] === '-') {
                    displayValue = displayValue.substring(1);
                }


                if (typeof formatter !== 'undefined') {
                    return (displayValue == '') ? 0 : displayValue;
                } else {
                    elem.val((displayValue == '0') ? '' : displayValue);
                }

            }

            function setModelNumber(val) {
                var modelNum = val.toString().replace(/,/g, '').replace(/[A-Za-z]/g, '');
                modelNum = parseFloat(modelNum);
                modelNum = (!isNaN(modelNum)) ? modelNum : 0;
                if (modelNum.toString().indexOf('.') !== -1) {
                    modelNum = Math.round((modelNum + 0.00001) * 100) / 100;
                }
                if (attrs.positive) {
                    modelNum = Math.abs(modelNum);
                }
                return modelNum;
            }
        }
    };

});

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

app.filter('formatCurrency', function () {
    return (value, noname = true, nation_id = 1) => {
        if (!value) return 0;
        value = Number(value);
        if (nation_id == 1) {
            return parseNumber(value) + (noname ? '' : ' đ');
        } else {
            return Number(value).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + (noname ? '' : ' $');
        }
    };
});