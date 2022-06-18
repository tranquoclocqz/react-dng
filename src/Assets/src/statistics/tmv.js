app.controller('tmv', function ($scope, $http, $compile, $sce) {
    $scope.init = () => {
        $('.content').css('opacity', 1);
        $scope.all_store = '';
        $scope.muti_store = '';
        $scope.isViewType = 0;
        $scope.arr_store_id = [];
        $scope.from = '';
        $scope.to = '';
        $scope.viewType = '1';
        $scope.stores_tmv = stores_tmv;
        $scope.loadingPage = true;
        $scope.loadingPageFilter = true;
        $scope.getManyStore('ALL');
        setTimeout(function () {
            $scope.filterDate = '';
        }, 200);
        select2();
    }

    $scope.getManyStore = (view) => {
        if ($scope.filterDate && $scope.filterDate != '') {
            let date = $scope.filterDate.split('-');
            $scope.from = moment(date[0]).format('DD/MM/YYYY');
            $scope.to = moment(date[1]).format('DD/MM/YYYY');
        }

        let data = {
            arr_store_id: view == 'ALL' ? [0] : $scope.arr_store_id,
            date_start: $scope.from,
            date_end: $scope.to,
            viewType: $scope.viewType,
            viewFilter: view,
        };

        if (view == 'FILTER' && $scope.arr_store_id.length == 0) {
            toastr.error('Vui lòng chọn chi nhánh cần thống kê!');
            return;
        }

        $http.post(base_url + 'statistics/ajax_get_sale_store_tmv', JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                if (view == 'ALL') {
                    $scope.all_store = r.data.data;
                } else if (view = 'FILTER') {
                    $scope.muti_store = r.data.data;
                }
                $scope.loadingPage = false;
                $scope.loadingPageFilter = false;
            } else toastr["error"]("Đã có lỗi xẩy ra!");
        })
    }

    $scope.changeDate = () => {
        $scope.isViewType = 1;
    }

    $scope.unsetDate = () => {
        $scope.filterDate = '';
        $scope.from = '';
        $scope.to = '';
        $scope.isViewType = 0;
    }

    $scope.converHtml = (htmlbd) => {
        return $sce.trustAsHtml(htmlbd);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
});