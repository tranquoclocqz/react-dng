app.controller('dng_love_gift_details', function ($scope, $http, $compile) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        $scope.is_leader = IS_LEADER;
        $scope.objectGeneration();
    }
    $scope.objectGeneration = () => {
        $scope.filter = {};
        $scope.filter.active = '2';
        $scope.filter.gift_id = [];
        $scope.filter.store_id = '0';
        $scope.filter.group_id = '0';
        $scope.filter.user_id = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;
        $scope.select2();

        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);

        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $http.get(base_url + 'love_sharing/get_gift_codes/' + preview_id + '?filter=' + JSON.stringify({})).then(r => {
                $scope.openModal('detail', r.data.data[0]);
            })
        } else console.log('no value was found!');
    }

    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }

    function resetTheCode() {
        $scope.the_code = {};
        $scope.the_code.gift_id = '0';
        $scope.select2();
    }
    $scope.openModal = (type, item = {}) => {
        $scope.modalType = type;
        switch (type) {
            case 'detail':
                $scope.detail_code = item;
                $scope.detail_code.is_dollar = (item.is_dollar == 0 || !item.is_dollar) ? false : true;
                break;
            case 'create':
                resetTheCode()
                break;
            case 'edit':
                $scope.the_code = {
                    'id': item.id,
                    'code': item.code,
                    'content': item.content,
                    'gift_id': item.gift_id
                };
                break;
            // case 'mc':

            //     break;
            default:
                break;
        }
        $('#codeModal').modal('show');
    }
    $scope.checkCodeIsset = (code) => {
        $http.get(base_url + 'love_sharing/ajax_check_code_isset/' + code).then(r => {
            if (r && r.data.status == 1) $scope.the_code.isset_code = true;
            else $scope.the_code.isset_code = false;
        })
    }
    $scope.codeAction = () => {
        if ($scope.the_code.gift_id == 0 || $scope.the_code.isset_code) {
            toastr["error"]('Vui lòng kiểm tra lại thông tin!');
            return false;
        }
        switch ($scope.modalType) {
            case 'create':
                $http.post(base_url + 'love_sharing/ajax_create_code_detail', $scope.the_code).then(r => {
                    if (r && r.data.status == 1) {
                        toastr.success('Đã tạo thành công!');
                        $scope.getAll();
                        resetTheCode();
                    } else toastr["error"](r.data.messages);
                })
                break;
            case 'edit':
                $http.post(base_url + 'love_sharing/ajax_update_code_detail', $scope.the_code).then(r => {
                    if (r && r.data.status == 1) {
                        toastr.success('Thành công!');
                        $scope.getAll();
                    } else toastr["error"](r.data.messages);
                })
                break;
            default:
                break;
        }
    }
    $scope.codeDetailAction = (type) => {
        if (!$scope.detail_code.confirm_note || $scope.detail_code.confirm_note == '') {
            toastr["error"]('Vui lòng nhập ghi chú duyệt!');
            return false;
        }
        switch (type) {
            case 'confirmRq':
                var real_price = ($scope.detail_code.price + '').replace(/,/g, "");
                if (parseInt(real_price) > parseInt($scope.detail_code.max_real_price)) {
                    toastr["error"]('Tổng tiền đã dùng lớn hơn so với giá tối đa!!');
                    return false;
                }
                var a = confirm('Duyệt sử dụng phần quà!')
                if (a) {
                    var data = {
                        'code_id': $scope.detail_code.id,
                        'user_id': $scope.detail_code.user_id,
                        'gift_name': $scope.detail_code.name,
                        'confirm_note': $scope.detail_code.confirm_note,
                        'gift_id': $scope.detail_code.gift_id,
                        'is_dollar': ($scope.detail_code.is_dollar) ? $scope.detail_code.is_dollar : false,
                        'price': real_price,
                        'confirm_department': $scope.detail_code.confirm_department,
                        'type': 'cf'
                    }
                    $http.post(base_url + 'love_sharing/ajax_confirm_code_request', data).then(r => {
                        if (r && r.data.status == 1) {
                            toastr.success('Đã cập nhật!!');
                            $('#codeModal').modal('hide');
                            $scope.getAll();
                        } else toastr["error"](r.data.messages);
                    })
                } else {
                    return false;
                }
                break;
            case 'refuseRq':
                var a = confirm('Hủy yêu cầu phần quà này?!')
                if (a) {
                    var data = {
                        'code_id': $scope.detail_code.id,
                        'user_id': $scope.detail_code.user_id,
                        'gift_name': $scope.detail_code.name,
                        'confirm_note': $scope.detail_code.confirm_note,
                        'gift_id': $scope.detail_code.gift_id,
                        'type': 'dn'
                    }
                    $http.post(base_url + 'love_sharing/ajax_confirm_code_request', data).then(r => {
                        if (r && r.data.status == 1) {
                            toastr.success('Đã cập nhật!!');
                            $('#codeModal').modal('hide');
                            $scope.getAll();
                        } else toastr["error"](r.data.messages);
                    })
                } else {
                    return false;
                }
                break;
            default:
                break;
        }
    }
    $scope.updateCode = (item) => {
        var data = {
            'id': item.id,
            'confirm_note': item.confirm_note,
            'is_dollar': item.is_dollar,
            'confirm_department': item.confirm_department,
            'price': (item.price + '').replace(/,/g, "")
        }
        $http.post(base_url + 'love_sharing/ajax_update_code_detail', data).then(r => {
            if (r && r.data.status == 1) {
                toastr.success('Đã cập nhật!!');
                $scope.getAll();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.sort_items = () => {
        $scope.filter.sort_date = !$scope.filter.sort_date;
        $scope.getAll();
    }
    $scope.getAll = (pagingReload = true) => {
        if (pagingReload) {
            $scope.filter.offset = 0;
            $scope.pagingInfo.offset = 0;
            pi.currentPage = 1;
        }
        $http.get(base_url + 'love_sharing/get_gift_codes?filter=' + JSON.stringify($scope.filter)).then(r => {
            if ($scope.filter.active == 0) $scope.show_total = true;
            else $scope.show_total = false;

            if ($scope.filter.by_confirmdate) $scope.show_confirmdate = true;
            else $scope.show_confirmdate = false;

            $scope.rows = r.data.data;
            $scope.total_price = r.data.total_price;
            $scope.pagingInfo.total = r.data.count;
            $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
        })
    }

    $scope.exportExcel = () => {
        window.open(base_url + 'love_sharing/exportExcel?filter=' + JSON.stringify($scope.filter), '_blank');
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

    $scope.dateInputInit = () => {
        $('.custom-daterange').daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: moment().subtract(3, 'month').startOf('month'),
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
    $scope.select2 = () => {
        setTimeout(() => {
            $('.select2').select2({ selectionTitleAttribute: false });
        }, 50);
    }
    $scope.multiple_confirm_mode = (status, step = 1) => {
        $scope.multiple_confirm_status = status;
        if (status == 1) {
            $scope.mc_Obj = {}
            $scope.mc_Obj.mc_items = [];
            $scope.mc_Obj.confirm_department = '1';
            $scope.mc_Obj.price = 0;

            delete $scope.error_messages;
        }
    }
    $scope.select_item_MC = (item) => {
        let ind = $scope.mc_Obj.mc_items.findIndex(x => x.id === item.id);
        if (ind === -1) $scope.mc_Obj.mc_items.push(item);
        else $scope.mc_Obj.mc_items.splice(ind, 1);
    }
    $scope.check_mc_selected = (id) => {
        let ind = $scope.mc_Obj.mc_items.findIndex(x => x.id === id);
        if (ind === -1) return 0;
        else return 1;
    }
    $scope.remove_mc_item = (index) => {
        $scope.mc_Obj.mc_items.splice(index, 1);
    }
    $scope.mcAction = (active) => {
        if (!$scope.mc_Obj.confirm_note || $scope.mc_Obj.confirm_note == '') {
            $scope.error_messages = 'Vui lòng nhập ghi chú.';
            return false;
        }
        let c = confirm("Bạn có muốn duyệt tất cả những phiếu dưới đây???");
        if (c) {
            let data = angular.copy($scope.mc_Obj);
            data.active = active;
            data.price = (data.price + '').replace(/,/g, "");
            $http.post(base_url + 'love_sharing/ajax_code_mc', data).then(r => {
                if (r && r.data.status == 1) {
                    toastr.success('Cập nhật thành công!');
                    $scope.getAll();
                    $('#codeModal').modal('hide');
                    delete $scope.multiple_confirm_status;
                } else $scope.error_messages = (r.data.messages);
            })
        }
    }
});