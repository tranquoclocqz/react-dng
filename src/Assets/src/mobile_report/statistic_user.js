
app.controller('uCtrl', function ($scope, $http) {

    var pi = $scope.pagingInfo = {
        itemsPerPage: 10,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };


    $scope.init = () => {
        $scope.isView = 1;
        $scope.filter = dataFilter;
        $scope.filter.dateType = '0';
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.historyDetail = [];
        $scope.history = [];
        $scope.getAll();
        $scope.count = 1;
        $scope.loadDt = true;
        select2();
    }

    //Kéo xuống cuối trang thì load page
    angular.element(document.querySelector('.body-box')).bind('scroll', function () {
        let heightWhenScroll = $('.body-box').scrollTop() + $('.body-box').height();
        let heightDiv = $('#heightdiv').height() + 40;
        if (heightWhenScroll >= heightDiv && $scope.history.length < $scope.historyTotal) {
            $scope.count = $scope.count + 1;
            $scope.pagingInfo.currentPage = $scope.count;
            $scope.getSaleHistory();
        }
    });


    function select2() {
        setTimeout(() => {
            $('.select2').select();
        }, 200);
    }

    $scope.getAll = () => {
        $scope.loadHome = false;
        let data = {
            api_key: $scope.filter.api,
            user_id: $scope.filter.user_id,
            group_id: $scope.filter.group_id,
            store_id: $scope.filter.store_id
        }

        if ($scope.filter.dateType == 0) data.date = moment().format('YYYY-MM-DD');
        if ($scope.filter.dateType == 1) data.date = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
        if ($scope.filter.dateType == 2) data.date = moment().subtract(2, 'months').endOf('month').format('YYYY-MM-DD');
        $scope.filter.date = data.date;

        let url = base_url + '/mobile_report/ajax_statistic_user';
        $http.post(url, data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.report = r.data.data;
            }
            $scope.loadHome = true;
        })
    }

    $scope.getSaleHistory = () => {
        $scope.loading = true;
        let data = {
            api_key: $scope.filter.api,
            user_id: $scope.filter.user_id,
            date: $scope.filter.date,
            group_id: $scope.filter.group_id,
            store_id: $scope.filter.store_id,
            offset: ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage,
            limit: $scope.filter.limit
        }
        let url = base_url + '/mobile_report/ajax_history_statistic_user';
        $http.post(url, data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.loading = false;
                r.data.data.forEach(r => {
                    $scope.history.push(r);
                });
                console.log($scope.history);
                $scope.historyTotal = r.data.total_record;
            }
        })
    }

    $scope.getHistoryDetail = (id) => {
        let data = {
            api_key: $scope.filter.api,
            user_id: $scope.filter.user_id,
            store_id: $scope.filter.store_id,
            group_id: $scope.filter.group_id,
            invoice_id: id
        }
        $scope.loadDt = false;
        let url = base_url + '/mobile_report/ajax_detail_statistic_user';
        $http.post(url, data).then(r => {
            if (r.data && r.data.status == 1) {
                $scope.historyDetail = r.data.data;
                $scope.loadDt = true;
            }
        })
    }

    $scope.openView = (val, item) => {
        $scope.isView = val;
        if (val == 2) {
            $scope.count = 1;
            $scope.pagingInfo.currentPage = 1;
            $scope.getSaleHistory();
            $scope.history = [];
        }
        if (val == 3) $scope.getHistoryDetail(item.id);
        $scope.historyDetailTmp = item;
    }

    $scope.backView = () => {
        $scope.isView = $scope.isView - 1;
    }

    $scope.getPercentDevelop = (tt, ltt) => {
        if (ltt != 0) {
            let per = (100 - ((tt / ltt) * 100)) * -1;
            //trường hợp giảm
            if (per < 0 && ltt > 0) {
                return per.toFixed(2);
            }
            return per < 0 ? per.toFixed(2) * -1 : per.toFixed(2);
        }
        return 100;
    }

    $scope.getPercent = (tt, ltt) => {
        if (ltt != 0) {
            let per = (100 - ((tt / ltt) * 100)) * -1;
            return per < 0 ? per.toFixed(2) * -1 : per.toFixed(2);
        }
        return 100;
    }

    $scope.getMoney = (val) => {
        let mn = val ? Number(val) : 0;
        if (mn >= 1000000000) {
            return (mn / 1000000000).toFixed(2) + ' Tỷ';
        } else if (mn >= 1000000) {
            return (mn / 1000000).toFixed(2) + ' Tr';
        } else {
            return mn == 0 ? 0 : (mn / 1000).toFixed(0) + ' K';
        }
    }

    $scope.getTotalMoney = (val1, val2, val3) => {
        let mn = Number(val1) + Number(val2) + Number(val3);
        if (mn >= 1000000000) {
            return (mn / 1000000000).toFixed(2) + ' Tỷ';
        } else if (mn >= 1000000) {
            return (mn / 1000000).toFixed(2) + ' Tr';
        } else {
            return (mn / 1000).toFixed(0) + ' K';
        }
    }

    $scope.formatDate = (date, fm) => {
        return moment(date).format(fm);
    }

    $scope.getTypeName = (type) => {
        if (type == 'service') return 'DỊCH VỤ';
        return type == 'package' ? 'GÓI DỊCH VỤ' : 'SẢN PHẨM';
    }
    $scope.checkShow = (type) => {
        let dt = $scope.historyDetail.filter(r => { return r.type == type });
        return dt.length > 0 ? true : false;
    }

});