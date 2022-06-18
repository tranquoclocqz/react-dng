angular.module('app', [])
    .controller('locations', function($scope, $http, $sce, $compile) {
        var pi = $scope.pagingInfo = {
            itemsPerPage: 20,
            offset: 0,
            to: 0,
            currentPage: 1,
            totalPage: 1,
            total: 0
        };

        $scope.init = () => {
            objectGeneration();
            $scope.getAll();
            $scope.getRequiredData();
            $scope.addchannel = {
                show: false,
                name: ''
            }
        }

        function objectGeneration() {
            $scope.filter = {};
            $scope.filter.loading = false;
            $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
            $scope.filter.offset = $scope.pagingInfo.offset;
            $scope.filter.channel_id = '0';
        }
        $scope.getAll = (pagingReload = true) => {
            if (pagingReload) {
                $scope.filter.offset = 0;
                $scope.pagingInfo.offset = 0;
                pi.currentPage = 1;
            }
            $scope.filter.loading = true;
            $http.post('marketing_offlines/ajax_get_locations', $scope.filter).then(r => {
                $scope.filter.loading = false;
                $scope.rows = r.data.data.data;
                $scope.pagingInfo.total = r.data.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.data.count / pi.itemsPerPage);
            })
        }

        function resetNewElement() {
            $scope.newElement = {};
            $scope.newElement.channel_id = '0';
            select2_img();
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
        $scope.confirmModalAction = () => {
            if ($scope.newElement.channel_id == 0) {
                return showMessErr('Kênh không được bỏ trống !');
            }
            switch ($scope.modalType) {
                case 'create':
                    let confirm_ask = confirm('Are you sure you want to create this channel?');
                    if (!confirm_ask) return false;
                    $http.post('marketing_offlines/ajax_create_location', $scope.newElement).then(r => {
                        if (r && r.data.status == 1) {
                            toastr.success('Đã tạo thành công!');
                            $scope.getAll();
                            $('#createModal').modal('hide');
                        } else toastr["error"](r.data.messages);
                    })
                    break;
                case 'detail':
                    $http.post('marketing_offlines/ajax_update_location', $scope.newElement).then(r => {
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
            $('#createModal').modal('show');
            select2_img(100);
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

        // lấy danh sách kênh và địa điễm theo chương trình
        $scope.getRequiredData = () => {
            $http.get('marketing_offlines/ajax_get_required_channels').then(r => {
                if (r && r.data.status == 1) {
                    $scope.channels = r.data.data;
                } else toastr["error"](r.data.messages);
                select2_img();
            });
        }

        /* Thêm channel */
        $scope.addChannel = () => {
            if (!$scope.addchannel.name) {
                return showMessErr('Vui lòng nhập tên kênh !');
            }
            $http.post('marketing_offlines/ajax_create_channel', $scope.addchannel).then(r => {
                if (r && r.data.status == 1) {
                    showMessSuccess(r.data.messages);
                    $scope.addchannel.show = false;
                    $scope.getRequiredData();
                } else showMessErr(r.data.messages);
            });
        }

    })