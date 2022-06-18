angular.module('app', [])
    .controller('campaigns', function ($scope, $http, $sce, $compile) {
        var pi = $scope.pagingInfo = {
            itemsPerPage: 30,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.init = () => {
            objectGeneration();
            resetNewElement();
            $scope.getStore();
            $scope.getMkters();
            $scope.getAll();
            $scope.obj_search_location = {
                show_rs: false,
                key: '',
                list: [],
                list_p: [],
                load: false
            };
            $scope.searchLocations();
        }

        $scope.get_marketing_offline_vouchers = (voucher_id) => {
            voucher_id = voucher_id ? voucher_id : 0;
            $http.get(base_url + 'marketing_offlines/get_marketing_offline_vouchers?voucher_id=' + voucher_id).then(r => {
                if (r && r.data.status == 1) {
                    $scope.vouchers = r.data.data;
                    select2_img();
                }
            });
        }

        function objectGeneration() {
            $scope.filter = {};
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
            $scope.filter.loading = false;
            $scope.filter.active = '-1';
            $scope.filter.date = '';
        }
        $scope.getAll = (pagingReload = true) => {
            if (pagingReload) {
                $scope.filter.offset = 0;
                $scope.pagingInfo.offset = 0;
                pi.currentPage = 1;
            }
            $scope.filter.loading = true;
            $http.post('marketing_offlines/ajax_get_campaigns', $scope.filter).then(r => {
                $scope.filter.loading = false;
                $scope.rows = r.data.data.data;
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
            })
        }

        function resetNewElement() {
            $scope.newElement = {};
            $scope.newElement.locations = [];
            $scope.newElement.voucher_id = '0';
            $scope.newElement.user_id = '0';
            $scope.newElement.store_id = '0';
        }
        $scope.createElement = () => {

        }
        $scope.openCreator = (type) => {
            $scope.modalType = type;
            if (type == 'create') resetNewElement();

            $scope.get_marketing_offline_vouchers();
            setTimeout(() => {
                $('#createModal').modal('show');
                select2_img();
            }, 50);
        }
        document.addEventListener("click", function (event) {
            // If user clicks inside the element, do nothing
            if (event.target.closest(".finding, .phone-inpt")) return;
            // If user clicks outside the element, hide it!
            $scope.showRecomend = false;
            $scope.$apply();
        });
        $scope.selectElement = (item) => {
            $scope.newElement = item;
            $scope.showRecomend = false;
            $scope.modalType = 'update';
        }
        $scope.bindPartner = () => {
            if ($scope.newElement.phone.length > 4) {
                $http.get('marketing_offlines/ajax_get_partners?filter=' + JSON.stringify({
                    phone: $scope.newElement.phone,
                    limit: 10,
                    offset: 0
                })).then(r => {
                    if (r && r.data.status == 1) {
                        $scope.showRecomend = true;
                        $scope.findingElements = r.data.data.data;
                    } else toastr["error"](r.data.messages);
                })
            }
        }
        $scope.confirmModalAction = () => {
            if ($scope.newElement.locations.length == 0) {
                return showMessErr('Địa điểm không được để trống !');
            }
            switch ($scope.modalType) {
                case 'create':
                    let confirm_ask = confirm('Are you sure you want to create this partner?');
                    if (!confirm_ask) return false;
                    $http.post('marketing_offlines/ajax_create_campaign', $scope.newElement).then(r => {
                        if (r && r.data.status == 1) {
                            toastr.success('Đã tạo thành công!');
                            $scope.filter.date = '';
                            $scope.getAll();
                            $('#createModal').modal('hide');
                        } else toastr["error"](r.data.messages);
                    })
                    break;
                case 'detail':
                    $http.post('marketing_offlines/ajax_update_campaign', $scope.newElement).then(r => {
                        if (r && r.data.status == 1) {
                            $('#createModal').modal('hide');
                            toastr.success('Thành công!');
                            $scope.filter.date = '';
                            $scope.getAll();
                        } else toastr["error"](r.data.messages);
                    })
                    break;
                default:
                    break;
            }
        }

        $scope.openDetail = (partner) => {
            var item = angular.copy(partner);
            // Reset giá trị của danh sách không cần load ajax
            $scope.obj_search_location.list = $scope.obj_search_location.list_p;
            $scope.get_marketing_offline_vouchers(item.voucher_id);
            $scope.modalType = 'detail';
            $scope.newElement = angular.copy(item);
            $scope.newElement.date = item.start_date + ' - ' + item.end_date;
            $scope.newElement.locations = item.locations ? JSON.parse(item.locations) : [];
            // Xóa các phần tử newElement.locations khỏi obj_search_location.list
            var ids_exits = $scope.newElement.locations.map(x => x.id + '');
            $scope.obj_search_location.list = $scope.obj_search_location.list.filter(x => !ids_exits.includes(x.id));

            $('#createModal').modal('show');
            select2_img();
        }

        $scope.appendWorkshift = () => {
            if (!$scope.newElement.workshifts) $scope.newElement.workshifts = [];
            $scope.newElement.workshifts.push({
                start: moment().format('DD/MM/YYYY HH:mm'),
                end: moment().subtract(-4, 'hours').format('DD/MM/YYYY HH:mm')
            });
            refreshDate();
        }

        function refreshDate() {
            setTimeout(() => {
                singleDatePicker();
            }, 50);
        }

        function singleDatePicker() {
            $('.custom-date-single').daterangepicker({
                opens: 'center',
                timePicker: true,
                alwaysShowCalendars: true,
                singleDatePicker: true,
                timePicker24Hour: true,
                maxYear: parseInt(moment().format('YYYY'), 10),
                locale: {
                    format: 'DD/MM/YYYY HH:mm',
                }
            });
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
            pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage;
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

        $scope.update_active = (item) => {
            let data = {
                id: item.id,
                active: item.active_status ? 1 : 0
            };
            $http.post('marketing_offlines/ajax_update_campaign_active', data).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"]('Đã cập nhật');
                } else toastr["error"](r.data.messages);
            })
        }

        $scope.setUnDate = () => {
            $scope.filter.date = '';
        }

        if ($('.custom-daterange').length) {
            $('.custom-daterange').daterangepicker({
                opens: 'left',
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                ranges: {
                    'Hôm nay': [moment(), moment()],
                    'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    '7 ngày trước': [moment().subtract(6, 'days'), moment()],
                    '30 ngày trước': [moment().subtract(29, 'days'), moment()],
                    'Tháng này': [moment().startOf('month'), moment().endOf('month')],
                    'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                },
                "locale": {
                    "format": 'DD/MM/YYYY'
                }
            });
        }

        $scope.hideRsFilterLocations = () => {
            setTimeout(() => {
                $scope.obj_search_location.show_rs = false;
                $scope.$apply();
            }, 250)
        }

        $scope.searchLocations = () => {
            var key = $scope.obj_search_location.key ? $scope.obj_search_location.key : '';
            var not_ids = $scope.newElement.locations ? $scope.newElement.locations.map(x => x.id + '') : [];
            var data_search = {
                'not_ids': not_ids,
                'key': key
            };
            setTimeout(() => {
                $scope._searchLocations(data_search);
            }, 300);
        }

        $scope._searchLocations = (data_search) => {
            $scope.obj_search_location.load = true;

            $http.post(base_url + 'marketing_offlines/ajax_search_locations', data_search).then(r => {
                if (r.data.status) {
                    $scope.obj_search_location.list = r.data.data;
                    $scope.obj_search_location.list_p = r.data.data;
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_search_location.load = false;
            }, function (data, status, headers, config) {
                showMessErrSystem()
            });
        }

        $scope.chooseLocation = (key) => {
            var item = angular.copy($scope.obj_search_location.list[key]);
            $scope.newElement.locations.push(item);
            $scope.obj_search_location.list.splice(key, 1);
        }

        $scope.removeChooseLocation = (key) => {
            var item = angular.copy($scope.newElement.locations[key]);
            $scope.obj_search_location.list.push(item);
            $scope.newElement.locations.splice(key, 1);

            setTimeout(() => {
                $('#search-app').trigger('focus');
            }, 300);
        }

        $scope.resetSearch = () => {
            $scope.obj_search_location.key = '';
            $scope.searchLocations();
        }

        $scope.getStore = () => {
            $http.get(base_url + 'marketing_offlines/ajax_get_stores').then(r => {
                if (r && r.data.status == 1) {
                    $scope.stores = r.data.data;
                    $scope.stores_ = angular.copy(r.data.data);
                    $scope.stores.push({
                        id: -1,
                        name: 'Hồ Chí Minh',
                        description: 'Hồ Chí Minh'
                    }, {
                        id: 0,
                        name: 'Chưa xác định',
                        description: 'Chưa xác định'
                    });
                    select2_img(100);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }
        $scope.getMkters = () => {
            $http.get(base_url + 'marketing_offlines/ajax_get_mkters').then(r => {
                if (r && r.data.status == 1) {
                    $scope.mkters = r.data.data;
                    select2_img(100);
                } else toastr["error"]("Đã có lỗi xẩy ra!");
            });
        }
    })