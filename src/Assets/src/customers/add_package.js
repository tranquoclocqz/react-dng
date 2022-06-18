app.controller('add_packace', function ($scope, $http, $timeout) {
    $scope.init = () => {
        $scope.filter = {};
        $scope.filter.nation = nation_id;
        $scope.package = {};
        $scope.discount = {
            type: 'percent',
            price: 0
        }
        $scope.salePrice = nation_id == 1 ? '0 đ' : '0 $';
        $scope.salePriceNotFm = 0;
        $scope.store_type = store_type + '';
        $scope.min = 0;
        $scope.pay_package = '';
        $scope.list_invoices = [];
        $scope.invoice_id = 0;
        $scope.load_add_pk = false;
    }

    $scope.changeStoreType = () => {
        $scope.packages = [];
    }

    $scope.changeDiscountPrice = () => {
        let price = $scope.package.price_fm1;
        // console.log($scope.package.price_fm1);
        if ($scope.discount.price && $scope.discount.price > 0) {
            if ($scope.discount.type == 'percent') {
                price = Number($scope.package.price_fm1) - (Number($scope.package.price_fm1) * Number($scope.discount.price)) / 100;
            } else {
                price = Number($scope.package.price_fm1) - Number($scope.discount.price);
            }
        }

        $scope.salePrice = formatCurrencyA(price, nation_id);
        $scope.salePriceNotFm = price;
    }

    $scope.chooseInvoice = (event, invoice_id = 0) => {
        var checkked = $(event.target).is(':checked');
        if (checkked) {
            $scope.invoice_id = invoice_id;
        } else {
            $scope.invoice_id = 0;
        }
    }

    $scope.checkInvoice = () => {
        $scope.load_add_pk = true;
        $scope.list_invoices = [];
        $scope.invoice_id = 0;
        $http.get(base_url + 'customers/ajax_check_invoice_customer/' + customer_id).then(r => {
            if (r.data && r.data.status == 1) {
                let data = r.data.data;
                $scope.list_invoices = data;
                if (data.length) {
                    if (data.length == 1) {
                        $scope.invoice_id = $scope.list_invoices[0].invoice_id;
                        $scope.checkInput(1, false);
                    } else {
                        $('#cf_add_package').modal('show');
                    }
                } else {
                    toastr.error('Khách hàng chưa phát sinh Hóa đơn trong ngày tại chi nhánh!');
                }
                $scope.load_add_pk = false;
            } else {
                toastr.error(r.data.message, 'Lỗi!');
            }
            select2();
        }, function () {
            toastr.error('Lỗi hệ thống! Vui lòng thử lại sau!');
        })
    }

    $scope.checkInput = (event, $check = true) => {
        if ($check) {
            if (!$scope.id_pakcage) {
                toastr["error"]("Vui lòng chọn gói!");
                event.preventDefault();
                showInputErr('#myInput');
                return false;
            }

            if ($('#frm-add_pk input[name=discount]').val() > 0 && !$('#myAreaBox').val()) {
                toastr["error"]("Vui lòng nhập lý do giảm giá!");
                event.preventDefault();
                showInputErr('#myAreaBox');
                return false;
            }

            if (Number($scope.salePriceNotFm) < Number($scope.min)) {
                toastr["error"]("Giá bán không hợ lệ!");
                event.preventDefault();
                showInputErr('#frm-add_pk input[name=discount]');
                return false;
            }

            let paypkg = $scope.pay_package + '';
            paypkg = paypkg.replace(/,/g, "");
            if (Number(paypkg) > Number($scope.salePriceNotFm)) {
                toastr["error"]("Số tiền trả trước không hợp lệ!");
                event.preventDefault();
                showInputErr('#frm-add_pk input[name=pay]');
                return false;
            }

            if ($scope.invoice_id == 0) {
                event.preventDefault();
                $scope.checkInvoice();
            } else {
                $scope.load_add_pk = true;
                setTimeout(() => {
                    $('#frm-add_pk').submit();
                }, 50)
            }
        } else {
            $scope.load_add_pk = true;
            setTimeout(() => {
                $('#frm-add_pk').submit();
            }, 50)
        }
    }

    $scope.getInformation = (val) => {
        $scope.id_pakcage = val.id;
        $scope.packages = [];
        $scope.package = val;
        $scope.getInfoPackage(val.id);
        $scope.filter.key = val.description;
    }

    $scope.getInfoPackage = (id) => {
        $http.get(base_url + '/customers/ajax_get_packages_details?id=' + id + '&nation_id=' + nation_id).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.services = r.data.services;
                $scope.products = r.data.products;
                $scope.min = Number(r.data.min);
                $scope.minFM = r.data.minFM;
                $scope.changeDiscountPrice();
            }
        })
    }

    $scope.changeInput = () => {
        if ($scope.filter.key && $scope.filter.key != '') {
            $('.search-custome').addClass('search-item');
            $scope.getPackage(false);
        }
    }

    $scope.getPackage = (vl) => {
        $scope.filter.storeType = $scope.store_type;
        $http.post(base_url + '/customers/ajax_get_packages_by_key?filter=', JSON.stringify($scope.filter)).then(r => {
            if (r && r.data.status == 1) {
                $('.search-custome').removeClass('search-item');
                $scope.packages = r.data.data;

            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.formatCurrencyA = (value, nation) => {
        return formatCurrencyA(value, nation)
        // var formatter = new Intl.NumberFormat('en-US', {
        //     style: 'currency',
        //     currency: 'USD',
        //     minimumFractionDigits: 2,
        //     // the default value for minimumFractionDigits depends on the currency
        //     // and is usually already 2
        // });

        // if (nation == 2) {
        //     var result = formatter.format(formatNumber(value))
        //     return (result.replace('$', '') + ' $');
        // }

        // if (nation == 1) {
        //     var index = (value + '').indexOf('.');
        //     if (index >= 0) {
        //         var result = value.slice(0, index);
        //     } else result = value;
        //     return (formatNumber(result).toLocaleString() + ' đ');
        // }
    }

});