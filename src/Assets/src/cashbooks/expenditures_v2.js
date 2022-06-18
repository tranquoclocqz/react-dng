app.directive('copyToClipboard', function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.click(function () {
                if (attrs.copyToClipboard) {
                    var $temp_input = $("<input>");
                    $("body").append($temp_input);
                    $temp_input.val(attrs.copyToClipboard).select();
                    document.execCommand("copy");
                    $temp_input.remove();
                    toastr["warning"]('Đã sao chép liên kết vào bộ nhớ tạm!');
                }
            });
        }
    };
});
app.directive("whenScrolled", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            // we get a list of elements of size 1 and need the first element
            raw = elem[0];
            // we load more elements when scrolled past a limit
            elem.bind("scroll", function () {
                if (raw.scrollTop + raw.offsetHeight + 5 >= raw.scrollHeight) {
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});
app.controller('expenditures_v2', function ($scope, $http, $sce) {
    var pi = $scope.pagingInfo = {
        itemsPerPage: 30,
        offset: 0,
        to: 0,
        currentPage: 1,
        totalPage: 1,
        total: 0
    };

    $scope.init = () => {
        get_group_cost();
        $scope.base_url = base_url;
        $scope.current_user = CURRENT_USER_ID;
        $scope.is_admin = IS_ADMIN;
        $scope.current_store_id = CURRENT_STORE_ID;
        $scope.transaction_limit = 30;

        objectGenerator();
        setTimeout(() => {
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
        var preview_id = getParamsValue('preview_id');
        if (preview_id) {
            $scope.get_itemDetail(preview_id, 'view');
        } else console.log('no value was found!');
        changeParams();
    }

    $scope.checkShowUrlImage = (url_image) => {
        var url = angular.copy(url_image) + '';
        if (url.slice(0, 4) == 'http') {} else {
            url = base_url + 'assets/uploads/certificates/' + url;
        }
        return url;
    }

    $scope.be_showZoomImg = (url) => {
        showZoomImg($scope.checkShowUrlImage(url));
    }

    $scope.print_incomplete = () => {
        let data = check_valid();
        if (!data) return;
        window.open("cashbooks/ajax_print_incomplete_cashbook?data=" + JSON.stringify(data), "_blank")
    }

    function get_group_cost() {
        $http.get(base_url + 'cashbooks/ajax_get_group_cost').then(r => {
            $scope.group_cost = r.data.data;
        })
    }
    $scope.refreshFilter = () => {
        objectGenerator();
        setTimeout(() => {
            select2();
            $scope.dateInputInit();
            $scope.getAll();
        }, 10);
    }

    function getParamsValue(params) {
        var url = new URL(window.location.href);
        var c = url.searchParams.get(params);
        return c;
    }

    function changeParams() {
        let st = '';
        let arr = $scope.filter.store_id;
        if (arr.length > 0) {
            st += '&store_id=';
            for (let index = 0; index < arr.length; index++) {
                st += arr[index];
                if (index < arr.length - 1) {
                    st += ',';
                }
            }
        }
        let stt = '';
        if ($scope.filter.verify_status != '-1') {
            stt += '&verify_status=' + $scope.filter.verify_status;
        }

        let url = base_url +
            'cashbooks/expenditures_v2?request_confirm_id=' + $scope.filter.request_confirm_id + st + stt;
        window.history.pushState('', '', url);
    }

    function objectGenerator() {
        $scope.filter = {};
        let pStore = getParamsValue('store_id');
        if (pStore) {
            try {
                pStore = JSON.parse('[' + pStore + ']');
                angular.forEach(pStore, function (value, key) {
                    if (!isNaN(value)) {
                        pStore[key] = value.toString();
                    }
                })
            } catch {
                pStore = [];
                toastr["error"]('Vui lòng kiểm tra url')
            }
        }

        let pCf = getParamsValue('request_confirm_id');
        let pSt = getParamsValue('verify_status');
        let dStore = ($scope.is_admin != 0) ? [] : [$scope.current_store_id.toString()]

        $scope.filter.request_confirm_id = pCf ? pCf.toString() : '0';
        $scope.filter.verify_status = pSt ? pSt.toString() : '-1';


        $scope.filter.store_id = pStore ? pStore : dStore;
        $scope.filter.confirm_id = '0';
        $scope.filter.type_id = '0';
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = $scope.pagingInfo.offset;

        $scope.selection_status = false;
        $scope.mont_year_render();
    }
    $scope.selectMonthAllocated = (month) => {
        $scope.cbsObject.month_allocated = month;
    }
    $scope.mont_year_render = (year = 0, delete_access = true) => {

        if ($scope.cbsObject && delete_access) delete $scope.cbsObject.month_allocated;

        let d = new Date();
        $scope.current_year = d.getFullYear();
        let current_month = d.getMonth();

        $scope.df_month_allocated = $scope.current_year + '/' + (current_month < 10 ? '0' + current_month : current_month);

        $scope.list_month = [];
        for (let index = 0; index < current_month; index++) {
            let bep = index + 1;
            bep = bep < 10 ? '0' + bep : bep;
            $scope.list_month.push(bep);
        }
        if (current_month == 0) {
            $scope.current_year = $scope.current_year - 1;
            $scope.list_month = [12];
            $scope.df_month_allocated = $scope.current_year + '/' + 12;
        }
    }
    $scope.getAll = () => {
        changeParams();
        $scope.body_loading = true;
        $http.get(base_url + 'cashbooks/ajax_get_store_cashbookes?filter=' + JSON.stringify($scope.filter)).then(r => {
            $scope.body_loading = false;
            if (r.data.status == 1) {
                $scope.rows = r.data.data;
                $scope.pagingInfo.total = r.data.count;
                $scope.pagingInfo.totalPage = Math.ceil(r.data.count / pi.itemsPerPage);
            } else toastr["error"](r.data.messages);
        })
    }

    $scope.handleFilter = () => {
        $scope.pagingInfo.currentPage = 1;
        $scope.pagingInfo.offset = 0;
    }


    $scope.formatDate = (d, fm) => {
        return moment(d).format(fm);
    }

    function select2() {
        setTimeout(() => {
            $('.select2').select2();
        }, 200);
    }
    //paging-----------------------------------

    $scope.go2Page = function (page) {
        if (page < 0) return;
        var pi = $scope.pagingInfo;
        pi.currentPage = page;
        pi.from = pi.offset = (pi.currentPage - 1) * pi.itemsPerPage;
        $scope.filter.limit = $scope.pagingInfo.itemsPerPage;
        $scope.filter.offset = ($scope.pagingInfo.currentPage - 1) * $scope.pagingInfo.itemsPerPage;
        $scope.getAll();
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
    //end paging

    $scope.dateInputInit = (el = '.custom-daterange', subtract, startDate = false, endDate = false) => {
        $(el).daterangepicker({
            opens: 'right',
            alwaysShowCalendars: true,
            startDate: (startDate) ? startDate : moment().subtract(subtract, 'days'),
            endDate: (endDate) ? endDate : moment(),
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

    function new_CBS_reset() {
        delete $scope.list_transaction_func;
        delete $scope.list_verify_request;
        delete $scope.bind_selected_group;

        $scope.cbsObject = {};
        $scope.cbsObject.type_id = '0';
        $scope.cbsObject.formality = 'amount';
        $scope.cbsObject.source = 'amount';
        $scope.cbsObject.bank_id = '0';
        $scope.cbsObject.link_functions = [];
        $('#inputFileEdit').val('');
        setTimeout(() => {
            var c = document.getElementById("myCanvas");
            if (c) {
                var ctx = c.getContext("2d");
                ctx.clearRect(0, 0, c.width, c.height);
            }
        }, 300);
    }
    $scope.openModal = (type, item = null) => {
        delete $scope.error_messages;
        $scope.modalType = type;
        switch (type) {
            case 'file':
                $scope.detail_file = $scope.checkShowUrlImage(item.file);
                break;
            case 'create_cbs':
                new_CBS_reset();
                get_store_amount($scope.current_store_id);
                setTimeout(() => {
                    autosize($('textarea.autosize'));
                }, 50);
                select2();
                break;
            case 'reconfirm':
                $scope.cbsObject = item;
                $scope.cbsObject.note_edit_cashbook = '';
                setTimeout(() => {
                    autosize($('textarea.autosize'));
                }, 50);
                break;
            case 'linked':
                get_linked_by_cbs(item);
                break;
            default:
                break;

        }
        $('#showModal').modal('show');
    }

    function get_linked_by_cbs(cbs) {
        $http.get(base_url + 'cashbooks/get_get_linked_by_cbs?filter=' + JSON.stringify({
            'cbs_id': cbs.id,
            'link_function_type': cbs.link_function_type
        })).then(r => {
            if (r.data.status == 1) {
                $scope.linked_list = (r.data.data);
                $scope.linked_list_function_type = cbs.link_function_type;
            } else toastr["error"]('Vui lòng thử lại');
        })
    }

    function get_store_amount(store_id) {
        $http.get(base_url + 'cashbooks/get_store_start_amount/' + store_id).then(r => {
            if (r.data.status == 1) {
                $scope.start_amount = (r.data.data) ? r.data.data : 0;
            } else toastr["error"]('Vui lòng thử lại');
        })
    }
    $scope.check_data_after_loaddata = function (data) {
        $scope.mont_year_render(data.year_allocated, false);
        let selected_group = $scope.group_cost.find(x => x.id === data.type_id);
        $scope.bind_selected_group = selected_group;
        $http.get(base_url + 'cashbooks/ajax_get_user_by?filter=' + JSON.stringify({
            'group_ids': JSON.parse(selected_group.main_group_confirm_id),
            'user_ids': JSON.parse(selected_group.user_confirm_id),
            'cost_group_id': selected_group.id
        })).then(r => {
            if (r.data.status == 1) {
                $scope.list_verify_request = r.data.data;
                select2();
            } else toastr["error"]('Vui lòng thử lại');
        })
        if (selected_group.link_function_type > 0) {
            if (selected_group.link_function_type == 4) {
                $scope.loadding = true;
                $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?filter=' + JSON.stringify({
                    'link_function_type': selected_group.link_function_type,
                    'transaction_ids': data.link_functions
                })).then(r => {
                    if (r.data.status == 1) {
                        $scope.list_transaction_func = r.data.data;
                        angular.forEach($scope.list_transaction_func, function (value, key) {
                            if (value.id_cs == $scope.cbsObject.id) {
                                value.view = 1;
                                $scope.max_price = value.transfer_amount;
                            } else {
                                value.view = 0;
                            }
                        });
                    } else toastr["error"]('Vui lòng thử lại');
                    $scope.loadding = false;
                })
            } else {
                $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?filter=' + JSON.stringify({
                    'link_function_type': selected_group.link_function_type,
                    'limit': 30
                })).then(r => {
                    if (r.data.status == 1) {
                        angular.forEach(r.data.data, function (value, key) {
                            r.data.data[key].selected_item = false;
                            if (data.link_functions.indexOf(value.id) != -1) {
                                r.data.data[key].selected_item = true;
                            }
                        });
                        $scope.list_transaction_func = r.data.data;
                    } else toastr["error"]('Vui lòng thử lại');
                })
            }

        }
    }
    $scope.check_date_apply = () => {
        var drp = $('#apply-date-daterange').data('daterangepicker');
        if (drp) {
            $scope.cbsObject.start_apply = drp.startDate.format('YYYY/MM/DD');
            $scope.cbsObject.end_apply = drp.endDate.format('YYYY/MM/DD');
            let d = $scope.formatDate($scope.cbsObject.start_apply, "DD/MM/YYYY") + ' - ' + $scope.formatDate($scope.cbsObject.end_apply, "DD/MM/YYYY");
            if ($scope.cbsObject.start_apply == $scope.cbsObject.end_apply) d = $scope.formatDate($scope.cbsObject.start_apply, "DD/MM/YYYY");
            $scope.cbsObject.title = "[" + STORE_NAME + "] DOANH THU TIỀN MẶT " + d;
            setTimeout(() => {
                if (IS_MOBILE) {
                    $('.ob-title').attr('rows', 2);
                }
                $scope.$apply()
            }, 50);
        }
    }
    $scope.editTitle = () => {
        if (!$scope.edit_title) {
            setTimeout(() => {
                $('.ob-title').focus();
            }, 100);
        }
        $scope.edit_title = !$scope.edit_title;
    }
    $scope.check_type_id = (id, checktype = false) => {
        $scope.cbsObject.title = "";
        delete $scope.cbsObject.start_apply;
        delete $scope.cbsObject.end_apply;
        if (id == 1) {
            $scope.edit_title = false;
            $scope.dateInputInit('#apply-date-daterange', 0);
            setTimeout(() => {
                $scope.check_date_apply();
            }, 200);
        }

        let selected_group = $scope.group_cost.find(x => x.id === id);
        $scope.bind_selected_group = selected_group;
        $scope.cbsObject.link_functions = [];
        $scope.transaction_limit = 30;

        if (selected_group.quota_per_month && selected_group.quota_per_month != null) {
            $scope.cbsObject.month_allocated = $scope.df_month_allocated + '';
            $scope.cbsObject.month_accept = selected_group.quota_per_month;
        } else {
            delete $scope.cbsObject.month_allocated;
            delete $scope.cbsObject.month_accept;
            delete $scope.cbsObject.year_allocated;
        }
        $http.get(base_url + 'cashbooks/ajax_get_user_by?filter=' + JSON.stringify({
            'group_ids': JSON.parse(selected_group.main_group_confirm_id),
            'user_ids': JSON.parse(selected_group.user_confirm_id),
            'cost_group_id': selected_group.id
        })).then(r => {
            if (r.data.status == 1) {
                $scope.list_verify_request = r.data.data;
                $scope.cbsObject.request_verify_id = '0';
                select2();
            } else toastr["error"]('Vui lòng thử lại');
        })
        if (selected_group.link_function_type != 0) {
            $scope.cbsObject.link_function_type = selected_group.link_function_type;
            if (selected_group.link_function_type == 4) {
                $scope.search_bank = {};
                $scope.search_bank.name = "";
                if ($scope.cbsObject.id) {
                    $scope.get_itemDetail($scope.cbsObject.id, 'edit');
                }
            } else {
                $scope.get_recent_transactions();
            }
        } else {
            delete $scope.list_transaction_func;
            delete $scope.cbsObject.link_function_type;
        }
    }

    $scope.get_recent_transactions_bank = () => {
        if ($scope.search_bank.name.length > 3 || 1) {
            // Tạm thời ko cần tìm theo nội dung
            $scope.loadding = true;
            if (!$scope.cbsObject.id) {
                $scope.cbsObject.link_functions = []
            }
            if (!$scope.cbsObject.price) {
                $scope.loadding = false;
                return showMessErr('Vui lòng nhập số tiền');
            }

            $scope.cbsObject.formality = "transfer";

            $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?' + $.param({
                'link_function_type': $scope.bind_selected_group.link_function_type,
                'keyword': $scope.search_bank.name,
                'price': $scope.cbsObject.price
            })).then(r => {
                if (r.data.status == 1) {
                    $scope.list_transaction_func = r.data.data;
                    angular.forEach($scope.list_transaction_func, function (value, key) {
                        if (value.id_cs == $scope.cbsObject.id) {
                            value.view = 1;
                        } else {
                            value.view = 0;
                        }
                    });
                    if (r.data.data.length == 0) toastr["warning"]('Không có giao dịch liên kết phù hợp, vui lòng kiểm tra lại nội dung tìm kiếm và số tiền!');
                    select2();
                } else showMessErr('Vui lòng thử lại');
                $scope.loadding = false;
            });
        } else {
            return showMessErr('Vui lòng nhập nội dung hóa đơn chuyển khoản');
        }

    }

    $scope.get_recent_transactions = (uplimit = false) => {
        if (uplimit) $scope.transaction_limit = $scope.transaction_limit + 30;
        $http.get(base_url + 'cashbooks/ajax_get_recently_transaction_func?filter=' + JSON.stringify({
            'link_function_type': $scope.bind_selected_group.link_function_type,
            'limit': $scope.transaction_limit
        })).then(r => {
            if (r.data.status == 1) {
                $scope.list_transaction_func = r.data.data;
                if (r.data.data.length == 0) toastr["warning"]('Không có giao dịch liên kết phù hợp, vui lòng kiểm tra lại nhóm chi!');
                select2();
            } else toastr["error"]('Vui lòng thử lại');
        })
    }

    $scope.copy_cbs_id = () => {
        /* Select the text field */
        var copyText = document.getElementById("copy_input");
        copyText.select();
        copyText.setSelectionRange(0, 99999); /* For mobile devices */
        /* Copy the text inside the text field */
        document.execCommand("copy");
        /* Alert the copied text */
        alert("Đã copy liên kết: " + copyText.value);
    }
    $scope.zoomAction = () => {
        $scope.zoomImage = !$scope.zoomImage;
    }
    $scope.get_itemDetail = (id, type = 'edit') => {
        $scope.search_bank = {};
        $scope.search_bank.name = "";
        delete $scope.error_messages;
        $scope.zoomImage = false;
        $scope.body_loading = true;
        let par = (type == 'edit') ? '?type=edit' : '?type=view';
        $http.get(base_url + 'cashbooks/ajax_get_cbs_detail/' + id + par).then(r => {
            $scope.body_loading = false;
            if (r.data.status == 1) {
                $scope.url_preview = base_url + 'cashbooks/expenditures_v2?preview_id=' + r.data.data.id;
                $scope.detail_transaction_func = r.data.recent_transactions;
                $scope.cbsObject = r.data.data;
                $scope.modalType = (type == 'edit') ? 'create_cbs' : 'view_detail';
                $scope.check_data_after_loaddata(r.data.data);
                $('#showModal').modal('show');
            } else toastr["error"]('Vui lòng thử lại');
        })
    }

    $scope.confirm_cbs = (status, type = 1) => { //1: duyệt lần 1, 2: duyệt lại
        if (type == 2 || (status == 2 && type == 1)) {
            if (!$scope.cbsObject.note_edit_cashbook || $scope.cbsObject.note_edit_cashbook == '') {
                showMessErr('Vui lòng nhập ghi chú!')
                return false;
            }
        } else {
            $scope.cbsObject.note_edit_cashbook = '';
        }
        let data = {
            'cbs_id': $scope.cbsObject.id,
            'status': status,
            'cancel_note': $scope.cbsObject.note_edit_cashbook,
            'confirm_type': type
        }

        $scope.save_loading = true;
        $scope.loading_model_note = true;
        $http.post(base_url + 'cashbooks/ajax_confirm_cbs', data).then(r => {
            $scope.save_loading = false;
            $scope.loading_model_note = false;
            if (r && r.data.status == 1) {
                $scope.getAll();
                $('#showModal').modal('hide');
                $('#confirm-note-modal').modal('hide');
                if (status == 1 && type == 1) {
                    swal("Thông báo", "Phiếu chi đã duyệt thành công.", "success");
                } else showMessSuccess('Đã cập nhật thành công!');
            } else showMessErr();
        })
    }
    $scope.attachFile = () => {
        $('#inputFileEdit').click();
    }
    $scope.imageUpload = function (element) {
        var files = event.target.files; //FileList object
        $scope.saveImage(files)
    }

    $scope.showZoomImg = (value) => {
        showZoomImg(value)
    }

    $scope.removeFile = (key, item) => {
        item.files.splice(key, 1);
    }

    $scope.saveImage = (files) => {
        var formData = new FormData();
        for (let index = 0; index < files.length; index++) {
            formData.append('file[]', files[index]);
        }
        formData.append('resize_level', 3);
        formData.append('folder', 'cashbook');
        formData.append('multiple', true);
        $scope.loading = true;
        $http({
            url: base_url + '/uploads/ajax_upload_to_filehost?resize_level=2',
            method: "POST",
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        }).then(r => {
            $scope.loading = false;
            if (r.data.status == 1) {
                $scope.cbsObject.files = r.data.data;
            } else {
                toastr["error"](r.data.message)
            }
        })
    }

    function check_valid() {

        if ($scope.cbsObject.type_id == 1) {
            let moments = $scope.formatDate(moment(), "DD/MM/YYYY");
            let apply = $scope.formatDate($scope.cbsObject.end_apply, "DD/MM/YYYY");
            if (moments == apply) {
                toastr["error"]('Vui lòng chọn lại ngày doanh số (không chọn ngày hiện tại)!');
                return false;
            }
        }

        if ($scope.cbsObject.formality == 'transfer' && $scope.cbsObject.bank_id == 0) {
            toastr["error"]('Vui lòng chọn tài khoản thụ hưởng!');
            return false;
        }
        if (!$scope.cbsObject.files || $scope.cbsObject.files.length == 0) {
            toastr["error"]('Vui lòng chọn chứng từ!');
            return false;
        }
        if ($scope.cbsObject.link_function_type && $scope.cbsObject.link_function_type != 0 && (!$scope.cbsObject.link_functions || $scope.cbsObject.link_functions.length == 0)) {
            toastr["error"]('Không có giao dịch áp dụng, vui lòng kiểm tra lại!');
            return false;
        }

        if ($scope.cbsObject.month_accept && !$scope.cbsObject.month_allocated) {
            toastr["error"]('Vui lòng nhập đầy đủ tháng áp dụng!');
            return false;
        }

        if (($scope.cbsObject.type_id != 1) && (!$scope.cbsObject.request_verify_id || $scope.cbsObject.request_verify_id == 0)) {
            toastr["error"]('Vui lòng chọn người duyệt!');
            return false;
        }


        let data = angular.copy($scope.cbsObject);

        data.price = (data.price + '').replace(/,/g, "");
        if (data.price <= 0) {
            toastr["error"]('Vui lòng nhập số tiền!');
            return false;
        }
        if (data.price > $scope.max_price && $scope.cbsObject.link_function_type == 3) {
            $scope.error_messages = 'Vui lòng kiểm tra lại số tiền đã nhập và số tiền sử dụng quà tặng!'
            return false;
        }
        if (data.price != $scope.max_price && $scope.cbsObject.link_function_type == 4) {
            toastr["error"]('Vui lòng kiểm tra lại số tiền đã nhập và số tiền thanh toán ngân hàng!');
            return false;
        }
        return data;
    }

    $scope.cbs_action = () => {
        let data = check_valid();
        if (!data) return;
        $scope.save_loading = true;
        $http.post(base_url + 'cashbooks/ajax_create_cbs', data).then(r => {
            if (r && r.data.status == 1) {
                delete $scope.error_messages;
                $('#showModal').modal('hide');
                toastr.success('Đã tạo thành công!');
                $scope.getAll();
            } else {
                $scope.error_messages = r.data.messages;
                $("#showModal").animate({
                    scrollTop: 0
                }, "slow");
            }
            $scope.save_loading = false;
        })
    }
    $scope.openMdConfirm = (type, item) => {
        $scope.confirmModalType = type;
        $scope.md_item = item;
        $('#confirmModal').modal('show');

    }
    $scope.confirmAction = () => {
        switch ($scope.confirmModalType) {
            case 'cancel':
                $http.get(base_url + 'cashbooks/cancel_cbs_by_creator/' + $scope.md_item).then(r => {
                    if (r && r.data.status == 1) {
                        toastr.success(r.data.messages);
                        $scope.getAll();
                        $('#confirmModal').modal('hide');
                        $('#showModal').modal('hide');
                    } else toastr["error"](r.data.messages);
                })
                break;

            default:
                break;
        }
    }
    $scope.resend_cbs = (id) => {
        $http.get(base_url + 'cashbooks/ajax_resend_cbs/' + id).then(r => {
            if (r && r.data.status == 1) {
                toastr.success(r.data.messages);
                $scope.getAll();
            } else toastr["error"](r.data.messages);
        })
    }
    $scope.selectTrans = (item) => {
        if ($scope.bind_selected_group.id == 26 && item.total_linked && item.total_linked > 0) {
            if (($scope.cbsObject.id && item.linked_cbs != $scope.cbsObject.id) || !$scope.cbsObject.id) {
                toastr["error"]('Không thể chọn giao dịch đã được tạo phiếu chi.');
                return false;
            }
        }

        item.selected_item = !item.selected_item;
        $scope.cbsObject.link_functions = [];
        $scope.max_price = 0;
        angular.forEach($scope.list_transaction_func, function (value, key) {
            if (value.selected_item) {
                $scope.cbsObject.link_functions.push(value.id);
                if (value.max_real_price) $scope.max_price += Number(value.max_real_price);
            }
        });
    }

    $scope.selectTransBank = (item) => {
        $scope.cbsObject.link_functions = [];
        $scope.cbsObject.link_functions.push(item.id);
        $scope.cbsObject.bank_id = item.bank_id;
        $scope.max_price = 0;
        angular.forEach($scope.list_transaction_func, function (value, key) {
            if (value.id == item.id) {
                value.view = 1;
                $scope.max_price = value.transfer_amount;
            } else {
                value.view = 0;
            }
        });
    }

    $scope.showModelConfirm = (status, type = 1) => {
        swal({
            title: "Thông báo",
            text: "Bạn có chắc muốn duyệt phiếu chi này?",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Đóng",
            confirmButtonColor: "#00a65a",
            closeOnConfirm: false,
            showLoaderOnConfirm: true,
            allowOutsideClick: false
        }, function () {
            $scope.confirm_cbs(status, type);
        });
    }

    $scope.showModelNote = () => {
        $scope.cbsObject.note_edit_cashbook = '';
        $('#confirm-note-modal').modal('show');
    }

});