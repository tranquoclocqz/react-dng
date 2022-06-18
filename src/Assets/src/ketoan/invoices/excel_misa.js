app.controller('exceCtrll', function ($scope, $http, $sce) {
    $scope.init = () => {
        $scope.filter = {
            invoice_type_sale: 'ALL',
            type: 'sale',
            store_ids: [],
            data_type_id: '0',
            version: 'V2'
        }
        $scope.filter_cb = {};
        $scope.filter_cb.type = 'receipts';
        $scope.filter_cb.store_ids = [];
        $scope.getListProductGroup();
        $scope.filterWh = {
            version: 'V2'
        };
        setTimeout(() => {
            $scope.dateInputInit();
        }, 10);
    }
    $scope.getExcelSale = () => {
        let d1 = $scope.filter.date.split('-')[0].trim();
        let d2 = d1.split('/');
        let d3 = $scope.filter.date.split('-')[1].trim();
        let d4 = d3.split('/');
        $scope.filter.start_date = d2[2] + '/' + d2[1] + '/' + d2[0];
        $scope.filter.end_date = d4[2] + '/' + d4[1] + '/' + d4[0];
        $scope.loading = true;
        if ($scope.filter.category_ids && $scope.filter.data_type_id == 2) {
            $scope.filter.category_ids = [];
        }

        $scope.url = '';
        $http.get(base_url + '/ketoan/invoices/ajax_get_excel?' + $.param($scope.filter)).then(r => {
            if (r.data && r.data.status == 1) {
                select2();
                select2Level();
                $scope.url = r.data.data;
                $scope.version = $scope.filter.version;
                // window.open(r.data.data);

            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loading = false;
        })
    }

    $scope.getExcelWarehouse = () => {
        let d1 = $scope.filterWh.date.split('-')[0].trim();
        let d2 = d1.split('/');
        let d3 = $scope.filterWh.date.split('-')[1].trim();
        let d4 = d3.split('/');
        $scope.filterWh.start_date = d2[2] + '/' + d2[1] + '/' + d2[0];
        $scope.filterWh.end_date = d4[2] + '/' + d4[1] + '/' + d4[0];
        $scope.loadingWh = true;
        $scope.urlWh = '';
        $http.get(base_url + '/ketoan/invoices/ajax_get_excel?' + $.param($scope.filterWh)).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.urlWh = r.data.data;
                $scope.versionWH = $scope.filterWh.version;
                // window.open(r.data.data);
            } else {
                toastr["error"](r.data ? r.data.message : 'Không thể lấy dữ liệu. Vui lòng thử lại sau!');
            }
            $scope.loadingWh = false;
        })
    }

    $scope.changeType = (type) => {
        if (type == 'V2') $scope.filter.invoice_type_sale = 'ALL';
        if (type == 'V1') $scope.filter.invoice_type_sale = '1';
        select2();
    }

    $scope.checkURL = (url) => {
        if ('http' == url.slice(0, 4)) {
            return true
        }
        return false;
    }

    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(6, 'days'),
            endDate: moment(),
            // maxDate: moment(),
            maxYear: parseInt(moment().format('YYYY'), 10),
            ranges: {
                'Hôm nay': [moment(), moment()],
                'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1,
                    'days')],
                '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                'Tháng trước': [moment().subtract(1, 'month').startOf('month'),
                moment().subtract(1, 'month').endOf('month')
                ]
            },
            locale: {
                format: 'DD/MM/YYYY',
            }
        });
    }
    $scope.exportExcel = () => {
        let link = $scope.filter_cb.type == 'expenditures' ? 'ajax_get_export_expendture_misa' : 'ajax_get_export_receipt_misa';
        window.open(base_url + 'ketoan/invoices/' + link + '?filter=' + JSON.stringify($scope.filter_cb), '_blank');
    }

    $scope.getListProductGroup = () => {
        $scope.list_product_groups = [];
        $http.get(base_url + 'product_groups/ajax_get_list_product_group').then(r => {
            if (r.data && r.data.status) {
                $scope.list_product_groups = r.data.data;
                select2();
                select2Level();
            } else {
                showMessErr('Không lấy được danh sách nhóm sản phẩm');
            }
        }, function (data, status, headers, config) {
            showMessErr('Không lấy được danh sách nhóm sản phẩm');
        });
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
})