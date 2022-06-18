app.controller('index', function ($scope, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.base_url = base_url;
        $scope.objectGeneration();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
    }
    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.user_id = '-1';
        $scope.filter.transType = '0';
        $scope.filter.store_id = '0';
        $scope.filter.group_id = '0';
        $scope.filter.unit = '-1';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.heartSend = {};
    }

    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({ nameselectionTitleAttribute: false });
        }, 50);
    }
    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $http.get(base_url + 'love_sharing/get_all_love_transactions?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.rows = r.data.data;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }
    // paging
    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll(false);
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
    // end paging


    $scope.imageUpload = function (element, type) {
        var files = event.target.files; //FileList object
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = $scope.imageIsLoaded;
            reader.readAsDataURL(file);
        }
        $scope.saveImage(files, type)
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
    $scope.confirmModalAction = (action) => {
        $scope.modalAction = action;
        $('#confirmModal').modal('show');
    }
    $scope.confirmAction = () => {
        switch ($scope.modalAction) {
            case 'create':
                $scope.sendHearts();
                break;
            default:
                break;
        }
    }
    $scope.$watch('heartSend.gift_quantity', function () {
        $scope.quantity_bind = ($scope.heartSend.gift_quantity) ? ($scope.heartSend.gift_quantity + '').replace(/,/g, "") : '0';
        console.log($scope.quantity_bind);
    });
    $scope.sendHearts = (count = false) => {
        $scope.sendLoading = true;
        $scope.heartSend.gift_quantity = ($scope.heartSend.gift_quantity) ? ($scope.heartSend.gift_quantity + '').replace(/,/g, "") : '0';
        $scope.heartSend.count_people = count;
        // $scope.heartSend.gift_name = $('#giftSelect').select2('data')[0].text;
        $http.post(base_url + 'love_sharing/ajax_send_hearts', $scope.heartSend).then(r => {
            $scope.sendLoading = false;
            if (r && r.data.status == 1) {
                if (count) {
                    $scope.totalPeopleSelected = r.data.count;
                } else {
                    $scope.heartSend.receiver_group_ids = [];
                    $scope.heartSend.receiver_store_ids = [];
                    $scope.heartSend.receiver_user_ids = [];
                    $scope.select2();
                    $scope.getAll();
                    delete $scope.totalPeopleSelected;
                    delete $scope.selectedGiftName;
                    $('#confirmModal').modal('hide');
                }
            } else toastr["error"](r.data.message);
        })
    }
    $scope.getloveUnit = () => {
        if (!$scope.heartSend.sender_id) {
            toastr["error"]('Chưa chọn người gửi!');
            $scope.select2();
            return false;
        }
        var data = {
            'user_id': $scope.heartSend.sender_id,
        }
        $http.get(base_url + 'love_sharing/ajax_get_love_unit?filter=' + JSON.stringify(data)).then(r => {
            if (r && r.data.status == 1) {
                $scope.unit_types = r.data.data;
                $scope.select2();
            }
        })
    }
    $scope.setSelectedGift = (item) => {
        obj = _.find($scope.unit_types, function (obj) { return obj.id == $scope.heartSend.gift_id })
        $scope.selectedGiftQuantity = (obj) ? obj.slt : 0;
        $scope.selectedGiftName = obj ? obj.name : '';
    }
    $scope.createStatus = (status) => {
        $scope.creatingStatus = status;
    }
});