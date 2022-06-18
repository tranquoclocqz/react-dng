angular.module('app', [])
    .controller('phones', function($scope, $http, $sce, $compile) {
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
            $scope.getChannels();
            $scope.getAll();

            $scope.obj_search_campaign = {
                show_rs: false,
                key: '',
                list: [],
                load: false
            };
            $scope.searchCampaigns();

            $scope.obj_search_location = {
                show_rs: false,
                key: '',
                list: [],
                load: false
            };
            $scope.searchLocations();
        }

        function objectGeneration() {
            $scope.filter = {};
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
            $scope.filter.channel_id = '0';
            $scope.filter.is_invalid = '1';
            $scope.filter.date = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
            $scope.filter.loading = false;
        }
        $scope.getAll = (pagingReload = true) => {
            if (pagingReload) {
                $scope.filter.offset = 0;
                $scope.pagingInfo.offset = 0;
                pi.currentPage = 1;
            }
            $scope.filter.loading = true;
            $http.post('marketing_offlines/get_data_phones', $scope.filter).then(r => {
                $scope.filter.loading = false;
                $scope.rows = r.data.data.data;
                $scope.count_sale_care = r.data.data.count_sale_care;
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
            })
        }

        $scope.exportExcel = () => {
            window.open(base_url + 'marketing_offlines/export_excel_phones?filter=' + JSON.stringify($scope.filter), '_blank');
        }

        function resetNewElement() {
            $scope.newElement = {};
            // $scope.newElement.date = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
        }
        $scope.createElement = () => {

        }
        $scope.openCreator = (type) => {
            $scope.modalType = type;
            if (type == 'create') resetNewElement();
            setTimeout(() => {
                $('#createModal').modal('show');
            }, 50);
        }
        document.addEventListener("click", function(event) {
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
            switch ($scope.modalType) {
                case 'create':
                    let confirm_ask = confirm('Are you sure you want to create this partner?');
                    if (!confirm_ask) return false;
                    $http.post('marketing_offlines/ajax_create_campaign', $scope.newElement).then(r => {
                        if (r && r.data.status == 1) {
                            toastr.success('Đã tạo thành công!');
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
                            $scope.getAll();
                        } else toastr["error"](r.data.messages);
                    })
                    break;
                default:
                    break;
            }
        }

        $scope.openDetail = (partner) => {
            $scope.modalType = 'detail';
            $scope.newElement = partner;
            $scope.newElement.date = partner.start_date + ' - ' + partner.end_date;
            $('#createModal').modal('show');
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
        $scope.go2Page = function(page) {
            if (page < 0) return;
            var pi = $scope.pagingInfo;
            pi.currentPage = page;
            pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
            $scope.getAll(false);
            pi.to = pi.total < pi.itemsPerPage ? pi.total : pi.itemsPerPage;
        }

        $scope.Previous = function(page) {
            if (page - 1 > 0) $scope.go2Page(page - 1);
            if (page - 1 == 0) $scope.go2Page(page);
        }

        $scope.getRange = function(paging) {
                var max = paging.currentPage + 3;
                var total = paging.totalPage + 1;
                if (max > total) max = total;
                var min = paging.currentPage - 2;
                if (min <= 0) min = 1;
                var tmp = [];
                return _.range(min, max);
            }
            // end paging

        $scope.hideRsFilterCampaigns = () => {
            setTimeout(() => {
                $scope.obj_search_campaign.show_rs = false;
                $scope.$apply();
            }, 250)
        }

        $scope.searchCampaigns = () => {
            var key = $scope.obj_search_campaign.key ? $scope.obj_search_campaign.key : '';
            if ($scope.obj_search_campaign.key == '') {
                $scope.filter.campaign_id = 0;
            }
            setTimeout(() => {
                $scope._searchCampaigns(key);
            }, 300);
        }

        $scope._searchCampaigns = (key) => {
            $scope.obj_search_campaign.load = true;
            $http.get(base_url + 'marketing_offlines/ajax_search_campaigns?key=' + key).then(r => {
                if (r.data.status) {
                    var data = r.data.data;
                    $scope.obj_search_campaign.list = data;
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_search_campaign.load = false;
            }, function(data, status, headers, config) {
                showMessErrSystem()
            });
        }

        $scope.chooseCampaign = (data) => {
            $scope.obj_search_campaign.key = '';
            $scope.filter.campaign_id = data.id;
            $scope.filter.campaign_name = data.name;
            $scope.searchLocations();
        }

        $scope.removeChooseCampaign = () => {
            $scope.filter.campaign_id = 0;
            $scope.searchLocations();
            setTimeout(() => {
                $('#search-app').trigger('focus');
            }, 100);
        }

        $scope.resetSearchCampaign = () => {
            $scope.filter.campaign_id = 0;
            $scope.obj_search_campaign.key = '';
            $scope.searchCampaigns();
        }

        // Search location
        $scope.hideRsFilterLocations = () => {
            setTimeout(() => {
                $scope.obj_search_location.show_rs = false;
                $scope.$apply();
            }, 250)
        }

        $scope.searchLocations = () => {

            var data_search = {
                key: $scope.obj_search_location.key ? $scope.obj_search_location.key : '',
                campaign_id: $scope.filter.campaign_id ? $scope.filter.campaign_id : 0,
                channel_id: $scope.filter.channel_id ? $scope.filter.channel_id : 0
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
                } else {
                    showMessErr(r.data.message);
                }
                $scope.obj_search_location.load = false;
            }, function(data, status, headers, config) {
                showMessErrSystem()
            });
        }

        $scope.chooseLocation = (data) => {
            $scope.obj_search_location.key = '';
            $scope.filter.location_id = data.id;
            $scope.filter.location_name = data.name;
        }

        $scope.removeChooseLocation = () => {
            $scope.filter.location_id = 0;
            setTimeout(() => {
                $('#search-app-location').trigger('focus');
            }, 100);
        }

        $scope.resetSearchLocation = () => {
            $scope.filter.location_id = 0;
            $scope.obj_search_location.key = '';
            $scope.searchLocations();
        }

        // lấy danh sách kênh
        $scope.getChannels = () => {
            $http.get('marketing_offlines/ajax_get_required_channels').then(r => {
                if (r && r.data.status == 1) {
                    $scope.channels = r.data.data;
                } else toastr["error"](r.data.messages);
                select2_img();
            });
        }
    })