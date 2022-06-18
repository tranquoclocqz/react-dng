app.controller('report_online', function ($scope, $http, $filter) {
    $scope.init = () => {
        $scope.stores = stores;
        $scope.filterReport = {
            offset: 0,
            limit: 20,
            type_search: 'product_id',
            store_ids: []
        };
        $scope.loading = {
            total: true,
            userTotal: true,
            userNumber: true,
            product: true
        };
        $scope.isChangeDate = true;
        $scope.colorDefault = ["#b91314", "#b79419", "#4de47c", "#726dd3", "#d54c69", "#5a1632", "#605481", "#b18b9c", "#df49ed", "#f54fc6", "#a9d1da", "#83ad05", "#1a09f5", "#cf33d9", "#d641a8", "#bba638", "#ca6e1a", "#5b82f3", "#d9ce5", "#162db0", "#9881f0", "#522750", "#8afd97", "#c91fe2", "#9a9585"];

        $scope.getGroupProduct();
        $scope.loadDescription();
        setTimeout(() => {
            setDefaultDate();
            loadReport();
            $('.box-op').css('opacity', 1);
        }, 200);
    }

    function getRandomColor() {
        let cls = [];
        for (let index = 0; index < 50; index++) {
            const randomColor = Math.floor(Math.random() * 16777215).toString(16);
            let color = "#" + randomColor;
            cls.push(color);
        }
        return cls;
    }

    $scope.loadDescription = () => {
        $scope.description = {
            total: 'Số lượng đơn / Tổng tiền',
            delivery: 'Số lượng đơn / Tổng tiền',
            return: 'Số lượng đơn / Tổng tiền',
            discount: 'Tiền giảm giá đơn hàng mới'
        };
        $is_prd = $scope.filterReport.type_search == 'product_id' && $scope.filterReport.product_id && $scope.filterReport.product_id.length != 0;
        $is_grprd = $scope.filterReport.type_search == 'group_product_id' && $scope.filterReport.group_product_id && $scope.filterReport.group_product_id.length != 0;
        if ($is_prd || $is_grprd) {
            $scope.description = {
                total: 'Số lượng SP / Tổng tiền SP',
                delivery: 'Số lượng SP / Tổng tiền SP',
                return: 'Số lượng SP / Tổng tiền SP',
                discount: 'Tiền giảm giá SP mới'
            };
        }

    }

    $scope.handlerFilter = () => {
        let val = '';
        if ($scope.isShow('user')) val = $('#data_user_id').val() ? JSON.parse($('#data_user_id').val()) : '';
        if ($scope.isShow('product_id')) val = $('#data_product_id').val() ? JSON.parse($('#data_product_id').val()) : '';
        if (val) $scope.filterReport[$scope.filterReport.type_search] = val;

        loadReport();
    }

    function loadReport() {
        $scope.getReportNewOld();
        if ($scope.isChangeDate) {
            $scope.getReportQuantityInvoiceUser();
            $scope.getReportTotalInvoiceUser();
            $scope.getReportProducts();
            $scope.isChangeDate = false;
        }
    }

    $scope.getReportNewOld = () => {
        $scope.loading.total = true;
        getFormatDataFilter();
        $http.get(base_url + '/statistics/ajax_get_report_old_new_online?filter=' + JSON.stringify($scope.filterReport)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.total = r.data.data;
                $scope.loading.total = false;
                $scope.loadDescription();
            }
        })
    }

    $scope.getReportQuantityInvoiceUser = () => {
        getFormatDataFilter();
        let ft = angular.copy($scope.filterReport);
        ft.order_by = 'quantity';
        $scope.loading.userNumber = true;
        $http.get(base_url + '/statistics/ajax_get_report_top_users?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.quantityUsers = r.data.data;
                $scope.loading.userNumber = false;
                $scope.setHeight();
            }
        })
    }

    $scope.getReportTotalInvoiceUser = () => {
        getFormatDataFilter();
        let ft = angular.copy($scope.filterReport);
        ft.order_by = 'total';
        $scope.loading.userTotal = true;
        $http.get(base_url + '/statistics/ajax_get_report_top_users?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.totalUsers = r.data.data;
                $scope.loading.userTotal = false;
                $scope.setHeight();
            }
        })
    }

    $scope.getReportProducts = (val_limit) => {
        getFormatDataFilter();
        $scope.loading.product = val_limit ? false : true;
        ft = angular.copy($scope.filterReport);
        if (val_limit) {
            ft.limit = ft.limit + val_limit;

        } else {
            ft.limit = 20;
        }
        $scope.isGetSuccessProduct = false;
        $http.get(base_url + '/statistics/ajax_get_top_sale_product?filter=' + JSON.stringify(ft)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.quantityProducts = r.data.data;
                $scope.totalProduct = r.data.count;
                $scope.loading.product = false;
                $scope.isGetSuccessProduct = true;
                $scope.setHeight();
            }
        })
    }

    angular.element(document.querySelector('.body-box')).bind('scroll', function () {
        let heightWhenScroll = $('.body-box').scrollTop() + $('.body-box').height();
        let ht = $scope.quantityProducts.length * 44 - 70
        if (heightWhenScroll >= ht && $scope.isGetSuccessProduct && $scope.totalProduct != $scope.quantityProducts.length) {
            $scope.getReportProducts($scope.quantityProducts.length - 10);
        }
    });

    $scope.setHeight = () => {
        if (!$scope.loading.userTotal && !$scope.loading.product && !$scope.loading.userNumber) {
            let arr = [
                $scope.quantityProducts.length,
                $scope.totalUsers.length,
                $scope.quantityUsers.length
            ];
            let max = Math.max(...arr) * 44;
            getColor(max / 44);
            if ($(window).width() > 765) {
                if (max < 400) {
                    max = 400;
                } else max = max + 20;

                if (max > 920) {
                    max = 920;
                    $('.box-top').css('max-height', max + 'px');
                    $('.box-top').css('overflow-y', 'auto');
                }
                $('.box-top').css('min-height', max + 'px');
            }
        }
    }

    function getColor(lenght) {
        if (lenght > $scope.colorDefault.length) {
            $scope.colorDefault = $scope.colorDefault.concat(getRandomColor());
        }
        return $scope.colorDefault;
    }

    function setDefaultDate() {
        $scope.filterReport.date = moment().format('01/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY')
    }

    function getFormatDataFilter() {
        let d1 = $scope.filterReport.date.split('-')[0].trim();
        let d2 = d1.split('/');
        let d3 = $scope.filterReport.date.split('-')[1].trim();
        let d4 = d3.split('/');
        $scope.filterReport.start_date = d2[2] + '-' + d2[1] + '-' + d2[0];
        $scope.filterReport.end_date = d4[2] + '-' + d4[1] + '-' + d4[0];
    }

    $scope.changeDate = () => {
        $scope.isChangeDate = true;
    }

    $scope.isShow = (type) => {
        if (type == 'user') {
            if (['import_id', 'user_sale_id', 'user_handler_id'].find(r => { return r == $scope.filterReport.type_search })) {
                return true;
            }
            return false;
        } else {
            if ($scope.filterReport.type_search == type) {
                return true;
            }
            return false;
        }
    }

    $scope.getGroupProduct = () => {
        $scope.group_products = [];
        $http.get(base_url + '/ajax/ajax_get_group_products').then(r => {
            if (r.data && r.data.status == 1) {
                $scope.group_products = r.data.data;
                select2Level(100);
                setTimeout(() => {
                    $(".select_st").select2({
                        placeholder: "Chi nhánh"
                    });
                }, 200);
            }
        })
    }
})