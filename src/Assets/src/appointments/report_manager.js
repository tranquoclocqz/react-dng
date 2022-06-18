var date = new Date();

app.controller('report_manager', function ($scope, $http, $compile, $filter) {
    $scope.init = () => {
        $scope.load = false;
        $scope.filter = {
            manager_id: '0',
            store_id: ['0'],
            region_id: '0',
            month: (date.getMonth() + 1) + '',
            year: date.getFullYear().toString(),
        };
        $scope.img_account_df = img_account_df;
        $scope.getListManager();
        $('.op-report').removeClass('op-report');
        select2_img();
    }

    $scope.getListManager = () => {
        $scope.load = true;
        var data_rq = angular.copy($scope.filter),
            store_ids = [];
        if ($scope.filter.store_id.includes('0')) {
            listStore.forEach(item => {
                store_ids.push(item.id);
            });
        } else {
            store_ids = $scope.filter.store_id;
        }

        var endDate = new Date(data_rq.year, data_rq.month, 0).getDate();
        var month = parseInt(data_rq.month) > 9 ? data_rq.month : '0' + data_rq.month
        data_rq.store_id = store_ids;
        data_rq.start_date = data_rq.year + '-' + month + '-01';
        data_rq.end_date = data_rq.year + '-' + month + '-' + endDate;

        $http.get(base_url + 'appointments/ajax_get_report_manager_in_appointment?' + $.param(data_rq)).then(r => {
            $scope.load = false;
            if (r.data.status) {
                $scope.list = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        })
    }

    $scope.getDetail = (item, detail) => {
        var data_rq = {
            date: detail.date,
            manager_id: item.manager_id,
            store_id: item.store_id
        }

        $scope.list.data.forEach(e => {
            e.detail.forEach(item => {
                item.is_open = false;
            });
        });

        detail.is_open = true;
        detail.load = true;
        $http.get(base_url + 'appointments/ajax_get_detail_appointment_manager?' + $.param(data_rq)).then(r => {
            detail.load = false;
            if (r.data.status) {
                $scope.detaiInvoice = r.data.data;
            } else {
                showMessErr(r.data.message);
            }
        })
    };

    $scope.getDetailInvoice = (item, detail) => {
        var data_rq = {
            date: detail.date,
            manager_id: item.manager_id,
            store_id: item.store_id,
        }
        var url = base_url + 'appointments/report_manager_detail?' + $.param(data_rq);
        window.open(url, '_blank');
    };

    $scope.getListStoreByRegion = () => {
        $scope.filter.store_id = [];
        if ($scope.filter.region_id == '0') {
            $scope.filter.store_id = ['0'];
        } else {
            listStore.forEach( (item) => {
                if (item.admin_region_id == $scope.filter.region_id) {
                    $scope.filter.store_id.push(item.id);
                }
            });
        }
        select2();
    }
});
app.filter('formatCurrency', function () {
    return (value, nation_id, noname = false) => {
        if (!value) return 0;
        value = Number(value);
        if (nation_id == 1) {
            return parseNumber(value) + (noname ? '' : ' đ');
        } else {
            return (Number(value) / 100).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + (noname ? '' : ' $');
        }
    };
});

function select2(timeout = 100, selector = '.content-wrapper .select2') {
    setTimeout(() => {
        jQuery(selector).select2({
            templateResult: _formatStateSelect2
        });
    }, timeout);
}

function _formatStateSelect2(node) {
    var optimage = $(node.element).data('image');
    if (optimage) {
        var $opt = $(`<span><img src="${optimage}" style="width: 22px; height: 22px; object-fit: cover; border-radius: 50%; margin-right: 5px; border: 1px solid #dadce0" />${node.text}</span>`);
        return $opt;
    }
    return node.text;
}