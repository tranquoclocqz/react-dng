angular.module('app', [])
    .controller('reports', function ($scope, $http, $sce, $compile) {

        $scope.init = () => {
            $scope.showNote = false;
            $scope.showReport = false;
            objectGeneration();
            $scope.getChannels();
            $scope.get_partners();
            $scope.date = {
                min: moment().startOf('month'),
                max: moment().endOf('month')
            };

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
            $scope.getReports();
        }

        $scope.get_partners = () => {
            $http.get('marketing_offlines/ajax_get_partners?filter=' + JSON.stringify({
                campaign_id: $scope.filter.campaign_id
            })).then(r => {

                if (r && r.data.status == 1) {
                    $scope.partners = r.data.data.data;
                    select2_img(100);
                } else toastr["error"](r.data.messages);
            });
        }

        function objectGeneration() {
            $scope.filter = {};
            $scope.filter.channel_id = '0';
            $scope.filter.import_id = '0';
            //$scope.filter.date = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
            $scope.filter.loading = false;
        }
        $scope.getReports = () => {
            if ($scope.filter.campaign_id) {
                $scope.filter.loading = true;
                $http.post('marketing_offlines/get_reports_marketing', $scope.filter).then(r => {
                    $scope.filter.loading = false;
                    $scope.rows = r.data.data;
                    $scope.showReport = true;
                })
            } else {
                $scope.showReport = false;
            }
        }

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
            }, function (data, status, headers, config) {
                showMessErrSystem()
            });
        }

        $scope.chooseCampaign = (data) => {
            $scope.obj_search_campaign.key = '';
            $scope.filter.campaign_id = data.id;
            $scope.filter.campaign_name = data.name;
            $scope.get_partners();
            $scope.searchLocations();

            $scope.date.min = data.start_date;
            $scope.date.max = data.end_date;
            $scope.dateReport();
        }

        $scope.removeChooseCampaign = () => {
            $scope.filter.campaign_id = 0;
            $scope.get_partners();
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
            $scope.filter.location_id = 0;
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
            }, function (data, status, headers, config) {
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

        $scope.openDetail = (item) => {

            var data_filter = {
                id_invoices: item.id_invoices,
                id_mkt_phones: item.id_mkt_phones
            }
            $http.post('marketing_offlines/get_detail_reports_marketing', data_filter).then(r => {
                if (r && r.data.status == 1) {
                    item.myhtml = `
                        <div class="d-flex-bw"><span>Dịch vụ: </span><b class="text-danger">` + $scope.getMoney(r.data.data.services) + `</b></div>
                        <div class="d-flex-bw"><span>Sản Phẩm: </span><b class="text-danger">` + $scope.getMoney(r.data.data.products) + `</b></div>
                        <div class="d-flex-bw"><span>Gói: </span><b class="text-danger">` + $scope.getMoney(r.data.data.packages) + `</b></div>
                        <div class="d-flex-bw"><span>Thu nợ: </span><b class="text-danger">` + $scope.getMoney(r.data.data.package_debits) + `</b></div>`;
                    item.show = true;
                } else toastr["error"](r.data.messages);
            });
        }

        $scope.hideDetail = (item) => {
            setTimeout(() => {
                item.show = false;
                item.myhtml = null;
                $scope.$apply();
            }, 250)
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

        $scope.dateReport = () => {
            var min = moment($scope.date.min).format("DD/MM/YYYY");
            var max = moment($scope.date.max).format("DD/MM/YYYY");
            $('.reportdate').val('');
            $('.reportdate').daterangepicker({
                opens: 'right',
                alwaysShowCalendars: true,
                showCustomRangeLabel: false,
                minDate: min,
                maxDate: max,
                startDate: min,
                endDate: max,
                locale: {
                    format: 'DD/MM/YYYY'
                }
            });
        }

        $scope.converHtml = (html) => {
            return $sce.trustAsHtml(html);
        }
    })