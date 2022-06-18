angular.module('app', [])
    .controller('partners', function($scope, $http, $sce, $compile) {
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
            $scope.getAll();
            $scope.searchCampaigns();
        }

        function objectGeneration() {
            $scope.filter = {};
            $scope.filter.campaign_id = 0;
            $scope.filter.status = '0';
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
            $scope.filter.date = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
            $scope.filter.loading = false;

            $scope.obj_search_campaign = {
                show_rs: false,
                key: '',
                list: [],
                load: false
            };
        }
        $scope.getAll = (pagingReload = true) => {
            if (pagingReload) {
                $scope.filter.offset = 0;
                $scope.pagingInfo.offset = 0;
                pi.currentPage = 1;
            }

            $scope.filter.loading = true;
            $http.get('marketing_offlines/ajax_get_partners?filter=' + JSON.stringify($scope.filter)).then(r => {
                $scope.rows = r.data.data.data;
                $scope.rows.forEach(element => {
                    element.locations = element.locations ? JSON.parse(element.locations) : [];
                });
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
                $scope.filter.loading = false;
            })
        }

        $scope.update_status = (item) => {
            let data = {
                id: item.id,
                active: item.active_status ? 1 : 0
            };
            $http.post('marketing_offlines/ajax_update_partner_status', data).then(r => {
                if (r && r.data.status == 1) {
                    toastr["success"]('Đã cập nhật');
                } else toastr["error"](r.data.messages);
            })
        }

        function resetNewElement() {
            $scope.newElement = {};
            $scope.newElement.gender = 'female';
            $scope.newElement.active = '1';
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

        $scope.refreshError = (id) => {
            $http.get('marketing_offlines/ajax_refresh_partner_errr/' + id).then(r => {
                if (r && r.data.status == 1) {
                    toastr.success('Đã cập nhật!');
                    $scope.newElement.error_process = 0;
                    $scope.getAll();
                } else toastr["error"](r.data.messages);
            })
        }

        $scope.confirmModalAction = () => {
            // kiễm tra bắt buộc nhập địa điễm
            var flag = false;
            $scope.newElement.workshifts.forEach(element => {
                if (!element.location_id || element.location_id == '0') {
                    return flag = true;
                }
            });
            if (flag) { return showMessErr('Bắt buộc nhập địa điểm'); }

            switch ($scope.modalType) {
                case 'create':
                    let confirm_ask = confirm('Are you sure you want to create this partner?');
                    if (!confirm_ask) return false;
                    $http.post('marketing_offlines/ajax_create_partner', $scope.newElement).then(r => {
                        if (r && r.data.status == 1) {
                            toastr.success('Đã tạo thành công!');
                            $scope.getAll();
                            $('#createModal').modal('hide');
                        } else toastr["error"](r.data.message);
                    })
                    break;
                case 'detail':
                    $http.post('marketing_offlines/ajax_update_partner', $scope.newElement).then(r => {
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

        $scope.removeShift = (ind) => {
            $scope.newElement.workshifts.splice(ind);
        }

        $scope.openDetail = (partner) => {
            var item = angular.copy(partner);
            $http.get('marketing_offlines/ajax_get_partner_detail?id=' + item.id).then(r => {
                if (r && r.data.status == 1) {
                    $scope.modalType = 'detail';
                    $scope.newElement = r.data.data;
                    $scope.newElement.workshifts.filter(x => x.location_id = x.location_id + '');
                    if ($scope.newElement.campaign_id) {
                        $scope.getLocations($scope.newElement.campaign_id);
                    }
                    $('#createModal').modal('show');
                    refreshDate();
                } else toastr["error"](r.data.messages);
            })
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
            if ($scope.modalType) {
                $scope.newElement.campaign_id = data.id;
                $scope.newElement.campaign_name = data.name;
                $scope.getLocations($scope.newElement.campaign_id);
            } else {
                $scope.filter.campaign_id = data.id;
                $scope.filter.campaign_name = data.name;
            }
        }

        // lấy danh sách địa điểm theo chương trình
        $scope.getLocations = (campaign_id) => {
            $http.get('marketing_offlines/ajax_search_locations?campaign_id=' + campaign_id).then(r => {
                if (r && r.data.status == 1) {
                    $scope.locations = r.data.data;
                } else toastr["error"](r.data.messages);
                select2_img();
            });
        }

        $scope.removeChooseCampaign = () => {
            if ($scope.modalType) {
                $scope.newElement.campaign_id = 0;
                $scope.locations = [];
            } else {
                $scope.filter.campaign_id = 0;
                setTimeout(() => {
                    $('#search-app').trigger('focus');
                }, 100);
            }
        }

        $scope.resetSearch = () => {
            if ($scope.modalType) {
                $scope.newElement.campaign_id = 0;
            } else {
                $scope.filter.campaign_id = 0;
            }
            $scope.obj_search_campaign.key = '';
            $scope.searchCampaigns();
        }

        $scope.clickInput = () => {
            $scope.obj_search_campaign.show_rs = true;
            $scope.modalType = '';
        }
    })